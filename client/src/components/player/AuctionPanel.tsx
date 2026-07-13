import Countdown from "./Countdown";
import PlayerCard from "../../shared/PlayerCard";

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


  if (
    !game?.currentPlayer
  ) {
    return (
      <section className="player-card player-card--waiting">
        <h2>
          Waiting for next player
        </h2>

        <p>
          The commissioner has not started an auction yet.
        </p>
      </section>
    );
  }


  const currentPlayer =
    game.currentPlayer;


  if (
    auctionFinished
  ) {
    if (
      game.lastWinnerTeamId === null
    ) {
      return (
        <section className="player-card">
          <div className="auction-result-heading">
            <span className="auction-result-heading__icon">
              —
            </span>

            <div>
              <h2>
                No bids received
              </h2>

              <p>
                The player was not awarded.
              </p>
            </div>
          </div>

          <PlayerCard
            name={
              currentPlayer.name
            }
            position={
              currentPlayer.position
            }
            nflTeam={
              currentPlayer.nfl_team
            }
            rank={
              currentPlayer.rank
            }
          />
        </section>
      );
    }


    if (
      wonAuction
    ) {
      return (
        <section className="player-card player-card--won">
          <div className="auction-result-heading">
            <span className="auction-result-heading__icon">
              🏆
            </span>

            <div>
              <h2>
                You won
              </h2>

              <p>
                The player has been added to your team.
              </p>
            </div>
          </div>

          <PlayerCard
            name={
              currentPlayer.name
            }
            position={
              currentPlayer.position
            }
            nflTeam={
              currentPlayer.nfl_team
            }
            rank={
              currentPlayer.rank
            }
            price={
              game.lastWinnerPrice ??
              undefined
            }
            result="won"
          />
        </section>
      );
    }


    return (
      <section className="player-card player-card--lost">
        <div className="auction-result-heading">
          <span className="auction-result-heading__icon">
            ✕
          </span>

          <div>
            <h2>
              You lost
            </h2>

            <p>
              Another team submitted the winning bid.
            </p>
          </div>
        </div>

        <PlayerCard
          name={
            currentPlayer.name
          }
          position={
            currentPlayer.position
          }
          nflTeam={
            currentPlayer.nfl_team
          }
          rank={
            currentPlayer.rank
          }
          price={
            game.lastWinnerPrice ??
            undefined
          }
          result="lost"
        />
      </section>
    );
  }


  return (
    <section className="player-card auction-panel">
      <PlayerCard
        name={
          currentPlayer.name
        }
        position={
          currentPlayer.position
        }
        nflTeam={
          currentPlayer.nfl_team
        }
        rank={
          currentPlayer.rank
        }
      />

      <div className="auction-countdown-section">
        <span className="auction-section-label">
          Time remaining
        </span>

        <Countdown
          seconds={
            game.countdown
          }
        />
      </div>

      {
        error && (
          <p
            className="player-error"
            role="alert"
          >
            {error}
          </p>
        )
      }

      {
        bidSubmitted ? (
          <div className="bid-locked">
            <div className="bid-locked__title">
              ✓ Bid locked
            </div>

            <p>
              Waiting for the auction result.
            </p>
          </div>
        ) : (
          <div className="bid-form">
            <label
              className="bid-form__label"
              htmlFor="bid-amount"
            >
              Your bid
            </label>

            <div className="bid-form__input-wrapper">
              <span className="bid-form__currency">
                $
              </span>

              <input
                id="bid-amount"
                className="bid-form__input"
                type="number"
                inputMode="numeric"
                min="1"
                max={
                  teamBudget
                }
                placeholder="0"
                value={
                  bidAmount
                }
                onChange={
                  event =>
                    onBidAmountChange(
                      event.target.value
                    )
                }
              />
            </div>

            <div className="bid-form__budget">
              Available budget: ${teamBudget}
            </div>

            <button
              className="bid-form__submit"
              type="button"
              onClick={
                onSubmitBid
              }
            >
              Submit Bid
            </button>
          </div>
        )
      }
    </section>
  );
}