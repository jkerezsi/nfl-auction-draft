import fs from "fs";
import path from "path";

import { parse } from "csv-parse/sync";

import { db } from "../database/connection";


interface PlayerCSVRow {

  RK: string;

  "PLAYER NAME": string;

  POS: string;

  TEAM: string;

  "BYE WEEK": string;

}



function normalizePosition(position: string) {


  if (position.startsWith("RB")) {
    return "RB";
  }


  if (position.startsWith("WR")) {
    return "WR";
  }


  if (position.startsWith("QB")) {
    return "QB";
  }


  if (position.startsWith("TE")) {
    return "TE";
  }


  if (position.startsWith("DEF")) {
    return "DEF";
  }


  if (position.startsWith("K")) {
    return "K";
  }


  return position;

}




function importPlayers() {


  const filePath = path.join(
    process.cwd(),
    "nfl_top_250.csv"
  );


  console.log(
    "Reading:",
    filePath
  );



  const csvFile = fs.readFileSync(
    filePath,
    "utf8"
  );



  const records = parse<PlayerCSVRow>(
    csvFile,
    {
      columns: true,
      skip_empty_lines: true
    }
  );



  db.prepare(
    "DELETE FROM draft_players"
  ).run();



  const insert = db.prepare(`
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



  for (const row of records) {


    insert.run(

      Number(row.RK),

      row["PLAYER NAME"],

      normalizePosition(
        row.POS
      ),

      row.TEAM,

      Number(row["BYE WEEK"])

    );


  }



  console.log(
    `${records.length} players imported`
  );

}




try {


  importPlayers();


  console.log(
    "Import complete"
  );


  process.exit(0);


}
catch(error) {


  console.error(error);


  process.exit(1);


}
try {

  importPlayers();

  console.log(
    "Import complete"
  );

  process.exit(0);

}
catch(error) {

  console.error(error);

  process.exit(1);

}