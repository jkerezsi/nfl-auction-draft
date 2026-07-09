import { db } from "../database/connection";

export class TeamService {

  getAllTeams() {

    return db.prepare(`
      SELECT
        id,
        name,
        budget,
        connected
      FROM teams
      ORDER BY name
    `).all();

  }

}

export const teamService = new TeamService();