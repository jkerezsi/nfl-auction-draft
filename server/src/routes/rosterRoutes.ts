import {
  Router
} from "express";

import {
  getTeamRoster
} from "../services/rosterService";

import {
  releaseDraftedPlayer
} from "../services/playerReleaseService";

import {
  getGameState
} from "../services/gameService";

import {
  broadcastGameUpdated
} from "../socket/socket";

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

router.delete(
  "/player/:rosterId",
  (
    req: any,
    res: any
  ) => {
    try {
      const rosterId =
        Number(
          req.params.rosterId
        );

      const result =
        releaseDraftedPlayer(
          rosterId
        );

      broadcastGameUpdated(
        getGameState()
      );

      res.json({
        success: true,
        releasedPlayer:
          result
      });
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