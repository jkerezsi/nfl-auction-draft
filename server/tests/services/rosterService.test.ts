import {
  describe,
  expect,
  it
} from "vitest";

import {
  getTeamRoster
} from "../../src/services/rosterService";

import {
  createTestPlayer,
  createTestTeam,
  insertRosterPlayer
} from "../helpers/database";


describe(
  "rosterService",
  () => {
    it.each([
      0,
      -1,
      1.5
    ])(
      "rejects invalid team ID %s",
      teamId => {
        expect(
          () =>
            getTeamRoster(
              teamId
            )
        ).toThrow(
          "Invalid team ID"
        );
      }
    );


    it(
      "rejects an unknown team",
      () => {
        expect(
          () =>
            getTeamRoster(
              999
            )
        ).toThrow(
          "Team not found"
        );
      }
    );


    it(
      "returns an empty roster",
      () => {
        const teamId =
          createTestTeam(
            "Alpha",
            200
          );


        const roster =
          getTeamRoster(
            teamId
          );


        expect(
          roster
        ).toMatchObject({
          teamId,
          teamName:
            "Alpha",
          budget: 200,
          spent: 0,
          playerCount: 0,
          players: []
        });
      }
    );


    it(
      "returns player metadata and calculates spending",
      () => {
        const teamId =
          createTestTeam(
            "Alpha",
            145
          );

        const playerId =
          createTestPlayer({
            rank: 1,
            name:
              "Jahmyr Gibbs",
            position:
              "RB1",
            nflTeam:
              "DET",
            byeWeek: 6,
            auctionValue: 57,
            drafted: 1
          });


        insertRosterPlayer({
          teamId,
          playerId,
          playerName:
            "Jahmyr Gibbs",
          position:
            "RB1",
          price: 55
        });


        const roster =
          getTeamRoster(
            teamId
          );


        expect(
          roster.spent
        ).toBe(
          55
        );

        expect(
          roster.playerCount
        ).toBe(
          1
        );

        expect(
          roster.players[0]
        ).toMatchObject({
          playerId,
          playerName:
            "Jahmyr Gibbs",
          position:
            "RB1",
          nflTeam:
            "DET",
          byeWeek: 6,
          rank: 1,
          auctionValue: 57,
          price: 55
        });
      }
    );


  it(
  "orders players by fixed roster slot",
  () => {
    const teamId =
      createTestTeam(
        "Alpha"
      );


    const wrId =
      createTestPlayer({
        rank: 3,
        name:
          "Wide Receiver",
        position:
          "WR1"
      });

    const qbId =
      createTestPlayer({
        rank: 2,
        name:
          "Quarterback",
        position:
          "QB1"
      });

    const rbId =
      createTestPlayer({
        rank: 1,
        name:
          "Running Back",
        position:
          "RB1"
      });


    insertRosterPlayer({
      teamId,
      playerId:
        wrId,
      playerName:
        "Wide Receiver",
      position:
        "WR1",
      price: 10,
      slot:
        "WR1"
    });

    insertRosterPlayer({
      teamId,
      playerId:
        qbId,
      playerName:
        "Quarterback",
      position:
        "QB1",
      price: 10,
      slot:
        "QB"
    });

    insertRosterPlayer({
      teamId,
      playerId:
        rbId,
      playerName:
        "Running Back",
      position:
        "RB1",
      price: 10,
      slot:
        "RB1"
    });


    const roster =
      getTeamRoster(
        teamId
      );


    expect(
      roster.players.map(
        player =>
          player.slot
      )
    ).toEqual([
      "QB",
      "RB1",
      "WR1"
    ]);


    expect(
      roster.players.map(
        player =>
          player.position
      )
    ).toEqual([
      "QB1",
      "RB1",
      "WR1"
    ]);
  }
);
  }
);
