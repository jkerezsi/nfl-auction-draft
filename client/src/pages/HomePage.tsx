import {
  useEffect,
  useState
} from "react";


import {
  getTeams
} from "../services/teamService";


import {
  saveTeamId,
  getTeamId
} from "../services/sessionService";


import type { Team } from "../types/team";



export default function HomePage() {


  const [teams, setTeams] =
    useState<Team[]>([]);


  const [selectedTeam, setSelectedTeam] =
    useState<number | null>(
      getTeamId()
    );



  useEffect(
    () => {

      loadTeams();

    },
    []
  );



  async function loadTeams() {

    const data =
      await getTeams();

    setTeams(data);

  }



  function selectTeam(
    id: number
  ) {

    saveTeamId(id);

    setSelectedTeam(id);

  }



  if (selectedTeam) {


    const team =
      teams.find(
        t =>
          t.id === selectedTeam
      );



    return (

      <div>

        <h1>
          Welcome {team?.name}
        </h1>


        <h2>
          Budget: ${team?.budget}
        </h2>


        <p>
          Waiting for draft...
        </p>


      </div>

    );

  }



  return (

    <div>

      <h1>
        Choose your team
      </h1>


      {
        teams.map(
          team => (

            <button

              key={
                team.id
              }

              onClick={
                () =>
                  selectTeam(
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

  );

}