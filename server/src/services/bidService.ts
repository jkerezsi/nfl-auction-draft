import { db } from "../database/connection";


export interface Bid {

  id: number;

  team_id: number;

  player_id: number;

  amount: number;

  submitted_at: string;

}



export function submitBid(

  teamId: number,

  playerId: number,

  amount: number

) {


  const team =
    db
      .prepare(
        `
        SELECT

          id,

          budget

        FROM teams

        WHERE id = ?

        `
      )
      .get(teamId) as any;



  if (!team) {

    throw new Error(
      "Team not found"
    );

  }



  if (
    amount <= 0
  ) {

    throw new Error(
      "Invalid bid amount"
    );

  }



  if (
    amount > team.budget
  ) {

    throw new Error(
      "Bid exceeds budget"
    );

  }



  const existingBid =
    db
      .prepare(
        `
        SELECT

          id

        FROM auction_bids

        WHERE

          team_id = ?

          AND

          player_id = ?

        `
      )
      .get(
        teamId,
        playerId
      );



  if (existingBid) {

    throw new Error(
      "Bid already submitted"
    );

  }



  const result =
    db
      .prepare(
        `
        INSERT INTO auction_bids

        (

          team_id,

          player_id,

          amount

        )

        VALUES

        (

          ?,

          ?,

          ?

        )

        `
      )
      .run(

        teamId,

        playerId,

        amount

      );



  return {

    id:
      result.lastInsertRowid,

    message:
      "Bid submitted"

  };


}




export function getCurrentAuctionBids(

  playerId: number

): Bid[] {


  return db
    .prepare(
      `
      SELECT

        id,

        team_id,

        player_id,

        amount,

        submitted_at

      FROM auction_bids

      WHERE player_id = ?

      ORDER BY

        amount DESC,

        submitted_at ASC

      `
    )
    .all(
      playerId
    ) as Bid[];

}





export function resolveAuction(

  playerId: number

) {


  const winner =
    db
      .prepare(
        `
        SELECT

          *

        FROM auction_bids

        WHERE player_id = ?

        ORDER BY

          amount DESC,

          submitted_at ASC

        LIMIT 1

        `
      )
      .get(
        playerId
      ) as Bid | undefined;



  if (!winner) {

    return {

      winner: null,

      message:
        "No bids submitted"

    };

  }



  const player =
    db
      .prepare(
        `
        SELECT

          id,

          name,

          position

        FROM draft_players

        WHERE id = ?

        `
      )
      .get(
        playerId
      ) as any;



  if (!player) {

    throw new Error(
      "Player not found"
    );

  }




  const team =
    db
      .prepare(
        `
        SELECT

          budget

        FROM teams

        WHERE id = ?

        `
      )
      .get(
        winner.team_id
      ) as any;



  if (
    winner.amount > team.budget
  ) {

    throw new Error(
      "Winning bid exceeds budget"
    );

  }




  db.transaction(
    () => {


      db
        .prepare(
          `
          UPDATE teams

          SET

            budget = budget - ?

          WHERE id = ?

          `
        )
        .run(

          winner.amount,

          winner.team_id

        );




      db
        .prepare(
          `
          INSERT INTO roster

          (

            team_id,

            player_id,

            player_name,

            position,

            price,

            slot

          )

          VALUES

          (

            ?,

            ?,

            ?,

            ?,

            ?,

            ?

          )

          `
        )
        .run(

          winner.team_id,

          player.id,

          player.name,

          player.position,

          winner.amount,

          player.position

        );




      db
        .prepare(
          `
          UPDATE game

          SET

            status = 'RESULT',

            last_winner_team_id = ?,

            last_winner_price = ?,

            last_winner_player_id = ?

          WHERE id = 1

          `
        )
        .run(

          winner.team_id,

          winner.amount,

          player.id

        );


    }

  )();



  return {

    winnerTeamId:
      winner.team_id,

    playerId:
      player.id,

    playerName:
      player.name,

    price:
      winner.amount

  };


}