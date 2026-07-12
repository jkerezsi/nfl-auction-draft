import { db } from "../database/connection";


export interface RosterPlayer {
  id: number;
  playerId: number;
  playerName: string;
  position: string;
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


function getPositionOrder(
  position: string
): number {
  const normalizedPosition =
    position
      .toUpperCase()
      .replace(/[0-9]/g, "");


  const positionOrder:
    Record<string, number> = {
      QB: 1,
      RB: 2,
      WR: 3,
      TE: 4,
      FLEX: 5,
      K: 6,
      DST: 7,
      DEF: 7,
      BENCH: 8
    };


  return (
    positionOrder[normalizedPosition] ??
    99
  );
}


export function getTeamRoster(
  teamId: number
): TeamRoster {
  if (
    !Number.isInteger(teamId) ||
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
      .get(teamId) as TeamRow | undefined;


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
          id,
          player_id AS playerId,
          player_name AS playerName,
          position,
          price,
          slot
        FROM roster
        WHERE team_id = ?
        ORDER BY id ASC
        `
      )
      .all(teamId) as RosterPlayer[];


  players.sort(
    (firstPlayer, secondPlayer) => {
      const positionDifference =
        getPositionOrder(
          firstPlayer.position
        ) -
        getPositionOrder(
          secondPlayer.position
        );


      if (positionDifference !== 0) {
        return positionDifference;
      }


      return (
        firstPlayer.playerName
          .localeCompare(
            secondPlayer.playerName
          )
      );
    }
  );


  const spent =
    players.reduce(
      (
        total,
        player
      ) =>
        total + player.price,
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