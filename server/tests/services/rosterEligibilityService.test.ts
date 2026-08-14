import {
  describe,
  expect,
  it
} from "vitest";

import {
  checkRosterEligibility
} from "../../src/services/rosterEligibilityService";

import {
  createTestPlayer,
  createTestTeam,
  insertRosterPlayer
} from "../helpers/database";


describe(
  "rosterEligibilityService",
  () => {
    it(
      "allows a human team to draft a second QB",
      () => {
        const teamId =
          createTestTeam();

        const firstQbId =
          createTestPlayer({
            name:
              "First QB",
            position:
              "QB"
          });

        insertRosterPlayer({
          teamId,
          playerId:
            firstQbId,
          playerName:
            "First QB",
          position:
            "QB",
          price: 10,
          slot:
            "QB"
        });

        const secondQbId =
          createTestPlayer({
            name:
              "Second QB",
            position:
              "QB"
          });

        const result =
          checkRosterEligibility(
            teamId,
            secondQbId,
            "HUMAN"
          );

        expect(
          result.eligible
        ).toBe(true);
      }
    );


    it(
      "allows an auto-draft team to draft a second QB",
      () => {
        const teamId =
          createTestTeam();

        for (
          let index = 0;
          index < 1;
          index += 1
        ) {
          const playerId =
            createTestPlayer({
              name:
                `QB ${index + 1}`,
              position:
                "QB"
            });

          insertRosterPlayer({
            teamId,
            playerId,
            playerName:
              `QB ${index + 1}`,
            position:
              "QB",
            price: 10,
            slot:
              "QB"
          });
        }

        const secondQbId =
          createTestPlayer({
            name:
              "Second QB",
            position:
              "QB"
          });

        const result =
          checkRosterEligibility(
            teamId,
            secondQbId,
            "AUTO_DRAFT"
          );

        expect(
          result.eligible
        ).toBe(true);
      }
    );


    it(
      "rejects a third QB for auto-draft",
      () => {
        const teamId =
          createTestTeam();

        [
          "QB 1",
          "QB 2"
        ].forEach(
          name => {
            const playerId =
              createTestPlayer({
                name,
                position:
                  "QB"
              });

            insertRosterPlayer({
              teamId,
              playerId,
              playerName:
                name,
              position:
                "QB",
              price: 10,
              slot:
                name === "QB 1"
                  ? "QB"
                  : "BENCH1"
            });
          }
        );

        const thirdQbId =
          createTestPlayer({
            name:
              "QB 3",
            position:
              "QB"
          });

        const result =
          checkRosterEligibility(
            teamId,
            thirdQbId,
            "AUTO_DRAFT"
          );

        expect(
          result.eligible
        ).toBe(false);

        expect(
          result.reason
        ).toContain(
          "position limit"
        );
      }
    );


    it(
      "allows a human team to draft another kicker",
      () => {
        const teamId =
          createTestTeam();

        const firstKickerId =
          createTestPlayer({
            name:
              "First K",
            position:
              "K"
          });

        insertRosterPlayer({
          teamId,
          playerId:
            firstKickerId,
          playerName:
            "First K",
          position:
            "K",
          price: 5,
          slot:
            "K"
        });

        const secondKickerId =
          createTestPlayer({
            name:
              "Second K",
            position:
              "K"
          });

        const result =
          checkRosterEligibility(
            teamId,
            secondKickerId,
            "HUMAN"
          );

        expect(
          result.eligible
        ).toBe(true);
      }
    );


    it(
      "rejects a second kicker for auto-draft",
      () => {
        const teamId =
          createTestTeam();

        const firstKickerId =
          createTestPlayer({
            name:
              "First K",
            position:
              "K"
          });

        insertRosterPlayer({
          teamId,
          playerId:
            firstKickerId,
          playerName:
            "First K",
          position:
            "K",
          price: 5,
          slot:
            "K"
        });

        const secondKickerId =
          createTestPlayer({
            name:
              "Second K",
            position:
              "K"
          });

        const result =
          checkRosterEligibility(
            teamId,
            secondKickerId,
            "AUTO_DRAFT"
          );

        expect(
          result.eligible
        ).toBe(false);

        expect(
          result.reason
        ).toContain(
          "position limit"
        );
      }
    );
        it(
      "rejects a third TE for auto-draft",
      () => {
        const teamId =
          createTestTeam();

        [
          "TE 1",
          "TE 2"
        ].forEach(
          (
            name,
            index
          ) => {
            const playerId =
              createTestPlayer({
                name,
                position:
                  "TE"
              });

            insertRosterPlayer({
              teamId,
              playerId,
              playerName:
                name,
              position:
                "TE",
              price: 10,
              slot:
                index === 0
                  ? "TE"
                  : "BENCH1"
            });
          }
        );

        const thirdTeId =
          createTestPlayer({
            name:
              "TE 3",
            position:
              "TE"
          });

        const result =
          checkRosterEligibility(
            teamId,
            thirdTeId,
            "AUTO_DRAFT"
          );

        expect(
          result.eligible
        ).toBe(false);

        expect(
          result.reason
        ).toContain(
          "position limit"
        );
      }
    );


    it(
      "rejects a third DST for auto-draft",
      () => {
        const teamId =
          createTestTeam();

        [
          "DST 1",
          "DST 2"
        ].forEach(
          (
            name,
            index
          ) => {
            const playerId =
              createTestPlayer({
                name,
                position:
                  "DST"
              });

            insertRosterPlayer({
              teamId,
              playerId,
              playerName:
                name,
              position:
                "DST",
              price: 5,
              slot:
                index === 0
                  ? "DST"
                  : "BENCH1"
            });
          }
        );

        const thirdDstId =
          createTestPlayer({
            name:
              "DST 3",
            position:
              "DST"
          });

        const result =
          checkRosterEligibility(
            teamId,
            thirdDstId,
            "AUTO_DRAFT"
          );

        expect(
          result.eligible
        ).toBe(false);

        expect(
          result.reason
        ).toContain(
          "position limit"
        );
      }
    );


    it(
      "allows auto-draft to fill a missing K when the bench is full",
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
            const position =
              slot === "QB"
                ? "QB"
                : slot.startsWith("RB")
                  ? "RB"
                  : slot.startsWith("WR")
                    ? "WR"
                    : slot === "TE"
                      ? "TE"
                      : slot === "DST"
                        ? "DST"
                        : "WR";

            const playerId =
              createTestPlayer({
                name:
                  `Player ${index + 1}`,
                position
              });

            insertRosterPlayer({
              teamId,
              playerId,
              playerName:
                `Player ${index + 1}`,
              position,
              price: 5,
              slot
            });
          }
        );

        const kickerId =
          createTestPlayer({
            name:
              "Final K",
            position:
              "K"
          });

        const result =
          checkRosterEligibility(
            teamId,
            kickerId,
            "AUTO_DRAFT"
          );

        expect(
          result.eligible
        ).toBe(true);
      }
    );


    it(
      "allows auto-draft to fill a missing DST when the bench is full",
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
            const position =
              slot === "QB"
                ? "QB"
                : slot.startsWith("RB")
                  ? "RB"
                  : slot.startsWith("WR")
                    ? "WR"
                    : slot === "TE"
                      ? "TE"
                      : slot === "K"
                        ? "K"
                        : "WR";

            const playerId =
              createTestPlayer({
                name:
                  `Player ${index + 1}`,
                position
              });

            insertRosterPlayer({
              teamId,
              playerId,
              playerName:
                `Player ${index + 1}`,
              position,
              price: 5,
              slot
            });
          }
        );

        const dstId =
          createTestPlayer({
            name:
              "Final DST",
            position:
              "DST"
          });

        const result =
          checkRosterEligibility(
            teamId,
            dstId,
            "AUTO_DRAFT"
          );

        expect(
          result.eligible
        ).toBe(true);
      }
    );


    it(
      "rejects a WR for auto-draft when the bench is full and only K is missing",
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
            const position =
              slot === "QB"
                ? "QB"
                : slot.startsWith("RB")
                  ? "RB"
                  : slot.startsWith("WR")
                    ? "WR"
                    : slot === "TE"
                      ? "TE"
                      : slot === "DST"
                        ? "DST"
                        : "WR";

            const playerId =
              createTestPlayer({
                name:
                  `Player ${index + 1}`,
                position
              });

            insertRosterPlayer({
              teamId,
              playerId,
              playerName:
                `Player ${index + 1}`,
              position,
              price: 5,
              slot
            });
          }
        );

        const wrId =
          createTestPlayer({
            name:
              "Extra WR",
            position:
              "WR"
          });

        const result =
          checkRosterEligibility(
            teamId,
            wrId,
            "AUTO_DRAFT"
          );

        expect(
          result.eligible
        ).toBe(false);

        expect(
          result.reason
        ).toContain(
          "Bench is full"
        );
      }
    );


    it(
      "does not apply the bench-full restriction to human teams",
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
            const position =
              slot === "QB"
                ? "QB"
                : slot.startsWith("RB")
                  ? "RB"
                  : slot.startsWith("WR")
                    ? "WR"
                    : slot === "TE"
                      ? "TE"
                      : slot === "DST"
                        ? "DST"
                        : "WR";

            const playerId =
              createTestPlayer({
                name:
                  `Player ${index + 1}`,
                position
              });

            insertRosterPlayer({
              teamId,
              playerId,
              playerName:
                `Player ${index + 1}`,
              position,
              price: 5,
              slot
            });
          }
        );

        const wrId =
          createTestPlayer({
            name:
              "Extra WR",
            position:
              "WR"
          });

        const result =
          checkRosterEligibility(
            teamId,
            wrId,
            "HUMAN"
          );

        expect(
            result.eligible
            ).toBe(false);

            expect(
            result.reason
            ).toContain(
            "impossible to complete"
            );
      }
    );
        it(
      "rejects an extra player when the remaining roster cannot fill the missing starters",
      () => {
        const teamId =
          createTestTeam();

        const roster = [
          ["QB", "QB"],
          ["RB1", "RB"],
          ["RB2", "RB"],
          ["WR1", "WR"],
          ["WR2", "WR"],
          ["TE", "TE"],
          ["FLEX", "RB"],
          ["K", "K"],
          ["BENCH1", "QB"],
          ["BENCH2", "QB"],
          ["BENCH3", "QB"],
          ["BENCH4", "QB"],
          ["BENCH5", "QB"],
          ["BENCH6", "QB"]
        ];

        roster.forEach(
          (
            [slot, position],
            index
          ) => {
            const playerId =
              createTestPlayer({
                name:
                  `Player ${index + 1}`,
                position
              });

            insertRosterPlayer({
              teamId,
              playerId,
              playerName:
                `Player ${index + 1}`,
              position,
              price: 5,
              slot
            });
          }
        );

        /*
         * The roster has 14 players and is missing DST.
         * There is only one slot left, so a WR cannot be
         * added because that would leave no way to add DST.
         */
        const wrId =
          createTestPlayer({
            name:
              "Extra WR",
            position:
              "WR"
          });

        const result =
          checkRosterEligibility(
            teamId,
            wrId,
            "HUMAN"
          );

        expect(
          result.eligible
        ).toBe(false);

        expect(
          result.reason
        ).toContain(
          "impossible to complete"
        );
      }
    );


    it(
      "allows the final DST when DST is the only missing starter",
      () => {
        const teamId =
          createTestTeam();

        const roster = [
          ["QB", "QB"],
          ["RB1", "RB"],
          ["RB2", "RB"],
          ["WR1", "WR"],
          ["WR2", "WR"],
          ["TE", "TE"],
          ["FLEX", "RB"],
          ["K", "K"],
          ["BENCH1", "QB"],
          ["BENCH2", "QB"],
          ["BENCH3", "QB"],
          ["BENCH4", "QB"],
          ["BENCH5", "QB"],
          ["BENCH6", "QB"]
        ];

        roster.forEach(
          (
            [slot, position],
            index
          ) => {
            const playerId =
              createTestPlayer({
                name:
                  `Player ${index + 1}`,
                position
              });

            insertRosterPlayer({
              teamId,
              playerId,
              playerName:
                `Player ${index + 1}`,
                position,
                price: 5,
                slot
            });
          }
        );

        const dstId =
          createTestPlayer({
            name:
              "Final DST",
            position:
              "DST"
          });

        const result =
          checkRosterEligibility(
            teamId,
            dstId,
            "HUMAN"
          );

        expect(
          result.eligible
        ).toBe(true);
      }
    );
  }

);