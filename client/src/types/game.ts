import type {
  Player
} from "./player";


export type GameStatus =
  | "SETUP"
  | "AUCTION"
  | "RESULT";


export interface GameState {
  id: number;

  status: GameStatus;

  currentPlayerId: number | null;

  countdown: number;

  lastWinnerTeamId: number | null;

  lastWinnerPrice: number | null;

  lastWinnerPlayerId: number | null;

  submittedBidCount: number;

  totalTeamCount: number;

  currentPlayer: Player | null;
}