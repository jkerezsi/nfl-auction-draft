import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";


import { initializeDatabase } from "./database/init";


import {
  initializeSocket
} from "./socket";


import teamRoutes from "./routes/teamRoutes";
import playerRoutes from "./routes/playerRoutes";
import gameRoutes from "./routes/gameRoutes";
import rosterRoutes from "./routes/rosterRoutes";
import bidRoutes from "./routes/bidRoutes";



initializeDatabase();



const app =
  express();



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
  (socket) => {


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






app.use(
  cors()
);


app.use(
  express.json()
);





app.use(
  "/api/team",
  teamRoutes
);



app.use(
  "/api/players",
  playerRoutes
);



app.use(
  "/api/game",
  gameRoutes
);



app.use(
  "/api/roster",
  rosterRoutes
);



app.use(
  "/api/bid",
  bidRoutes
);





app.get(
  "/",
  (_req, res) => {


    res.json({

      message:
        "Fantasy Auction Draft API"

    });


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


  }
);