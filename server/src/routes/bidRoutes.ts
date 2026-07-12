import { Router } from "express";

import {
  submitBid,
  getCurrentAuctionBids,
  resolveAuction
} from "../services/bidService";

import {
  getGameState
} from "../services/gameService";

import {
  stopAuctionTimer
} from "../services/auctionTimerService";

import {
  broadcastGameUpdated
} from "../socket/socket";


const router =
  Router();


router.post(
  "/",
  (req: any, res: any) => {
    try {
      const {
        teamId,
        playerId,
        amount
      } = req.body;


      const result =
        submitBid(
          Number(teamId),
          Number(playerId),
          Number(amount)
        );


      const gameAfterBid =
        getGameState();


      const everyoneSubmitted =
        gameAfterBid.totalTeamCount > 0 &&
        gameAfterBid.submittedBidCount >=
          gameAfterBid.totalTeamCount;


      if (everyoneSubmitted) {
        stopAuctionTimer();


        const auctionResult =
          resolveAuction(
            Number(playerId)
          );


        const finishedGame =
          getGameState();


        broadcastGameUpdated(
          finishedGame
        );


        return res.json({
          ...result,

          auctionFinished: true,

          auctionResult,

          game:
            finishedGame
        });
      }


      // Public update contains only the submitted count.
      // Bid amounts remain private.
      broadcastGameUpdated(
        gameAfterBid
      );


      res.json({
        ...result,

        auctionFinished: false
      });
    } catch (error: any) {
      res
        .status(400)
        .json({
          error:
            error.message
        });
    }
  }
);


router.get(
  "/current/:playerId",
  (req: any, res: any) => {
    try {
      const playerId =
        Number(
          req.params.playerId
        );


      const game =
        getGameState();


      if (
        game.status !== "RESULT" ||
        game.lastWinnerPlayerId !== playerId
      ) {
        return res
          .status(403)
          .json({
            error:
              "Bids remain hidden until the auction finishes"
          });
      }


      const bids =
        getCurrentAuctionBids(
          playerId
        );


      res.json(
        bids
      );
    } catch (error: any) {
      res
        .status(400)
        .json({
          error:
            error.message
        });
    }
  }
);


router.post(
  "/resolve/:playerId",
  (req: any, res: any) => {
    try {
      const playerId =
        Number(
          req.params.playerId
        );


      stopAuctionTimer();


      const result =
        resolveAuction(
          playerId
        );


      const game =
        getGameState();


      broadcastGameUpdated(
        game
      );


      res.json({
        result,
        game
      });
    } catch (error: any) {
      res
        .status(400)
        .json({
          error:
            error.message
        });
    }
  }
);


export default router;