import { Router } from "server/node_modules/@types/express";
import { getGameState } from "../services/gameService";


const router = Router();


router.get("/", (_, res) => {

  const game = getGameState();

  res.json(game);

});


export default router;