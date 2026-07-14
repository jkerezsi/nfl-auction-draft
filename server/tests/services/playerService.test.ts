import {
  describe,
  expect,
  it
} from "vitest";

import {
  playerService
} from "../../src/services/playerService";

import {
  createTestPlayer
} from "../helpers/database";


describe(
  "playerService",
  () => {
    it(
      "returns players ordered by overall rank with auction values",
      () => {
        createTestPlayer({
          rank: 2,
          name:
            "Second Player",
          position:
            "RB2",
          auctionValue: 40
        });

        createTestPlayer({
          rank: 1,
          name:
            "First Player",
          position:
            "RB1",
          auctionValue: 55
        });


        const players =
          playerService
            .getAllPlayers();


        expect(
          players.map(
            player =>
              player.name
          )
        ).toEqual([
          "First Player",
          "Second Player"
        ]);

        expect(
          players[0]
            .auction_value
        ).toBe(
          55
        );
      }
    );
  }
);
