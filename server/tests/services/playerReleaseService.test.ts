import {
  describe,
  expect,
  it
} from "vitest";

import {
  db
} from "../../src/database/connection";

import {
  releaseDraftedPlayer
} from "../../src/services/playerReleaseService";

import {
  createTestPlayer,
  createTestTeam,
  insertRosterPlayer,
  setGameState
} from "../helpers/database";


describe(
  "playerReleaseService",
  () => {
    it.each([
      0,
      -1,
      1.5,
      Number.NaN
    ])(
      "rejects invalid roster ID %s",
      rosterId => {
        expect(
          () =>
            releaseDraftedPlayer(
              rosterId
            )
        ).toThrow(
          "Invalid roster ID"
        );
      }
    );


    it(
      "rejects an unknown roster entry",
      () => {
        expect(
          () =>
            releaseDraftedPlayer(
              999
            )
        ).toThrow(
          "Roster player not found"
        );
      }
    );


    it(
      "rejects release during an active auction",
      () => {
        const teamId =
          createTestTeam(
            "Alpha",
            160
          );

        const playerId =
          createTestPlayer({
            name:
              "Test Player",
            position:
              "RB1",
            drafted:
              1
          });


        insertRosterPlayer({
          teamId,
          playerId,
          playerName:
            "Test Player",
          position:
            "RB1",
          price:
            40,
          slot:
            "RB1"
        });


        const roster =
          db
            .prepare(
              `
              SELECT id
              FROM roster
              WHERE team_id = ?
                AND player_id = ?
              `
            )
            .get(
              teamId,
              playerId
            ) as {
              id: number;
            };


        setGameState({
          status:
            "AUCTION",
          currentPlayerId:
            playerId,
          countdown:
            20
        });


        expect(
          () =>
            releaseDraftedPlayer(
              roster.id
            )
        ).toThrow(
          "A player cannot be released during an active auction"
        );


        const team =
          db
            .prepare(
              `
              SELECT budget
              FROM teams
              WHERE id = ?
              `
            )
            .get(
              teamId
            ) as {
              budget: number;
            };


        expect(
          team.budget
        ).toBe(
          160
        );
      }
    );


    it(
      "removes the roster entry and refunds the team",
      () => {
        const teamId =
          createTestTeam(
            "Alpha",
            145
          );

        const playerId =
          createTestPlayer({
            name:
              "Jahmyr Gibbs",
            position:
              "RB1",
            drafted:
              1
          });


        insertRosterPlayer({
          teamId,
          playerId,
          playerName:
            "Jahmyr Gibbs",
          position:
            "RB1",
          price:
            55,
          slot:
            "RB1"
        });


        const roster =
          db
            .prepare(
              `
              SELECT id
              FROM roster
              WHERE team_id = ?
                AND player_id = ?
              `
            )
            .get(
              teamId,
              playerId
            ) as {
              id: number;
            };


        const result =
          releaseDraftedPlayer(
            roster.id
          );


        const team =
          db
            .prepare(
              `
              SELECT budget
              FROM teams
              WHERE id = ?
              `
            )
            .get(
              teamId
            ) as {
              budget: number;
            };


        const rosterCount =
          db
            .prepare(
              `
              SELECT COUNT(*) AS count
              FROM roster
              WHERE id = ?
              `
            )
            .get(
              roster.id
            ) as {
              count: number;
            };


        expect(
          result
        ).toEqual({
          rosterId:
            roster.id,
          teamId,
          teamName:
            "Alpha",
          playerId,
          playerName:
            "Jahmyr Gibbs",
          refundedAmount:
            55,
          slot:
            "RB1"
        });


        expect(
          team.budget
        ).toBe(
          200
        );

        expect(
          rosterCount.count
        ).toBe(
          0
        );
      }
    );


    it(
      "marks the released player as available",
      () => {
        const teamId =
          createTestTeam(
            "Alpha",
            175
          );

        const playerId =
          createTestPlayer({
            name:
              "Josh Allen",
            position:
              "QB1",
            drafted:
              1
          });


        insertRosterPlayer({
          teamId,
          playerId,
          playerName:
            "Josh Allen",
          position:
            "QB1",
          price:
            25,
          slot:
            "QB"
        });


        const roster =
          db
            .prepare(
              `
              SELECT id
              FROM roster
              WHERE player_id = ?
              `
            )
            .get(
              playerId
            ) as {
              id: number;
            };


        releaseDraftedPlayer(
          roster.id
        );


        const player =
          db
            .prepare(
              `
              SELECT drafted
              FROM draft_players
              WHERE id = ?
              `
            )
            .get(
              playerId
            ) as {
              drafted: number;
            };


        expect(
          player.drafted
        ).toBe(
          0
        );
      }
    );


    it(
      "deletes all auction bids for the released player",
      () => {
        const teamId =
          createTestTeam(
            "Alpha",
            170
          );

        const secondTeamId =
          createTestTeam(
            "Beta",
            200
          );

        const playerId =
          createTestPlayer({
            drafted:
              1
          });


        insertRosterPlayer({
          teamId,
          playerId,
          playerName:
            "Test Player",
          position:
            "WR1",
          price:
            30,
          slot:
            "WR1"
        });


        db
          .prepare(
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
              ?
            )
            `
          )
          .run(
            teamId,
            playerId,
            30
          );


        db
          .prepare(
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
              ?
            )
            `
          )
          .run(
            secondTeamId,
            playerId,
            25
          );


        const roster =
          db
            .prepare(
              `
              SELECT id
              FROM roster
              WHERE player_id = ?
              `
            )
            .get(
              playerId
            ) as {
              id: number;
            };


        releaseDraftedPlayer(
          roster.id
        );


        const bidCount =
          db
            .prepare(
              `
              SELECT COUNT(*) AS count
              FROM auction_bids
              WHERE player_id = ?
              `
            )
            .get(
              playerId
            ) as {
              count: number;
            };


        expect(
          bidCount.count
        ).toBe(
          0
        );
      }
    );


    it(
      "clears the result state when releasing the last winning player",
      () => {
        const teamId =
          createTestTeam(
            "Alpha",
            150
          );

        const playerId =
          createTestPlayer({
            name:
              "Winning Player",
            drafted:
              1
          });


        insertRosterPlayer({
          teamId,
          playerId,
          playerName:
            "Winning Player",
          position:
            "RB1",
          price:
            50,
          slot:
            "RB1"
        });


        setGameState({
          status:
            "RESULT",
          currentPlayerId:
            playerId,
          lastWinnerTeamId:
            teamId,
          lastWinnerPrice:
            50,
          lastWinnerPlayerId:
            playerId
        });


        const roster =
          db
            .prepare(
              `
              SELECT id
              FROM roster
              WHERE player_id = ?
              `
            )
            .get(
              playerId
            ) as {
              id: number;
            };


        releaseDraftedPlayer(
          roster.id
        );


        const game =
          db
            .prepare(
              `
              SELECT
                status,

                current_player_id
                  AS currentPlayerId,

                countdown,

                last_winner_team_id
                  AS lastWinnerTeamId,

                last_winner_price
                  AS lastWinnerPrice,

                last_winner_player_id
                  AS lastWinnerPlayerId

              FROM game
              WHERE id = 1
              `
            )
            .get() as {
              status: string;
              currentPlayerId:
                number | null;
              countdown: number;
              lastWinnerTeamId:
                number | null;
              lastWinnerPrice:
                number | null;
              lastWinnerPlayerId:
                number | null;
            };


        expect(
          game
        ).toEqual({
          status:
            "SETUP",
          currentPlayerId:
            null,
          countdown:
            0,
          lastWinnerTeamId:
            null,
          lastWinnerPrice:
            null,
          lastWinnerPlayerId:
            null
        });
      }
    );


    it(
      "does not clear an unrelated result",
      () => {
        const teamId =
          createTestTeam(
            "Alpha",
            170
          );

        const releasedPlayerId =
          createTestPlayer({
            rank:
              1,
            name:
              "Released Player",
            drafted:
              1
          });

        const resultPlayerId =
          createTestPlayer({
            rank:
              2,
            name:
              "Result Player",
            drafted:
              1
          });


        insertRosterPlayer({
          teamId,
          playerId:
            releasedPlayerId,
          playerName:
            "Released Player",
          position:
            "RB1",
          price:
            30,
          slot:
            "RB1"
        });


        setGameState({
          status:
            "RESULT",
          currentPlayerId:
            resultPlayerId,
          lastWinnerTeamId:
            teamId,
          lastWinnerPrice:
            20,
          lastWinnerPlayerId:
            resultPlayerId
        });


        const roster =
          db
            .prepare(
              `
              SELECT id
              FROM roster
              WHERE player_id = ?
              `
            )
            .get(
              releasedPlayerId
            ) as {
              id: number;
            };


        releaseDraftedPlayer(
          roster.id
        );


        const game =
          db
            .prepare(
              `
              SELECT
                status,

                last_winner_player_id
                  AS lastWinnerPlayerId

              FROM game
              WHERE id = 1
              `
            )
            .get() as {
              status: string;
              lastWinnerPlayerId:
                number | null;
            };


        expect(
          game.status
        ).toBe(
          "RESULT"
        );

        expect(
          game.lastWinnerPlayerId
        ).toBe(
          resultPlayerId
        );
      }
    );
  }
);