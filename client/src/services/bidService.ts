import api from "./api";

import type {
  AuctionBid,
  SubmitBidResponse
} from "../types/bit";


export async function submitBid(
  teamId: number,
  playerId: number,
  amount: number
): Promise<SubmitBidResponse> {
  const response =
    await api.post<SubmitBidResponse>(
      "/bid",
      {
        teamId,
        playerId,
        amount
      }
    );


  return response.data;
}


export async function getAuctionResults(
  playerId: number
): Promise<AuctionBid[]> {
  const response =
    await api.get<AuctionBid[]>(
      `/bid/current/${playerId}`
    );


  return response.data;
}