import express from "express";
import cors from "cors";

import { initializeDatabase } from "./database/init";

import teamRoutes from "./routes/teamRoutes";
import playerRoutes from "./routes/playerRoutes";
import gameRoutes from "./routes/gameRoutes";


initializeDatabase();


const app = express();


app.use(cors());

app.use(express.json());



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



app.get(
  "/",
  (_req: any, res: any) => {

    res.json({
      message: "Fantasy Auction Draft API"
    });

  }
);



const PORT = 3000;


app.listen(
  PORT,
  () => {

    console.log(
      `Server running on port ${PORT}`
    );

  }
);