import { Router } from "express";

import {
  getGameState,
  nominatePlayer
} from "../services/gameService";

import {
  broadcastGameUpdated
} from "../socket/socket";


const router = Router();



router.get(
  "/",
  (_req: any, res: any) => {

    res.json(
      getGameState()
    );

  }
);



router.post(
  "/nominate/:playerId",
  (req: any, res: any) => {

    const playerId =
      Number(
        req.params.playerId
      );


    const game =
      nominatePlayer(
        playerId
      );


    broadcastGameUpdated(
      game
    );


    res.json(
      game
    );

  }
);



export default router;