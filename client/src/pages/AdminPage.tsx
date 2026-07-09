import { useEffect, useState } from "react";

import type { Player } from "../types/player";

import {
  getPlayers
} from "../services/playerService";


function AdminPage() {


  const [players, setPlayers] =
    useState<Player[]>([]);



  useEffect(() => {

    loadPlayers();

  }, []);



  async function loadPlayers() {

    const data =
      await getPlayers();

    setPlayers(data);

  }



  return (

    <div>

      <h1>
        Admin Draft Board
      </h1>


      <p>
        Available Players: {players.length}
      </p>


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
              Status
            </th>

          </tr>

        </thead>


        <tbody>

          {players.map((player) => (

            <tr
              key={player.id}
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

                {player.drafted === 1
                  ? "Drafted"
                  : "Available"
                }

              </td>


            </tr>

          ))}


        </tbody>


      </table>


    </div>

  );

}


export default AdminPage;