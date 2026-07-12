import { db } from "../database/connection";


export interface CurrentPlayer {
  id: number;
  rank: number;
  name: string;
  position: string;
  nfl_team: string;
  bye_week: number;
  drafted: number;
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


  let currentPlayer: CurrentPlayer | null =
    null;


  if (game.currentPlayerId !== null) {
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
            drafted
          FROM draft_players
          WHERE id = ?
          `
        )
        .get(
          game.currentPlayerId
        ) as CurrentPlayer | undefined ?? null;
  }


  const totalTeamRow =
    db
      .prepare(
        `
        SELECT COUNT(*) AS count
        FROM teams
        `
      )
      .get() as {
        count: number;
      };


  let submittedBidCount = 0;


  if (game.currentPlayerId !== null) {
    const submittedBidRow =
      db
        .prepare(
          `
          SELECT COUNT(*) AS count
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
    !Number.isInteger(playerId) ||
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


  if (player.drafted === 1) {
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
  ).run(playerId);


  return getGameState();
}