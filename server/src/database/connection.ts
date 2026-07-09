import Database from "better-sqlite3";
import path from "path";
import fs from "fs";


const databaseFolder =
  path.join(
    process.cwd(),
    "database"
  );


if (!fs.existsSync(databaseFolder)) {

  fs.mkdirSync(
    databaseFolder,
    {
      recursive: true
    }
  );

}


const databaseFile =
  path.join(
    databaseFolder,
    "fantasy.db"
  );


export const db =
  new Database(databaseFile);