import {
  db
} from "../database/connection";


export interface Player {
  id: number;
  rank: number;
  name: string;
  position: string;
  nfl_team: string;
  bye_week: number;
  drafted: number;
  auction_value: number;
}


export class PlayerService {
  getAllPlayers(): Player[] {
    return db
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
        ORDER BY rank
        `
      )
      .all() as Player[];
  }
}


export const playerService =
  new PlayerService();