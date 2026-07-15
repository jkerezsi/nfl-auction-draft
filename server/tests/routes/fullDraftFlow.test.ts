import request from "supertest";

import {
  describe,
  expect,
  it
} from "vitest";

import app from "../../src/app";

import {
  createTestPlayer
} from "../helpers/database";

import {
  getAdminAuthorizationHeader
} from "../helpers/adminAuth";


describe(
  "complete auction API flow",
  () => {
    it(
      "creates teams, nominates, bids, resolves and exposes the winner roster",
      async () => {
        const authorization =
          await getAdminAuthorizationHeader();


        const firstTeamResponse =
          await request(
            app
          )
            .post(
              "/api/team"
            )
            .set(
              "Authorization",
              authorization
            )
            .send({
              name:
                "Alpha"
            });


        expect(
          firstTeamResponse.status
        ).toBe(
          201
        );


        const secondTeamResponse =
          await request(
            app
          )
            .post(
              "/api/team"
            )
            .set(
              "Authorization",
              authorization
            )
            .send({
              name:
                "Beta"
            });


        expect(
          secondTeamResponse.status
        ).toBe(
          201
        );


        const firstTeamId =
          firstTeamResponse.body.id;

        const secondTeamId =
          secondTeamResponse.body.id;


        const playerId =
          createTestPlayer({
            rank:
              1,

            name:
              "Jahmyr Gibbs",

            position:
              "RB1",

            nflTeam:
              "DET",

            byeWeek:
              6,

            auctionValue:
              57
          });


        const nominateResponse =
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
          nominateResponse.status
        ).toBe(
          200
        );

        expect(
          nominateResponse.body
            .status
        ).toBe(
          "AUCTION"
        );


        const firstBidResponse =
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
                45
            });


        expect(
          firstBidResponse.status
        ).toBe(
          200
        );

        expect(
          firstBidResponse.body
            .auctionFinished
        ).toBe(
          false
        );


        const secondBidResponse =
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
                51
            });


        expect(
          secondBidResponse.status
        ).toBe(
          200
        );

        expect(
          secondBidResponse.body
            .auctionFinished
        ).toBe(
          true
        );

        expect(
          secondBidResponse.body
            .auctionResult
            .winnerTeamId
        ).toBe(
          secondTeamId
        );


        const teamsResponse =
          await request(
            app
          )
            .get(
              "/api/team"
            );


        expect(
          teamsResponse.status
        ).toBe(
          200
        );


        const winningTeam =
          teamsResponse.body.find(
            (
              team: {
                id: number;
              }
            ) =>
              team.id ===
              secondTeamId
          );


        expect(
          winningTeam
        ).toBeDefined();

        expect(
          winningTeam.budget
        ).toBe(
          149
        );


        const rosterResponse =
          await request(
            app
          )
            .get(
              `/api/roster/${secondTeamId}`
            );


        expect(
          rosterResponse.status
        ).toBe(
          200
        );

        expect(
          rosterResponse.body
        ).toMatchObject({
          teamId:
            secondTeamId,

          spent:
            51,

          playerCount:
            1
        });

        expect(
          rosterResponse.body
            .players[0]
        ).toMatchObject({
          playerId,

          playerName:
            "Jahmyr Gibbs",

          position:
            "RB1",

          auctionValue:
            57,

          price:
            51,

          slot:
            "RB1"
        });


        const playersResponse =
          await request(
            app
          )
            .get(
              "/api/players"
            );


        expect(
          playersResponse.status
        ).toBe(
          200
        );


        const draftedPlayer =
          playersResponse.body.find(
            (
              player: {
                id: number;
              }
            ) =>
              player.id ===
              playerId
          );


        expect(
          draftedPlayer
        ).toBeDefined();

        expect(
          draftedPlayer.drafted
        ).toBe(
          1
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
            "RESULT",

          lastWinnerTeamId:
            secondTeamId,

          lastWinnerPrice:
            51,

          lastWinnerPlayerId:
            playerId
        });
      }
    );
  }
);