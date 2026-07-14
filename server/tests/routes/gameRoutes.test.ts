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
  }
);
