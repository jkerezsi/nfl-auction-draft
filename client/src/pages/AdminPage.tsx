import {
  useEffect,
  useState
} from "react";


import type { Player } from "../types/player";


import {
  getPlayers
} from "../services/playerService";


import {
  getGameState,
  nominatePlayer
} from "../services/gameService";



function AdminPage() {


  const [players, setPlayers] =
    useState<Player[]>([]);



  const [game, setGame] =
    useState<any>(null);



  useEffect(() => {

    loadData();

  }, []);



  async function loadData() {


    const playerData =
      await getPlayers();


    setPlayers(
      playerData
    );


    const gameData =
      await getGameState();


    setGame(
      gameData
    );


  }



  async function handleNominate(
    playerId: number
  ) {


    await nominatePlayer(
      playerId
    );


    await loadData();

  }



  const currentPlayer =
    players.find(
      (p) =>
        p.id === game?.currentPlayerId
    );



  return (

    <div
      style={{
        display: "flex",
        gap: "30px",
        padding: "20px"
      }}
    >


      <div
        style={{
          flex: 2
        }}
      >

        <h1>
          Player Pool
        </h1>


        <table>

          <thead>

            <tr>

              <th>
                Rank
              </th>

              <th>
                Player
              </th>

              <th>
                Team
              </th>

              <th>
                Position
              </th>

              <th>
                Action
              </th>

            </tr>

          </thead>


          <tbody>


            {players.map(
              (player) => (

              <tr
                key={player.id}
                style={{
                  opacity:
                    player.drafted
                      ? 0.4
                      : 1
                }}
              >

                <td>
                  {player.rank}
                </td>


                <td>
                  {player.name}
                </td>


                <td>
                  {player.nfl_team}
                </td>


                <td>
                  {player.position}
                </td>


                <td>


                  <button

                    disabled={
                      player.drafted === 1
                    }


                    onClick={() =>
                      handleNominate(
                        player.id
                      )
                    }

                  >

                    Nominate

                  </button>


                </td>


              </tr>


            ))}


          </tbody>


        </table>


      </div>



      <div
        style={{
          flex: 1,
          border: "1px solid #ccc",
          padding: "20px"
        }}
      >


        <h1>
          Current Auction
        </h1>



        {!currentPlayer && (

          <p>
            No player nominated
          </p>

        )}



        {currentPlayer && (

          <>

            <h2>
              {currentPlayer.name}
            </h2>


            <p>
              {currentPlayer.nfl_team}
              {" "}
              {currentPlayer.position}
            </p>


            <hr />


            <p>
              Status:
              {" "}
              {game.status}
            </p>


            <p>
              Countdown:
              {" "}
              {game.countdown}
            </p>


            <p>
              Current Bid:
              {" "}
              ${game.currentBid}
            </p>


          </>

        )}


      </div>


    </div>

  );

}


export default AdminPage;