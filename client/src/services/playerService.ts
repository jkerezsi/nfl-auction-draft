import api from "./api";

import type { Player } from "../types/player";


export async function getPlayers(): Promise<Player[]> {

  const response =
    await api.get<Player[]>("/players");


  return response.data;

}