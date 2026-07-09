import { db } from "./connection";


export function initializeDatabase() {


  db.exec(`

    CREATE TABLE IF NOT EXISTS game (

      id INTEGER PRIMARY KEY,

      status TEXT NOT NULL,

      current_player_id INTEGER,

      countdown INTEGER DEFAULT 0,

      created_at TEXT DEFAULT CURRENT_TIMESTAMP,

      updated_at TEXT DEFAULT CURRENT_TIMESTAMP

    );


    CREATE TABLE IF NOT EXISTS teams (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      token TEXT UNIQUE NOT NULL,

      name TEXT NOT NULL,

      logo TEXT,

      budget INTEGER NOT NULL,

      connected INTEGER DEFAULT 0,

      created_at TEXT DEFAULT CURRENT_TIMESTAMP

    );


    CREATE TABLE IF NOT EXISTS roster (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      team_id INTEGER NOT NULL,

      slot TEXT NOT NULL,

      player_name TEXT,

      position TEXT,

      FOREIGN KEY(team_id)
      REFERENCES teams(id)

    );


    CREATE TABLE IF NOT EXISTS settings (

      key TEXT PRIMARY KEY,

      value TEXT NOT NULL

    );


    CREATE TABLE IF NOT EXISTS draft_players (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      rank INTEGER,

      name TEXT NOT NULL,

      position TEXT NOT NULL,

      nfl_team TEXT,

      bye_week INTEGER,

      drafted INTEGER DEFAULT 0

    );


  `);



  const existingGame =
    db
      .prepare(
        "SELECT * FROM game WHERE id = 1"
      )
      .get();



  if (!existingGame) {

    db.prepare(`

      INSERT INTO game

      (
        id,
        status,
        countdown
      )

      VALUES

      (
        1,
        'SETUP',
        0
      )

    `).run();

  }



  const budgetSetting =
    db
      .prepare(
        `
        SELECT value
        FROM settings
        WHERE key = 'startingBudget'
        `
      )
      .get();



  if (!budgetSetting) {

    db.prepare(`

      INSERT INTO settings
      (
        key,
        value
      )

      VALUES
      (
        ?,
        ?
      )

    `)
    .run(
      "startingBudget",
      "1000"
    );

  }


}