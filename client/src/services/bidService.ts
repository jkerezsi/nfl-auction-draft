import api from "./api";


export async function submitBid(

  teamId: number,

  playerId: number,

  amount: number

) {

  const response =
    await api.post(
      "/bid",
      {
        teamId,
        playerId,
        amount
      }
    );


  return response.data;

}