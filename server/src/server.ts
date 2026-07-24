import "dotenv/config";

import http from "http";
import { Server } from "socket.io";

import app from "./app";
import { initializeDatabase } from "./database/init";
import { initializeSocket } from "./socket";
import { resumeAuctionTimer } from "./services/auctionTimerService";

initializeDatabase();

const server = http.createServer(app);

const clientOrigin =
  process.env.CLIENT_ORIGIN ??
  "http://localhost:5173";

const io = new Server(server, {
  cors:
    process.env.NODE_ENV === "production"
      ? undefined
      : {
          origin: clientOrigin
        }
});

initializeSocket(io);

io.on("connection", socket => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const port = Number(process.env.PORT) || 3000;
const host = "0.0.0.0";

server.listen(port, host, () => {
  console.log(
    `Server running at http://${host}:${port}`
  );

  resumeAuctionTimer();
});
