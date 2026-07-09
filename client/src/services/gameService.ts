import api from "./api";


export async function nominatePlayer(
  playerId: number
) {

  const response =
    await api.post(
      `/game/nominate/${playerId}`
    );


  return response.data;

}



export async function getGameState() {

  const response =
    await api.get(
      "/game"
    );


  return response.data;

}