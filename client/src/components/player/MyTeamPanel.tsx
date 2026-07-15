import RosterView, {
  TOTAL_ROSTER_SLOTS
} from "../../shared/RosterView";

import type {
  RosterPlayer,
  TeamRoster
} from "../../types/roster";


interface MyTeamPanelProps {
  roster: TeamRoster | null;
  loading: boolean;
  error: string;

  releasingRosterId:
    number | null;

  onReleasePlayer: (
    player: RosterPlayer
  ) => void;
}


export default function MyTeamPanel({
  roster,
  loading,
  error,
  releasingRosterId,
  onReleasePlayer
}: MyTeamPanelProps) {
  if (
    loading &&
    roster === null
  ) {
    return (
      <section className="player-card">
        <h2>
          My Team
        </h2>

        <p className="player-status-message">
          Loading your roster...
        </p>
      </section>
    );
  }


  if (
    error &&
    roster === null
  ) {
    return (
      <section className="player-card">
        <h2>
          My Team
        </h2>

        <p
          className="player-error"
          role="alert"
        >
          {error}
        </p>
      </section>
    );
  }


  if (
    roster === null
  ) {
    return (
      <section className="player-card">
        <h2>
          My Team
        </h2>

        <p className="player-status-message">
          No roster data available.
        </p>
      </section>
    );
  }


  return (
    <section className="player-card my-team-panel">
      <div className="my-team-heading">
        <div>
          <span className="player-section-eyebrow">
            My Team
          </span>

          <h2>
            {roster.teamName}
          </h2>
        </div>

        {
          loading && (
            <span className="my-team-refreshing">
              Refreshing...
            </span>
          )
        }
      </div>

      <div className="roster-summary">
        <div className="roster-summary__item">
          <span className="roster-summary__label">
            Players
          </span>

          <strong className="roster-summary__value">
            {roster.playerCount}
            {" / "}
            {TOTAL_ROSTER_SLOTS}
          </strong>
        </div>

        <div className="roster-summary__item">
          <span className="roster-summary__label">
            Spent
          </span>

          <strong className="roster-summary__value">
            ${roster.spent}
          </strong>
        </div>

        <div className="roster-summary__item">
          <span className="roster-summary__label">
            Remaining
          </span>

          <strong className="roster-summary__value">
            ${roster.budget}
          </strong>
        </div>
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

      <RosterView
        roster={
          roster
        }
        renderPlayerActions={
          player => (
            <button
              type="button"
              onClick={
                () =>
                  onReleasePlayer(
                    player
                  )
              }
              disabled={
                releasingRosterId !== null
              }
              className="roster-release-button"
            >
              {
                releasingRosterId ===
                  player.id
                  ? "Releasing..."
                  : "Release"
              }
            </button>
          )
        }
      />
    </section>
  );
}
