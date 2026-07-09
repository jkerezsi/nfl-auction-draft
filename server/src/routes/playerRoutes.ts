import { Router } from "express";

import {
  playerService
} from "../services/playerService";


const router = Router();


router.get(
  "/",
  (_req: any, res: any) => {

    const players =
      playerService.getAllPlayers();


    res.json(players);

  }
);


export default router;