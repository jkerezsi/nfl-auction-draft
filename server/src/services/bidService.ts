import {
  db
} from "../database/connection";

import {
  getAvailableRosterSlot
} from "./rosterSlotService";


export interface Bid {
  id: number;
  team_id: number;
  player_id: number;
  amount: number;
  submitted_at: string;
}


interface TeamRow {
  id: number;
  name: string;
  budget: number;
}


interface PlayerRow {
  id: number;
  name: string;
  position: string;
  drafted: number;
}


interface GameRow {
  status: string;
  currentPlayerId: number | null;
}


export interface AuctionResult {
  winnerTeamId: number;
  winnerTeamName: string;
  playerId: number;
  playerName: string;
  price: number;
}


export function submitBid(
  teamId: number,
  playerId: number,
  amount: number
) {
  if (
    !Number.isInteger(
      teamId
    ) ||
    teamId <= 0
  ) {
    throw new Error(
      "Invalid team ID"
    );
  }


  if (
    !Number.isInteger(
      playerId
    ) ||
    playerId <= 0
  ) {
    throw new Error(
      "Invalid player ID"
    );
  }


  if (
    !Number.isInteger(
      amount
    ) ||
    amount <= 0
  ) {
    throw new Error(
      "Invalid bid amount"
    );
  }


  const game =
    db
      .prepare(
        `
        SELECT
          status,
          current_player_id AS currentPlayerId
        FROM game
        WHERE id = 1
        `
      )
      .get() as GameRow | undefined;


  if (
    !game ||
    game.status !== "AUCTION"
  ) {
    throw new Error(
      "There is no active auction"
    );
  }


  if (
    game.currentPlayerId !==
    playerId
  ) {
    throw new Error(
      "This player is not currently available for bidding"
    );
  }


  const team =
    db
      .prepare(
        `
        SELECT
          id,
          name,
          budget
        FROM teams
        WHERE id = ?
        `
      )
      .get(
        teamId
      ) as TeamRow | undefined;


  if (!team) {
    throw new Error(
      "Team not found"
    );
  }


  if (
    amount >
    team.budget
  ) {
    throw new Error(
      "Bid exceeds budget"
    );
  }


  const existingBid =
    db
      .prepare(
        `
        SELECT id
        FROM auction_bids
        WHERE team_id = ?
          AND player_id = ?
        `
      )
      .get(
        teamId,
        playerId
      );


  if (existingBid) {
    throw new Error(
      "Bid already submitted"
    );
  }


  const result =
    db
      .prepare(
        `
        INSERT INTO auction_bids
        (
          team_id,
          player_id,
          amount
        )
        VALUES
        (
          ?,
          ?,
          ?
        )
        `
      )
      .run(
        teamId,
        playerId,
        amount
      );


  return {
    id:
      Number(
        result.lastInsertRowid
      ),

    message:
      "Bid submitted"
  };
}


export function getCurrentAuctionBids(
  playerId: number
): Bid[] {
  return db
    .prepare(
      `
      SELECT
        id,
        team_id,
        player_id,
        amount,
        submitted_at
      FROM auction_bids
      WHERE player_id = ?
      ORDER BY
        amount DESC,
        submitted_at ASC,
        id ASC
      `
    )
    .all(
      playerId
    ) as Bid[];
}


export function resolveAuction(
  playerId: number
): AuctionResult | null {
  const resolveTransaction =
    db.transaction(
      () => {
        const game =
          db
            .prepare(
              `
              SELECT
                status,
                current_player_id AS currentPlayerId
              FROM game
              WHERE id = 1
              `
            )
            .get() as GameRow | undefined;


        if (
          !game ||
          game.status !== "AUCTION"
        ) {
          throw new Error(
            "There is no active auction to resolve"
          );
        }


        if (
          game.currentPlayerId !==
          playerId
        ) {
          throw new Error(
            "This is not the current auction player"
          );
        }


        const player =
          db
            .prepare(
              `
              SELECT
                id,
                name,
                position,
                drafted
              FROM draft_players
              WHERE id = ?
              `
            )
            .get(
              playerId
            ) as PlayerRow | undefined;


        if (!player) {
          throw new Error(
            "Player not found"
          );
        }


        if (
          player.drafted === 1
        ) {
          throw new Error(
            "Player has already been drafted"
          );
        }


        const winner =
          db
            .prepare(
              `
              SELECT
                id,
                team_id,
                player_id,
                amount,
                submitted_at
              FROM auction_bids
              WHERE player_id = ?
              ORDER BY
                amount DESC,
                submitted_at ASC,
                id ASC
              LIMIT 1
              `
            )
            .get(
              playerId
            ) as Bid | undefined;


        if (!winner) {
          db
            .prepare(
              `
              UPDATE game
              SET
                status = 'RESULT',
                countdown = 0,
                last_winner_team_id = NULL,
                last_winner_price = NULL,
                last_winner_player_id = ?,
                updated_at = CURRENT_TIMESTAMP
              WHERE id = 1
              `
            )
            .run(
              playerId
            );


          return null;
        }


        const team =
          db
            .prepare(
              `
              SELECT
                id,
                name,
                budget
              FROM teams
              WHERE id = ?
              `
            )
            .get(
              winner.team_id
            ) as TeamRow | undefined;


        if (!team) {
          throw new Error(
            "Winning team not found"
          );
        }


        if (
          winner.amount >
          team.budget
        ) {
          throw new Error(
            "Winning bid exceeds the team's current budget"
          );
        }


        const rosterSlot =
          getAvailableRosterSlot(
            winner.team_id,
            player.position
          );


        const budgetUpdate =
          db
            .prepare(
              `
              UPDATE teams
              SET budget = budget - ?
              WHERE id = ?
                AND budget >= ?
              `
            )
            .run(
              winner.amount,
              winner.team_id,
              winner.amount
            );


        if (
          budgetUpdate.changes !== 1
        ) {
          throw new Error(
            "Could not deduct the winning bid"
          );
        }


        const draftedUpdate =
          db
            .prepare(
              `
              UPDATE draft_players
              SET drafted = 1
              WHERE id = ?
                AND drafted = 0
              `
            )
            .run(
              player.id
            );


        if (
          draftedUpdate.changes !== 1
        ) {
          throw new Error(
            "Player has already been drafted"
          );
        }


        db
          .prepare(
            `
            INSERT INTO roster
            (
              team_id,
              player_id,
              player_name,
              position,
              price,
              slot
            )
            VALUES
            (
              ?,
              ?,
              ?,
              ?,
              ?,
              ?
            )
            `
          )
          .run(
            winner.team_id,
            player.id,
            player.name,
            player.position,
            winner.amount,
            rosterSlot
          );


        db
          .prepare(
            `
            UPDATE game
            SET
              status = 'RESULT',
              countdown = 0,
              last_winner_team_id = ?,
              last_winner_price = ?,
              last_winner_player_id = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = 1
            `
          )
          .run(
            winner.team_id,
            winner.amount,
            player.id
          );


        return {
          winnerTeamId:
            winner.team_id,

          winnerTeamName:
            team.name,

          playerId:
            player.id,

          playerName:
            player.name,

          price:
            winner.amount
        };
      }
    );


  return resolveTransaction();
}
