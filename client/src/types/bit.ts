export interface AuctionBid {
  id: number;

  team_id: number;

  player_id: number;

  amount: number;

  submitted_at: string;
}


export interface SubmitBidResponse {
  id: number;

  message: string;

  auctionFinished: boolean;
}