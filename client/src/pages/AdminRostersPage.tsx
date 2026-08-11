import {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  Link
} from "react-router-dom";

import {
  getTeams
} from "../services/teamService";

import {
  getRoster
} from "../services/rosterService";

import {
  logout
} from "../services/adminAuthService";

import socket from "../services/socket";

import type {
  TeamRoster
} from "../types/roster";


const ROSTER_SLOTS = [
  "QB",
  "RB1",
  "RB2",
  "WR1",
  "WR2",
  "TE",
  "FLEX",
  "K",
  "DST",
  "BENCH1",
  "BENCH2",
  "BENCH3",
  "BENCH4",
  "BENCH5",
  "BENCH6"
];


export default function AdminRostersPage() {
  const [
    rosters,
    setRosters
  ] = useState<TeamRoster[]>([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");


  const loadRosters =
    useCallback(
      async () => {
        try {
          setError("");

          const teams =
            await getTeams();

          const rosterData =
            await Promise.all(
              teams.map(
                team =>
                  getRoster(
                    team.id
                  )
              )
            );

          setRosters(
            rosterData
          );
        } catch {
          setError(
            "Could not load team rosters."
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      []
    );


  useEffect(
    () => {
      void loadRosters();


      const handleGameUpdated =
        () => {
          void loadRosters();
        };


      const handleTeamUpdated =
        () => {
          void loadRosters();
        };


      socket.on(
        "GAME_UPDATED",
        handleGameUpdated
      );

      socket.on(
        "TEAM_UPDATED",
        handleTeamUpdated
      );


      return () => {
        socket.off(
          "GAME_UPDATED",
          handleGameUpdated
        );

        socket.off(
          "TEAM_UPDATED",
          handleTeamUpdated
        );
      };
    },
    [
      loadRosters
    ]
  );


  function handleLogout() {
    logout();

    window.location.href =
      "/admin";
  }


  return (
    <div
      style={{
        minHeight:
          "100vh",
        padding:
          "24px",
        background:
          "#111827",
        color:
          "white"
      }}
    >
      <header
        style={{
          display:
            "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
          flexWrap:
            "wrap",
          gap:
            "16px",
          marginBottom:
            "28px"
        }}
      >
        <div>
          <h1
            style={{
              margin:
                0,
              fontSize:
                "36px"
            }}
          >
            League Rosters
          </h1>

          <p
            style={{
              marginTop:
                "6px",
              marginBottom:
                0,
              opacity:
                0.7
            }}
          >
            All teams on one page
          </p>
        </div>


        <div
          style={{
            display:
              "flex",
            flexWrap:
              "wrap",
            gap:
              "10px"
          }}
        >
          <Link
            to="/admin"
            style={{
              padding:
                "10px 16px",
              border:
                "1px solid #60a5fa",
              borderRadius:
                "8px",
              background:
                "#2563eb",
              color:
                "white",
              fontWeight:
                700,
              textDecoration:
                "none"
            }}
          >
            Back to Draft
          </Link>


          <button
            type="button"
            onClick={
              () =>
                void loadRosters()
            }
            style={{
              padding:
                "10px 16px",
              border:
                "1px solid #6b7280",
              borderRadius:
                "8px",
              background:
                "#374151",
              color:
                "white",
              cursor:
                "pointer"
            }}
          >
            Refresh
          </button>


          <button
            type="button"
            onClick={
              handleLogout
            }
            style={{
              padding:
                "10px 16px",
              border:
                "1px solid #6b7280",
              borderRadius:
                "8px",
              background:
                "#374151",
              color:
                "white",
              cursor:
                "pointer"
            }}
          >
            Logout
          </button>
        </div>
      </header>


      {
        error && (
          <div
            style={{
              padding:
                "14px",
              marginBottom:
                "20px",
              background:
                "#7f1d1d",
              border:
                "1px solid #ef4444",
              borderRadius:
                "10px"
            }}
          >
            {
              error
            }
          </div>
        )
      }


      {
        loading ? (
          <div
            style={{
              padding:
                "40px",
              textAlign:
                "center",
              opacity:
                0.7,
              fontSize:
                "20px"
            }}
          >
            Loading rosters...
          </div>
        ) : rosters.length === 0 ? (
          <div
            style={{
              padding:
                "40px",
              textAlign:
                "center",
              background:
                "#1f2937",
              borderRadius:
                "16px",
              opacity:
                0.8
            }}
          >
            No teams have been created yet.
          </div>
        ) : (
          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(340px, 1fr))",
              gap:
                "20px",
              alignItems:
                "start"
            }}
          >
            {
              rosters.map(
                roster => (
                  <TeamRosterCard
                    key={
                      roster.teamId
                    }
                    roster={
                      roster
                    }
                  />
                )
              )
            }
          </div>
        )
      }
    </div>
  );
}


function TeamRosterCard({
  roster
}: {
  roster: TeamRoster;
}) {
  const playerBySlot =
    new Map(
      roster.players.map(
        player => [
          player.slot,
          player
        ]
      )
    );


  return (
    <section
      style={{
        overflow:
          "hidden",
        background:
          "#1f2937",
        border:
          "1px solid #374151",
        borderRadius:
          "16px"
      }}
    >
      <div
        style={{
          padding:
            "18px 20px",
          borderBottom:
            "1px solid #374151"
        }}
      >
        <div
          style={{
            display:
              "flex",
            justifyContent:
              "space-between",
            alignItems:
              "flex-start",
            gap:
              "12px"
          }}
        >
          <div>
            <h2
              style={{
                margin:
                  0,
                fontSize:
                  "24px"
              }}
            >
              {
                roster.teamName
              }
            </h2>

            <div
              style={{
                marginTop:
                  "6px",
                opacity:
                  0.7
              }}
            >
              {
                roster.playerCount
              }
              {" / "}
              {
                ROSTER_SLOTS.length
              }
              {" players"}
            </div>
          </div>


          <div
            style={{
              textAlign:
                "right"
            }}
          >
            <div
              style={{
                fontSize:
                  "24px",
                fontWeight:
                  700
              }}
            >
              $
              {
                roster.budget
              }
            </div>

            <div
              style={{
                marginTop:
                  "3px",
                opacity:
                  0.65,
                fontSize:
                  "13px"
              }}
            >
              remaining
            </div>
          </div>
        </div>


        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "1fr 1fr",
            gap:
              "8px",
            marginTop:
              "14px"
          }}
        >
          <SummaryBox
            label="Spent"
            value={
              `$${roster.spent}`
            }
          />

          <SummaryBox
            label="Open Slots"
            value={
              String(
                ROSTER_SLOTS.length -
                  roster.playerCount
              )
            }
          />
        </div>
      </div>


      <div
        style={{
          padding:
            "8px 16px 16px"
        }}
      >
        {
          ROSTER_SLOTS.map(
            slot => {
              const player =
                playerBySlot.get(
                  slot
                );

              return (
                <div
                  key={
                    slot
                  }
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "70px minmax(0, 1fr) 64px",
                    gap:
                      "10px",
                    alignItems:
                      "center",
                    minHeight:
                      "44px",
                    padding:
                      "7px 4px",
                    borderBottom:
                      "1px solid #374151"
                  }}
                >
                  <div
                    style={{
                      color:
                        "#93c5fd",
                      fontWeight:
                        700,
                      fontSize:
                        "13px"
                    }}
                  >
                    {
                      slot
                    }
                  </div>


                  {
                    player ? (
                      <div
                        style={{
                          minWidth:
                            0
                        }}
                      >
                        <div
                          style={{
                            overflow:
                              "hidden",
                            textOverflow:
                              "ellipsis",
                            whiteSpace:
                              "nowrap",
                            fontWeight:
                              600
                          }}
                        >
                          {
                            player.playerName
                          }
                        </div>

                        <div
                          style={{
                            marginTop:
                              "2px",
                            overflow:
                              "hidden",
                            textOverflow:
                              "ellipsis",
                            whiteSpace:
                              "nowrap",
                            opacity:
                              0.6,
                            fontSize:
                              "12px"
                          }}
                        >
                          {
                            player.position
                          }

                          {
                            player.nflTeam
                              ? ` · ${player.nflTeam}`
                              : ""
                          }

                          {
                            player.rank !==
                            null
                              ? ` · #${player.rank}`
                              : ""
                          }
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          opacity:
                            0.35,
                          fontStyle:
                            "italic"
                        }}
                      >
                        Empty
                      </div>
                    )
                  }


                  <div
                    style={{
                      textAlign:
                        "right",
                      fontWeight:
                        player
                          ? 700
                          : 400,
                      opacity:
                        player
                          ? 1
                          : 0.3
                    }}
                  >
                    {
                      player
                        ? `$${player.price}`
                        : "—"
                    }
                  </div>
                </div>
              );
            }
          )
        }
      </div>
    </section>
  );
}


function SummaryBox({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding:
          "10px 12px",
        background:
          "#111827",
        borderRadius:
          "8px"
      }}
    >
      <div
        style={{
          opacity:
            0.6,
          fontSize:
            "12px"
        }}
      >
        {
          label
        }
      </div>

      <div
        style={{
          marginTop:
            "2px",
          fontSize:
            "18px",
          fontWeight:
            700
        }}
      >
        {
          value
        }
      </div>
    </div>
  );
}