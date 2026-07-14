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


describe(
  "complete auction API flow",
  () => {
    it(
      "creates teams, nominates, bids, resolves and exposes the winner roster",
      async () => {
        const firstTeamResponse =
          await request(
            app
          )
            .post(
              "/api/team"
            )
            .send({
              name:
                "Alpha"
            });

        const secondTeamResponse =
          await request(
            app
          )
            .post(
              "/api/team"
            )
            .send({
              name:
                "Beta"
            });


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
            51
        });


        const playersResponse =
          await request(
            app
          )
            .get(
              "/api/players"
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
