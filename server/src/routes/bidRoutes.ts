import { Router } from "express";


import {
  submitBid,
  getCurrentAuctionBids,
  resolveAuction
} from "../services/bidService";



const router =
  Router();




router.post(
  "/",
  (
    req: any,
    res: any
  ) => {


    try {


      const {
        teamId,
        playerId,
        amount
      } = req.body;



      const result =
        submitBid(

          Number(teamId),

          Number(playerId),

          Number(amount)

        );



      res.json(
        result
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






router.get(
  "/current/:playerId",
  (
    req: any,
    res: any
  ) => {


    const playerId =
      Number(
        req.params.playerId
      );



    const bids =
      getCurrentAuctionBids(
        playerId
      );



    res.json(
      bids
    );


  }
);







router.post(
  "/resolve/:playerId",
  (
    req: any,
    res: any
  ) => {


    try {


      const playerId =
        Number(
          req.params.playerId
        );



      const result =
        resolveAuction(
          playerId
        );



      res.json(
        result
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