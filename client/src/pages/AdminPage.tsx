import {
  useEffect,
  useState
} from "react";


import {
  getPlayers
} from "../services/playerService";


import {
  getTeams
} from "../services/teamService";


import {
  Player
} from "../types/player";


import {
  Team
} from "../types/team";


import PlayerCard
from "../components/PlayerCard";


import TeamCard
from "../components/TeamCard";



function AdminPage() {


  const [players, setPlayers] =
    useState<Player[]>([]);


  const [teams, setTeams] =
    useState<Team[]>([]);


  const [search, setSearch] =
    useState("");



  useEffect(() => {


    getPlayers()
      .then(setPlayers)
      .catch(console.error);


    getTeams()
      .then(setTeams)
      .catch(console.error);


  }, []);




  const filteredPlayers =
    players.filter(player =>

      player.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )

    );



  return (

    <div className="admin-page">


      <h1>
        Fantasy Auction Draft
      </h1>



      <section>

        <h2>
          Teams
        </h2>


        <div className="team-grid">

          {
            teams.map(team =>

              <TeamCard
                key={team.id}
                team={team}
              />

            )
          }

        </div>

      </section>



      <section>

        <h2>
          Player Pool
        </h2>


        <input

          placeholder="Search players..."

          value={search}

          onChange={
            e =>
              setSearch(
                e.target.value
              )
          }

        />


        <div className="player-grid">


          {
            filteredPlayers.map(player =>

              <PlayerCard

                key={player.id}

                player={player}

              />

            )
          }


        </div>


      </section>


    </div>

  );

}


export default AdminPage;