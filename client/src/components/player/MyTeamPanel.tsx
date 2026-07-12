import type {
  TeamRoster
} from "../../types/roster";


interface MyTeamPanelProps {
  roster: TeamRoster | null;
}


export default function MyTeamPanel({
  roster
}: MyTeamPanelProps) {

  if (!roster) {

    return (

      <div className="player-card">

        <h2>
          My Team
        </h2>

        <p>
          Loading...
        </p>

      </div>

    );

  }


  return (

    <div className="player-card">

      <h2>
        My Team
      </h2>


      {
        roster.players.length === 0 && (

          <p>
            No players drafted yet.
          </p>

        )
      }


      {
        roster.players.map(
          player => (

            <div

              key={player.id}

              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom:
                  "1px solid #ddd"
              }}

            >

              <div>

                <strong>
                  {player.position}
                </strong>

                {" "}

                {player.playerName}

              </div>


              <div>

                ${player.price}

              </div>

            </div>

          )
        )
      }


      <hr />


      <div>

        Players:
        {" "}
        {roster.playerCount}

      </div>


      <div>

        Spent:
        {" "}
        ${roster.spent}

      </div>


      <div>

        Remaining:
        {" "}
        ${roster.budget}

      </div>


    </div>

  );

}