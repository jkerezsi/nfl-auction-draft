import fs from "fs";
import path from "path";

import {
  db
} from "../database/connection";


interface CsvRow {
  [key: string]: string;
}


function parseCsv(
  content: string
): CsvRow[] {
  const rows: string[][] = [];

  let currentRow: string[] = [];
  let currentValue = "";
  let insideQuotes = false;


  for (
    let index = 0;
    index < content.length;
    index += 1
  ) {
    const character =
      content[index];

    const nextCharacter =
      content[index + 1];


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
      insideQuotes =
        !insideQuotes;

      continue;
    }


    if (
      character === "," &&
      !insideQuotes
    ) {
      currentRow.push(
        currentValue
      );

      currentValue = "";

      continue;
    }


    if (
      (
        character === "\n" ||
        character === "\r"
      ) &&
      !insideQuotes
    ) {
      if (
        character === "\r" &&
        nextCharacter === "\n"
      ) {
        index += 1;
      }


      currentRow.push(
        currentValue
      );

      currentValue = "";


      if (
        currentRow.some(
          value =>
            value.length > 0
        )
      ) {
        rows.push(
          currentRow
        );
      }


      currentRow = [];

      continue;
    }


    currentValue +=
      character;
  }


  if (
    currentValue.length > 0 ||
    currentRow.length > 0
  ) {
    currentRow.push(
      currentValue
    );

    rows.push(
      currentRow
    );
  }


  const [
    headerRow,
    ...dataRows
  ] = rows;


  if (!headerRow) {
    return [];
  }


  const headers =
    headerRow.map(
      header =>
        header
          .replace(
            /^\uFEFF/,
            ""
          )
          .trim()
    );


  return dataRows.map(
    values => {
      const row: CsvRow = {};


      headers.forEach(
        (
          header,
          index
        ) => {
          row[header] =
            values[index]?.trim() ??
            "";
        }
      );


      return row;
    }
  );
}


function ensureAuctionValueColumns() {
  const columns =
    db
      .prepare(
        `
        PRAGMA table_info(
          draft_players
        )
        `
      )
      .all() as Array<{
        name: string;
      }>;


  const hasAuctionValue =
    columns.some(
      column =>
        column.name ===
        "auction_value"
    );


  if (!hasAuctionValue) {
    db.exec(
      `
      ALTER TABLE draft_players
      ADD COLUMN auction_value
      INTEGER NOT NULL
      DEFAULT 0
      `
    );
  }
    const hasMaxOffer =
    columns.some(
      column =>
        column.name ===
        "max_offer"
    );

  if (!hasMaxOffer) {
    db.exec(
      `
      ALTER TABLE draft_players
      ADD COLUMN max_offer
      INTEGER NOT NULL
      DEFAULT 0
      `
    );
  }
}


function getCsvPath() {
  const suppliedPath =
    process.argv[2];


  if (suppliedPath) {
    return path.resolve(
      suppliedPath
    );
  }


  return path.resolve(
    process.cwd(),
    "database",
    "nfl_top_250_FERI_master.csv"
  );
}


function main() {
  const csvPath =
    getCsvPath();


  if (
    !fs.existsSync(
      csvPath
    )
  ) {
    throw new Error(
      `CSV file not found: ${csvPath}`
    );
  }


  const rows =
    parseCsv(
      fs.readFileSync(
        csvPath,
        "utf8"
      )
    );


  if (rows.length === 0) {
    throw new Error(
      "The CSV contains no player rows."
    );
  }


  ensureAuctionValueColumns();


  const updatePlayer =
    db.prepare(
      `
      UPDATE draft_players
      SET
        auction_value = ?,
        max_offer = ?
      WHERE
        LOWER(
          TRIM(name)
        ) =
        LOWER(
          TRIM(?)
        )
        AND
        LOWER(
          TRIM(
            COALESCE(
              nfl_team,
              ''
            )
          )
        ) =
        LOWER(
          TRIM(?)
        )
      `
    );


  const importValues =
    db.transaction(
      () => {
        let updated = 0;
        let unmatched = 0;
        let invalid = 0;

        const unmatchedPlayers:
          string[] = [];


        for (const row of rows) {
          const name =
            row["PLAYER NAME"];

          const team =
            row["TEAM"];

          const rawValue =
            row["AUCTION VALUE"];
          const rawMaxOffer =
            row["MAX OFFER"];

          if (
            !name ||
            !team
          ) {
            invalid += 1;

            continue;
          }


          const auctionValue =
            Number(
              rawValue
            );
          const maxOffer =
            Number(
              rawMaxOffer
            );

          if (
            !Number.isInteger(
              maxOffer
            ) ||
            maxOffer < 0
          ) {
            invalid += 1;

            continue;
          }

          if (
            !Number.isInteger(
              auctionValue
            ) ||
            auctionValue < 0
          ) {
            invalid += 1;

            continue;
          }


          const result =
            updatePlayer.run(
              auctionValue,
              maxOffer,
              name,
              team
            );


          if (
            result.changes === 1
          ) {
            updated += 1;
          } else {
            unmatched += 1;

            unmatchedPlayers.push(
              `${name} (${team})`
            );
          }
        }


        return {
          updated,
          unmatched,
          invalid,
          unmatchedPlayers
        };
      }
    );


  const report =
    importValues();


  console.log(
    `Auction values imported from: ${csvPath}`
  );

  console.log(
    `Updated players: ${report.updated}`
  );

  console.log(
    `Unmatched database players: ${report.unmatched}`
  );

  console.log(
    `Invalid CSV rows: ${report.invalid}`
  );


  if (
    report.unmatchedPlayers.length > 0
  ) {
    console.log(
      "\nUnmatched rows:"
    );


    for (
      const player
      of report.unmatchedPlayers
    ) {
      console.log(
        `- ${player}`
      );
    }
  }
}


try {
  main();
} catch (error) {
  console.error(
    "Auction value import failed:",
    error
  );

  process.exitCode = 1;
} finally {
  db.close();
}
