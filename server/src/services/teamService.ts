import {
  db
} from "../database/connection";

import {
  getGameState
} from "./gameService";

import {
  broadcastGameUpdated,
  broadcastTeamUpdated
} from "../socket/socket";


export interface Team {
  id: number;
  name: string;
  budget: number;
  connected: number;
}


interface TeamRow {
  id: number;
  name: string;
  budget: number;
  connected: number;
}


interface GameStatusRow {
  status: string;
}


interface RosterPlayerRow {
  playerId: number;
}


function getTeamById(
  teamId: number
): Team {
  const team =
    db
      .prepare(
        `
        SELECT
          id,
          name,
          budget,
          connected
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


  return team;
}


function validateTeamId(
  teamId: number
) {
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
}


function normalizeTeamName(
  name: string
) {
  const trimmedName =
    name.trim();


  if (!trimmedName) {
    throw new Error(
      "Team name required"
    );
  }


  if (
    trimmedName.length > 60
  ) {
    throw new Error(
      "Team name must be 60 characters or fewer"
    );
  }


  return trimmedName;
}


function ensureUniqueTeamName(
  name: string,
  excludedTeamId?: number
) {
  const duplicate =
    excludedTeamId === undefined
      ? db
          .prepare(
            `
            SELECT id
            FROM teams
            WHERE LOWER(
              TRIM(name)
            ) = LOWER(
              TRIM(?)
            )
            LIMIT 1
            `
          )
          .get(
            name
          )
      : db
          .prepare(
            `
            SELECT id
            FROM teams
            WHERE LOWER(
              TRIM(name)
            ) = LOWER(
              TRIM(?)
            )
              AND id != ?
            LIMIT 1
            `
          )
          .get(
            name,
            excludedTeamId
          );


  if (duplicate) {
    throw new Error(
      "A team with that name already exists"
    );
  }
}


export function getTeams(): Team[] {
  return db
    .prepare(
      `
      SELECT
        id,
        name,
        budget,
        connected
      FROM teams
      ORDER BY id ASC
      `
    )
    .all() as Team[];
}


export function createTeam(
  name: string
): Team {
  const trimmedName =
    normalizeTeamName(
      name
    );


  ensureUniqueTeamName(
    trimmedName
  );


  const setting =
    db
      .prepare(
        `
        SELECT value
        FROM settings
        WHERE key = 'startingBudget'
        `
      )
      .get() as {
        value: string;
      } | undefined;


  if (!setting) {
    throw new Error(
      "Starting budget setting not found"
    );
  }


  const budget =
    Number(
      setting.value
    );


  if (
    !Number.isFinite(
      budget
    ) ||
    budget < 0
  ) {
    throw new Error(
      "Starting budget setting is invalid"
    );
  }


  const result =
    db
      .prepare(
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
      )
      .run(
        trimmedName,
        budget
      );


  const team =
    getTeamById(
      Number(
        result.lastInsertRowid
      )
    );


  broadcastTeamUpdated({
    type: "CREATED",
    team
  });


  broadcastGameUpdated(
    getGameState()
  );


  return team;
}


export function updateTeam(
  teamId: number,
  name: string
): Team {
  validateTeamId(
    teamId
  );


  getTeamById(
    teamId
  );


  const trimmedName =
    normalizeTeamName(
      name
    );


  ensureUniqueTeamName(
    trimmedName,
    teamId
  );


  const result =
    db
      .prepare(
        `
        UPDATE teams
        SET name = ?
        WHERE id = ?
        `
      )
      .run(
        trimmedName,
        teamId
      );


  if (
    result.changes !== 1
  ) {
    throw new Error(
      "Could not update team"
    );
  }


  const team =
    getTeamById(
      teamId
    );


  broadcastTeamUpdated({
    type: "UPDATED",
    team
  });


  broadcastGameUpdated(
    getGameState()
  );


  return team;
}


export function deleteTeam(
  teamId: number
) {
  validateTeamId(
    teamId
  );


  const team =
    getTeamById(
      teamId
    );


  const game =
    db
      .prepare(
        `
        SELECT status
        FROM game
        WHERE id = 1
        `
      )
      .get() as GameStatusRow | undefined;


  if (!game) {
    throw new Error(
      "Game state not found"
    );
  }


  if (
    game.status === "AUCTION"
  ) {
    throw new Error(
      "A team cannot be deleted during an active auction"
    );
  }


  const deleteTransaction =
    db.transaction(
      () => {
        const rosterPlayers =
          db
            .prepare(
              `
              SELECT
                player_id AS playerId
              FROM roster
              WHERE team_id = ?
              `
            )
            .all(
              teamId
            ) as RosterPlayerRow[];


        db
          .prepare(
            `
            DELETE FROM auction_bids
            WHERE team_id = ?
            `
          )
          .run(
            teamId
          );


        db
          .prepare(
            `
            DELETE FROM roster
            WHERE team_id = ?
            `
          )
          .run(
            teamId
          );


        const undraftPlayer =
          db.prepare(
            `
            UPDATE draft_players
            SET drafted = 0
            WHERE id = ?
            `
          );


        for (
          const rosterPlayer
          of rosterPlayers
        ) {
          undraftPlayer.run(
            rosterPlayer.playerId
          );
        }


        db
          .prepare(
            `
            UPDATE game
            SET
              status = CASE
                WHEN last_winner_team_id = ?
                  THEN 'SETUP'
                ELSE status
              END,
              current_player_id = CASE
                WHEN last_winner_team_id = ?
                  THEN NULL
                ELSE current_player_id
              END,
              countdown = CASE
                WHEN last_winner_team_id = ?
                  THEN 0
                ELSE countdown
              END,
              last_winner_team_id = CASE
                WHEN last_winner_team_id = ?
                  THEN NULL
                ELSE last_winner_team_id
              END,
              last_winner_price = CASE
                WHEN last_winner_team_id = ?
                  THEN NULL
                ELSE last_winner_price
              END,
              last_winner_player_id = CASE
                WHEN last_winner_team_id = ?
                  THEN NULL
                ELSE last_winner_player_id
              END,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = 1
            `
          )
          .run(
            teamId,
            teamId,
            teamId,
            teamId,
            teamId,
            teamId
          );


        const result =
          db
            .prepare(
              `
              DELETE FROM teams
              WHERE id = ?
              `
            )
            .run(
              teamId
            );


        if (
          result.changes !== 1
        ) {
          throw new Error(
            "Could not delete team"
          );
        }
      }
    );


  deleteTransaction();


  broadcastTeamUpdated({
    type: "DELETED",
    teamId
  });


  broadcastGameUpdated(
    getGameState()
  );


  return {
    teamId,
    teamName:
      team.name
  };
}