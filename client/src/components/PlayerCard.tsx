import { Player } from "../types/player";


interface Props {

  player: Player;

}



function PlayerCard({
  player
}: Props) {


  return (

    <div className="player-card">

      <div className="player-rank">
        #{player.rank}
      </div>


      <div className="player-name">
        {player.name}
      </div>


      <div className="player-info">

        <span className={`position ${player.position}`}>
          {player.position}
        </span>


        <span>
          {player.nfl_team}
        </span>


        <span>
          Bye {player.bye_week}
        </span>

      </div>


    </div>

  );

}


export default PlayerCard;