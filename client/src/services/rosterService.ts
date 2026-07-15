import api from "./api";

import type {
  TeamRoster
} from "../types/roster";


export interface ReleasePlayerResponse {
  success: true;

  releasedPlayer: {
    rosterId: number;
    teamId: number;
    teamName: string;
    playerId: number;
    playerName: string;
    refundedAmount: number;
    slot: string;
  };
}


export async function getRoster(
  teamId: number
): Promise<TeamRoster> {
  const response =
    await api.get<TeamRoster>(
      `/roster/${teamId}`
    );


  return response.data;
}


export async function releasePlayer(
  rosterId: number
): Promise<ReleasePlayerResponse> {
  const response =
    await api.delete<ReleasePlayerResponse>(
      `/roster/player/${rosterId}`
    );


  return response.data;
}
