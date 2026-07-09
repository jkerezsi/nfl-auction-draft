import Database from "server/node_modules/@types/better-sqlite3";
import path from "path";

const dbPath = path.join(
  process.cwd(),
  "../database/fantasy.db"
);

export const db = new Database(dbPath);

db.pragma("journal_mode = WAL");