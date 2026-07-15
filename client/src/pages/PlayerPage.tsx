import {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  isAxiosError
} from "axios";

import {
  getTeams
} from "../services/teamService";

import {
  getRoster,
  releasePlayer
} from "../services/rosterService";

import {
  saveTeamId,
  getTeamId,
  clearTeamId
} from "../services/sessionService";

import useAuction from "../hooks/useAuction";

import TeamSelector from "../components/player/TeamSelector";
import AuctionPanel from "../components/player/AuctionPanel";
import MyTeamPanel from "../components/player/MyTeamPanel";

import "../styles/player.css";

import type {
  Team
} from "../types/team";

import type {
  RosterPlayer,
  TeamRoster
} from "../types/roster";


type Tab =
  | "auction"
  | "team";


interface ApiErrorResponse {
  error?: string;
}


function PlayerPage() {
  const [teams, setTeams] =
    useState<Team[]>([]);

  const [selectedTeamId, setSelectedTeamId] =
    useState<number | null>(
      getTeamId()
    );

  const [roster, setRoster] =
    useState<TeamRoster | null>(
      null
    );

  const [rosterLoading, setRosterLoading] =
    useState(false);

  const [rosterError, setRosterError] =
    useState("");

  const [
    releasingRosterId,
    setReleasingRosterId
  ] =
    useState<number | null>(
      null
    );

  const [activeTab, setActiveTab] =
    useState<Tab>(
      "auction"
    );

  const [pageError, setPageError] =
    useState("");


  const loadTeams =
    useCallback(
      async () => {
        try {
          const data =
            await getTeams();


          setTeams(
            data
          );
        } catch {
          setPageError(
            "Could not load teams."
          );
        }
      },
      []
    );


  const loadRoster =
    useCallback(
      async (
        teamId: number
      ) => {
        setRosterLoading(
          true
        );

        setRosterError(
          ""
        );


        try {
          const data =
            await getRoster(
              teamId
            );


          setRoster(
            data
          );
        } catch {
          setRosterError(
            "Could not load your roster."
          );
        } finally {
          setRosterLoading(
            false
          );
        }
      },
      []
    );


  const handleAuctionResult =
    useCallback(
      () => {
        void loadTeams();


        if (
          selectedTeamId !== null
        ) {
          void loadRoster(
            selectedTeamId
          );
        }
      },
      [
        loadRoster,
        loadTeams,
        selectedTeamId
      ]
    );


  const {
    game,
    bidAmount,
    bidSubmitted,
    error: auctionError,
    setBidAmount,
    placeBid
  } = useAuction({
    selectedTeamId,
    onAuctionResult:
      handleAuctionResult
  });


  useEffect(
    () => {
      void loadTeams();
    },
    [loadTeams]
  );


  useEffect(
    () => {
      if (
        selectedTeamId === null
      ) {
        setRoster(
          null
        );

        setRosterError(
          ""
        );

        setRosterLoading(
          false
        );

        setReleasingRosterId(
          null
        );

        return;
      }


      void loadRoster(
        selectedTeamId
      );
    },
    [
      loadRoster,
      selectedTeamId
    ]
  );


  function selectTeam(
    teamId: number
  ) {
    saveTeamId(
      teamId
    );


    setSelectedTeamId(
      teamId
    );


    setPageError(
      ""
    );
  }


  function changeTeam() {
    clearTeamId();


    setSelectedTeamId(
      null
    );

    setRoster(
      null
    );

    setRosterError(
      ""
    );

    setRosterLoading(
      false
    );

    setReleasingRosterId(
      null
    );

    setActiveTab(
      "auction"
    );

    setPageError(
      ""
    );
  }


  async function handleReleasePlayer(
    player: RosterPlayer
  ) {
    if (
      selectedTeamId === null
    ) {
      return;
    }


    const confirmed =
      window.confirm(
        `Release ${player.playerName}? ` +
        `$${player.price} will be refunded and the player will return to the pool.`
      );


    if (!confirmed) {
      return;
    }


    try {
      setRosterError(
        ""
      );

      setPageError(
        ""
      );

      setReleasingRosterId(
        player.id
      );


      await releasePlayer(
        player.id
      );


      await Promise.all([
        loadRoster(
          selectedTeamId
        ),
        loadTeams()
      ]);
    } catch (
      requestError: unknown
    ) {
      if (
        isAxiosError<ApiErrorResponse>(
          requestError
        )
      ) {
        setRosterError(
          requestError.response?.data?.error ??
          "Could not release the player."
        );
      } else {
        setRosterError(
          "Could not release the player."
        );
      }
    } finally {
      setReleasingRosterId(
        null
      );
    }
  }


  const selectedTeam =
    teams.find(
      team =>
        team.id === selectedTeamId
    );


  if (
    !selectedTeam
  ) {
    return (
      <>
        {
          pageError && (
            <p
              className="player-error"
              role="alert"
            >
              {pageError}
            </p>
          )
        }

        <TeamSelector
          teams={
            teams
          }
          onSelect={
            selectTeam
          }
        />
      </>
    );
  }


  return (
    <main className="player-page">
      <header className="player-header">
        <div>
          <span className="player-header__label">
            Your team
          </span>

          <h1>
            {selectedTeam.name}
          </h1>
        </div>

        <div className="player-budget">
          <span className="player-budget__label">
            Budget
          </span>

          <strong className="player-budget__value">
            ${selectedTeam.budget}
          </strong>
        </div>
      </header>

      <nav
        className="player-nav"
        aria-label="Player page sections"
      >
        <button
          type="button"
          className={
            activeTab === "auction"
              ? "active"
              : ""
          }
          aria-pressed={
            activeTab === "auction"
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
          type="button"
          className={
            activeTab === "team"
              ? "active"
              : ""
          }
          aria-pressed={
            activeTab === "team"
          }
          onClick={
            () =>
              setActiveTab(
                "team"
              )
          }
        >
          My Team

          {
            roster &&
            roster.playerCount > 0 && (
              <span className="player-nav__count">
                {roster.playerCount}
              </span>
            )
          }
        </button>
      </nav>

      <div className="player-content">
        {
          activeTab === "auction" && (
            <AuctionPanel
              game={
                game
              }
              bidAmount={
                bidAmount
              }
              bidSubmitted={
                bidSubmitted
              }
              selectedTeamId={
                selectedTeam.id
              }
              teamBudget={
                selectedTeam.budget
              }
              error={
                auctionError ||
                pageError
              }
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
              roster={
                roster
              }
              loading={
                rosterLoading
              }
              error={
                rosterError
              }
              releasingRosterId={
                releasingRosterId
              }
              onReleasePlayer={
                player =>
                  void handleReleasePlayer(
                    player
                  )
              }
            />
          )
        }
      </div>

      <button
        type="button"
        className="change-team"
        onClick={
          changeTeam
        }
      >
        Change Team
      </button>
    </main>
  );
}


export default PlayerPage;
