import { db } from "../database/connection";


export interface RosterPlayer {

  id: number;

  player_id: number;

  player_name: string;

  position: string;

  price: number;

  slot: string;

}



export function getTeamRoster(
  teamId: number
): RosterPlayer[] {


  return db
    .prepare(
      `
      SELECT

        id,

        player_id,

        player_name,

        position,

        price,

        slot

      FROM roster

      WHERE team_id = ?

      ORDER BY id ASC

      `
    )
    .all(teamId) as RosterPlayer[];

}