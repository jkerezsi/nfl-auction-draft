import { db } from "../database/connection";


export interface GameState {
  id: number;
  status: string;
  currentPlayerId: number | null;
  countdown: number;
}


export function getGameState(): GameState {

  const game = db
    .prepare(
      `
      SELECT
        id,
        status,
        current_player_id as currentPlayerId,
        countdown
      FROM game
      WHERE id = 1
      `
    )
    .get() as GameState;


  return game;

}