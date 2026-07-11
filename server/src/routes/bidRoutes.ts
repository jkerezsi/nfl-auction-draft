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
  broadcastGameUpdated
} from "../socket/socket";


const router = Router();


router.post(
  "/",
  (req: any, res: any) => {
    try {
      const {
        teamId,
        playerId,
        amount
      } = req.body;


      const result = submitBid(
        Number(teamId),
        Number(playerId),
        Number(amount)
      );


      // Deliberately no socket broadcast here.
      // A sealed bid is visible only to the submitting player.
      res.json(result);
    } catch (error: any) {
      res
        .status(400)
        .json({
          error: error.message
        });
    }
  }
);


router.get(
  "/current/:playerId",
  (req: any, res: any) => {
    try {
      const game = getGameState();
      const playerId = Number(req.params.playerId);


      if (
        game.status !== "RESULT" ||
        game.lastWinnerPlayerId !== playerId
      ) {
        return res
          .status(403)
          .json({
            error: "Bids remain hidden until the auction finishes"
          });
      }


      const bids = getCurrentAuctionBids(playerId);

      res.json(bids);
    } catch (error: any) {
      res
        .status(400)
        .json({
          error: error.message
        });
    }
  }
);


router.post(
  "/resolve/:playerId",
  (req: any, res: any) => {
    try {
      const playerId = Number(req.params.playerId);

      const result = resolveAuction(playerId);
      const game = getGameState();


      broadcastGameUpdated(game);


      res.json({
        result,
        game
      });
    } catch (error: any) {
      res
        .status(400)
        .json({
          error: error.message
        });
    }
  }
);


export default router;