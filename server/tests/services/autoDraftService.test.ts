import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it
} from "vitest";

import {
  db
} from "../../src/database/connection";

import {
  submitAutoDraftBids
} from "../../src/services/autoDraftService";

import {
  getCurrentAuctionBids
} from "../../src/services/bidService";

import {
  createTestPlayer,
  createTestTeam,
  insertRosterPlayer,
  setGameState
} from "../helpers/database";


describe(
  "autoDraftService",
  () => {
    beforeEach(
      () => {
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
            countdown = 0;
          `
        );
      }
    );


    afterEach(
      () => {
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
            countdown = 0;
          `
        );
      }
    );


    it(
      "submits exactly the player's max offer for an enabled auto-draft team",
      () => {
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
              "Max Offer Player",
            position:
              "WR"
          });


        db.prepare(
          `
          UPDATE draft_players
          SET max_offer = ?
          WHERE id = ?
          `
        ).run(
          61,
          playerId
        );


        setGameState({
          status:
            "AUCTION",
          currentPlayerId:
            playerId
        });


        submitAutoDraftBids(
          playerId
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
      }
    );


    it(
      "does not submit a bid for a disabled auto-draft team",
      () => {
        const teamId =
          createTestTeam(
            "Human Team",
            200
          );


        db.prepare(
          `
          UPDATE teams
          SET auto_draft_enabled = 0
          WHERE id = ?
          `
        ).run(
          teamId
        );


        const playerId =
          createTestPlayer({
            name:
              "Disabled Auto Player",
            position:
              "RB"
          });


        db.prepare(
          `
          UPDATE draft_players
          SET max_offer = ?
          WHERE id = ?
          `
        ).run(
          50,
          playerId
        );


        setGameState({
          status:
            "AUCTION",
          currentPlayerId:
            playerId
        });


        submitAutoDraftBids(
          playerId
        );


        expect(
          getCurrentAuctionBids(
            playerId
          )
        ).toHaveLength(
          0
        );
      }
    );


    it(
      "submits each enabled team's own fixed max offer",
      () => {
        const firstTeamId =
          createTestTeam(
            "Auto Team One",
            200
          );

        const secondTeamId =
          createTestTeam(
            "Auto Team Two",
            200
          );


        db.prepare(
          `
          UPDATE teams
          SET auto_draft_enabled = 1
          WHERE id IN (?, ?)
          `
        ).run(
          firstTeamId,
          secondTeamId
        );


        const playerId =
          createTestPlayer({
            name:
              "Multiple Auto Teams",
            position:
              "WR"
          });


        db.prepare(
          `
          UPDATE draft_players
          SET max_offer = ?
          WHERE id = ?
          `
        ).run(
          55,
          playerId
        );


        setGameState({
          status:
            "AUCTION",
          currentPlayerId:
            playerId
        });


        submitAutoDraftBids(
          playerId
        );


        const bids =
          getCurrentAuctionBids(
            playerId
          );


        expect(
          bids
        ).toHaveLength(
          2
        );


        expect(
          bids.map(
            bid =>
              [
                bid.team_id,
                bid.amount
              ]
          )
        ).toEqual(
          expect.arrayContaining([
            [
              firstTeamId,
              55
            ],
            [
              secondTeamId,
              55
            ]
          ])
        );
      }
    );


    it(
      "does not bid when the team cannot afford the max offer",
      () => {
        const teamId =
          createTestTeam(
            "Poor Auto Team",
            40
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
              "Too Expensive",
            position:
              "RB"
          });


        db.prepare(
          `
          UPDATE draft_players
          SET max_offer = ?
          WHERE id = ?
          `
        ).run(
          41,
          playerId
        );


        setGameState({
          status:
            "AUCTION",
          currentPlayerId:
            playerId
        });


        submitAutoDraftBids(
          playerId
        );


        expect(
          getCurrentAuctionBids(
            playerId
          )
        ).toHaveLength(
          0
        );
      }
    );


    it(
      "does not bid when roster eligibility rejects the player",
      () => {
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


        /*
         * Fill the auto-draft roster with two
         * kickers. The third kicker must be
         * rejected by rosterEligibilityService.
         */
        for (
          let index = 0;
          index < 2;
          index += 1
        ) {
          const kickerId =
            createTestPlayer({
              name:
                `Existing Kicker ${index + 1}`,
              position:
                "K"
            });


          insertRosterPlayer({
            teamId,
            playerId:
              kickerId,
            playerName:
              `Existing Kicker ${index + 1}`,
            position:
              "K",
            price:
              5,
            slot:
              index === 0
                ? "K"
                : "BENCH1"
          });
        }


        const playerId =
          createTestPlayer({
            name:
              "Third Kicker",
            position:
              "K"
          });


        db.prepare(
          `
          UPDATE draft_players
          SET max_offer = ?
          WHERE id = ?
          `
        ).run(
          20,
          playerId
        );


        setGameState({
          status:
            "AUCTION",
          currentPlayerId:
            playerId
        });


        submitAutoDraftBids(
          playerId
        );


        expect(
          getCurrentAuctionBids(
            playerId
          )
        ).toHaveLength(
          0
        );
      }
    );


    it(
      "does not change the auto-draft amount based on existing bids",
      () => {
        const autoTeamId =
          createTestTeam(
            "Auto Team",
            200
          );

        const otherTeamId =
          createTestTeam(
            "Other Team",
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
              "Fixed Bid Player",
            position:
              "WR"
          });


        db.prepare(
          `
          UPDATE draft_players
          SET max_offer = ?
          WHERE id = ?
          `
        ).run(
          61,
          playerId
        );


        setGameState({
          status:
            "AUCTION",
          currentPlayerId:
            playerId
        });


        /*
         * A competing bid already exists.
         * Auto-draft must still submit exactly
         * max_offer rather than reacting to it.
         */
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
          otherTeamId,
          playerId,
          100
        );


        submitAutoDraftBids(
          playerId
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
      }
    );


    it(
      "does not submit a duplicate bid",
      () => {
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
              "Duplicate Bid Player",
            position:
              "WR"
          });


        db.prepare(
          `
          UPDATE draft_players
          SET max_offer = ?
          WHERE id = ?
          `
        ).run(
          50,
          playerId
        );


        setGameState({
          status:
            "AUCTION",
          currentPlayerId:
            playerId
        });


        submitAutoDraftBids(
          playerId
        );

        submitAutoDraftBids(
          playerId
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
          50
        );
      }
    );


    it(
      "does nothing when max offer is zero",
      () => {
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
              "No Max Offer",
            position:
              "WR"
          });


        db.prepare(
          `
          UPDATE draft_players
          SET max_offer = 0
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


        submitAutoDraftBids(
          playerId
        );


        expect(
          getCurrentAuctionBids(
            playerId
          )
        ).toHaveLength(
          0
        );
      }
    );
  }
);