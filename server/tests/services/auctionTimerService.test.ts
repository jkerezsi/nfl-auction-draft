
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

vi.unmock(
  "../../src/services/auctionTimerService"
);

import {
  db
} from "../../src/database/connection";

import {
  startAuctionTimer,
  stopAuctionTimer
} from "../../src/services/auctionTimerService";

import {
  getCurrentAuctionBids,
  submitBid
} from "../../src/services/bidService";

import {
  createTestPlayer,
  createTestTeam,
  setGameState
} from "../helpers/database";


describe(
  "auctionTimerService",
  () => {
    beforeEach(
      () => {
        vi.useFakeTimers();


        db.exec(
          `
          DELETE FROM auction_bids;
          DELETE FROM roster;

          UPDATE teams
          SET
            budget = 200,
            auto_draft_enabled = 0;

          UPDATE draft_players
          SET
            drafted = 0,
            max_offer = 0;

          UPDATE game
          SET
            status = 'SETUP',
            current_player_id = NULL,
            countdown = 0,
            current_bid = 0,
            current_bid_team_id = NULL,
            last_winner_team_id = NULL,
            last_winner_price = NULL,
            last_winner_player_id = NULL;
          `
        );
      }
    );


    afterEach(
      () => {
        stopAuctionTimer();


        vi.clearAllTimers();
        vi.useRealTimers();


        db.exec(
          `
          DELETE FROM auction_bids;
          DELETE FROM roster;

          UPDATE teams
          SET
            budget = 200,
            auto_draft_enabled = 0;

          UPDATE draft_players
          SET
            drafted = 0,
            max_offer = 0;

          UPDATE game
          SET
            status = 'SETUP',
            current_player_id = NULL,
            countdown = 0,
            current_bid = 0,
            current_bid_team_id = NULL,
            last_winner_team_id = NULL,
            last_winner_price = NULL,
            last_winner_player_id = NULL;
          `
        );
      }
    );


    it(
      "does not submit the auto-draft bid before 10 seconds have elapsed",
      async () => {
        const teamId =
          createTestTeam(
            "Auto Team",
            200
          );


        db.prepare(
          `
          UPDATE teams
          SET auto_draft_enabled = 1
          WHERE id = ?
          `
        ).run(
          teamId
        );


        const playerId =
          createTestPlayer({
            name:
              "Timer Player",
            position:
              "WR"
          });


        db.prepare(
          `
          UPDATE draft_players
          SET max_offer = 61
          WHERE id = ?
          `
        ).run(
          playerId
        );


        startAuctionTimer(
          playerId,
          30
        );


        expect(
          getCurrentAuctionBids(
            playerId
          )
        ).toHaveLength(
          0
        );


        await vi.advanceTimersByTimeAsync(
          9_000
        );


        expect(
          getCurrentAuctionBids(
            playerId
          )
        ).toHaveLength(
          0
        );


        stopAuctionTimer();
      }
    );


    it(
      "submits the exact max offer 10 seconds after a 30-second auction starts",
      async () => {
        const teamId =
          createTestTeam(
            "Auto Team",
            200
          );


        db.prepare(
          `
          UPDATE teams
          SET auto_draft_enabled = 1
          WHERE id = ?
          `
        ).run(
          teamId
        );


        const playerId =
          createTestPlayer({
            name:
              "Timer Max Offer Player",
            position:
              "RB"
          });


        db.prepare(
          `
          UPDATE draft_players
          SET max_offer = 61
          WHERE id = ?
          `
        ).run(
          playerId
        );


        startAuctionTimer(
          playerId,
          30
        );


        await vi.advanceTimersByTimeAsync(
          10_000
        );


        const bids =
          getCurrentAuctionBids(
            playerId
          );


        expect(
          bids
        ).toHaveLength(
          1
        );


        expect(
          bids[0].team_id
        ).toBe(
          teamId
        );


        expect(
          bids[0].amount
        ).toBe(
          61
        );


        stopAuctionTimer();
      }
    );


    it(
      "submits the auto-draft bid only once",
      async () => {
        const teamId =
          createTestTeam(
            "Auto Team",
            200
          );


        db.prepare(
          `
          UPDATE teams
          SET auto_draft_enabled = 1
          WHERE id = ?
          `
        ).run(
          teamId
        );


        const playerId =
          createTestPlayer({
            name:
              "Single Submission Player",
            position:
              "WR"
          });


        db.prepare(
          `
          UPDATE draft_players
          SET max_offer = 55
          WHERE id = ?
          `
        ).run(
          playerId
        );


        startAuctionTimer(
          playerId,
          30
        );


        await vi.advanceTimersByTimeAsync(
          10_000
        );


        await vi.advanceTimersByTimeAsync(
          5_000
        );


        const bids =
          getCurrentAuctionBids(
            playerId
          );


        expect(
          bids
        ).toHaveLength(
          1
        );


        expect(
          bids[0].amount
        ).toBe(
          55
        );


        stopAuctionTimer();
      }
    );


    it(
      "submits the fixed max offer regardless of an existing higher bid",
      async () => {
        const autoTeamId =
          createTestTeam(
            "Auto Team",
            200
          );

        const humanTeamId =
          createTestTeam(
            "Human Team",
            200
          );


        db.prepare(
          `
          UPDATE teams
          SET auto_draft_enabled = 1
          WHERE id = ?
          `
        ).run(
          autoTeamId
        );


        const playerId =
          createTestPlayer({
            name:
              "Existing Bid Player",
            position:
              "WR"
          });


        db.prepare(
          `
          UPDATE draft_players
          SET max_offer = 61
          WHERE id = ?
          `
        ).run(
          playerId
        );


        setGameState({
          status:
            "AUCTION",
          currentPlayerId:
            playerId
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
          (?, ?, ?)
          `
        ).run(
          humanTeamId,
          playerId,
          100
        );


        /*
         * startAuctionTimer resets the auction state,
         * but it does not delete auction_bids.
         */
        startAuctionTimer(
          playerId,
          30
        );


        await vi.advanceTimersByTimeAsync(
          10_000
        );


        const autoBid =
          db
            .prepare(
              `
              SELECT
                amount
              FROM auction_bids
              WHERE
                team_id = ?
                AND player_id = ?
              `
            )
            .get(
              autoTeamId,
              playerId
            ) as {
              amount: number;
            } | undefined;


        expect(
          autoBid
        ).toBeDefined();


        expect(
          autoBid?.amount
        ).toBe(
          61
        );


        stopAuctionTimer();
      }
    );


    it(
      "resolves immediately after auto-draft when all human teams already submitted",
      async () => {
        const autoTeamId =
          createTestTeam(
            "Auto Team",
            200
          );

        const humanTeamId =
          createTestTeam(
            "Human Team",
            200
          );


        db.prepare(
          `
          UPDATE teams
          SET auto_draft_enabled = 1
          WHERE id = ?
          `
        ).run(
          autoTeamId
        );


        const playerId =
          createTestPlayer({
            name:
              "Early Completion Player",
            position:
              "WR"
          });


        db.prepare(
          `
          UPDATE draft_players
          SET max_offer = 61
          WHERE id = ?
          `
        ).run(
          playerId
        );


        startAuctionTimer(
          playerId,
          30
        );


        submitBid(
          humanTeamId,
          playerId,
          80
        );


        await vi.advanceTimersByTimeAsync(
          10_000
        );


        const game =
          db
            .prepare(
              `
              SELECT
                status,
                last_winner_team_id AS winnerTeamId,
                last_winner_price AS winnerPrice
              FROM game
              WHERE id = 1
              `
            )
            .get() as {
              status: string;
              winnerTeamId:
                number | null;
              winnerPrice:
                number | null;
            };


        expect(
          game.status
        ).toBe(
          "RESULT"
        );


        expect(
          game.winnerTeamId
        ).toBe(
          humanTeamId
        );


        expect(
          game.winnerPrice
        ).toBe(
          80
        );


        expect(
          getCurrentAuctionBids(
            playerId
          )
        ).toHaveLength(
          2
        );
      }
    );


    it(
      "supports a different auction duration while still triggering 10 seconds after start",
      async () => {
        const teamId =
          createTestTeam(
            "Auto Team",
            200
          );


        db.prepare(
          `
          UPDATE teams
          SET auto_draft_enabled = 1
          WHERE id = ?
          `
        ).run(
          teamId
        );


        const playerId =
          createTestPlayer({
            name:
              "Custom Duration Player",
            position:
              "TE"
          });


        db.prepare(
          `
          UPDATE draft_players
          SET max_offer = 42
          WHERE id = ?
          `
        ).run(
          playerId
        );


        startAuctionTimer(
          playerId,
          20
        );


        await vi.advanceTimersByTimeAsync(
          9_000
        );


        expect(
          getCurrentAuctionBids(
            playerId
          )
        ).toHaveLength(
          0
        );


        await vi.advanceTimersByTimeAsync(
          1_000
        );


        const bids =
          getCurrentAuctionBids(
            playerId
          );


        expect(
          bids
        ).toHaveLength(
          1
        );


        expect(
          bids[0].amount
        ).toBe(
          42
        );


        stopAuctionTimer();
      }
    );
  }
);