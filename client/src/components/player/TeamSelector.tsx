import TeamCard from "../../shared/TeamCard";

import type {
  Team
} from "../../types/team";


interface TeamSelectorProps {
  teams: Team[];

  onSelect: (
    teamId: number
  ) => void;
}


export default function TeamSelector({
  teams,
  onSelect
}: TeamSelectorProps) {
  return (
    <main className="player-page team-selection-page">
      <section className="team-selection-shell">
        <header className="team-selection-header">
          <div className="team-selection-icon">
            🏈
          </div>

          <span className="player-section-eyebrow">
            Fantasy Auction Draft
          </span>

          <h1>
            Choose your team
          </h1>

          <p>
            Select the team you are managing tonight.
            Your choice stays saved on this device.
          </p>
        </header>

        {
          teams.length === 0 ? (
            <div className="team-selection-empty">
              <div className="team-selection-empty__icon">
                ⏳
              </div>

              <h2>
                Waiting for teams
              </h2>

              <p>
                The commissioner has not created any
                teams yet. This page will update once
                teams are available.
              </p>
            </div>
          ) : (
            <>
              <div className="team-selection-summary">
                <span>
                  Available teams
                </span>

                <strong>
                  {teams.length}
                </strong>
              </div>

              <div className="team-selector">
                {
                  teams.map(
                    team => (
                      <TeamCard
                        key={team.id}
                        name={team.name}
                        budget={team.budget}
                        onClick={
                          () =>
                            onSelect(
                              team.id
                            )
                        }
                      />
                    )
                  )
                }
              </div>

              <p className="team-selection-help">
                Tap a team to continue to the live auction.
              </p>
            </>
          )
        }
      </section>
    </main>
  );
}
