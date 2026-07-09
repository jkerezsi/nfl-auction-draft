import { Router } from "express";

import {
  getGameState
} from "../services/gameService";


const router = Router();


router.get(
  "/",
  (_req: any, res: any) => {

    const game =
      getGameState();


    res.json(game);

  }
);


export default router;