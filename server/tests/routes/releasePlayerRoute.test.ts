import request from "supertest";

import {
  describe,
  expect,
  it
} from "vitest";

import app from "../../src/app";

import {
  db
} from "../../src/database/connection";

import {
  createTestPlayer,
  createTestTeam,
  insertRosterPlayer,
  setGameState
} from "../helpers/database";


describe(
  "release player route",
  () => {
    it(
      "releases a drafted player",
      async () => {
        const teamId =
          createTestTeam(
            "Alpha",
            150
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
            50,
          slot:
            "RB1"
        });


        const rosterEntry =
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


        const response =
          await request(
            app
          )
            .delete(
              `/api/roster/player/${rosterEntry.id}`
            );


        expect(
          response.status
        ).toBe(
          200
        );

        expect(
          response.body
        ).toEqual({
          success:
            true,

          releasedPlayer: {
            rosterId:
              rosterEntry.id,

            teamId,

            teamName:
              "Alpha",

            playerId,

            playerName:
              "Jahmyr Gibbs",

            refundedAmount:
              50,

            slot:
              "RB1"
          }
        });


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
              rosterEntry.id
            ) as {
              count: number;
            };


        expect(
          team.budget
        ).toBe(
          200
        );

        expect(
          player.drafted
        ).toBe(
          0
        );

        expect(
          rosterCount.count
        ).toBe(
          0
        );
      }
    );


    it.each([
      "0",
      "-1",
      "1.5",
      "invalid"
    ])(
      "rejects invalid roster ID %s",
      async rosterId => {
        const response =
          await request(
            app
          )
            .delete(
              `/api/roster/player/${rosterId}`
            );


        expect(
          response.status
        ).toBe(
          400
        );

        expect(
          response.body.error
        ).toBe(
          "Invalid roster ID"
        );
      }
    );


    it(
      "rejects an unknown roster entry",
      async () => {
        const response =
          await request(
            app
          )
            .delete(
              "/api/roster/player/999"
            );


        expect(
          response.status
        ).toBe(
          400
        );

        expect(
          response.body.error
        ).toBe(
          "Roster player not found"
        );
      }
    );


    it(
      "rejects release during an active auction",
      async () => {
        const teamId =
          createTestTeam(
            "Alpha",
            160
          );

        const draftedPlayerId =
          createTestPlayer({
            rank:
              1,
            name:
              "Drafted Player",
            position:
              "WR1",
            drafted:
              1
          });

        const auctionPlayerId =
          createTestPlayer({
            rank:
              2,
            name:
              "Auction Player",
            position:
              "RB1"
          });


        insertRosterPlayer({
          teamId,
          playerId:
            draftedPlayerId,
          playerName:
            "Drafted Player",
          position:
            "WR1",
          price:
            40,
          slot:
            "WR1"
        });


        const rosterEntry =
          db
            .prepare(
              `
              SELECT id
              FROM roster
              WHERE player_id = ?
              `
            )
            .get(
              draftedPlayerId
            ) as {
              id: number;
            };


        setGameState({
          status:
            "AUCTION",

          currentPlayerId:
            auctionPlayerId,

          countdown:
            20
        });


        const response =
          await request(
            app
          )
            .delete(
              `/api/roster/player/${rosterEntry.id}`
            );


        expect(
          response.status
        ).toBe(
          400
        );

        expect(
          response.body.error
        ).toBe(
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
              rosterEntry.id
            ) as {
              count: number;
            };


        expect(
          team.budget
        ).toBe(
          160
        );

        expect(
          rosterCount.count
        ).toBe(
          1
        );
      }
    );


    it(
      "clears the latest result when releasing its winning player",
      async () => {
        const teamId =
          createTestTeam(
            "Alpha",
            170
          );

        const playerId =
          createTestPlayer({
            name:
              "Winning Player",
            position:
              "TE1",
            drafted:
              1
          });


        insertRosterPlayer({
          teamId,
          playerId,
          playerName:
            "Winning Player",
          position:
            "TE1",
          price:
            30,
          slot:
            "TE"
        });


        const rosterEntry =
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


        setGameState({
          status:
            "RESULT",

          currentPlayerId:
            playerId,

          countdown:
            0,

          lastWinnerTeamId:
            teamId,

          lastWinnerPrice:
            30,

          lastWinnerPlayerId:
            playerId
        });


        const response =
          await request(
            app
          )
            .delete(
              `/api/roster/player/${rosterEntry.id}`
            );


        expect(
          response.status
        ).toBe(
          200
        );


        const gameResponse =
          await request(
            app
          )
            .get(
              "/api/game"
            );


        expect(
          gameResponse.status
        ).toBe(
          200
        );

        expect(
          gameResponse.body
        ).toMatchObject({
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
  }
);