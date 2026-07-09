import {
  useEffect,
  useState
} from "react";


import {
  getTeams
} from "../services/teamService";


import {
  saveTeamId,
  getTeamId,
  clearTeamId
} from "../services/sessionService";


import type { Team } from "../types/team";



type Tab =
  | "auction"
  | "team";



function PlayerPage() {


  const [teams, setTeams] =
    useState<Team[]>([]);


  const [selectedTeamId, setSelectedTeamId] =
    useState<number | null>(
      getTeamId()
    );


  const [activeTab, setActiveTab] =
    useState<Tab>("auction");



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
    teamId: number
  ) {

    saveTeamId(teamId);

    setSelectedTeamId(teamId);

  }



  function changeTeam() {

    clearTeamId();

    setSelectedTeamId(null);

  }



  const selectedTeam =
    teams.find(
      team =>
        team.id === selectedTeamId
    );



  if (!selectedTeam) {


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

                  className="team-button"

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

      </div>

    );

  }



  return (

    <div className="player-page">


      <div className="player-header">

        <h1>
          {selectedTeam.name}
        </h1>


        <div>
          Budget: ${selectedTeam.budget}
        </div>


      </div>



      <div className="player-content">


        {
          activeTab === "auction" && (

            <div className="player-card">

              <h2>
                Auction
              </h2>


              <p>
                Waiting for next player...
              </p>


            </div>

          )
        }



        {
          activeTab === "team" && (

            <div className="player-card">

              <h2>
                My Team
              </h2>


              <p>
                No players drafted yet.
              </p>


              <h3>
                Missing spots
              </h3>


              <ul>

                <li>
                  QB
                </li>

                <li>
                  RB
                </li>

                <li>
                  WR
                </li>

                <li>
                  TE
                </li>

              </ul>


            </div>

          )
        }


      </div>




      <div className="player-nav">


        <button

          className={
            activeTab === "auction"
              ? "active"
              : ""
          }

          onClick={
            () =>
              setActiveTab(
                "auction"
              )
          }

        >

          Auction

        </button>



        <button

          className={
            activeTab === "team"
              ? "active"
              : ""
          }

          onClick={
            () =>
              setActiveTab(
                "team"
              )
          }

        >

          My Team

        </button>


      </div>



      <button

        className="change-team"

        onClick={changeTeam}

      >

        Change Team

      </button>



    </div>

  );

}


export default PlayerPage;