import fs from "fs";
import path from "path";

import { db } from "./connection";

interface CsvRow {
  [key: string]: string;
}

export interface PlayerBootstrapResult {
  skipped: boolean;
  imported: number;
  invalid: number;
}

function parseCsv(content: string): CsvRow[] {
  const rows: string[][] = [];

  let currentRow: string[] = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    const nextCharacter = content[index + 1];

    if (
      character === '"' &&
      insideQuotes &&
      nextCharacter === '"'
    ) {
      currentValue += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (character === "," && !insideQuotes) {
      currentRow.push(currentValue);
      currentValue = "";
      continue;
    }

    if (
      (character === "\n" || character === "\r") &&
      !insideQuotes
    ) {
      if (
        character === "\r" &&
        nextCharacter === "\n"
      ) {
        index += 1;
      }

      currentRow.push(currentValue);
      currentValue = "";

      if (currentRow.some(value => value.length > 0)) {
        rows.push(currentRow);
      }

      currentRow = [];
      continue;
    }

    currentValue += character;
  }

  if (
    currentValue.length > 0 ||
    currentRow.length > 0
  ) {
    currentRow.push(currentValue);
    rows.push(currentRow);
  }

  const [headerRow, ...dataRows] = rows;

  if (!headerRow) {
    return [];
  }

  const headers = headerRow.map(header =>
    header
      .replace(/^\uFEFF/, "")
      .trim()
  );

  return dataRows.map(values => {
    const row: CsvRow = {};

    headers.forEach((header, index) => {
      row[header] =
        values[index]?.trim() ?? "";
    });

    return row;
  });
}

function normalizePosition(position: string): string {
  return position
    .trim()
    .toUpperCase()
    .replace(/[0-9]+$/, "");
}

function resolveCsvPath(): string {
  const candidates = [
    process.env.PLAYER_CSV_PATH,

    // Production Docker location
    path.resolve(
      process.cwd(),
      "database",
      "nfl_top_250_with_auction_values.csv"
    ),

    // Running from repository root
    path.resolve(
      process.cwd(),
      "server",
      "database",
      "nfl_top_250_with_auction_values.csv"
    ),

    // Relative to compiled server files
    path.resolve(
      __dirname,
      "../../database",
      "nfl_top_250_with_auction_values.csv"
    )
  ].filter(
    (candidate): candidate is string =>
      Boolean(candidate)
  );

  const csvPath = candidates.find(candidate =>
    fs.existsSync(candidate)
  );

  if (!csvPath) {
    throw new Error(
      `Player CSV not found. Checked: ${candidates.join(", ")}`
    );
  }

  return csvPath;
}

export function bootstrapPlayers(): PlayerBootstrapResult {
  const existing = db
    .prepare(`
      SELECT COUNT(*) AS count
      FROM draft_players
    `)
    .get() as { count: number };

  // Never overwrite an existing draft or player pool.
  if (existing.count > 0) {
    console.log(
      `Player bootstrap skipped: ${existing.count} players already exist.`
    );

    return {
      skipped: true,
      imported: 0,
      invalid: 0
    };
  }

  const csvPath = resolveCsvPath();

  const rows = parseCsv(
    fs.readFileSync(csvPath, "utf8")
  );

  if (rows.length === 0) {
    throw new Error(
      `Player CSV contains no rows: ${csvPath}`
    );
  }

  const insertPlayer = db.prepare(`
    INSERT INTO draft_players
    (
      rank,
      name,
      position,
      nfl_team,
      bye_week,
      auction_value,
      drafted
    )
    VALUES (?, ?, ?, ?, ?, ?, 0)
  `);

  const importPlayers = db.transaction(() => {
    let imported = 0;
    let invalid = 0;

    for (const row of rows) {
      const rank = Number(row["RK"]);
      const name = row["PLAYER NAME"]?.trim();
      const position =
        normalizePosition(row["POS"] ?? "");
      const nflTeam =
        row["TEAM"]?.trim() || null;
      const byeWeek =
        Number(row["BYE WEEK"]);
      const auctionValue =
        Number(row["AUCTION VALUE"]);

      if (
        !name ||
        !position ||
        !Number.isInteger(rank) ||
        rank <= 0 ||
        !Number.isInteger(auctionValue) ||
        auctionValue < 0
      ) {
        invalid += 1;
        continue;
      }

      insertPlayer.run(
        rank,
        name,
        position,
        nflTeam,
        Number.isInteger(byeWeek)
          ? byeWeek
          : null,
        auctionValue
      );

      imported += 1;
    }

    return {
      imported,
      invalid
    };
  });

  const result = importPlayers();

  if (result.imported === 0) {
    throw new Error(
      "Player bootstrap imported zero valid players."
    );
  }

  console.log(`Players imported from: ${csvPath}`);
  console.log(`Imported players: ${result.imported}`);
  console.log(`Invalid CSV rows: ${result.invalid}`);

  return {
    skipped: false,
    ...result
  };
}