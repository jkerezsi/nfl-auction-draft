export interface RosterPlayer {
  id: number;

  playerId: number;

  playerName: string;

  position: string;

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