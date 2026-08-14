import {
  db
} from "../database/connection";

import {
  normalizePosition,
  ROSTER_SLOTS
} from "./rosterSlotService";


export type DraftMode =
  | "HUMAN"
  | "AUTO_DRAFT";


interface RosterPlayerRow {
  position: string;
  slot: string;
}


interface PlayerRow {
  id: number;
  position: string;
}


export interface RosterEligibilityResult {
  eligible: boolean;
  reason?: string;
}


const AUTO_DRAFT_POSITION_LIMITS:
  Partial<Record<string, number>> = {
    QB: 2,
    TE: 2,
    K: 1,
    DST: 2
  };


const STARTER_SLOTS = [
  "QB",
  "RB1",
  "RB2",
  "WR1",
  "WR2",
  "TE",
  "FLEX",
  "K",
  "DST"
] as const;


const BENCH_SLOTS = [
  "BENCH1",
  "BENCH2",
  "BENCH3",
  "BENCH4",
  "BENCH5",
  "BENCH6"
] as const;


const VALID_POSITIONS = [
  "QB",
  "RB",
  "WR",
  "TE",
  "K",
  "DST"
] as const;


function getRosterPlayers(
  teamId: number
): RosterPlayerRow[] {
  return db
    .prepare(
      `
      SELECT
        position,
        slot
      FROM roster
      WHERE team_id = ?
      `
    )
    .all(
      teamId
    ) as RosterPlayerRow[];
}


function getPlayer(
  playerId: number
): PlayerRow | undefined {
  return db
    .prepare(
      `
      SELECT
        id,
        position
      FROM draft_players
      WHERE id = ?
      `
    )
    .get(
      playerId
    ) as PlayerRow | undefined;
}


function isPositionCompatibleWithStarter(
  position: string,
  slot: string
): boolean {
  switch (slot) {
    case "QB":
      return position === "QB";

    case "RB1":
    case "RB2":
      return position === "RB";

    case "WR1":
    case "WR2":
      return position === "WR";

    case "TE":
      return position === "TE";

    case "FLEX":
      return (
        position === "RB" ||
        position === "WR" ||
        position === "TE"
      );

    case "K":
      return position === "K";

    case "DST":
      return position === "DST";

    default:
      return false;
  }
}


function canAssignStarters(
  positions: string[]
): boolean {
  const used =
    new Set<number>();


  function assignSlot(
    slotIndex: number
  ): boolean {
    if (
      slotIndex >=
      STARTER_SLOTS.length
    ) {
      return true;
    }


    const slot =
      STARTER_SLOTS[
        slotIndex
      ];


    for (
      let playerIndex = 0;
      playerIndex < positions.length;
      playerIndex += 1
    ) {
      if (
        used.has(
          playerIndex
        )
      ) {
        continue;
      }


      if (
        !isPositionCompatibleWithStarter(
          positions[playerIndex],
          slot
        )
      ) {
        continue;
      }


      used.add(
        playerIndex
      );


      if (
        assignSlot(
          slotIndex + 1
        )
      ) {
        return true;
      }


      used.delete(
        playerIndex
      );
    }


    return false;
  }


  return assignSlot(0);
}


function rosterCanEventuallyBeCompleted(
  roster: RosterPlayerRow[],
  candidatePosition: string
): boolean {
  const positions = [
    ...roster.map(
      player =>
        normalizePosition(
          player.position
        )
    ),
    candidatePosition
  ];


  /*
   * There are 15 total roster spots:
   * 9 starters + 6 bench.
   */
  if (
    positions.length >
    ROSTER_SLOTS.length
  ) {
    return false;
  }


  /*
   * Before the team has nine players,
   * there are still enough future roster
   * spots to fill missing starters.
   */
  if (
    positions.length <
    STARTER_SLOTS.length
  ) {
    return true;
  }


  /*
   * Once the team has at least nine players,
   * the current player pool must be capable
   * of filling every required starting slot.
   *
   * Existing slot assignments are deliberately
   * ignored here. We reason from the available
   * player positions so FLEX can be assigned
   * correctly.
   */
  return canAssignStarters(
    positions
  );
}


function countPosition(
  roster: RosterPlayerRow[],
  position: string
): number {
  return roster.filter(
    player =>
      normalizePosition(
        player.position
      ) === position
  ).length;
}


function isBenchFull(
  roster: RosterPlayerRow[]
): boolean {
  const occupied =
    new Set(
      roster.map(
        player =>
          player.slot
            .trim()
            .toUpperCase()
      )
    );


  return BENCH_SLOTS.every(
    slot =>
      occupied.has(
        slot
      )
  );
}


function canFillMissingStarter(
  roster: RosterPlayerRow[],
  position: string
): boolean {
  const occupied =
    new Set(
      roster.map(
        player =>
          player.slot
            .trim()
            .toUpperCase()
      )
    );


  switch (position) {
    case "QB":
      return !occupied.has(
        "QB"
      );

    case "RB":
      return (
        !occupied.has("RB1") ||
        !occupied.has("RB2") ||
        !occupied.has("FLEX")
      );

    case "WR":
      return (
        !occupied.has("WR1") ||
        !occupied.has("WR2") ||
        !occupied.has("FLEX")
      );

    case "TE":
      return (
        !occupied.has("TE") ||
        !occupied.has("FLEX")
      );

    case "K":
      return !occupied.has(
        "K"
      );

    case "DST":
      return !occupied.has(
        "DST"
      );

    default:
      return false;
  }
}


export function checkRosterEligibility(
  teamId: number,
  playerId: number,
  mode: DraftMode
): RosterEligibilityResult {
  if (
    !Number.isInteger(teamId) ||
    teamId <= 0
  ) {
    return {
      eligible: false,
      reason: "Invalid team ID"
    };
  }


  if (
    !Number.isInteger(playerId) ||
    playerId <= 0
  ) {
    return {
      eligible: false,
      reason: "Invalid player ID"
    };
  }


  const player =
    getPlayer(
      playerId
    );


  if (!player) {
    return {
      eligible: false,
      reason: "Player not found"
    };
  }


  const roster =
    getRosterPlayers(
      teamId
    );


  if (
    roster.length >=
    ROSTER_SLOTS.length
  ) {
    return {
      eligible: false,
      reason: "Roster is full"
    };
  }


  const position =
    normalizePosition(
      player.position
    );


  if (
    !VALID_POSITIONS.includes(
      position as typeof VALID_POSITIONS[number]
    )
  ) {
    return {
      eligible: false,
      reason:
        `Unsupported player position: ${player.position}`
    };
  }


 if (
  mode === "HUMAN"
) {
  /*
   * Human teams have no positional limits and
   * are not subject to the auto-draft full-bench
   * restriction.
   *
   * However, when this bid would create the
   * 14th player on the roster, there is only
   * one roster spot remaining. At that point
   * we must make sure the required starting
   * lineup can still be completed.
   */
  if (
    roster.length >=
    STARTER_SLOTS.length + BENCH_SLOTS.length - 1
  ) {
    if (
      !rosterCanEventuallyBeCompleted(
        roster,
        position
      )
    ) {
      return {
        eligible: false,
        reason:
          "This bid would make it impossible to complete the required starting roster"
      };
    }
  }

  return {
    eligible: true
  };
}


  /*
   * Everything below this point applies
   * only to AUTO_DRAFT teams.
   */


  /*
   * Auto-draft positional limits.
   *
   * QB  -> maximum 2
   * TE  -> maximum 2
   * K   -> maximum 1
   * DST -> maximum 2
   *
   * RB/WR have no explicit positional cap.
   */
  const positionLimit =
    AUTO_DRAFT_POSITION_LIMITS[
      position
    ];


  if (
    positionLimit !== undefined &&
    countPosition(
      roster,
      position
    ) >= positionLimit
  ) {
    return {
      eligible: false,
      reason:
        `Auto-draft position limit reached for ${position}`
    };
  }


  /*
   * When the bench is full, auto-draft may
   * only acquire a player who can fill an
   * unfilled starting position.
   *
   * This is intentionally NOT applied to
   * human teams.
   */
  if (
    isBenchFull(
      roster
    ) &&
    !canFillMissingStarter(
      roster,
      position
    )
  ) {
    return {
      eligible: false,
      reason:
        "Bench is full and this player cannot fill a missing starting position"
    };
  }


  /*
   * Auto-draft must not make it impossible
   * to complete the required starting roster.
   */
  if (
    !rosterCanEventuallyBeCompleted(
      roster,
      position
    )
  ) {
    return {
      eligible: false,
      reason:
        "This bid would make it impossible to complete the required starting roster"
    };
  }


  return {
    eligible: true
  };
}