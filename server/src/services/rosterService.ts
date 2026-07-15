import {
  db
} from "../database/connection";

import {
  getRosterSlotOrder
} from "./rosterSlotService";


export interface RosterPlayer {
  id: number;
  playerId: number;
  playerName: string;
  position: string;
  nflTeam: string | null;
  byeWeek: number | null;
  rank: number | null;
  auctionValue: number;
  price: number;
  slot: string;
}


export interface TeamRoster {
  teamId: number;
  teamName: string;
  budget: number;
  spent: number;
  playerCount: number;
  players: RosterPlayer[];
}


interface TeamRow {
  id: number;
  name: string;
  budget: number;
}


export function getTeamRoster(
  teamId: number
): TeamRoster {
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


  const team =
    db
      .prepare(
        `
        SELECT
          id,
          name,
          budget
        FROM teams
        WHERE id = ?
        `
      )
      .get(
        teamId
      ) as TeamRow | undefined;


  if (!team) {
    throw new Error(
      "Team not found"
    );
  }


  const players =
    db
      .prepare(
        `
        SELECT
          roster.id,

          roster.player_id
            AS playerId,

          roster.player_name
            AS playerName,

          roster.position,

          draft_players.nfl_team
            AS nflTeam,

          draft_players.bye_week
            AS byeWeek,

          draft_players.rank,

          draft_players.auction_value
            AS auctionValue,

          roster.price,
          roster.slot

        FROM roster

        INNER JOIN draft_players
          ON draft_players.id =
            roster.player_id

        WHERE roster.team_id = ?

        ORDER BY roster.id ASC
        `
      )
      .all(
        teamId
      ) as RosterPlayer[];


  players.sort(
    (
      firstPlayer,
      secondPlayer
    ) => {
      const slotDifference =
        getRosterSlotOrder(
          firstPlayer.slot
        ) -
        getRosterSlotOrder(
          secondPlayer.slot
        );


      if (
        slotDifference !== 0
      ) {
        return slotDifference;
      }


      return (
        firstPlayer.id -
        secondPlayer.id
      );
    }
  );


  const spent =
    players.reduce(
      (
        total,
        player
      ) =>
        total +
        player.price,
      0
    );


  return {
    teamId:
      team.id,

    teamName:
      team.name,

    budget:
      team.budget,

    spent,

    playerCount:
      players.length,

    players
  };
}