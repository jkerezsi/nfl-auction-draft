import "dotenv/config";

import express from "express";
import cors from "cors";

import adminAuthRoutes from "./routes/adminAuthRoutes";
import teamRoutes from "./routes/teamRoutes";
import playerRoutes from "./routes/playerRoutes";
import gameRoutes from "./routes/gameRoutes";
import rosterRoutes from "./routes/rosterRoutes";
import bidRoutes from "./routes/bidRoutes";


const app =
  express();


const clientOrigin =
  process.env.CLIENT_ORIGIN ??
  "http://localhost:5173";


app.use(
  cors({
    origin:
      clientOrigin
  })
);


app.use(
  express.json()
);


app.use(
  "/api/admin-auth",
  adminAuthRoutes
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
  "/api/health",
  (
    _req,
    res
  ) => {
    res.json({
      status:
        "ok"
    });
  }
);


app.get(
  "/",
  (
    _req,
    res
  ) => {
    res.json({
      message:
        "Fantasy Auction Draft API"
    });
  }
);


export default app;