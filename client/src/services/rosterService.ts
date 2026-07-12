import api from "./api";

import type {
  TeamRoster
} from "../types/roster";


export async function getRoster(
  teamId: number
): Promise<TeamRoster> {
  const response =
    await api.get<TeamRoster>(
      `/roster/${teamId}`
    );


  return response.data;
}