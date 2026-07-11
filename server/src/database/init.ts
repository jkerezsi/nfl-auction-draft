import { db } from "./connection";


export function initializeDatabase() {


  db.exec(`


    CREATE TABLE IF NOT EXISTS game (

      id INTEGER PRIMARY KEY,

      status TEXT NOT NULL,

      current_player_id INTEGER,

      countdown INTEGER DEFAULT 0,

      current_bid INTEGER DEFAULT 0,

      current_bid_team_id INTEGER,

      created_at TEXT DEFAULT CURRENT_TIMESTAMP,

      updated_at TEXT DEFAULT CURRENT_TIMESTAMP

    );


    CREATE TABLE IF NOT EXISTS teams (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      name TEXT NOT NULL,

      logo TEXT,

      budget INTEGER NOT NULL,

      connected INTEGER DEFAULT 0,

      created_at TEXT DEFAULT CURRENT_TIMESTAMP

    );


    CREATE TABLE IF NOT EXISTS roster (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      team_id INTEGER NOT NULL,

      player_id INTEGER NOT NULL,

      player_name TEXT NOT NULL,

      position TEXT NOT NULL,

      price INTEGER NOT NULL,

      slot TEXT NOT NULL,

      created_at TEXT DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY(team_id)
      REFERENCES teams(id),

      FOREIGN KEY(player_id)
      REFERENCES draft_players(id)

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

    CREATE TABLE IF NOT EXISTS auction_bids (

  id INTEGER PRIMARY KEY AUTOINCREMENT,

  team_id INTEGER NOT NULL,

  player_id INTEGER NOT NULL,

  amount INTEGER NOT NULL,

  submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY(team_id)
    REFERENCES teams(id),

  FOREIGN KEY(player_id)
    REFERENCES draft_players(id),

  UNIQUE(team_id, player_id)

);


  `);



  try {

    db.exec(
      `
      ALTER TABLE game
      ADD COLUMN current_bid INTEGER DEFAULT 0
      `
    );

  } catch {}

try {

  db.exec(
    `
    ALTER TABLE game
    ADD COLUMN last_winner_team_id INTEGER
    `
  );

} catch {}



try {

  db.exec(
    `
    ALTER TABLE game
    ADD COLUMN last_winner_price INTEGER
    `
  );

} catch {}



try {

  db.exec(
    `
    ALTER TABLE game
    ADD COLUMN last_winner_player_id INTEGER
    `
  );

} catch {}

  try {

    db.exec(
      `
      ALTER TABLE game
      ADD COLUMN current_bid_team_id INTEGER
      `
    );

  } catch {}



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