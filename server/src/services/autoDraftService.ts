import {
  db
} from "../database/connection";

import {
  submitBid
} from "./bidService";

import {
  checkRosterEligibility
} from "./rosterEligibilityService";


interface AutoDraftTeamRow {
  id: number;
  name: string;
  budget: number;
}


interface PlayerRow {
  id: number;
  name: string;
  max_offer: number;
  drafted: number;
}


interface GameRow {
  status: string;
  currentPlayerId: number | null;
}


export function submitAutoDraftBids(
  playerId: number
): number {
  if (
    !Number.isInteger(
      playerId
    ) ||
    playerId <= 0
  ) {
    throw new Error(
      "Invalid player ID"
    );
  }


  const game =
    db
      .prepare(
        `
        SELECT
          status,
          current_player_id AS currentPlayerId
        FROM game
        WHERE id = 1
        `
      )
      .get() as GameRow | undefined;


  if (
    !game ||
    game.status !== "AUCTION" ||
    game.currentPlayerId !== playerId
  ) {
    return 0;
  }


  const player =
    db
      .prepare(
        `
        SELECT
          id,
          name,
          max_offer,
          drafted
        FROM draft_players
        WHERE id = ?
        `
      )
      .get(
        playerId
      ) as PlayerRow | undefined;


  if (
    !player ||
    player.drafted === 1
  ) {
    return 0;
  }


  if (
    !Number.isInteger(
      player.max_offer
    ) ||
    player.max_offer <= 0
  ) {
    return 0;
  }


  const teams =
    db
      .prepare(
        `
        SELECT
          id,
          name,
          budget
        FROM teams
        WHERE auto_draft_enabled = 1
        ORDER BY id ASC
        `
      )
      .all() as AutoDraftTeamRow[];


  let submittedCount =
    0;


  for (
    const team of teams
  ) {
    const existingBid =
      db
        .prepare(
          `
          SELECT id
          FROM auction_bids
          WHERE
            team_id = ?
            AND player_id = ?
          `
        )
        .get(
          team.id,
          player.id
        );


    if (existingBid) {
      continue;
    }


    if (
      team.budget <
      player.max_offer
    ) {
      continue;
    }


    const eligibility =
      checkRosterEligibility(
        team.id,
        player.id,
        "AUTO_DRAFT"
      );


    if (
      !eligibility.eligible
    ) {
      continue;
    }


    try {
      submitBid(
        team.id,
        player.id,
        player.max_offer
      );

      submittedCount +=
        1;
    } catch (error) {
      console.error(
        `Auto-draft bid failed for team ${team.id} (${team.name}) for player ${player.name}:`,
        error
      );
    }
  }


  return submittedCount;
}
