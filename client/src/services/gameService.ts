import api from "./api";

import type {
  GameState
} from "../types/game";


export async function getGameState():
Promise<GameState> {
  const response =
    await api.get<GameState>(
      "/game"
    );


  return response.data;
}


export async function nominatePlayer(
  playerId: number
): Promise<GameState> {
  const response =
    await api.post<GameState>(
      `/game/nominate/${playerId}`
    );


  return response.data;
}