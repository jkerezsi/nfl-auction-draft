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
    <div className="player-page">
      <div className="player-card">
        <h1>
          Choose your team
        </h1>

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
      </div>
    </div>
  );
}