import api from "./api";

import type { Team } from "../types/team";


export async function getTeams(): Promise<Team[]> {

  const response =
    await api.get("/team");

  return response.data;

}


export async function createTeam(
  name: string
): Promise<Team> {

  const response =
    await api.post(
      "/team",
      {
        name
      }
    );

  return response.data;

}