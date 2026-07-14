import {
  Router
} from "express";

import {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam
} from "../services/teamService";


const router =
  Router();


router.get(
  "/",
  (
    _req: any,
    res: any
  ) => {
    try {
      res.json(
        getTeams()
      );
    } catch (
      error: any
    ) {
      res
        .status(400)
        .json({
          error:
            error.message
        });
    }
  }
);


router.post(
  "/",
  (
    req: any,
    res: any
  ) => {
    try {
      const name =
        typeof req.body?.name ===
        "string"
          ? req.body.name
          : "";


      const team =
        createTeam(
          name
        );


      res
        .status(201)
        .json(
          team
        );
    } catch (
      error: any
    ) {
      res
        .status(400)
        .json({
          error:
            error.message
        });
    }
  }
);


router.patch(
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


      const name =
        typeof req.body?.name ===
        "string"
          ? req.body.name
          : "";


      const team =
        updateTeam(
          teamId,
          name
        );


      res.json(
        team
      );
    } catch (
      error: any
    ) {
      res
        .status(400)
        .json({
          error:
            error.message
        });
    }
  }
);


router.delete(
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


      const result =
        deleteTeam(
          teamId
        );


      res.json({
        message:
          "Team deleted",
        ...result
      });
    } catch (
      error: any
    ) {
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