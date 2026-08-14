import {
  db
} from "../../src/database/connection";


export interface TestPlayerInput {
  rank?: number;
  name?: string;
  position?: string;
  nflTeam?: string;
  byeWeek?: number;
  drafted?: number;
  auctionValue?: number;
  maxOffer?: number;
}


export function initializeTestDatabase() {
  db.exec(
    `
    CREATE TABLE IF NOT EXISTS game (
      id INTEGER PRIMARY KEY,
      status TEXT NOT NULL,
      current_player_id INTEGER,
      countdown INTEGER DEFAULT 0,
      current_bid INTEGER DEFAULT 0,
      current_bid_team_id INTEGER,
      last_winner_team_id INTEGER,
      last_winner_price INTEGER,
      last_winner_player_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
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
  auction_value INTEGER NOT NULL DEFAULT 0,
  max_offer INTEGER NOT NULL DEFAULT 0,
  drafted INTEGER NOT NULL DEFAULT 0
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
    `
  );
}


export function resetTestDatabase() {
  db.exec(
    `
    DELETE FROM auction_bids;
    DELETE FROM roster;
    DELETE FROM teams;
    DELETE FROM draft_players;
    DELETE FROM settings;
    DELETE FROM game;

    DELETE FROM sqlite_sequence
    WHERE name IN (
      'teams',
      'draft_players',
      'roster',
      'auction_bids'
    );
    `
  );


  db.prepare(
    `
    INSERT INTO settings
    (
      key,
      value
    )
    VALUES
    (
      'startingBudget',
      '200'
    )
    `
  ).run();


  db.prepare(
    `
    INSERT INTO game
    (
      id,
      status,
      current_player_id,
      countdown,
      current_bid,
      current_bid_team_id,
      last_winner_team_id,
      last_winner_price,
      last_winner_player_id
    )
    VALUES
    (
      1,
      'SETUP',
      NULL,
      0,
      0,
      NULL,
      NULL,
      NULL,
      NULL
    )
    `
  ).run();
}


export function createTestTeam(
  name = "Test Team",
  budget = 200
) {
  const result =
    db.prepare(
      `
      INSERT INTO teams
      (
        name,
        budget
      )
      VALUES
      (
        ?,
        ?
      )
      `
    ).run(
      name,
      budget
    );


  return Number(
    result.lastInsertRowid
  );
}


export function createTestPlayer(
  input: TestPlayerInput = {}
) {
  const {
    rank = 1,
    name = "Test Player",
    position = "RB1",
    nflTeam = "TST",
    byeWeek = 7,
    drafted = 0,
    auctionValue = 25,
    maxOffer = 0
  } = input;


  const result =
    db.prepare(
      `
      INSERT INTO draft_players
      (
        rank,
        name,
        position,
        nfl_team,
        bye_week,
        drafted,
        auction_value,
        max_offer
      )
      VALUES
      (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?
      )
      `
    ).run(
      rank,
      name,
      position,
      nflTeam,
      byeWeek,
      drafted,
      auctionValue,
      maxOffer
    );


  return Number(
    result.lastInsertRowid
  );
}


export function setGameState(
  input: {
    status?: string;
    currentPlayerId?: number | null;
    countdown?: number;
    lastWinnerTeamId?: number | null;
    lastWinnerPrice?: number | null;
    lastWinnerPlayerId?: number | null;
  }
) {
  const {
    status = "SETUP",
    currentPlayerId = null,
    countdown = 0,
    lastWinnerTeamId = null,
    lastWinnerPrice = null,
    lastWinnerPlayerId = null
  } = input;


  db.prepare(
    `
    UPDATE game
    SET
      status = ?,
      current_player_id = ?,
      countdown = ?,
      last_winner_team_id = ?,
      last_winner_price = ?,
      last_winner_player_id = ?
    WHERE id = 1
    `
  ).run(
    status,
    currentPlayerId,
    countdown,
    lastWinnerTeamId,
    lastWinnerPrice,
    lastWinnerPlayerId
  );
}


export function insertRosterPlayer(
  input: {
    teamId: number;
    playerId: number;
    playerName: string;
    position: string;
    price: number;
    slot?: string;
  }
) {
  db.prepare(
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
  ).run(
    input.teamId,
    input.playerId,
    input.playerName,
    input.position,
    input.price,
    input.slot ??
      input.position
  );
}
