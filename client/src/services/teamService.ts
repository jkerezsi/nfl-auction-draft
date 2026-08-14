import api from "./api";

import type {
  Team
} from "../types/team";


export async function getTeams():
Promise<Team[]> {
  const response =
    await api.get<Team[]>(
      "/team"
    );


  return response.data;
}


export async function createTeam(
  name: string
): Promise<Team> {
  const response =
    await api.post<Team>(
      "/team",
      {
        name
      }
    );


  return response.data;
}


export async function updateTeam(
  teamId: number,
  name: string
): Promise<Team> {
  const response =
    await api.patch<Team>(
      `/team/${teamId}`,
      {
        name
      }
    );


  return response.data;
}


export async function deleteTeam(
  teamId: number
): Promise<{
  message: string;
  teamId: number;
  teamName: string;
}> {
  const response =
    await api.delete<{
      message: string;
      teamId: number;
      teamName: string;
    }>(
      `/team/${teamId}`
    );


  return response.data;
}

export async function setTeamAutoDraftEnabled(
  teamId: number,
  enabled: boolean
): Promise<Team> {
  const response =
    await api.patch<Team>(
      `/team/${teamId}/auto-draft`,
      {
        enabled
      }
    );


  return response.data;
}
