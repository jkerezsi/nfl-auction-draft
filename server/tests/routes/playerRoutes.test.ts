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
  "player routes",
  () => {
    it(
      "returns players ordered by rank with auction data",
      async () => {
        createTestPlayer({
          rank:
            2,
          name:
            "Second Player",
          position:
            "RB2",
          auctionValue:
            40
        });

        createTestPlayer({
          rank:
            1,
          name:
            "First Player",
          position:
            "RB1",
          auctionValue:
            55
        });


        const response =
          await request(
            app
          )
            .get(
              "/api/players"
            );


        expect(
          response.status
        ).toBe(
          200
        );

        expect(
          response.body.map(
            (
              player: {
                name: string;
              }
            ) =>
              player.name
          )
        ).toEqual([
          "First Player",
          "Second Player"
        ]);

        expect(
          response.body[0]
            .auction_value
        ).toBe(
          55
        );
      }
    );
  }
);
