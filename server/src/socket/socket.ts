import { getSocket } from "./index";


export function broadcastGameUpdated(
  game: any
) {

  getSocket().emit(
    "GAME_UPDATED",
    game
  );

}


export function broadcastTeamUpdated(
  team: any
) {

  getSocket().emit(
    "TEAM_UPDATED",
    team
  );

}