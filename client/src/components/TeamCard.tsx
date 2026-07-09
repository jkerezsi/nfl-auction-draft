import type { Team } from "../types/team";


interface Props {
  team: Team;
}


export default function TeamCard(
  {
    team
  }: Props
) {

  return (

    <div className="card">

      <h3>
        {team.name}
      </h3>


      <p>
        Budget: ${team.budget}
      </p>


      <p>
        {
          team.connected
            ? "🟢 Connected"
            : "🔴 Offline"
        }
      </p>


    </div>

  );

}