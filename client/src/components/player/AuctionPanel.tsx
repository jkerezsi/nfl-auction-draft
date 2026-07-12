import Countdown from "./Countdown";

import type {
  GameState
} from "../../types/game";


interface AuctionPanelProps {
  game: GameState | null;

  bidAmount: string;

  bidSubmitted: boolean;

  selectedTeamId: number;

  teamBudget: number;

  error: string;

  onBidAmountChange: (
    value: string
  ) => void;

  onSubmitBid: () => void;
}


export default function AuctionPanel({
  game,
  bidAmount,
  bidSubmitted,
  selectedTeamId,
  teamBudget,
  error,
  onBidAmountChange,
  onSubmitBid
}: AuctionPanelProps) {
  const auctionFinished =
    game?.status === "RESULT";


  const wonAuction =
    auctionFinished &&
    game.lastWinnerTeamId !== null &&
    game.lastWinnerTeamId ===
      selectedTeamId;


  if (!game?.currentPlayer) {
    return (
      <div className="player-card">
        <h2>
          Waiting for next player...
        </h2>
      </div>
    );
  }


  if (auctionFinished) {
    if (game.lastWinnerTeamId === null) {
      return (
        <div className="player-card">
          <h2>
            No bids received
          </h2>

          <p>
            {game.currentPlayer.name}
            {" was not awarded."}
          </p>
        </div>
      );
    }


    if (wonAuction) {
      return (
        <div className="player-card">
          <h2>
            🏆 YOU WON
          </h2>

          <p>
            Player:
          </p>

          <strong>
            {game.currentPlayer.name}
          </strong>

          <p>
            Price: ${game.lastWinnerPrice}
          </p>
        </div>
      );
    }


    return (
      <div className="player-card">
        <h2>
          ❌ YOU LOST
        </h2>

        <p>
          Player: {game.currentPlayer.name}
        </p>

        <p>
          Winning bid: ${game.lastWinnerPrice}
        </p>
      </div>
    );
  }


  return (
    <div className="player-card">
      <h2>
        {game.currentPlayer.name}
      </h2>

      <p>
        {game.currentPlayer.position}
        {" - "}
        {game.currentPlayer.nfl_team}
      </p>

      <Countdown
        seconds={game.countdown}
      />

      {
        error && (
          <p>
            {error}
          </p>
        )
      }

      {
        bidSubmitted ? (
          <div>
            ✅ Bid locked

            <p>
              Waiting for result...
            </p>
          </div>
        ) : (
          <>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              max={teamBudget}
              placeholder="Your bid"
              value={bidAmount}
              onChange={
                event =>
                  onBidAmountChange(
                    event.target.value
                  )
              }
            />

            <button
              onClick={onSubmitBid}
            >
              Submit Bid
            </button>
          </>
        )
      }
    </div>
  );
}