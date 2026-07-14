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
  insertRosterPlayer
} from "../helpers/database";


describe(
  "roster routes",
  () => {
    it(
      "returns a complete team roster",
      async () => {
        const teamId =
          createTestTeam(
            "Alpha",
            145
          );

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
              57,
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
            55
        });


        const response =
          await request(
            app
          )
            .get(
              `/api/roster/${teamId}`
            );


        expect(
          response.status
        ).toBe(
          200
        );

        expect(
          response.body
        ).toMatchObject({
          teamId,
          teamName:
            "Alpha",
          budget:
            145,
          spent:
            55,
          playerCount:
            1
        });

        expect(
          response.body.players[0]
        ).toMatchObject({
          playerId,
          playerName:
            "Jahmyr Gibbs",
          position:
            "RB1",
          nflTeam:
            "DET",
          byeWeek:
            6,
          rank:
            1,
          auctionValue:
            57,
          price:
            55
        });
      }
    );


    it(
      "returns an error for an unknown team",
      async () => {
        const response =
          await request(
            app
          )
            .get(
              "/api/roster/999"
            );


        expect(
          response.status
        ).toBe(
          400
        );

        expect(
          response.body.error
        ).toBe(
          "Team not found"
        );
      }
    );
  }
);
