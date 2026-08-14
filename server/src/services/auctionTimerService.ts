import {
  db
} from "../database/connection";

import {
  getGameState
} from "./gameService";

import {
  resolveAuction
} from "./bidService";

import {
  submitAutoDraftBids
} from "./autoDraftService";

import {
  broadcastGameUpdated
} from "../socket/socket";


let auctionTimer:
  NodeJS.Timeout | null =
  null;


let autoDraftElapsedSeconds =
  0;


const AUTO_DRAFT_DELAY_SECONDS =
  10;


function resolveCurrentAuction(
  playerId: number
): boolean {
  try {
    resolveAuction(
      playerId
    );
  } catch (error) {
    console.error(
      "Automatic auction resolution failed:",
      error
    );

    return false;
  }


  broadcastGameUpdated(
    getGameState()
  );

  return true;
}


function tryResolveAfterAutoDraft(
  playerId: number
): boolean {
  const game =
    getGameState();


  if (
    game.status !== "AUCTION" ||
    game.currentPlayerId !== playerId
  ) {
    return false;
  }


  /*
   * Every auto-draft team has now had its one
   * automatic-bid opportunity. Teams that could
   * not submit because of budget, roster rules,
   * or a zero max offer are intentionally allowed
   * to remain without a bid.
   *
   * If every team that is going to bid has now
   * submitted, finish immediately.
   */
  if (
    game.totalTeamCount > 0 &&
    game.submittedBidCount >=
      game.totalTeamCount
  ) {
    stopAuctionTimer();

    return resolveCurrentAuction(
      playerId
    );
  }


  return false;
}


function runAutoDraft(
  playerId: number
): void {
  try {
    submitAutoDraftBids(
      playerId
    );
  } catch (error) {
    console.error(
      "Automatic draft bidding failed:",
      error
    );
  }


  broadcastGameUpdated(
    getGameState()
  );
}


export function stopAuctionTimer() {
  if (auctionTimer) {
    clearInterval(
      auctionTimer
    );

    auctionTimer = null;
  }


  autoDraftElapsedSeconds =
    0;
}


export function startAuctionTimer(
  playerId: number,
  startingSeconds: number
) {
  stopAuctionTimer();


  if (
    !Number.isInteger(
      playerId
    ) ||
    playerId <= 0
  ) {
    throw new Error(
      "Invalid auction player"
    );
  }


  if (
    !Number.isInteger(
      startingSeconds
    ) ||
    startingSeconds <= 0
  ) {
    throw new Error(
      "Invalid countdown duration"
    );
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


  autoDraftElapsedSeconds =
    0;


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
        ).run(
          nextCountdown
        );


        autoDraftElapsedSeconds +=
          1;


        broadcastGameUpdated(
          getGameState()
        );


        if (
          autoDraftElapsedSeconds ===
          AUTO_DRAFT_DELAY_SECONDS
        ) {
          runAutoDraft(
            playerId
          );


          if (
            tryResolveAfterAutoDraft(
              playerId
            )
          ) {
            return;
          }
        }


        if (
          nextCountdown === 0
        ) {
          /*
           * For very short auctions, the 10-second
           * auto-draft point may never be reached.
           * Give auto-draft teams their opportunity
           * immediately before resolving the auction.
           */
          if (
            autoDraftElapsedSeconds <
            AUTO_DRAFT_DELAY_SECONDS
          ) {
            runAutoDraft(
              playerId
            );
          }


          stopAuctionTimer();


          resolveCurrentAuction(
            playerId
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


  if (
    game.countdown <= 0
  ) {
    runAutoDraft(
      game.currentPlayerId
    );


    stopAuctionTimer();


    resolveCurrentAuction(
      game.currentPlayerId
    );

    return;
  }


  /*
   * The original elapsed auction duration is not
   * persisted. After a process restart, resume the
   * remaining countdown and give auto-draft its
   * standard delay again for this timer lifetime.
   */
  startAuctionTimer(
    game.currentPlayerId,
    game.countdown
  );
}
