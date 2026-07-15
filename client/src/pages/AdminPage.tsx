import { useEffect, useState } from "react";

import {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
} from "../services/teamService";

import { getPlayers } from "../services/playerService";

import Countdown from "../components/player/Countdown";
import PlayerCard from "../shared/PlayerCard";

import {
  getGameState,
  nominatePlayer,
  resetDraft,
} from "../services/gameService";

import { getAuctionResults } from "../services/bidService";

import socket from "../services/socket";

import type { Team } from "../types/team";

import type { Player } from "../types/player";

import type { AuctionBid } from "../types/bid";
import TeamsPanel from
  "../components/admin/TeamsPanel";

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

const POSITION_FILTERS = ["ALL", "QB", "RB", "WR", "TE", "K", "DST"] as const;

type PositionFilter = (typeof POSITION_FILTERS)[number];

export default function AdminPage() {
  const [teams, setTeams] = useState<Team[]>([]);

  const [players, setPlayers] = useState<Player[]>([]);

  const [game, setGame] = useState<GameState | null>(null);

  const [results, setResults] = useState<AuctionBid[]>([]);

  const [name, setName] = useState("");

  const [error, setError] = useState("");

  const [selectedPosition, setSelectedPosition] =
    useState<PositionFilter>("ALL");

  const [confirmReset, setConfirmReset] = useState(false);

  const [isResetting, setIsResetting] = useState(false);

  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);

  const [editingTeamName, setEditingTeamName] = useState("");

  const [deletingTeamId, setDeletingTeamId] = useState<number | null>(null);

  const [isSavingTeam, setIsSavingTeam] = useState(false);

  const [isDeletingTeam, setIsDeletingTeam] = useState(false);

  useEffect(() => {
    void loadInitialData();

    function handleGameUpdated(updatedGame: GameState) {
      setGame(updatedGame);

      if (
        updatedGame.status === "RESULT" &&
        updatedGame.lastWinnerPlayerId !== null
      ) {
        void loadResults(updatedGame.lastWinnerPlayerId);

        void loadTeams();
        void loadPlayers();
      } else {
        setResults([]);
      }

      if (updatedGame.status === "SETUP") {
        void loadTeams();
        void loadPlayers();
      }
    }

    socket.on("GAME_UPDATED", handleGameUpdated);

    return () => {
      socket.off("GAME_UPDATED", handleGameUpdated);
    };
  }, []);

  async function loadInitialData() {
    try {
      setError("");

      const [teamData, playerData, gameData] = await Promise.all([
        getTeams(),
        getPlayers(),
        getGameState(),
      ]);

      setTeams(teamData);

      setPlayers(playerData);

      setGame(gameData);

      if (
        gameData.status === "RESULT" &&
        gameData.lastWinnerPlayerId !== null
      ) {
        await loadResults(gameData.lastWinnerPlayerId);
      }
    } catch {
      setError("Could not load the admin board.");
    }
  }

  async function loadTeams() {
    const data =
      await getTeams();


    setTeams(
      data
    );
  }


  async function loadPlayers() {
    const data = await getPlayers();

    setPlayers(data);
  }

  async function loadResults(playerId: number) {
    try {
      const data = await getAuctionResults(playerId);

      setResults(data);
    } catch {
      setResults([]);
    }
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

  function beginEditingTeam(team: Team) {
    setError("");

    setDeletingTeamId(null);

    setEditingTeamId(team.id);

    setEditingTeamName(team.name);
  }

  function cancelEditingTeam() {
    setEditingTeamId(null);

    setEditingTeamName("");
  }

  async function saveTeamName(teamId: number) {
    const trimmedName = editingTeamName.trim();

    if (!trimmedName) {
      setError("Team name required.");

      return;
    }

    try {
      setError("");

      setIsSavingTeam(true);

      await updateTeam(teamId, trimmedName);

      await loadTeams();

      cancelEditingTeam();
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.error ?? "Could not update the team.",
      );
    } finally {
      setIsSavingTeam(false);
    }
  }

  async function handleDeleteTeam(teamId: number) {
    if (deletingTeamId !== teamId) {
      setEditingTeamId(null);

      setEditingTeamName("");

      setDeletingTeamId(teamId);

      return;
    }

    try {
      setError("");

      setIsDeletingTeam(true);

      await deleteTeam(teamId);

      const [teamData, playerData, gameData] = await Promise.all([
        getTeams(),
        getPlayers(),
        getGameState(),
      ]);

      setTeams(teamData);

      setPlayers(playerData);

      setGame(gameData);

      setResults([]);
      setDeletingTeamId(null);
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.error ?? "Could not delete the team.",
      );
    } finally {
      setIsDeletingTeam(false);
    }
  }

  async function startAuction(playerId: number) {
    try {
      setError("");
      setResults([]);
      setConfirmReset(false);

      const updatedGame = await nominatePlayer(playerId);

      setGame(updatedGame);
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.error ?? "Could not nominate the player.",
      );
    }
  }

  async function handleResetDraft() {
    if (!confirmReset) {
      setConfirmReset(true);

      return;
    }

    try {
      setError("");
      setIsResetting(true);

      const updatedGame = await resetDraft();

      const [teamData, playerData] = await Promise.all([
        getTeams(),
        getPlayers(),
      ]);

      setGame(updatedGame);

      setTeams(teamData);

      setPlayers(playerData);

      setResults([]);
      setSelectedPosition("ALL");
      setConfirmReset(false);
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.error ?? "Could not reset the draft.",
      );
    } finally {
      setIsResetting(false);
    }
  }

  function getTeamName(teamId: number) {
    return teams.find((team) => team.id === teamId)?.name ?? `Team ${teamId}`;
  }

  function normalizePosition(position: string): PositionFilter | string {
    const normalized = position.trim().toUpperCase();

    const positionMap: Record<string, PositionFilter> = {
      QB: "QB",
      RB: "RB",
      WR: "WR",
      TE: "TE",
      K: "K",
      DST: "DST",
      DEF: "DST",
    };

    const key = normalized.replace(/\s+/g, "").replace(/\d+$/, "");

    return positionMap[key] ?? key;
  }

  const filteredPlayers =
    selectedPosition === "ALL"
      ? players
      : players.filter(
          (player) => normalizePosition(player.position) === selectedPosition,
        );

  const currentPlayer = game?.currentPlayer ?? null;

  const isAuctionActive = game?.status === "AUCTION";

  const isResult = game?.status === "RESULT";

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px",
        background: "#111827",
        color: "white",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "36px",
            }}
          >
            Fantasy Auction Draft
          </h1>

          <p
            style={{
              marginBottom: 0,
              opacity: 0.7,
            }}
          >
            Admin Big-Screen Board
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: "20px",
            }}
          >
            Teams: {teams.length}
          </div>

          {confirmReset && (
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              disabled={isResetting}
              style={{
                padding: "10px 16px",
                border: "1px solid #6b7280",
                borderRadius: "8px",
                background: "#374151",
                color: "white",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={() => void handleResetDraft()}
            disabled={isResetting}
            style={{
              padding: "10px 16px",
              border: confirmReset ? "1px solid #f87171" : "1px solid #6b7280",
              borderRadius: "8px",
              background: confirmReset ? "#b91c1c" : "#374151",
              color: "white",
              fontWeight: 700,
              cursor: isResetting ? "not-allowed" : "pointer",
              opacity: isResetting ? 0.65 : 1,
            }}
          >
            {isResetting
              ? "Resetting..."
              : confirmReset
                ? "Confirm Reset"
                : "Reset Draft"}
          </button>
        </div>
      </header> 

      {confirmReset && (
        <div
          style={{
            padding: "14px",
            marginBottom: "20px",
            background: "#7f1d1d",
            border: "1px solid #ef4444",
            borderRadius: "10px",
          }}
        >
          This will erase all bids and rosters, restore every team budget, and
          mark every player as undrafted. Click Confirm Reset to continue.
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "14px",
            marginBottom: "20px",
            background: "#7f1d1d",
            borderRadius: "10px",
          }}
        >
          {error}
        </div>
      )}

      <section
        style={{
          padding: "28px",
          marginBottom: "24px",
          background: "#1f2937",
          borderRadius: "18px",
          textAlign: "center",
        }}
      >
        {!currentPlayer ? (
          <>
            <h2
              style={{
                fontSize: "32px",
              }}
            >
              Waiting for nomination
            </h2>

            <p>Select a player from the pool below.</p>
          </>
        ) : isAuctionActive ? (
          <>
            <p
              style={{
                margin: 0,
                fontSize: "20px",
                letterSpacing: "2px",
              }}
            >
              CURRENT AUCTION
            </p>

            <div
              style={{
                maxWidth: "600px",
                margin: "18px auto 0",
                textAlign: "left",
              }}
            >
              <PlayerCard
                name={currentPlayer.name}
                position={currentPlayer.position}
                nflTeam={currentPlayer.nfl_team}
                byeWeek={currentPlayer.bye_week}
                rank={currentPlayer.rank}
                auctionValue={currentPlayer.auction_value}
                salePrice={game.lastWinnerPrice ?? undefined}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: "60px",
                marginTop: "34px",
              }}
            >
              <Countdown seconds={game.countdown} />

              <div>
                <div
                  style={{
                    opacity: 0.7,
                    fontSize: "18px",
                  }}
                >
                  BIDS SUBMITTED
                </div>

                <div
                  style={{
                    fontSize: "80px",
                    fontWeight: 700,
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
                letterSpacing: "2px",
              }}
            >
              AUCTION RESULTS
            </p>

            <div
              style={{
                maxWidth: "600px",
                margin: "18px auto 0",
                textAlign: "left",
              }}
            >
              <PlayerCard
                name={currentPlayer.name}
                position={currentPlayer.position}
                nflTeam={currentPlayer.nfl_team}
                byeWeek={currentPlayer.bye_week}
                rank={currentPlayer.rank}
                auctionValue={currentPlayer.auction_value}
                salePrice={game.lastWinnerPrice ?? undefined}
              />
            </div>

            {results.length === 0 ? (
              <h3
                style={{
                  marginTop: "34px",
                  fontSize: "30px",
                }}
              >
                No bids submitted
              </h3>
            ) : (
              <div
                style={{
                  maxWidth: "850px",
                  margin: "32px auto 0",
                }}
              >
                {results.map((bid, index) => (
                  <div
                    key={bid.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "80px 1fr 180px",
                      alignItems: "center",
                      gap: "20px",
                      padding: "18px 22px",
                      marginBottom: "10px",
                      borderRadius: "12px",
                      background: index === 0 ? "#166534" : "#374151",
                      fontSize: index === 0 ? "30px" : "24px",
                      fontWeight: index === 0 ? 700 : 400,
                    }}
                  >
                    <span>{index === 0 ? "🏆" : `${index + 1}.`}</span>

                    <span
                      style={{
                        textAlign: "left",
                      }}
                    >
                      {getTeamName(bid.team_id)}
                    </span>

                    <span
                      style={{
                        textAlign: "right",
                      }}
                    >
                      ${bid.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <h2>Waiting for the next auction</h2>
        )}
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(280px, 1fr) minmax(480px, 2fr)",
          gap: "24px",
          alignItems: "start",
        }}
      >
      <TeamsPanel
        teams={
          teams
        }
        name={
          name
        }
        editingTeamId={
          editingTeamId
        }
        editingTeamName={
          editingTeamName
        }
        deletingTeamId={
          deletingTeamId
        }
        isSavingTeam={
          isSavingTeam
        }
        isDeletingTeam={
          isDeletingTeam
        }
        isAuctionActive={
          isAuctionActive
        }
        onNameChange={
          setName
        }
        onAddTeam={
          () =>
            void addTeam()
        }
        onEditingTeamNameChange={
          setEditingTeamName
        }
        onBeginEditing={
          beginEditingTeam
        }
        onCancelEditing={
          cancelEditingTeam
        }
        onSaveTeam={
          teamId =>
            void saveTeamName(
              teamId
            )
        }
        onCancelDelete={
          () =>
            setDeletingTeamId(
              null
            )
        }
        onDeleteTeam={
          teamId =>
            void handleDeleteTeam(
              teamId
            )
        }
      />

        <section
          style={{
            padding: "20px",
            background: "#1f2937",
            borderRadius: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "18px",
            }}
          >
            <h2
              style={{
                margin: 0,
              }}
            >
              Player Pool
            </h2>

            <span
              style={{
                opacity: 0.7,
              }}
            >
              {filteredPlayers.length}{" "}
              {filteredPlayers.length === 1 ? "player" : "players"}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginBottom: "18px",
            }}
          >
            {POSITION_FILTERS.map((position) => {
              const isSelected = selectedPosition === position;

              return (
                <button
                  key={position}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedPosition(position)}
                  style={{
                    minWidth: "52px",
                    padding: "9px 14px",
                    border: isSelected
                      ? "1px solid #60a5fa"
                      : "1px solid #4b5563",
                    borderRadius: "999px",
                    background: isSelected ? "#2563eb" : "#374151",
                    color: "white",
                    fontWeight: isSelected ? 700 : 500,
                    cursor: "pointer",
                  }}
                >
                  {position}
                </button>
              );
            })}
          </div>

          <div
            style={{
              maxHeight: "650px",
              overflowY: "auto",
            }}
          >
            {filteredPlayers.length === 0 ? (
              <div
                style={{
                  padding: "32px 16px",
                  textAlign: "center",
                  opacity: 0.7,
                }}
              >
                No players found for {selectedPosition}.
              </div>
            ) : (
              filteredPlayers.map((player) => (
                <div
                  key={player.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 130px",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px",
                    opacity: player.drafted === 1 ? 0.35 : 1,
                    borderBottom: "1px solid #374151",
                  }}
                >
                  <PlayerCard
                    name={player.name}
                    position={player.position}
                    nflTeam={player.nfl_team}
                    byeWeek={player.bye_week}
                    rank={player.rank}
                    auctionValue={player.auction_value}
                    compact
                  />

                  <button
                    type="button"
                    disabled={player.drafted === 1 || isAuctionActive}
                    onClick={() => void startAuction(player.id)}
                    style={{
                      padding: "10px",
                    }}
                  >
                    {player.drafted === 1 ? "Drafted" : "Nominate"}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
