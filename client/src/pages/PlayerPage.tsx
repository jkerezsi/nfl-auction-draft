import {
  useEffect,
  useState
} from "react";


import {
  getTeams
} from "../services/teamService";


import {
  getGameState
} from "../services/gameService";


import {
  submitBid
} from "../services/bidService";


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



  const [game, setGame] =
    useState<any>(
      null
    );



  const [bidAmount, setBidAmount] =
    useState("");



  const [bidSubmitted, setBidSubmitted] =
    useState(false);



  const [activeTab, setActiveTab] =
    useState<Tab>(
      "auction"
    );




  useEffect(
    () => {

      loadTeams();

      loadGame();


      const interval =
        setInterval(
          loadGame,
          3000
        );


      return () =>
        clearInterval(
          interval
        );


    },
    []
  );





  async function loadTeams() {


    const data =
      await getTeams();


    setTeams(
      data
    );


  }





  async function loadGame() {


    const data =
      await getGameState();


    setGame(
      data
    );


  }






  function selectTeam(
    teamId: number
  ) {


    saveTeamId(
      teamId
    );


    setSelectedTeamId(
      teamId
    );


  }






  function changeTeam() {


    clearTeamId();


    setSelectedTeamId(
      null
    );


  }







  async function placeBid() {


    if (
      !selectedTeamId ||
      !game?.currentPlayer
    ) {

      return;

    }



    await submitBid(

      selectedTeamId,

      game.currentPlayer.id,

      Number(
        bidAmount
      )

    );



    setBidSubmitted(
      true
    );


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

                  key={
                    team.id
                  }

                  className="team-button"

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





      {
        activeTab === "auction" && (


          <div className="player-card">


            {
              game?.currentPlayer ? (


                <>


                  <h2>
                    {game.currentPlayer.name}
                  </h2>


                  <p>

                    {game.currentPlayer.position}

                    {" - "}

                    {game.currentPlayer.nfl_team}

                  </p>



                  {
                    bidSubmitted ? (


                      <div>

                        ✅ Bid locked

                        <p>
                          Waiting for result...
                        </p>

                      </div>


                    ) : (


                      <>

                        <input

                          type="number"

                          placeholder="Your bid"

                          value={
                            bidAmount
                          }

                          onChange={
                            e =>
                              setBidAmount(
                                e.target.value
                              )
                          }

                        />



                        <button

                          onClick={
                            placeBid
                          }

                        >

                          Submit Bid

                        </button>


                      </>

                    )

                  }


                </>


              ) : (


                <h2>
                  Waiting for next player...
                </h2>


              )

            }


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







      <div className="player-nav">


        <button

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

        onClick={
          changeTeam
        }

      >

        Change Team

      </button>



    </div>

  );


}



export default PlayerPage;