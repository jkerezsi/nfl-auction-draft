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

        {
          teams.map(
            team => (

              <button

                key={team.id}

                className="team-button"

                onClick={
                  () =>
                    onSelect(
                      team.id
                    )
                }

              >

                {team.name}

              </button>

            )
          )
        }

      </div>

    </div>

  );

}