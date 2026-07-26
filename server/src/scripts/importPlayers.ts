import fs from "fs";
import path from "path";
import csv from "csv-parser";

import { db } from "../database/connection";


const csvFile =
  path.join(
    process.cwd(),
    "../server/database/nfl_top_250_with_auction_values.csv"
  );



const insertPlayer =
  db.prepare(`

    INSERT INTO draft_players

    (
      rank,
      name,
      position,
      nfl_team,
      bye_week
    )

    VALUES

    (
      ?,
      ?,
      ?,
      ?,
      ?
    )

  `);



async function importPlayers() {


  const players: any[] = [];



  await new Promise<void>((resolve, reject) => {


    fs.createReadStream(csvFile)

      .pipe(csv())

      .on(
        "data",
        (row) => {

          players.push(row);

        }
      )

      .on(
        "end",
        resolve
      )

      .on(
        "error",
        reject
      );


  });



  const insertMany =
    db.transaction(
      () => {


        for (const row of players) {


          insertPlayer.run(

            Number(row["RK"]),

            row["PLAYER NAME"],

            row["POS"],

            row["TEAM"],

            Number(row["BYE WEEK"])

          );


        }


      }
    );



  insertMany();



  console.log(
    `Imported ${players.length} players`
  );


}



importPlayers();