import {
  Router
} from "express";

import {
  getGameState,
  nominatePlayer,
  resetDraft
} from "../services/gameService";

import {
  startAuctionTimer,
  stopAuctionTimer
} from "../services/auctionTimerService";

import {
  broadcastGameUpdated
} from "../socket/socket";

import {
  requireAdmin
} from "../middleware/requireAdmin";

const router =
  Router();


router.get(
  "/",
  (
    _req: any,
    res: any
  ) => {
    try {
      res.json(
        getGameState()
      );
    } catch (
      error: any
    ) {
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
  "/nominate/:playerId",
  requireAdmin,
  (
    req: any,
    res: any
  ) => {
    try {
      const playerId =
        Number(
          req.params.playerId
        );


      const game =
        nominatePlayer(
          playerId
        );


      startAuctionTimer(
        playerId,
        game.countdown
      );


      res.json(
        getGameState()
      );
    } catch (
      error: any
    ) {
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
  "/reset",
  requireAdmin,
  (
    _req: any,
    res: any
  ) => {
    try {
      stopAuctionTimer();


      const game =
        resetDraft();


      broadcastGameUpdated(
        game
      );


      res.json(
        game
      );
    } catch (
      error: any
    ) {
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