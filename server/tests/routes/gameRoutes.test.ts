import request from "supertest";

import {
  describe,
  expect,
  it,
  vi
} from "vitest";

import app from "../../src/app";

import {
  startAuctionTimer,
  stopAuctionTimer
} from "../../src/services/auctionTimerService";

import {
  createTestPlayer,
  createTestTeam,
  insertRosterPlayer,
  setGameState
} from "../helpers/database";

import {
  getAdminAuthorizationHeader
} from "../helpers/adminAuth";


describe(
  "game routes",
  () => {
    it(
      "returns the game state",
      async () => {
        createTestTeam(
          "Alpha"
        );


        const response =
          await request(
            app
          )
            .get(
              "/api/game"
            );


        expect(
          response.status
        ).toBe(
          200
        );

        expect(
          response.body
        ).toMatchObject({
          id:
            1,
          status:
            "SETUP",
          totalTeamCount:
            1,
          submittedBidCount:
            0
        });
      }
    );


    it(
      "nominates a player and starts the timer",
      async () => {
        const authorization =
          await getAdminAuthorizationHeader();

        const playerId =
          createTestPlayer({
            name:
              "Jahmyr Gibbs"
          });


        const response =
          await request(
            app
          )
            .post(
              `/api/game/nominate/${playerId}`
            )
            .set(
              "Authorization",
              authorization
            );


        expect(
          response.status
        ).toBe(
          200
        );

        expect(
          response.body
        ).toMatchObject({
          status:
            "AUCTION",
          currentPlayerId:
            playerId,
          countdown:
            30
        });

        expect(
          vi.mocked(
            startAuctionTimer
          )
        ).toHaveBeenCalledWith(
          playerId,
          30
        );
      }
    );


    it(
      "rejects nomination of a drafted player",
      async () => {
        const authorization =
          await getAdminAuthorizationHeader();

        const playerId =
          createTestPlayer({
            drafted:
              1
          });


        const response =
          await request(
            app
          )
            .post(
              `/api/game/nominate/${playerId}`
            )
            .set(
              "Authorization",
              authorization
            );


        expect(
          response.status
        ).toBe(
          400
        );

        expect(
          response.body.error
        ).toBe(
          "Player has already been drafted"
        );
      }
    );


    it(
      "resets the complete draft",
      async () => {
        const authorization =
          await getAdminAuthorizationHeader();

        const teamId =
          createTestTeam(
            "Alpha",
            150
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
            "RB1",
          price:
            50
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


        const response =
          await request(
            app
          )
            .post(
              "/api/game/reset"
            )
            .set(
              "Authorization",
              authorization
            );


        expect(
          response.status
        ).toBe(
          200
        );

        expect(
          response.body
        ).toMatchObject({
          status:
            "SETUP",
          currentPlayerId:
            null,
          lastWinnerTeamId:
            null
        });

        expect(
          vi.mocked(
            stopAuctionTimer
          )
        ).toHaveBeenCalled();
      }
    );


    it(
      "requires admin authentication for nomination",
      async () => {
        const playerId =
          createTestPlayer();


        const response =
          await request(
            app
          )
            .post(
              `/api/game/nominate/${playerId}`
            );


        expect(
          response.status
        ).toBe(
          401
        );

        expect(
          response.body.error
        ).toBe(
          "Admin authentication required"
        );
      }
    );
  }
);