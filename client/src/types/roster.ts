export interface RosterPlayer {
  id: number;
  playerId: number;
  playerName: string;
  position: string;
  nflTeam: string | null;
  byeWeek: number | null;
  rank: number | null;
  auctionValue: number;
  price: number;
  slot: string;
}


export interface TeamRoster {
  teamId: number;
  teamName: string;
  budget: number;
  spent: number;
  playerCount: number;
  players: RosterPlayer[];
}