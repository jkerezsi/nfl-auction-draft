import { db } from "../database/connection";


export interface GameState {

  id: number;

  status: string;

  currentPlayerId: number | null;

  countdown: number;

  currentBid: number;

  currentBidTeamId: number | null;

}



export function getGameState(): GameState {


  const game =
    db
      .prepare(
        `
        SELECT

          id,

          status,

          current_player_id as currentPlayerId,

          countdown,

          current_bid as currentBid,

          current_bid_team_id as currentBidTeamId

        FROM game

        WHERE id = 1
        `
      )
      .get() as GameState;


  return game;

}



export function nominatePlayer(
  playerId: number
) {


  db
    .prepare(
      `
      UPDATE game

      SET

        status = 'AUCTION',

        current_player_id = ?,

        countdown = 30,

        current_bid = 0,

        current_bid_team_id = NULL

      WHERE id = 1
      `
    )
    .run(playerId);



  return getGameState();

}