import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import {
  isAxiosError
} from "axios";

import {
  getGameState
} from "../services/gameService";

import {
  submitBid
} from "../services/bidService";

import socket from "../services/socket";

import type {
  GameState
} from "../types/game";


interface UseAuctionOptions {
  selectedTeamId: number | null;
  onAuctionResult: () => void;
}


interface ApiErrorResponse {
  error?: string;
}


const BID_STORAGE_PREFIX =
  "fantasy_bid_submitted_";


function getBidStorageKey(
  teamId: number,
  playerId: number
) {
  return (
    `${BID_STORAGE_PREFIX}${teamId}_${playerId}`
  );
}


function clearStoredBidStates() {
  const keysToRemove:
    string[] = [];


  for (
    let index = 0;
    index < localStorage.length;
    index += 1
  ) {
    const key =
      localStorage.key(
        index
      );


    if (
      key?.startsWith(
        BID_STORAGE_PREFIX
      )
    ) {
      keysToRemove.push(
        key
      );
    }
  }


  for (
    const key
    of keysToRemove
  ) {
    localStorage.removeItem(
      key
    );
  }
}


export default function useAuction({
  selectedTeamId,
  onAuctionResult
}: UseAuctionOptions) {
  const [game, setGame] =
    useState<GameState | null>(
      null
    );

  const [bidAmount, setBidAmount] =
    useState("");

  const [bidSubmitted, setBidSubmitted] =
    useState(false);

  const [error, setError] =
    useState("");

  const currentPlayerIdRef =
    useRef<number | null>(
      null
    );

  const onAuctionResultRef =
    useRef(
      onAuctionResult
    );


  useEffect(
    () => {
      onAuctionResultRef.current =
        onAuctionResult;
    },
    [onAuctionResult]
  );


  const restoreBidState =
    useCallback(
      (
        teamId: number,
        playerId: number
      ) => {
        const storageKey =
          getBidStorageKey(
            teamId,
            playerId
          );


        setBidSubmitted(
          localStorage.getItem(
            storageKey
          ) === "true"
        );
      },
      []
    );


  const loadGame =
    useCallback(
      async () => {
        try {
          const data =
            await getGameState();


          currentPlayerIdRef.current =
            data.currentPlayerId;


          setGame(
            data
          );


          if (
            data.status === "SETUP"
          ) {
            clearStoredBidStates();

            setBidSubmitted(
              false
            );

            setBidAmount(
              ""
            );

            return;
          }


          if (
            selectedTeamId !== null &&
            data.currentPlayerId !== null &&
            data.status === "AUCTION"
          ) {
            restoreBidState(
              selectedTeamId,
              data.currentPlayerId
            );
          } else {
            setBidSubmitted(
              false
            );
          }
        } catch {
          setError(
            "Could not load the current auction."
          );
        }
      },
      [
        restoreBidState,
        selectedTeamId
      ]
    );


  useEffect(
    () => {
      void loadGame();


      function handleGameUpdated(
        updatedGame: GameState
      ) {
        const previousPlayerId =
          currentPlayerIdRef.current;


        const isNewAuctionPlayer =
          updatedGame.status === "AUCTION" &&
          updatedGame.currentPlayerId !== null &&
          updatedGame.currentPlayerId !==
            previousPlayerId;


        currentPlayerIdRef.current =
          updatedGame.currentPlayerId;


        setGame(
          updatedGame
        );


        if (
          updatedGame.status === "SETUP"
        ) {
          clearStoredBidStates();

          setBidSubmitted(
            false
          );

          setBidAmount(
            ""
          );

          setError(
            ""
          );

          return;
        }


        if (
          isNewAuctionPlayer &&
          selectedTeamId !== null &&
          updatedGame.currentPlayerId !== null
        ) {
          restoreBidState(
            selectedTeamId,
            updatedGame.currentPlayerId
          );


          setBidAmount(
            ""
          );

          setError(
            ""
          );
        }


        if (
          updatedGame.status === "RESULT"
        ) {
          onAuctionResultRef.current();
        }
      }


      socket.on(
        "GAME_UPDATED",
        handleGameUpdated
      );


      return () => {
        socket.off(
          "GAME_UPDATED",
          handleGameUpdated
        );
      };
    },
    [
      loadGame,
      restoreBidState,
      selectedTeamId
    ]
  );


  useEffect(
    () => {
      if (
        selectedTeamId === null
      ) {
        setBidSubmitted(
          false
        );

        setBidAmount(
          ""
        );

        setError(
          ""
        );

        return;
      }


      if (
        game?.status === "SETUP"
      ) {
        clearStoredBidStates();

        setBidSubmitted(
          false
        );

        setBidAmount(
          ""
        );

        return;
      }


      if (
        game?.status === "AUCTION" &&
        game.currentPlayerId !== null
      ) {
        restoreBidState(
          selectedTeamId,
          game.currentPlayerId
        );
      } else {
        setBidSubmitted(
          false
        );
      }
    },
    [
      game?.currentPlayerId,
      game?.status,
      restoreBidState,
      selectedTeamId
    ]
  );


  async function placeBid() {
    try {
      setError(
        ""
      );


      if (
        selectedTeamId === null ||
        !game?.currentPlayer
      ) {
        return;
      }


      const amount =
        Number(
          bidAmount
        );


      if (
        !Number.isInteger(
          amount
        ) ||
        amount <= 0
      ) {
        setError(
          "Enter a positive whole-number bid."
        );

        return;
      }


      await submitBid(
        selectedTeamId,
        game.currentPlayer.id,
        amount
      );


      localStorage.setItem(
        getBidStorageKey(
          selectedTeamId,
          game.currentPlayer.id
        ),
        "true"
      );


      setBidSubmitted(
        true
      );
    } catch (
      requestError: unknown
    ) {
      if (
        isAxiosError<ApiErrorResponse>(
          requestError
        )
      ) {
        setError(
          requestError.response?.data?.error ??
          "Bid failed."
        );

        return;
      }


      setError(
        "Bid failed."
      );
    }
  }


  return {
    game,
    bidAmount,
    bidSubmitted,
    error,
    setBidAmount,
    placeBid
  };
}