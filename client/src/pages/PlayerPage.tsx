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

import MyTeamPanel from "../components/player/MyTeamPanel";

import {
  getRoster
} from "../services/rosterService";

import type {
  TeamRoster
} from "../types/roster";

import {
  saveTeamId,
  getTeamId,
  clearTeamId
} from "../services/sessionService";

import TeamSelector from "../components/player/TeamSelector";
import AuctionPanel from "../components/player/AuctionPanel";

import type {
  Team
} from "../types/team";

import type {
  GameState
} from "../types/game";


type Tab =
  | "auction"
  | "team";


function getBidStorageKey(
  teamId: number,
  playerId: number
) {
  return (
    `fantasy_bid_submitted_${teamId}_${playerId}`
  );
}


function PlayerPage() {
  const [teams, setTeams] =
    useState<Team[]>([]);

  const [selectedTeamId, setSelectedTeamId] =
    useState<number | null>(
      getTeamId()
    );

  const [game, setGame] =
    useState<GameState | null>(
      null
    );
  
  const [roster, setRoster] =
  useState<TeamRoster | null>(
    null
  );

  const [bidAmount, setBidAmount] =
    useState("");

  const [bidSubmitted, setBidSubmitted] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState<Tab>(
      "auction"
    );

  const [error, setError] =
    useState("");

  const currentPlayerIdRef =
    useRef<number | null>(
      null
    );


  useEffect(
    () => {
      void loadTeams();
      void loadGame();


      function handleGameUpdated(
        updatedGame: GameState
      ) {
        const previousPlayerId =
          currentPlayerIdRef.current;


        const isNewAuctionPlayer =
          updatedGame.status === "AUCTION" &&
          updatedGame.currentPlayerId !== null &&
          updatedGame.currentPlayerId !==
            previousPlayerId;


        currentPlayerIdRef.current =
          updatedGame.currentPlayerId;


        setGame(
          updatedGame
        );

        if (
          updatedGame.status === "RESULT" &&
          selectedTeamId
        ) {
          loadRoster(
            selectedTeamId
          );
        }


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
            localStorage.getItem(
              storageKey
            ) === "true"
          );


          setBidAmount("");
          setError("");
        }


        if (
          updatedGame.status === "RESULT"
        ) {
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
      const data =
        await getTeams();


      setTeams(
        data
      );
    } catch {
      setError(
        "Could not load teams."
      );
    }
  }


  async function loadGame() {
    try {
      const data =
        await getGameState();


      currentPlayerIdRef.current =
        data.currentPlayerId;


      setGame(
        data
      );


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
          localStorage.getItem(
            storageKey
          ) === "true"
        );
      }
      if (
        selectedTeamId
      ) {

        loadRoster(
          selectedTeamId
        );

}
    } catch {
      setError(
        "Could not load the current auction."
      );
    }
  }


  function selectTeam(
    teamId: number
  ) {
    saveTeamId(
      teamId
    );


    setSelectedTeamId(
      teamId
    );


    setError("");
  }


  function changeTeam() {
    clearTeamId();


    setSelectedTeamId(
      null
    );


    setBidSubmitted(
      false
    );


    setBidAmount("");
    setError("");
  }

async function loadRoster(
  teamId: number
) {

  try {

    const data =
      await getRoster(
        teamId
      );

    setRoster(
      data
    );

  } catch {

    setRoster(
      null
    );

  }

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
        Number(
          bidAmount
        );


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


      setBidSubmitted(
        true
      );
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

      <div className="player-content">
        {
          activeTab === "auction" && (
            <AuctionPanel
              game={game}
              bidAmount={bidAmount}
              bidSubmitted={bidSubmitted}
              selectedTeamId={
                selectedTeam.id
              }
              teamBudget={
                selectedTeam.budget
              }
              error={error}
              onBidAmountChange={
                setBidAmount
              }
              onSubmitBid={
                placeBid
              }
            />
          )
        }

        {
          activeTab === "team" && (
          <MyTeamPanel
            roster={roster}
          />
          )
        }
      </div>

      <div className="player-nav">
        <button
          className={
            activeTab === "auction"
              ? "active"
              : ""
          }
          onClick={
            () =>
              setActiveTab(
                "auction"
              )
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
              setActiveTab(
                "team"
              )
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