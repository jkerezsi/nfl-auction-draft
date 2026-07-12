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
    try {
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
    } catch (error: any) {
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