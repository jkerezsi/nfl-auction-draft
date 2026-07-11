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

  currentBid: number;

  currentBidTeamId: number | null;

  currentPlayer: CurrentPlayer | null;

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



  let currentPlayer = null;



  if (
    game.currentPlayerId
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

            drafted

          FROM draft_players

          WHERE id = ?

          `
        )
        .get(
          game.currentPlayerId
        ) as CurrentPlayer;


  }



  return {

    ...game,

    currentPlayer

  };


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
    .run(
      playerId
    );



  return getGameState();

}