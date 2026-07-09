import {
  Router
} from "express";


import {
  getTeamRoster
} from "../services/rosterService";



const router =
  Router();



router.get(
  "/:teamId",
  (
    req: any,
    res: any
  ) => {


    const teamId =
      Number(
        req.params.teamId
      );


    const roster =
      getTeamRoster(
        teamId
      );


    res.json(
      roster
    );


  }
);



export default router;