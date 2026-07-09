import { apiGet } from "./api";

import {
  Player
} from "../types/player";


export function getPlayers() {

  return apiGet<Player[]>(
    "/players"
  );

}