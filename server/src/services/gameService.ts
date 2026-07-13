import {
  db
} from "../database/connection";


export interface CurrentPlayer {
  id: number;
  rank: number;
  name: string;
  position: string;
  nfl_team: string;
  bye_week: number;
  drafted: number;
  auction_value: number;
}


export interface GameState {
  id: number;
  status: string;
  currentPlayerId: number | null;
  countdown: number;

  lastWinnerTeamId: number | null;
  lastWinnerPrice: number | null;
  lastWinnerPlayerId: number | null;

  submittedBidCount: number;
  totalTeamCount: number;

  currentPlayer: CurrentPlayer | null;
}


interface GameRow {
  id: number;
  status: string;
  currentPlayerId: number | null;
  countdown: number;

  lastWinnerTeamId: number | null;
  lastWinnerPrice: number | null;
  lastWinnerPlayerId: number | null;
}


interface StartingBudgetRow {
  value: string;
}


export function getGameState(): GameState {
  const game =
    db
      .prepare(
        `
        SELECT
          id,
          status,
          current_player_id AS currentPlayerId,
          countdown,
          last_winner_team_id AS lastWinnerTeamId,
          last_winner_price AS lastWinnerPrice,
          last_winner_player_id AS lastWinnerPlayerId
        FROM game
        WHERE id = 1
        `
      )
      .get() as GameRow | undefined;


  if (!game) {
    throw new Error(
      "Game state not found"
    );
  }


  let currentPlayer:
    CurrentPlayer | null =
    null;


  if (
    game.currentPlayerId !== null
  ) {
      currentPlayer =
        db
          .prepare(
            `
            SELECT
              id,
              rank,
              name,
              position,
              nfl_team,
              bye_week,
              drafted,
              auction_value
            FROM draft_players
            WHERE id = ?
            `
          )
        .get(
          game.currentPlayerId
        ) as CurrentPlayer | undefined ??
      null;
  }


  const totalTeamRow =
    db
      .prepare(
        `
        SELECT
          COUNT(*) AS count
        FROM teams
        `
      )
      .get() as {
        count: number;
      };


  let submittedBidCount =
    0;


  if (
    game.currentPlayerId !== null
  ) {
    const submittedBidRow =
      db
        .prepare(
          `
          SELECT
            COUNT(*) AS count
          FROM auction_bids
          WHERE player_id = ?
          `
        )
        .get(
          game.currentPlayerId
        ) as {
          count: number;
        };


    submittedBidCount =
      submittedBidRow.count;
  }


  return {
    ...game,

    submittedBidCount,

    totalTeamCount:
      totalTeamRow.count,

    currentPlayer
  };
}


export function nominatePlayer(
  playerId: number
): GameState {
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


  const player =
    db
      .prepare(
        `
        SELECT
          id,
          drafted
        FROM draft_players
        WHERE id = ?
        `
      )
      .get(
        playerId
      ) as {
        id: number;
        drafted: number;
      } | undefined;


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


  db.prepare(
    `
    UPDATE game
    SET
      status = 'AUCTION',
      current_player_id = ?,
      countdown = 30,
      last_winner_team_id = NULL,
      last_winner_price = NULL,
      last_winner_player_id = NULL,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
    `
  ).run(
    playerId
  );


  return getGameState();
}


export function resetDraft():
  GameState {
  const resetTransaction =
    db.transaction(
      () => {
        const startingBudgetRow =
          db
            .prepare(
              `
              SELECT
                value
              FROM settings
              WHERE key = 'startingBudget'
              `
            )
            .get() as
              | StartingBudgetRow
              | undefined;


        if (
          !startingBudgetRow
        ) {
          throw new Error(
            "Starting budget setting not found"
          );
        }


        const startingBudget =
          Number(
            startingBudgetRow.value
          );


        if (
          !Number.isFinite(
            startingBudget
          ) ||
          startingBudget < 0
        ) {
          throw new Error(
            "Starting budget setting is invalid"
          );
        }


        db.prepare(
          `
          DELETE FROM auction_bids
          `
        ).run();


        db.prepare(
          `
          DELETE FROM roster
          `
        ).run();


        db.prepare(
          `
          UPDATE draft_players
          SET drafted = 0
          `
        ).run();


        db.prepare(
          `
          UPDATE teams
          SET
            budget = ?,
            connected = 0
          `
        ).run(
          startingBudget
        );


        const gameUpdate =
          db.prepare(
            `
            UPDATE game
            SET
              status = 'SETUP',
              current_player_id = NULL,
              countdown = 0,
              current_bid = 0,
              current_bid_team_id = NULL,
              last_winner_team_id = NULL,
              last_winner_price = NULL,
              last_winner_player_id = NULL,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = 1
            `
          ).run();


        if (
          gameUpdate.changes !== 1
        ) {
          throw new Error(
            "Could not reset game state"
          );
        }
      }
    );


  resetTransaction();


  return getGameState();
}