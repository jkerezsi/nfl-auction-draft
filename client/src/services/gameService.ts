import api from "./api";


export async function getGameState() {

  const response =
    await api.get(
      "/game"
    );


  return response.data;

}