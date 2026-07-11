import {
  useEffect,
  useState
} from "react";

import {
  getTeams,
  createTeam
} from "../services/teamService";

import {
  getPlayers
} from "../services/playerService";

import {
  getGameState,
  nominatePlayer
} from "../services/gameService";

import type { Team } from "../types/team";
import type { Player } from "../types/player";

import TeamCard from "../components/TeamCard";


export default function AdminPage() {
  const [teams, setTeams] =
    useState<Team[]>([]);

  const [players, setPlayers] =
    useState<Player[]>([]);

  const [name, setName] =
    useState("");

  const [currentPlayer, setCurrentPlayer] =
    useState<Player | null>(null);

  const [error, setError] =
    useState("");


  useEffect(
    () => {
      void loadInitialData();
    },
    []
  );


  async function loadInitialData() {
    try {
      setError("");

      const [
        teamData,
        playerData,
        gameData
      ] = await Promise.all([
        getTeams(),
        getPlayers(),
        getGameState()
      ]);


      setTeams(teamData);
      setPlayers(playerData);


      const activePlayer =
        playerData.find(
          player =>
            player.id === gameData.currentPlayerId
        ) ?? null;


      setCurrentPlayer(activePlayer);
    } catch {
      setError("Could not load the admin dashboard.");
    }
  }


  async function loadTeams() {
    const data = await getTeams();
    setTeams(data);
  }


  async function addTeam() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }


    try {
      setError("");

      await createTeam(trimmedName);

      setName("");

      await loadTeams();
    } catch {
      setError("Could not create the team.");
    }
  }


  async function startAuction(
    playerId: number
  ) {
    try {
      setError("");

      const result =
        await nominatePlayer(playerId);


      setCurrentPlayer(
        result.currentPlayer ?? null
      );
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.error ??
        "Could not nominate the player."
      );
    }
  }


  return (
    <div>
      <h1>
        Admin Dashboard
      </h1>

      {
        error && (
          <p>
            {error}
          </p>
        )
      }

      <h2>
        Teams
      </h2>

      <div>
        <input
          value={name}
          onChange={
            event =>
              setName(event.target.value)
          }
          placeholder="Team name"
        />

        <button
          onClick={addTeam}
        >
          Add Team
        </button>
      </div>

      <div>
        {
          teams.map(
            team => (
              <TeamCard
                key={team.id}
                team={team}
              />
            )
          )
        }
      </div>

      <hr />

      <h2>
        Auction Control
      </h2>

      {
        currentPlayer ? (
          <div>
            <h3>
              Current Player
            </h3>

            <p>
              {currentPlayer.name}
              {" - "}
              {currentPlayer.position}
              {" - "}
              {currentPlayer.nfl_team}
            </p>
          </div>
        ) : (
          <p>
            No player is currently selected.
          </p>
        )
      }

      <h3>
        Players
      </h3>

      <div>
        {
          players.map(
            player => (
              <div
                key={player.id}
                style={{
                  opacity:
                    player.drafted === 1
                      ? 0.45
                      : 1
                }}
              >
                <span>
                  {player.rank}.{" "}
                  {player.name}{" "}
                  ({player.position})
                </span>

                <button
                  disabled={
                    player.drafted === 1
                  }
                  onClick={
                    () =>
                      startAuction(player.id)
                  }
                >
                  {
                    player.drafted === 1
                      ? "Drafted"
                      : "Nominate"
                  }
                </button>
              </div>
            )
          )
        }
      </div>
    </div>
  );
}