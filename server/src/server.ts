import express from "server/node_modules/@types/express";
import cors from "server/node_modules/@types/cors";

import { initializeDatabase } from "./database/init";

import teamRoutes from "./routes/teamRoutes";
import playerRoutes from "./routes/playerRoutes";

initializeDatabase();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/team", teamRoutes);
app.use("/api/players", playerRoutes);

app.get("/", (_req, res) => {
  res.send("Fantasy Auction Draft API");
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});