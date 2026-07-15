import {
  db
} from "../database/connection";


interface GameRow {
  status: string;
}


interface RosterEntryRow {
  rosterId: number;
  teamId: number;
  teamName: string;
  playerId: number;
  playerName: string;
  price: number;
  slot: string;
}


export interface ReleasedPlayerResult {
  rosterId: number;
  teamId: number;
  teamName: string;
  playerId: number;
  playerName: string;
  refundedAmount: number;
  slot: string;
}


export function releaseDraftedPlayer(
  rosterId: number
): ReleasedPlayerResult {
  if (
    !Number.isInteger(
      rosterId
    ) ||
    rosterId <= 0
  ) {
    throw new Error(
      "Invalid roster ID"
    );
  }


  const releaseTransaction =
    db.transaction(
      () => {
        const game =
          db
            .prepare(
              `
              SELECT
                status
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


        if (
          game.status === "AUCTION"
        ) {
          throw new Error(
            "A player cannot be released during an active auction"
          );
        }


        const rosterEntry =
          db
            .prepare(
              `
              SELECT
                roster.id
                  AS rosterId,

                roster.team_id
                  AS teamId,

                teams.name
                  AS teamName,

                roster.player_id
                  AS playerId,

                roster.player_name
                  AS playerName,

                roster.price,

                roster.slot

              FROM roster

              INNER JOIN teams
                ON teams.id =
                  roster.team_id

              INNER JOIN draft_players
                ON draft_players.id =
                  roster.player_id

              WHERE roster.id = ?
              `
            )
            .get(
              rosterId
            ) as RosterEntryRow | undefined;


        if (!rosterEntry) {
          throw new Error(
            "Roster player not found"
          );
        }


        const refundResult =
          db
            .prepare(
              `
              UPDATE teams
              SET
                budget =
                  budget + ?
              WHERE id = ?
              `
            )
            .run(
              rosterEntry.price,
              rosterEntry.teamId
            );


        if (
          refundResult.changes !== 1
        ) {
          throw new Error(
            "Could not refund the team budget"
          );
        }


        const playerUpdate =
          db
            .prepare(
              `
              UPDATE draft_players
              SET
                drafted = 0
              WHERE id = ?
                AND drafted = 1
              `
            )
            .run(
              rosterEntry.playerId
            );


        if (
          playerUpdate.changes !== 1
        ) {
          throw new Error(
            "Could not return the player to the draft pool"
          );
        }


        db
          .prepare(
            `
            DELETE FROM auction_bids
            WHERE player_id = ?
            `
          )
          .run(
            rosterEntry.playerId
          );


        const rosterDelete =
          db
            .prepare(
              `
              DELETE FROM roster
              WHERE id = ?
              `
            )
            .run(
              rosterEntry.rosterId
            );


        if (
          rosterDelete.changes !== 1
        ) {
          throw new Error(
            "Could not remove the player from the roster"
          );
        }


        db
          .prepare(
            `
            UPDATE game
            SET
              status =
                CASE
                  WHEN last_winner_player_id = ?
                    THEN 'SETUP'
                  ELSE status
                END,

              current_player_id =
                CASE
                  WHEN last_winner_player_id = ?
                    THEN NULL
                  ELSE current_player_id
                END,

              countdown =
                CASE
                  WHEN last_winner_player_id = ?
                    THEN 0
                  ELSE countdown
                END,

              last_winner_team_id =
                CASE
                  WHEN last_winner_player_id = ?
                    THEN NULL
                  ELSE last_winner_team_id
                END,

              last_winner_price =
                CASE
                  WHEN last_winner_player_id = ?
                    THEN NULL
                  ELSE last_winner_price
                END,

              last_winner_player_id =
                CASE
                  WHEN last_winner_player_id = ?
                    THEN NULL
                  ELSE last_winner_player_id
                END,

              updated_at =
                CURRENT_TIMESTAMP

            WHERE id = 1
            `
          )
          .run(
            rosterEntry.playerId,
            rosterEntry.playerId,
            rosterEntry.playerId,
            rosterEntry.playerId,
            rosterEntry.playerId,
            rosterEntry.playerId
          );


        return {
          rosterId:
            rosterEntry.rosterId,

          teamId:
            rosterEntry.teamId,

          teamName:
            rosterEntry.teamName,

          playerId:
            rosterEntry.playerId,

          playerName:
            rosterEntry.playerName,

          refundedAmount:
            rosterEntry.price,

          slot:
            rosterEntry.slot
        };
      }
    );


  return releaseTransaction();
}