import {
  describe,
  expect,
  it
} from "vitest";

import {
  db
} from "../../src/database/connection";

import {
  getGameState,
  nominatePlayer,
  resetDraft
} from "../../src/services/gameService";

import {
  createTestPlayer,
  createTestTeam,
  insertRosterPlayer,
  setGameState
} from "../helpers/database";


describe(
  "gameService",
  () => {
    it(
      "returns the current game state with team and bid counts",
      () => {
        const playerId =
          createTestPlayer();

        const firstTeamId =
          createTestTeam(
            "Alpha"
          );

        createTestTeam(
          "Beta"
        );


        setGameState({
          status: "AUCTION",
          currentPlayerId:
            playerId,
          countdown: 20
        });


        db.prepare(
          `
          INSERT INTO auction_bids
          (
            team_id,
            player_id,
            amount
          )
          VALUES
          (
            ?,
            ?,
            20
          )
          `
        ).run(
          firstTeamId,
          playerId
        );


        const game =
          getGameState();


        expect(
          game.status
        ).toBe(
          "AUCTION"
        );

        expect(
          game.currentPlayer?.id
        ).toBe(
          playerId
        );

        expect(
          game.totalTeamCount
        ).toBe(
          2
        );

        expect(
          game.submittedBidCount
        ).toBe(
          1
        );
      }
    );


    it.each([
      0,
      -1,
      1.5,
      Number.NaN
    ])(
      "rejects invalid player ID %s",
      playerId => {
        expect(
          () =>
            nominatePlayer(
              playerId
            )
        ).toThrow(
          "Invalid player ID"
        );
      }
    );


    it(
      "rejects an unknown player",
      () => {
        expect(
          () =>
            nominatePlayer(
              999
            )
        ).toThrow(
          "Player not found"
        );
      }
    );


    it(
      "rejects a drafted player",
      () => {
        const playerId =
          createTestPlayer({
            drafted: 1
          });


        expect(
          () =>
            nominatePlayer(
              playerId
            )
        ).toThrow(
          "Player has already been drafted"
        );
      }
    );


    it(
      "starts an auction for an available player",
      () => {
        const playerId =
          createTestPlayer({
            name:
              "Jahmyr Gibbs",
            position:
              "RB1",
            auctionValue:
              57
          });


        const game =
          nominatePlayer(
            playerId
          );


        expect(
          game.status
        ).toBe(
          "AUCTION"
        );

        expect(
          game.currentPlayerId
        ).toBe(
          playerId
        );

        expect(
          game.countdown
        ).toBe(
          30
        );

        expect(
          game.currentPlayer
            ?.auction_value
        ).toBe(
          57
        );
      }
    );


    it(
      "resets bids, rosters, budgets, drafted players and game state",
      () => {
        const teamId =
          createTestTeam(
            "Alpha",
            130
          );

        const playerId =
          createTestPlayer({
            drafted: 1
          });


        insertRosterPlayer({
          teamId,
          playerId,
          playerName:
            "Test Player",
          position:
            "RB1",
          price: 70
        });


        db.prepare(
          `
          INSERT INTO auction_bids
          (
            team_id,
            player_id,
            amount
          )
          VALUES
          (
            ?,
            ?,
            70
          )
          `
        ).run(
          teamId,
          playerId
        );


        setGameState({
          status: "RESULT",
          currentPlayerId:
            playerId,
          lastWinnerTeamId:
            teamId,
          lastWinnerPrice:
            70,
          lastWinnerPlayerId:
            playerId
        });


        const game =
          resetDraft();


        const team =
          db.prepare(
            `
            SELECT budget
            FROM teams
            WHERE id = ?
            `
          ).get(
            teamId
          ) as {
            budget: number;
          };


        const player =
          db.prepare(
            `
            SELECT drafted
            FROM draft_players
            WHERE id = ?
            `
          ).get(
            playerId
          ) as {
            drafted: number;
          };


        const bidCount =
          db.prepare(
            `
            SELECT COUNT(*) AS count
            FROM auction_bids
            `
          ).get() as {
            count: number;
          };


        const rosterCount =
          db.prepare(
            `
            SELECT COUNT(*) AS count
            FROM roster
            `
          ).get() as {
            count: number;
          };


        expect(
          team.budget
        ).toBe(
          200
        );

        expect(
          player.drafted
        ).toBe(
          0
        );

        expect(
          bidCount.count
        ).toBe(
          0
        );

        expect(
          rosterCount.count
        ).toBe(
          0
        );

        expect(
          game.status
        ).toBe(
          "SETUP"
        );

        expect(
          game.currentPlayerId
        ).toBeNull();

        expect(
          game.lastWinnerTeamId
        ).toBeNull();
      }
    );
  }
);
