import {
  describe,
  expect,
  it
} from "vitest";

import {
  getAvailableRosterSlot,
  getRosterSlotOrder,
  normalizePosition
} from "../../src/services/rosterSlotService";

import {
  createTestPlayer,
  createTestTeam,
  insertRosterPlayer
} from "../helpers/database";


describe(
  "rosterSlotService",
  () => {
    it.each([
      [
        "QB1",
        "QB"
      ],
      [
        "RB18",
        "RB"
      ],
      [
        "WR 12",
        "WR"
      ],
      [
        "TE3",
        "TE"
      ],
      [
        "K4",
        "K"
      ],
      [
        "DST 2",
        "DST"
      ],
      [
        "DEF3",
        "DST"
      ]
    ])(
      "normalizes %s to %s",
      (
        input,
        expected
      ) => {
        expect(
          normalizePosition(
            input
          )
        ).toBe(
          expected
        );
      }
    );


    it(
      "assigns quarterback to QB",
      () => {
        const teamId =
          createTestTeam();


        expect(
          getAvailableRosterSlot(
            teamId,
            "QB1"
          )
        ).toBe(
          "QB"
        );
      }
    );


    it(
      "assigns running backs to RB1, RB2, FLEX and then bench",
      () => {
        const teamId =
          createTestTeam();


        const firstPlayerId =
          createTestPlayer({
            name:
              "First RB"
          });

        insertRosterPlayer({
          teamId,
          playerId:
            firstPlayerId,
          playerName:
            "First RB",
          position:
            "RB1",
          price: 10,
          slot:
            "RB1"
        });


        expect(
          getAvailableRosterSlot(
            teamId,
            "RB2"
          )
        ).toBe(
          "RB2"
        );


        const secondPlayerId =
          createTestPlayer({
            rank: 2,
            name:
              "Second RB"
          });

        insertRosterPlayer({
          teamId,
          playerId:
            secondPlayerId,
          playerName:
            "Second RB",
          position:
            "RB2",
          price: 10,
          slot:
            "RB2"
        });


        expect(
          getAvailableRosterSlot(
            teamId,
            "RB3"
          )
        ).toBe(
          "FLEX"
        );


        const thirdPlayerId =
          createTestPlayer({
            rank: 3,
            name:
              "Third RB"
          });

        insertRosterPlayer({
          teamId,
          playerId:
            thirdPlayerId,
          playerName:
            "Third RB",
          position:
            "RB3",
          price: 10,
          slot:
            "FLEX"
        });


        expect(
          getAvailableRosterSlot(
            teamId,
            "RB4"
          )
        ).toBe(
          "BENCH1"
        );
      }
    );


    it(
      "does not assign QB, K or DST to FLEX",
      () => {
        const teamId =
          createTestTeam();


        const qbId =
          createTestPlayer({
            name:
              "First QB",
            position:
              "QB1"
          });

        insertRosterPlayer({
          teamId,
          playerId:
            qbId,
          playerName:
            "First QB",
          position:
            "QB1",
          price: 10,
          slot:
            "QB"
        });


        expect(
          getAvailableRosterSlot(
            teamId,
            "QB2"
          )
        ).toBe(
          "BENCH1"
        );
      }
    );


    it(
      "assigns TE to FLEX after TE is filled",
      () => {
        const teamId =
          createTestTeam();


        const playerId =
          createTestPlayer({
            name:
              "First TE",
            position:
              "TE1"
          });

        insertRosterPlayer({
          teamId,
          playerId,
          playerName:
            "First TE",
          position:
            "TE1",
          price: 10,
          slot:
            "TE"
        });


        expect(
          getAvailableRosterSlot(
            teamId,
            "TE2"
          )
        ).toBe(
          "FLEX"
        );
      }
    );


    it(
      "throws when every roster slot is occupied",
      () => {
        const teamId =
          createTestTeam();


        const slots = [
          "QB",
          "RB1",
          "RB2",
          "WR1",
          "WR2",
          "TE",
          "FLEX",
          "K",
          "DST",
          "BENCH1",
          "BENCH2",
          "BENCH3",
          "BENCH4",
          "BENCH5",
          "BENCH6"
        ];


        slots.forEach(
          (
            slot,
            index
          ) => {
            const playerId =
              createTestPlayer({
                rank:
                  index + 1,
                name:
                  `Player ${index + 1}`,
                position:
                  "RB"
              });


            insertRosterPlayer({
              teamId,
              playerId,
              playerName:
                `Player ${index + 1}`,
              position:
                "RB",
              price: 1,
              slot
            });
          }
        );


        expect(
          () =>
            getAvailableRosterSlot(
              teamId,
              "RB"
            )
        ).toThrow(
          "Winning team roster is full"
        );
      }
    );


    it(
      "returns fixed roster display order",
      () => {
        expect(
          getRosterSlotOrder(
            "QB"
          )
        ).toBeLessThan(
          getRosterSlotOrder(
            "RB1"
          )
        );

        expect(
          getRosterSlotOrder(
            "FLEX"
          )
        ).toBeLessThan(
          getRosterSlotOrder(
            "BENCH1"
          )
        );

        expect(
          getRosterSlotOrder(
            "BENCH6"
          )
        ).toBe(
          15
        );
      }
    );
  }
);