import PlayerCard from "../../shared/PlayerCard";

import type {
  TeamRoster
} from "../../types/roster";


interface MyTeamPanelProps {
  roster: TeamRoster | null;
  loading: boolean;
  error: string;
}


export default function MyTeamPanel({
  roster,
  loading,
  error
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

      {
        roster.players.length === 0 ? (
          <div className="empty-roster">
            <h3>
              No players drafted yet
            </h3>

            <p>
              Players you win will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="roster-list">
            {
              roster.players.map(
                player => (
                <PlayerCard
                  name={player.name}
                  position={player.position}
                  nflTeam={player.nfl_team}
                  byeWeek={player.bye_week}
                  rank={player.rank}
                  auctionValue={player.auction_value}
                  compact
                />
                )
              )
            }
          </div>
        )
      }
    </section>
  );
}