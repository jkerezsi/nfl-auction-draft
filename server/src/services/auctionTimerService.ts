import { db } from "../database/connection";

import {
  getGameState
} from "./gameService";

import {
  resolveAuction
} from "./bidService";

import {
  broadcastGameUpdated
} from "../socket/socket";


let auctionTimer: NodeJS.Timeout | null =
  null;


export function stopAuctionTimer() {
  if (auctionTimer) {
    clearInterval(auctionTimer);

    auctionTimer = null;
  }
}


export function startAuctionTimer(
  playerId: number,
  startingSeconds: number
) {
  stopAuctionTimer();


  if (
    !Number.isInteger(playerId) ||
    playerId <= 0
  ) {
    throw new Error("Invalid auction player");
  }


  if (
    !Number.isInteger(startingSeconds) ||
    startingSeconds <= 0
  ) {
    throw new Error("Invalid countdown duration");
  }


  db.prepare(
    `
    UPDATE game
    SET
      status = 'AUCTION',
      current_player_id = ?,
      countdown = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
    `
  ).run(
    playerId,
    startingSeconds
  );


  broadcastGameUpdated(
    getGameState()
  );


  auctionTimer =
    setInterval(
      () => {
        const game =
          getGameState();


        if (
          game.status !== "AUCTION" ||
          game.currentPlayerId !== playerId
        ) {
          stopAuctionTimer();

          return;
        }


        const nextCountdown =
          Math.max(
            0,
            game.countdown - 1
          );


        db.prepare(
          `
          UPDATE game
          SET
            countdown = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = 1
          `
        ).run(nextCountdown);


        broadcastGameUpdated(
          getGameState()
        );


        if (nextCountdown === 0) {
          stopAuctionTimer();


          try {
            resolveAuction(playerId);
          } catch (error) {
            console.error(
              "Automatic auction resolution failed:",
              error
            );
          }


          broadcastGameUpdated(
            getGameState()
          );
        }
      },
      1000
    );
}


export function resumeAuctionTimer() {
  const game =
    getGameState();


  if (
    game.status !== "AUCTION" ||
    game.currentPlayerId === null
  ) {
    return;
  }


  if (game.countdown <= 0) {
    try {
      resolveAuction(
        game.currentPlayerId
      );
    } catch (error) {
      console.error(
        "Could not resolve expired auction:",
        error
      );
    }


    broadcastGameUpdated(
      getGameState()
    );

    return;
  }


  startAuctionTimer(
    game.currentPlayerId,
    game.countdown
  );
}