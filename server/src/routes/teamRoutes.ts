import { Router } from "express";


import {
  getTeams,
  createTeam
} from "../services/teamService";



const router = Router();



router.get(
  "/",
  (_req: any, res: any) => {

    res.json(
      getTeams()
    );

  }
);



router.post(
  "/",
  (req: any, res: any) => {


    const name =
      req.body.name;



    if (!name) {

      return res
        .status(400)
        .json({
          error: "Team name required"
        });

    }



    const team =
      createTeam(name);



    res.json(team);


  }
);



export default router;