import {
  describe,
  expect,
  it
} from "vitest";

import {
  db
} from "../../src/database/connection";

import {
  getCurrentAuctionBids,
  resolveAuction,
  submitBid
} from "../../src/services/bidService";

import {
  createTestPlayer,
  createTestTeam,
  setGameState
} from "../helpers/database";


describe(
  "bidService",
  () => {
    it.each([
      {
        teamId: 0,
        playerId: 1,
        amount: 10,
        message:
          "Invalid team ID"
      },
      {
        teamId: 1,
        playerId: 0,
        amount: 10,
        message:
          "Invalid player ID"
      },
      {
        teamId: 1,
        playerId: 1,
        amount: 0,
        message:
          "Invalid bid amount"
      },
      {
        teamId: 1,
        playerId: 1,
        amount: 1.5,
        message:
          "Invalid bid amount"
      }
    ])(
      "validates bid input",
      ({
        teamId,
        playerId,
        amount,
        message
      }) => {
        expect(
          () =>
            submitBid(
              teamId,
              playerId,
              amount
            )
        ).toThrow(
          message
        );
      }
    );


    it(
      "rejects bidding without an active auction",
      () => {
        const teamId =
          createTestTeam();

        const playerId =
          createTestPlayer();


        expect(
          () =>
            submitBid(
              teamId,
              playerId,
              10
            )
        ).toThrow(
          "There is no active auction"
        );
      }
    );


    it(
      "rejects a bid for a different player",
      () => {
        const teamId =
          createTestTeam();

        const currentPlayerId =
          createTestPlayer({
            name:
              "Current Player"
          });

        const otherPlayerId =
          createTestPlayer({
            name:
              "Other Player",
            rank: 2
          });


        setGameState({
          status: "AUCTION",
          currentPlayerId
        });


        expect(
          () =>
            submitBid(
              teamId,
              otherPlayerId,
              10
            )
        ).toThrow(
          "This player is not currently available for bidding"
        );
      }
    );


    it(
      "rejects a bid above the team budget",
      () => {
        const teamId =
          createTestTeam(
            "Alpha",
            20
          );

        const playerId =
          createTestPlayer();


        setGameState({
          status: "AUCTION",
          currentPlayerId:
            playerId
        });


        expect(
          () =>
            submitBid(
              teamId,
              playerId,
              21
            )
        ).toThrow(
          "Bid exceeds budget"
        );
      }
    );


    it(
      "stores one hidden bid per team and player",
      () => {
        const teamId =
          createTestTeam();

        const playerId =
          createTestPlayer();


        setGameState({
          status: "AUCTION",
          currentPlayerId:
            playerId
        });


        const result =
          submitBid(
            teamId,
            playerId,
            25
          );


        expect(
          result.message
        ).toBe(
          "Bid submitted"
        );


        expect(
          getCurrentAuctionBids(
            playerId
          )
        ).toHaveLength(
          1
        );


        expect(
          () =>
            submitBid(
              teamId,
              playerId,
              30
            )
        ).toThrow(
          "Bid already submitted"
        );
      }
    );


    it(
      "orders bids by amount descending",
      () => {
        const firstTeamId =
          createTestTeam(
            "Alpha"
          );

        const secondTeamId =
          createTestTeam(
            "Beta"
          );

        const playerId =
          createTestPlayer();


        setGameState({
          status: "AUCTION",
          currentPlayerId:
            playerId
        });


        submitBid(
          firstTeamId,
          playerId,
          25
        );

        submitBid(
          secondTeamId,
          playerId,
          40
        );


        const bids =
          getCurrentAuctionBids(
            playerId
          );


        expect(
          bids.map(
            bid =>
              bid.amount
          )
        ).toEqual([
          40,
          25
        ]);
      }
    );


    it(
      "awards the highest bid, deducts budget and creates the roster entry",
      () => {
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
          status: "AUCTION",
          currentPlayerId:
            playerId
        });


        submitBid(
          firstTeamId,
          playerId,
          40
        );

        submitBid(
          secondTeamId,
          playerId,
          55
        );


        const result =
          resolveAuction(
            playerId
          );


        expect(
          result
        ).toMatchObject({
          winnerTeamId:
            secondTeamId,
          playerId,
          price: 55
        });


        const winningTeam =
          db.prepare(
            `
            SELECT budget
            FROM teams
            WHERE id = ?
            `
          ).get(
            secondTeamId
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


        const roster =
          db.prepare(
            `
            SELECT
              team_id AS teamId,
              player_id AS playerId,
              price
            FROM roster
            WHERE player_id = ?
            `
          ).get(
            playerId
          ) as {
            teamId: number;
            playerId: number;
            price: number;
          };


        expect(
          winningTeam.budget
        ).toBe(
          145
        );

        expect(
          player.drafted
        ).toBe(
          1
        );

        expect(
          roster
        ).toEqual({
          teamId:
            secondTeamId,
          playerId,
          price: 55
        });
      }
    );


    it(
      "breaks equal bids by earliest row",
      () => {
        const firstTeamId =
          createTestTeam(
            "Alpha"
          );

        const secondTeamId =
          createTestTeam(
            "Beta"
          );

        const playerId =
          createTestPlayer();


        setGameState({
          status: "AUCTION",
          currentPlayerId:
            playerId
        });


        db.prepare(
          `
          INSERT INTO auction_bids
          (
            team_id,
            player_id,
            amount,
            submitted_at
          )
          VALUES
          (
            ?,
            ?,
            30,
            '2026-07-14 12:00:00'
          )
          `
        ).run(
          firstTeamId,
          playerId
        );


        db.prepare(
          `
          INSERT INTO auction_bids
          (
            team_id,
            player_id,
            amount,
            submitted_at
          )
          VALUES
          (
            ?,
            ?,
            30,
            '2026-07-14 12:00:00'
          )
          `
        ).run(
          secondTeamId,
          playerId
        );


        const result =
          resolveAuction(
            playerId
          );


        expect(
          result?.winnerTeamId
        ).toBe(
          firstTeamId
        );
      }
    );


    it(
      "returns null and records a result when no bids were submitted",
      () => {
        const playerId =
          createTestPlayer();


        setGameState({
          status: "AUCTION",
          currentPlayerId:
            playerId
        });


        const result =
          resolveAuction(
            playerId
          );


        const game =
          db.prepare(
            `
            SELECT
              status,
              last_winner_team_id AS winnerTeamId,
              last_winner_player_id AS winnerPlayerId
            FROM game
            WHERE id = 1
            `
          ).get() as {
            status: string;
            winnerTeamId:
              number | null;
            winnerPlayerId:
              number | null;
          };


        expect(
          result
        ).toBeNull();

        expect(
          game.status
        ).toBe(
          "RESULT"
        );

        expect(
          game.winnerTeamId
        ).toBeNull();

        expect(
          game.winnerPlayerId
        ).toBe(
          playerId
        );
      }
    );
  }
);
