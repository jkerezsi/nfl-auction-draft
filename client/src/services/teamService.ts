import api from "./api";

import type { Team } from "../types/team";


export async function getTeams(): Promise<Team[]> {

  const response =
    await api.get<Team[]>("/team");


  return response.data;

}