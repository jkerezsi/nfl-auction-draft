import { Router } from "express";

import {
  getGameState,
  nominatePlayer
} from "../services/gameService";

import {
  startAuctionTimer
} from "../services/auctionTimerService";


const router =
  Router();


router.get(
  "/",
  (_req: any, res: any) => {
    try {
      res.json(
        getGameState()
      );
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
  "/nominate/:playerId",
  (req: any, res: any) => {
    try {
      const playerId =
        Number(
          req.params.playerId
        );


      const game =
        nominatePlayer(playerId);


      startAuctionTimer(
        playerId,
        game.countdown
      );


      res.json(
        getGameState()
      );
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