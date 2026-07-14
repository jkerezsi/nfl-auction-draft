import Database from "better-sqlite3";
import path from "path";
import fs from "fs";


const configuredDatabaseFile =
  process.env.FANTASY_DB_PATH;


const isMemoryDatabase =
  configuredDatabaseFile ===
  ":memory:";


const databaseFile =
  isMemoryDatabase
    ? ":memory:"
    : configuredDatabaseFile
      ? path.resolve(
          configuredDatabaseFile
        )
      : path.join(
          process.cwd(),
          "database",
          "fantasy.db"
        );


if (!isMemoryDatabase) {
  const databaseFolder =
    path.dirname(
      databaseFile
    );


  if (
    !fs.existsSync(
      databaseFolder
    )
  ) {
    fs.mkdirSync(
      databaseFolder,
      {
        recursive: true
      }
    );
  }
}


export const db =
  new Database(
    databaseFile
  );


db.pragma(
  "foreign_keys = ON"
);