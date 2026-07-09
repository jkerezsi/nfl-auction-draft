import { Team } from "../types/team";


interface Props {

  team: Team;

}



function TeamCard({
  team
}: Props) {


  return (

    <div className="team-card">

      <h3>
        {team.name}
      </h3>


      <p>
        Budget:
      </p>


      <strong>
        ${team.budget}
      </strong>


      <p>

        {
          team.connected
            ? "🟢 Connected"
            : "⚪ Offline"
        }

      </p>


    </div>

  );

}


export default TeamCard;