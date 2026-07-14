import request from "supertest";

import {
  describe,
  expect,
  it
} from "vitest";

import app from "../../src/app";

import {
  createTestPlayer,
  createTestTeam,
  setGameState
} from "../helpers/database";


describe(
  "bid routes",
  () => {
    it(
      "accepts a valid hidden bid",
      async () => {
        const firstTeamId =
          createTestTeam(
            "Alpha"
          );

        createTestTeam(
          "Beta"
        );

        const playerId =
          createTestPlayer();


        setGameState({
          status:
            "AUCTION",
          currentPlayerId:
            playerId,
          countdown:
            30
        });


        const response =
          await request(
            app
          )
            .post(
              "/api/bid"
            )
            .send({
              teamId:
                firstTeamId,
              playerId,
              amount:
                30
            });


        expect(
          response.status
        ).toBe(
          200
        );

        expect(
          response.body
        ).toMatchObject({
          message:
            "Bid submitted",
          auctionFinished:
            false
        });


        const hiddenResponse =
          await request(
            app
          )
            .get(
              `/api/bid/current/${playerId}`
            );


        expect(
          hiddenResponse.status
        ).toBe(
          403
        );

        expect(
          hiddenResponse.body.error
        ).toBe(
          "Bids remain hidden until the auction finishes"
        );
      }
    );


    it(
      "automatically resolves when every team submits",
      async () => {
        const firstTeamId =
          createTestTeam(
            "Alpha"
          );

        const secondTeamId =
          createTestTeam(
            "Beta"
          );

        const playerId =
          createTestPlayer({
            name:
              "Jahmyr Gibbs",
            position:
              "RB1"
          });


        setGameState({
          status:
            "AUCTION",
          currentPlayerId:
            playerId,
          countdown:
            30
        });


        const firstResponse =
          await request(
            app
          )
            .post(
              "/api/bid"
            )
            .send({
              teamId:
                firstTeamId,
              playerId,
              amount:
                40
            });


        expect(
          firstResponse.body
            .auctionFinished
        ).toBe(
          false
        );


        const secondResponse =
          await request(
            app
          )
            .post(
              "/api/bid"
            )
            .send({
              teamId:
                secondTeamId,
              playerId,
              amount:
                55
            });


        expect(
          secondResponse.status
        ).toBe(
          200
        );

        expect(
          secondResponse.body
        ).toMatchObject({
          auctionFinished:
            true,
          auctionResult: {
            winnerTeamId:
              secondTeamId,
            playerId,
            price:
              55
          },
          game: {
            status:
              "RESULT",
            lastWinnerTeamId:
              secondTeamId,
            lastWinnerPrice:
              55,
            lastWinnerPlayerId:
              playerId
          }
        });


        const visibleResponse =
          await request(
            app
          )
            .get(
              `/api/bid/current/${playerId}`
            );


        expect(
          visibleResponse.status
        ).toBe(
          200
        );

        expect(
          visibleResponse.body.map(
            (
              bid: {
                amount: number;
              }
            ) =>
              bid.amount
          )
        ).toEqual([
          55,
          40
        ]);
      }
    );


    it(
      "rejects a duplicate bid",
      async () => {
        const teamId =
          createTestTeam(
            "Alpha"
          );

        createTestTeam(
          "Beta"
        );

        const playerId =
          createTestPlayer();


        setGameState({
          status:
            "AUCTION",
          currentPlayerId:
            playerId
        });


        await request(
          app
        )
          .post(
            "/api/bid"
          )
          .send({
            teamId,
            playerId,
            amount:
              25
          });


        const response =
          await request(
            app
          )
            .post(
              "/api/bid"
            )
            .send({
              teamId,
              playerId,
              amount:
                30
            });


        expect(
          response.status
        ).toBe(
          400
        );

        expect(
          response.body.error
        ).toBe(
          "Bid already submitted"
        );
      }
    );


    it(
      "rejects a bid above budget",
      async () => {
        const teamId =
          createTestTeam(
            "Alpha",
            20
          );

        const playerId =
          createTestPlayer();


        setGameState({
          status:
            "AUCTION",
          currentPlayerId:
            playerId
        });


        const response =
          await request(
            app
          )
            .post(
              "/api/bid"
            )
            .send({
              teamId,
              playerId,
              amount:
                21
            });


        expect(
          response.status
        ).toBe(
          400
        );

        expect(
          response.body.error
        ).toBe(
          "Bid exceeds budget"
        );
      }
    );
  }
);
