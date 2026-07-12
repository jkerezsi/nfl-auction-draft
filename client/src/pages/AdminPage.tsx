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


import Countdown from "../components/player/Countdown";
import {
  getGameState,
  nominatePlayer
} from "../services/gameService";

import {
  getAuctionResults
} from "../services/bidService";

import socket from "../services/socket";

import type {
  Team
} from "../types/team";

import type {
  Player
} from "../types/player";

import type {
  AuctionBid
} from "../services/bidService";


interface GameState {
  id: number;
  status: string;
  currentPlayerId: number | null;
  countdown: number;

  lastWinnerTeamId: number | null;
  lastWinnerPrice: number | null;
  lastWinnerPlayerId: number | null;

  submittedBidCount: number;
  totalTeamCount: number;

  currentPlayer: Player | null;
}


export default function AdminPage() {
  const [teams, setTeams] =
    useState<Team[]>([]);

  const [players, setPlayers] =
    useState<Player[]>([]);

  const [game, setGame] =
    useState<GameState | null>(
      null
    );

  const [results, setResults] =
    useState<AuctionBid[]>([]);

  const [name, setName] =
    useState("");

  const [error, setError] =
    useState("");


  useEffect(
    () => {
      void loadInitialData();


      function handleGameUpdated(
        updatedGame: GameState
      ) {
        setGame(
          updatedGame
        );


        if (
          updatedGame.status === "RESULT" &&
          updatedGame.lastWinnerPlayerId !== null
        ) {
          void loadResults(
            updatedGame.lastWinnerPlayerId
          );

          void loadTeams();
          void loadPlayers();
        } else {
          setResults([]);
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
      setGame(gameData);


      if (
        gameData.status === "RESULT" &&
        gameData.lastWinnerPlayerId !== null
      ) {
        await loadResults(
          gameData.lastWinnerPlayerId
        );
      }
    } catch {
      setError(
        "Could not load the admin board."
      );
    }
  }


  async function loadTeams() {
    const data =
      await getTeams();

    setTeams(data);
  }


  async function loadPlayers() {
    const data =
      await getPlayers();

    setPlayers(data);
  }


  async function loadResults(
    playerId: number
  ) {
    try {
      const data =
        await getAuctionResults(
          playerId
        );


      setResults(data);
    } catch {
      setResults([]);
    }
  }


  async function addTeam() {
    const trimmedName =
      name.trim();


    if (!trimmedName) {
      return;
    }


    try {
      setError("");


      await createTeam(
        trimmedName
      );


      setName("");


      await loadTeams();
    } catch {
      setError(
        "Could not create the team."
      );
    }
  }


  async function startAuction(
    playerId: number
  ) {
    try {
      setError("");
      setResults([]);


      const updatedGame =
        await nominatePlayer(
          playerId
        );


      setGame(
        updatedGame
      );
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.error ??
        "Could not nominate the player."
      );
    }
  }


  function getTeamName(
    teamId: number
  ) {
    return (
      teams.find(
        team =>
          team.id === teamId
      )?.name ??
      `Team ${teamId}`
    );
  }


  const currentPlayer =
    game?.currentPlayer ?? null;


  const isAuctionActive =
    game?.status === "AUCTION";


  const isResult =
    game?.status === "RESULT";


  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px",
        background: "#111827",
        color: "white"
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "20px",
          marginBottom: "24px"
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "36px"
            }}
          >
            Fantasy Auction Draft
          </h1>

          <p
            style={{
              marginBottom: 0,
              opacity: 0.7
            }}
          >
            Admin Big-Screen Board
          </p>
        </div>

        <div
          style={{
            fontSize: "20px"
          }}
        >
          Teams: {teams.length}
        </div>
      </header>

      {
        error && (
          <div
            style={{
              padding: "14px",
              marginBottom: "20px",
              background: "#7f1d1d",
              borderRadius: "10px"
            }}
          >
            {error}
          </div>
        )
      }

      <section
        style={{
          padding: "28px",
          marginBottom: "24px",
          background: "#1f2937",
          borderRadius: "18px",
          textAlign: "center"
        }}
      >
        {
          !currentPlayer ? (
            <>
              <h2
                style={{
                  fontSize: "32px"
                }}
              >
                Waiting for nomination
              </h2>

              <p>
                Select a player from the pool below.
              </p>
            </>
          ) : isAuctionActive ? (
            <>
              <p
                style={{
                  margin: 0,
                  fontSize: "20px",
                  letterSpacing: "2px"
                }}
              >
                CURRENT AUCTION
              </p>

              <h2
                style={{
                  margin:
                    "18px 0 4px",
                  fontSize: "52px"
                }}
              >
                {currentPlayer.name}
              </h2>

              <p
                style={{
                  fontSize: "24px"
                }}
              >
                {currentPlayer.position}
                {" · "}
                {currentPlayer.nfl_team}
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "center",
                  flexWrap: "wrap",
                  gap: "60px",
                  marginTop: "34px"
                }}
              >
              <Countdown
                seconds={game.countdown}
              />

                <div>
                  <div
                    style={{
                      opacity: 0.7,
                      fontSize: "18px"
                    }}
                  >
                    BIDS SUBMITTED
                  </div>

                  <div
                    style={{
                      fontSize: "80px",
                      fontWeight: 700
                    }}
                  >
                    {game.submittedBidCount}
                    {" / "}
                    {game.totalTeamCount}
                  </div>
                </div>
              </div>
            </>
          ) : isResult ? (
            <>
              <p
                style={{
                  margin: 0,
                  fontSize: "20px",
                  letterSpacing: "2px"
                }}
              >
                AUCTION RESULTS
              </p>

              <h2
                style={{
                  margin:
                    "18px 0 4px",
                  fontSize: "46px"
                }}
              >
                {currentPlayer.name}
              </h2>

              <p
                style={{
                  fontSize: "22px"
                }}
              >
                {currentPlayer.position}
                {" · "}
                {currentPlayer.nfl_team}
              </p>

              {
                results.length === 0 ? (
                  <h3
                    style={{
                      marginTop: "34px",
                      fontSize: "30px"
                    }}
                  >
                    No bids submitted
                  </h3>
                ) : (
                  <div
                    style={{
                      maxWidth: "850px",
                      margin:
                        "32px auto 0"
                    }}
                  >
                    {
                      results.map(
                        (
                          bid,
                          index
                        ) => (
                          <div
                            key={bid.id}
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "80px 1fr 180px",
                              alignItems:
                                "center",
                              gap: "20px",
                              padding: "18px 22px",
                              marginBottom:
                                "10px",
                              borderRadius:
                                "12px",
                              background:
                                index === 0
                                  ? "#166534"
                                  : "#374151",
                              fontSize:
                                index === 0
                                  ? "30px"
                                  : "24px",
                              fontWeight:
                                index === 0
                                  ? 700
                                  : 400
                            }}
                          >
                            <span>
                              {
                                index === 0
                                  ? "🏆"
                                  : `${index + 1}.`
                              }
                            </span>

                            <span
                              style={{
                                textAlign:
                                  "left"
                              }}
                            >
                              {getTeamName(
                                bid.team_id
                              )}
                            </span>

                            <span
                              style={{
                                textAlign:
                                  "right"
                              }}
                            >
                              ${bid.amount}
                            </span>
                          </div>
                        )
                      )
                    }
                  </div>
                )
              }
            </>
          ) : (
            <h2>
              Waiting for the next auction
            </h2>
          )
        }
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(280px, 1fr) minmax(480px, 2fr)",
          gap: "24px",
          alignItems: "start"
        }}
      >
        <section
          style={{
            padding: "20px",
            background: "#1f2937",
            borderRadius: "16px"
          }}
        >
          <h2>
            Teams
          </h2>

          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "18px"
            }}
          >
            <input
              value={name}
              onChange={
                event =>
                  setName(
                    event.target.value
                  )
              }
              placeholder="Team name"
              style={{
                flex: 1,
                padding: "12px"
              }}
            />

            <button
              onClick={addTeam}
              style={{
                padding:
                  "12px 16px"
              }}
            >
              Add
            </button>
          </div>

          {
            teams.map(
              team => (
                <div
                  key={team.id}
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    padding: "10px 0",
                    borderBottom:
                      "1px solid #374151"
                  }}
                >
                  <span>
                    {team.name}
                  </span>

                  <span>
                    ${team.budget}
                  </span>
                </div>
              )
            )
          }
        </section>

        <section
          style={{
            padding: "20px",
            background: "#1f2937",
            borderRadius: "16px"
          }}
        >
          <h2>
            Player Pool
          </h2>

          <div
            style={{
              maxHeight: "650px",
              overflowY: "auto"
            }}
          >
            {
              players.map(
                player => (
                  <div
                    key={player.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "70px 1fr 100px 130px",
                      alignItems:
                        "center",
                      gap: "12px",
                      padding: "10px",
                      opacity:
                        player.drafted === 1
                          ? 0.35
                          : 1,
                      borderBottom:
                        "1px solid #374151"
                    }}
                  >
                    <span>
                      #{player.rank}
                    </span>

                    <span>
                      {player.name}
                    </span>

                    <span>
                      {player.position}
                    </span>

                    <button
                      disabled={
                        player.drafted === 1 ||
                        isAuctionActive
                      }
                      onClick={
                        () =>
                          startAuction(
                            player.id
                          )
                      }
                      style={{
                        padding: "10px"
                      }}
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
        </section>
      </div>
    </div>
  );
}