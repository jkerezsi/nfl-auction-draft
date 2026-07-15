import PlayerCard from "../../shared/PlayerCard";

import type {
  RosterPlayer,
  TeamRoster
} from "../../types/roster";


interface MyTeamPanelProps {
  roster: TeamRoster | null;
  loading: boolean;
  error: string;
}


interface RosterSlotDefinition {
  id: string;
  label: string;
  group:
    | "starters"
    | "bench";
}


const ROSTER_SLOTS:
  RosterSlotDefinition[] = [
    {
      id: "QB",
      label: "QB",
      group: "starters"
    },
    {
      id: "RB1",
      label: "RB",
      group: "starters"
    },
    {
      id: "RB2",
      label: "RB",
      group: "starters"
    },
    {
      id: "WR1",
      label: "WR",
      group: "starters"
    },
    {
      id: "WR2",
      label: "WR",
      group: "starters"
    },
    {
      id: "TE",
      label: "TE",
      group: "starters"
    },
    {
      id: "FLEX",
      label: "FLEX",
      group: "starters"
    },
    {
      id: "K",
      label: "K",
      group: "starters"
    },
    {
      id: "DST",
      label: "DST",
      group: "starters"
    },
    {
      id: "BENCH1",
      label: "BENCH 1",
      group: "bench"
    },
    {
      id: "BENCH2",
      label: "BENCH 2",
      group: "bench"
    },
    {
      id: "BENCH3",
      label: "BENCH 3",
      group: "bench"
    },
    {
      id: "BENCH4",
      label: "BENCH 4",
      group: "bench"
    },
    {
      id: "BENCH5",
      label: "BENCH 5",
      group: "bench"
    },
    {
      id: "BENCH6",
      label: "BENCH 6",
      group: "bench"
    }
  ];


function normalizeSlot(
  slot: string
): string {
  return slot
    .trim()
    .toUpperCase();
}


function getPlayerForSlot(
  players: RosterPlayer[],
  slotId: string
): RosterPlayer | null {
  return (
    players.find(
      player =>
        normalizeSlot(
          player.slot
        ) === slotId
    ) ??
    null
  );
}


function renderRosterSlot(
  slot: RosterSlotDefinition,
  players: RosterPlayer[]
) {
  const player =
    getPlayerForSlot(
      players,
      slot.id
    );


  return (
    <div
      key={slot.id}
      className={
        `roster-slot ${
          player
            ? "roster-slot--filled"
            : "roster-slot--empty"
        }`
      }
    >
      <div className="roster-slot__label">
        {slot.label}
      </div>

      <div className="roster-slot__content">
        {
          player ? (
            <PlayerCard
              name={
                player.playerName
              }
              position={
                player.position
              }
              nflTeam={
                player.nflTeam ??
                undefined
              }
              byeWeek={
                player.byeWeek ??
                undefined
              }
              rank={
                player.rank ??
                undefined
              }
              auctionValue={
                player.auctionValue
              }
              salePrice={
                player.price
              }
              compact
            />
          ) : (
            <div className="roster-slot__placeholder">
              <span className="roster-slot__placeholder-icon">
                +
              </span>

              <span>
                Empty
              </span>
            </div>
          )
        }
      </div>
    </div>
  );
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


  const starterSlots =
    ROSTER_SLOTS.filter(
      slot =>
        slot.group ===
        "starters"
    );


  const benchSlots =
    ROSTER_SLOTS.filter(
      slot =>
        slot.group ===
        "bench"
    );


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
            {ROSTER_SLOTS.length}
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


      <div className="structured-roster">
        <div className="structured-roster__section">
          <div className="structured-roster__heading">
            <h3>
              Starting Lineup
            </h3>

            <span>
              9 slots
            </span>
          </div>

          <div className="structured-roster__slots">
            {
              starterSlots.map(
                slot =>
                  renderRosterSlot(
                    slot,
                    roster.players
                  )
              )
            }
          </div>
        </div>


        <div className="structured-roster__section">
          <div className="structured-roster__heading">
            <h3>
              Bench
            </h3>

            <span>
              6 slots
            </span>
          </div>

          <div className="structured-roster__slots">
            {
              benchSlots.map(
                slot =>
                  renderRosterSlot(
                    slot,
                    roster.players
                  )
              )
            }
          </div>
        </div>
      </div>
    </section>
  );
}