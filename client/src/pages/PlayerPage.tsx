import {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  getTeams
} from "../services/teamService";

import {
  getRoster
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
  TeamRoster
} from "../types/roster";


type Tab =
  | "auction"
  | "team";


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
        console.log(
          "Loading roster for team:",
          teamId
        );


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


          console.log(
            "Roster response:",
            data
          );


          setRoster(
            data
          );
        } catch (requestError: unknown) {
          console.error(
            "Roster request failed:",
            requestError
          );


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

    setActiveTab(
      "auction"
    );

    setPageError(
      ""
    );
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