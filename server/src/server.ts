import http from "http";

import {
  Server
} from "socket.io";

import app from "./app";

import {
  initializeDatabase
} from "./database/init";

import {
  initializeSocket
} from "./socket";

import {
  resumeAuctionTimer
} from "./services/auctionTimerService";


initializeDatabase();


const server =
  http.createServer(
    app
  );


const io =
  new Server(
    server,
    {
      cors: {
        origin:
          "http://localhost:5173"
      }
    }
  );


initializeSocket(
  io
);


io.on(
  "connection",
  socket => {
    console.log(
      "Socket connected:",
      socket.id
    );


    socket.on(
      "disconnect",
      () => {
        console.log(
          "Socket disconnected:",
          socket.id
        );
      }
    );
  }
);


const PORT =
  3000;


server.listen(
  PORT,
  () => {
    console.log(
      `Server running on port ${PORT}`
    );


    resumeAuctionTimer();
  }
);
