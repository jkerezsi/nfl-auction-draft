import { Router } from "server/node_modules/@types/express";
import { playerService } from "../services/playerService";

const router = Router();

router.get("/", (_req, res) => {

  const players = playerService.getAllPlayers();

  res.json(players);

});

export default router;