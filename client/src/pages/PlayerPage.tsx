import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  getTeams
} from "../services/teamService";

import {
  getGameState
} from "../services/gameService";

import {
  submitBid
} from "../services/bidService";

import socket from "../services/socket";

import {
  saveTeamId,
  getTeamId,
  clearTeamId
} from "../services/sessionService";

import type { Team } from "../types/team";
import type { Player } from "../types/player";
import TeamSelector from "../components/player/TeamSelector";

type Tab =
  | "auction"
  | "team";


interface GameState {
  id: number;
  status: string;
  currentPlayerId: number | null;
  countdown: number;
  currentBid: number;
  currentBidTeamId: number | null;
  lastWinnerTeamId: number | null;
  lastWinnerPrice: number | null;
  lastWinnerPlayerId: number | null;
  currentPlayer: Player | null;
}


function getBidStorageKey(
  teamId: number,
  playerId: number
) {
  return `fantasy_bid_submitted_${teamId}_${playerId}`;
}


function PlayerPage() {
  const [teams, setTeams] =
    useState<Team[]>([]);

  const [selectedTeamId, setSelectedTeamId] =
    useState<number | null>(
      getTeamId()
    );

  const [game, setGame] =
    useState<GameState | null>(null);

  const [bidAmount, setBidAmount] =
    useState("");

  const [bidSubmitted, setBidSubmitted] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState<Tab>("auction");

  const [error, setError] =
    useState("");

  const currentPlayerIdRef =
    useRef<number | null>(null);


  useEffect(
    () => {
      void loadTeams();
      void loadGame();


      function handleGameUpdated(
        updatedGame: GameState
      ) {
        const isNewAuctionPlayer =
          updatedGame.status === "AUCTION" &&
          updatedGame.currentPlayerId !== null &&
          updatedGame.currentPlayerId !==
            currentPlayerIdRef.current;


        currentPlayerIdRef.current =
          updatedGame.currentPlayerId;


        setGame(updatedGame);


        if (
          isNewAuctionPlayer &&
          selectedTeamId !== null
        ) {
          const storageKey =
            getBidStorageKey(
              selectedTeamId,
              updatedGame.currentPlayerId
            );


          setBidSubmitted(
            localStorage.getItem(storageKey) === "true"
          );

          setBidAmount("");
          setError("");
        }


        if (updatedGame.status === "RESULT") {
          void loadTeams();
        }
      }


      socket.on(
        "GAME_UPDATED",
        handleGameUpdated
      );


      return () => {
        socket.off(
          "GAME_UPDATED",
          handleGameUpdated
        );
      };
    },
    [selectedTeamId]
  );


  async function loadTeams() {
    try {
      const data = await getTeams();
      setTeams(data);
    } catch {
      setError("Could not load teams.");
    }
  }


  async function loadGame() {
    try {
      const data =
        await getGameState() as GameState;


      currentPlayerIdRef.current =
        data.currentPlayerId;


      setGame(data);


      if (
        selectedTeamId !== null &&
        data.currentPlayerId !== null &&
        data.status === "AUCTION"
      ) {
        const storageKey =
          getBidStorageKey(
            selectedTeamId,
            data.currentPlayerId
          );


        setBidSubmitted(
          localStorage.getItem(storageKey) === "true"
        );
      }
    } catch {
      setError("Could not load the current auction.");
    }
  }


  function selectTeam(
    teamId: number
  ) {
    saveTeamId(teamId);
    setSelectedTeamId(teamId);
    setError("");
  }


  function changeTeam() {
    clearTeamId();

    setSelectedTeamId(null);
    setBidSubmitted(false);
    setBidAmount("");
    setError("");
  }


  async function placeBid() {
    try {
      setError("");


      if (
        selectedTeamId === null ||
        !game?.currentPlayer
      ) {
        return;
      }


      const amount =
        Number(bidAmount);


      if (
        !Number.isInteger(amount) ||
        amount <= 0
      ) {
        setError(
          "Enter a positive whole-number bid."
        );

        return;
      }


      await submitBid(
        selectedTeamId,
        game.currentPlayer.id,
        amount
      );


      localStorage.setItem(
        getBidStorageKey(
          selectedTeamId,
          game.currentPlayer.id
        ),
        "true"
      );


      setBidSubmitted(true);
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.error ??
        "Bid failed."
      );
    }
  }


  const selectedTeam =
    teams.find(
      team =>
        team.id === selectedTeamId
    );


  const auctionFinished =
    game?.status === "RESULT";


  const wonAuction =
    auctionFinished &&
    game?.lastWinnerTeamId !== null &&
    game?.lastWinnerTeamId === selectedTeamId;

if (!selectedTeam) {

  return (

    <TeamSelector

      teams={teams}

      onSelect={selectTeam}

    />

  );

}


  return (
    <div className="player-page">
      <div className="player-header">
        <h1>
          {selectedTeam.name}
        </h1>

        <div>
          Budget: ${selectedTeam.budget}
        </div>
      </div>

      {
        error && (
          <div className="player-card">
            <p>
              {error}
            </p>
          </div>
        )
      }

      {
        activeTab === "auction" && (
          <div className="player-card">
            {
              auctionFinished ? (
                game?.lastWinnerTeamId === null ? (
                  <div>
                    <h2>
                      No bids received
                    </h2>

                    <p>
                      This player was not awarded.
                    </p>
                  </div>
                ) : wonAuction ? (
                  <div>
                    <h2>
                      🏆 YOU WON
                    </h2>

                    <p>
                      Player:
                    </p>

                    <strong>
                      {game?.currentPlayer?.name}
                    </strong>

                    <p>
                      Price: ${game?.lastWinnerPrice}
                    </p>
                  </div>
                ) : (
                  <div>
                    <h2>
                      ❌ YOU LOST
                    </h2>

                    <p>
                      Player:{" "}
                      {game?.currentPlayer?.name}
                    </p>

                    <p>
                      Winning bid:{" "}
                      ${game?.lastWinnerPrice}
                    </p>
                  </div>
                )
              ) : game?.currentPlayer ? (
                <>
                  <h2>
                    {game.currentPlayer.name}
                  </h2>

                  <p>
                    {game.currentPlayer.position}
                    {" - "}
                    {game.currentPlayer.nfl_team}
                  </p>

                  <p>
                    Time: {game.countdown}s
                  </p>

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
                          max={selectedTeam.budget}
                          placeholder="Your bid"
                          value={bidAmount}
                          onChange={
                            event =>
                              setBidAmount(
                                event.target.value
                              )
                          }
                        />

                        <button
                          onClick={placeBid}
                        >
                          Submit Bid
                        </button>
                      </>
                    )
                  }
                </>
              ) : (
                <h2>
                  Waiting for next player...
                </h2>
              )
            }
          </div>
        )
      }

      {
        activeTab === "team" && (
          <div className="player-card">
            <h2>
              My Team
            </h2>

            <p>
              Roster display is the next milestone.
            </p>
          </div>
        )
      }

      <div className="player-nav">
        <button
          className={
            activeTab === "auction"
              ? "active"
              : ""
          }
          onClick={
            () =>
              setActiveTab("auction")
          }
        >
          Auction
        </button>

        <button
          className={
            activeTab === "team"
              ? "active"
              : ""
          }
          onClick={
            () =>
              setActiveTab("team")
          }
        >
          My Team
        </button>
      </div>

      <button
        className="change-team"
        onClick={changeTeam}
      >
        Change Team
      </button>
    </div>
  );
}


export default PlayerPage;