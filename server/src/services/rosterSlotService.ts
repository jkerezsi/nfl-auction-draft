import {
  db
} from "../database/connection";


interface RosterSlotRow {
  slot: string;
}


export const ROSTER_SLOTS = [
  "QB",
  "RB1",
  "RB2",
  "WR1",
  "WR2",
  "TE",
  "FLEX",
  "K",
  "DST",
  "BENCH1",
  "BENCH2",
  "BENCH3",
  "BENCH4",
  "BENCH5",
  "BENCH6"
] as const;


export type RosterSlot =
  typeof ROSTER_SLOTS[number];


const BENCH_SLOTS:
  readonly RosterSlot[] = [
    "BENCH1",
    "BENCH2",
    "BENCH3",
    "BENCH4",
    "BENCH5",
    "BENCH6"
  ];


const ROSTER_SLOT_ORDER:
  Record<RosterSlot, number> = {
    QB: 1,

    RB1: 2,
    RB2: 3,

    WR1: 4,
    WR2: 5,

    TE: 6,
    FLEX: 7,
    K: 8,
    DST: 9,

    BENCH1: 10,
    BENCH2: 11,
    BENCH3: 12,
    BENCH4: 13,
    BENCH5: 14,
    BENCH6: 15
  };


export function normalizePosition(
  position: string
): string {
  const normalized =
    position
      .trim()
      .toUpperCase()
      .replace(
        /[^A-Z]/g,
        ""
      );


  if (
    normalized.startsWith(
      "DST"
    ) ||
    normalized.startsWith(
      "DEF"
    )
  ) {
    return "DST";
  }


  if (
    normalized.startsWith(
      "QB"
    )
  ) {
    return "QB";
  }


  if (
    normalized.startsWith(
      "RB"
    )
  ) {
    return "RB";
  }


  if (
    normalized.startsWith(
      "WR"
    )
  ) {
    return "WR";
  }


  if (
    normalized.startsWith(
      "TE"
    )
  ) {
    return "TE";
  }


  if (
    normalized.startsWith(
      "K"
    )
  ) {
    return "K";
  }


  return normalized;
}


function getOccupiedSlots(
  teamId: number
): Set<string> {
  const rows =
    db
      .prepare(
        `
        SELECT slot
        FROM roster
        WHERE team_id = ?
        `
      )
      .all(
        teamId
      ) as RosterSlotRow[];


  return new Set(
    rows.map(
      row =>
        row.slot
          .trim()
          .toUpperCase()
    )
  );
}


function getFirstAvailableSlot(
  occupiedSlots: Set<string>,
  eligibleSlots: readonly RosterSlot[]
): RosterSlot | null {
  return (
    eligibleSlots.find(
      slot =>
        !occupiedSlots.has(
          slot
        )
    ) ??
    null
  );
}


export function getAvailableRosterSlot(
  teamId: number,
  position: string
): RosterSlot {
  if (
    !Number.isInteger(
      teamId
    ) ||
    teamId <= 0
  ) {
    throw new Error(
      "Invalid team ID"
    );
  }


  const occupiedSlots =
    getOccupiedSlots(
      teamId
    );


  const normalizedPosition =
    normalizePosition(
      position
    );


  let eligibleStarterSlots:
    readonly RosterSlot[] = [];


  switch (
    normalizedPosition
  ) {
    case "QB":
      eligibleStarterSlots = [
        "QB"
      ];

      break;


    case "RB":
      eligibleStarterSlots = [
        "RB1",
        "RB2",
        "FLEX"
      ];

      break;


    case "WR":
      eligibleStarterSlots = [
        "WR1",
        "WR2",
        "FLEX"
      ];

      break;


    case "TE":
      eligibleStarterSlots = [
        "TE",
        "FLEX"
      ];

      break;


    case "K":
      eligibleStarterSlots = [
        "K"
      ];

      break;


    case "DST":
      eligibleStarterSlots = [
        "DST"
      ];

      break;
  }


  const starterSlot =
    getFirstAvailableSlot(
      occupiedSlots,
      eligibleStarterSlots
    );


  if (
    starterSlot !== null
  ) {
    return starterSlot;
  }


  const benchSlot =
    getFirstAvailableSlot(
      occupiedSlots,
      BENCH_SLOTS
    );


  if (
    benchSlot !== null
  ) {
    return benchSlot;
  }


  throw new Error(
    "Winning team roster is full"
  );
}


export function getRosterSlotOrder(
  slot: string
): number {
  const normalizedSlot =
    slot
      .trim()
      .toUpperCase() as RosterSlot;


  return (
    ROSTER_SLOT_ORDER[
      normalizedSlot
    ] ??
    99
  );
}