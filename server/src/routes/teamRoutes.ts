import { Router } from "express";

import {
  teamService
} from "../services/teamService";


const router = Router();


router.get(
  "/",
  (_req: any, res: any) => {

    const teams =
      teamService.getAllTeams();


    res.json(teams);

  }
);


export default router;