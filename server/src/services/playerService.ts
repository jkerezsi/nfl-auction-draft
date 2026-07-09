import { db } from "../database/connection";


export class PlayerService {


  getAllPlayers() {


    return db
      .prepare(`

        SELECT

          id,

          rank,

          name,

          position,

          nfl_team,

          bye_week,

          drafted

        FROM draft_players

        ORDER BY rank

      `)
      .all();


  }


}


export const playerService =
  new PlayerService();