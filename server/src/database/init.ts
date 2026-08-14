import { db } from "./connection";

interface TableColumn {
  name: string;
}

function columnExists(
  tableName: string,
  columnName: string
): boolean {
  const columns = db
    .prepare(`PRAGMA table_info(${tableName})`)
    .all() as TableColumn[];

  return columns.some(
    column => column.name === columnName
  );
}

function addColumnIfMissing(
  tableName: string,
  columnName: string,
  definition: string
): void {
  if (
    columnExists(
      tableName,
      columnName
    )
  ) {
    return;
  }

  db.exec(`
    ALTER TABLE ${tableName}
    ADD COLUMN ${columnName} ${definition}
  `);

  console.log(
    `Database migration applied: ${tableName}.${columnName}`
  );
}

export function initializeDatabase(): void {
  /*
   * Create the complete current schema first.
   *
   * These statements are safe to run on every startup because
   * CREATE TABLE IF NOT EXISTS does not replace existing tables.
   */
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS draft_players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rank INTEGER,
      name TEXT NOT NULL,
      position TEXT NOT NULL,
      nfl_team TEXT,
      bye_week INTEGER,
      auction_value INTEGER NOT NULL DEFAULT 0,
      max_offer INTEGER NOT NULL DEFAULT 0,
      drafted INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      logo TEXT,
      budget INTEGER NOT NULL,
      connected INTEGER NOT NULL DEFAULT 0,
      auto_draft_enabled INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS game (
      id INTEGER PRIMARY KEY,
      status TEXT NOT NULL,
      current_player_id INTEGER,
      countdown INTEGER NOT NULL DEFAULT 0,
      current_bid INTEGER NOT NULL DEFAULT 0,
      current_bid_team_id INTEGER,
      last_winner_team_id INTEGER,
      last_winner_price INTEGER,
      last_winner_player_id INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY(current_player_id)
        REFERENCES draft_players(id),

      FOREIGN KEY(current_bid_team_id)
        REFERENCES teams(id),

      FOREIGN KEY(last_winner_team_id)
        REFERENCES teams(id),

      FOREIGN KEY(last_winner_player_id)
        REFERENCES draft_players(id)
    );

    CREATE TABLE IF NOT EXISTS roster (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL,
      player_id INTEGER NOT NULL,
      player_name TEXT NOT NULL,
      position TEXT NOT NULL,
      price INTEGER NOT NULL,
      slot TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY(team_id)
        REFERENCES teams(id),

      FOREIGN KEY(player_id)
        REFERENCES draft_players(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS auction_bids (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL,
      player_id INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY(team_id)
        REFERENCES teams(id),

      FOREIGN KEY(player_id)
        REFERENCES draft_players(id),

      UNIQUE(team_id, player_id)
    );

    CREATE TABLE IF NOT EXISTS auto_draft_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL,
      player_id INTEGER NOT NULL,
      personal_rank INTEGER,
      max_bid INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY(team_id)
        REFERENCES teams(id)
        ON DELETE CASCADE,

      FOREIGN KEY(player_id)
        REFERENCES draft_players(id)
        ON DELETE CASCADE,

      UNIQUE(team_id, player_id)
    );

    CREATE INDEX IF NOT EXISTS idx_auto_draft_preferences_team
      ON auto_draft_preferences(team_id);

    CREATE INDEX IF NOT EXISTS idx_auto_draft_preferences_player
      ON auto_draft_preferences(player_id);

    CREATE INDEX IF NOT EXISTS idx_draft_players_rank
      ON draft_players(rank);

    CREATE INDEX IF NOT EXISTS idx_draft_players_drafted
      ON draft_players(drafted);

    CREATE INDEX IF NOT EXISTS idx_roster_team_id
      ON roster(team_id);

    CREATE INDEX IF NOT EXISTS idx_roster_player_id
      ON roster(player_id);

    CREATE INDEX IF NOT EXISTS idx_auction_bids_player_id
      ON auction_bids(player_id);
  `);



  /*
   * Migrate databases created by earlier versions of the app.
   *
   * These checks happen only after all tables have been created.
   */
  addColumnIfMissing(
    "draft_players",
    "auction_value",
    "INTEGER NOT NULL DEFAULT 0"
  );

  addColumnIfMissing(
    "draft_players",
    "max_offer",
    "INTEGER NOT NULL DEFAULT 0"
  );

  addColumnIfMissing(
    "game",
    "current_bid",
    "INTEGER NOT NULL DEFAULT 0"
  );

  addColumnIfMissing(
    "game",
    "current_bid_team_id",
    "INTEGER"
  );

  addColumnIfMissing(
    "game",
    "last_winner_team_id",
    "INTEGER"
  );

  addColumnIfMissing(
    "game",
    "last_winner_price",
    "INTEGER"
  );

  addColumnIfMissing(
    "game",
    "last_winner_player_id",
    "INTEGER"
  );

  addColumnIfMissing(
    "teams",
    "auto_draft_enabled",
    "INTEGER NOT NULL DEFAULT 0"
  );

  /*
   * Ensure the singleton game row exists.
   */
  const existingGame = db
    .prepare(`
      SELECT id
      FROM game
      WHERE id = 1
    `)
    .get();

  if (!existingGame) {
    db
      .prepare(`
        INSERT INTO game
        (
          id,
          status,
          countdown,
          current_bid
        )
        VALUES
        (
          1,
          'SETUP',
          0,
          0
        )
      `)
      .run();
  }

  /*
   * Ensure the starting budget setting exists.
   *
   * The current application configuration uses 200.
   * Existing teams are not modified here.
   */
  const budgetSetting = db
    .prepare(`
      SELECT value
      FROM settings
      WHERE key = 'startingBudget'
    `)
    .get();

  if (!budgetSetting) {
    db
      .prepare(`
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
        "200"
      );
  } else {
    db
      .prepare(`
        UPDATE settings
        SET value = ?
        WHERE key = 'startingBudget'
      `)
      .run("200");
  }

  console.log("Database initialized successfully.");
}