import {
  useEffect,
  useState
} from "react";


import {
  getTeams,
  createTeam
} from "../services/teamService";


import type { Team } from "../types/team";


import TeamCard from "../components/TeamCard";


export default function AdminPage() {


  const [teams, setTeams] =
    useState<Team[]>([]);


  const [name, setName] =
    useState("");



  async function loadTeams() {

    const data =
      await getTeams();

    setTeams(data);

  }



  async function addTeam() {

    if (!name.trim()) {
      return;
    }


    await createTeam(name);


    setName("");

    await loadTeams();

  }



  useEffect(
    () => {

      loadTeams();

    },
    []
  );



  return (

    <div>

      <h1>
        Admin Dashboard
      </h1>


      <h2>
        Teams
      </h2>


      <div>

        <input

          value={name}

          onChange={
            event =>
              setName(
                event.target.value
              )
          }

          placeholder="Team name"

        />


        <button
          onClick={addTeam}
        >
          Add Team
        </button>


      </div>



      <div>

        {
          teams.map(
            team => (

              <TeamCard

                key={
                  team.id
                }

                team={
                  team
                }

              />

            )
          )
        }

      </div>


    </div>

  );

}