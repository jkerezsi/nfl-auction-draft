import {
  describe,
  expect,
  it
} from "vitest";

import {
  db
} from "../../src/database/connection";

import {
  createTeam,
  deleteTeam,
  getTeams,
  setTeamAutoDraftEnabled,
  updateTeam
} from "../../src/services/teamService";

import {
  createTestPlayer,
  createTestTeam,
  insertRosterPlayer,
  setGameState
} from "../helpers/database";


describe(
  "teamService",
  () => {
    it(
      "creates a trimmed team with the configured starting budget",
      () => {
        const team =
          createTeam(
            "  Alpha  "
          );


        expect(
          team.name
        ).toBe(
          "Alpha"
        );

        expect(
          team.budget
        ).toBe(
          200
        );

        expect(
          getTeams()
        ).toHaveLength(
          1
        );
      }
    );


    it.each([
      "",
      "   "
    ])(
      "rejects an empty team name",
      name => {
        expect(
          () =>
            createTeam(
              name
            )
        ).toThrow(
          "Team name required"
        );
      }
    );


    it(
      "rejects a duplicate team name case-insensitively",
      () => {
        createTeam(
          "Alpha"
        );


        expect(
          () =>
            createTeam(
              " alpha "
            )
        ).toThrow(
          "A team with that name already exists"
        );
      }
    );


    it(
      "enables and disables auto-draft",
      () => {
        const team =
          createTeam(
            "Auto Team"
          );


        expect(
          team.autoDraftEnabled
        ).toBe(
          0
        );


        const enabled =
          setTeamAutoDraftEnabled(
            team.id,
            true
          );


        expect(
          enabled.autoDraftEnabled
        ).toBe(
          1
        );


        const disabled =
          setTeamAutoDraftEnabled(
            team.id,
            false
          );


        expect(
          disabled.autoDraftEnabled
        ).toBe(
          0
        );
      }
    );


    it(
      "rejects changing auto-draft during an active auction",
      () => {
        const team =
          createTeam(
            "Auto Team"
          );

        const playerId =
          createTestPlayer();


        setGameState({
          status:
            "AUCTION",
          currentPlayerId:
            playerId
        });


        expect(
          () =>
            setTeamAutoDraftEnabled(
              team.id,
              true
            )
        ).toThrow(
          "Auto-draft settings cannot be changed during an active auction"
        );
      }
    );


    it(
      "renames a team",
      () => {
        const team =
          createTeam(
            "Alpha"
          );


        const updated =
          updateTeam(
            team.id,
            "Beta"
          );


        expect(
          updated.name
        ).toBe(
          "Beta"
        );
      }
    );


    it(
      "rejects renaming to another existing team name",
      () => {
        const first =
          createTeam(
            "Alpha"
          );

        createTeam(
          "Beta"
        );


        expect(
          () =>
            updateTeam(
              first.id,
              " beta "
            )
        ).toThrow(
          "A team with that name already exists"
        );
      }
    );


    it(
      "rejects deletion during an active auction",
      () => {
        const team =
          createTeam(
            "Alpha"
          );

        const playerId =
          createTestPlayer();


        setGameState({
          status: "AUCTION",
          currentPlayerId:
            playerId
        });


        expect(
          () =>
            deleteTeam(
              team.id
            )
        ).toThrow(
          "A team cannot be deleted during an active auction"
        );
      }
    );


    it(
      "deletes a team, its bids and roster while returning players to the pool",
      () => {
        const teamId =
          createTestTeam(
            "Alpha"
          );

        const playerId =
          createTestPlayer({
            drafted: 1
          });


        insertRosterPlayer({
          teamId,
          playerId,
          playerName:
            "Test Player",
          position:
            "RB1",
          price: 30
        });


        db.prepare(
          `
          INSERT INTO auction_bids
          (
            team_id,
            player_id,
            amount
          )
          VALUES
          (
            ?,
            ?,
            30
          )
          `
        ).run(
          teamId,
          playerId
        );


        setGameState({
          status: "RESULT",
          currentPlayerId:
            playerId,
          lastWinnerTeamId:
            teamId,
          lastWinnerPrice:
            30,
          lastWinnerPlayerId:
            playerId
        });


        const result =
          deleteTeam(
            teamId
          );


        const teamCount =
          db.prepare(
            `
            SELECT COUNT(*) AS count
            FROM teams
            WHERE id = ?
            `
          ).get(
            teamId
          ) as {
            count: number;
          };


        const bidCount =
          db.prepare(
            `
            SELECT COUNT(*) AS count
            FROM auction_bids
            WHERE team_id = ?
            `
          ).get(
            teamId
          ) as {
            count: number;
          };


        const rosterCount =
          db.prepare(
            `
            SELECT COUNT(*) AS count
            FROM roster
            WHERE team_id = ?
            `
          ).get(
            teamId
          ) as {
            count: number;
          };


        const player =
          db.prepare(
            `
            SELECT drafted
            FROM draft_players
            WHERE id = ?
            `
          ).get(
            playerId
          ) as {
            drafted: number;
          };


        const game =
          db.prepare(
            `
            SELECT
              status,
              current_player_id AS currentPlayerId,
              last_winner_team_id AS winnerTeamId
            FROM game
            WHERE id = 1
            `
          ).get() as {
            status: string;
            currentPlayerId:
              number | null;
            winnerTeamId:
              number | null;
          };


        expect(
          result
        ).toEqual({
          teamId,
          teamName:
            "Alpha"
        });

        expect(
          teamCount.count
        ).toBe(
          0
        );

        expect(
          bidCount.count
        ).toBe(
          0
        );

        expect(
          rosterCount.count
        ).toBe(
          0
        );

        expect(
          player.drafted
        ).toBe(
          0
        );

        expect(
          game.status
        ).toBe(
          "SETUP"
        );

        expect(
          game.currentPlayerId
        ).toBeNull();

        expect(
          game.winnerTeamId
        ).toBeNull();
      }
    );
  }
);
