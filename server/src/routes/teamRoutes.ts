import { Router } from "server/node_modules/@types/express";
import crypto from "crypto";

import { db } from "../database/connection";
import { teamService } from "../services/teamService";

const router = Router();

/*
|--------------------------------------------------------------------------
| GET ALL TEAMS (Admin)
|--------------------------------------------------------------------------
*/

router.get("/", (_req, res) => {

  const teams = teamService.getAllTeams();

  res.json(teams);

});


/*
|--------------------------------------------------------------------------
| GET TEAM BY TOKEN
|--------------------------------------------------------------------------
*/

router.get("/:token", (req, res) => {

  const team = db.prepare(`
    SELECT
      id,
      name,
      budget
    FROM teams
    WHERE token = ?
  `).get(req.params.token);

  if (!team) {
    return res.status(404).json({
      message: "Team not found"
    });
  }

  const roster = db.prepare(`
    SELECT
      slot,
      player_name,
      position
    FROM roster
    WHERE team_id = ?
  `).all((team as any).id);

  res.json({
    ...team,
    roster
  });

});


/*
|--------------------------------------------------------------------------
| CREATE TEAM
|--------------------------------------------------------------------------
*/

router.post("/", (req, res) => {

  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      message: "Name is required"
    });
  }

  const startingBudget = db.prepare(`
    SELECT value
    FROM settings
    WHERE key = 'startingBudget'
  `).get() as { value: string };

  const token = crypto.randomUUID();

  const result = db.prepare(`
    INSERT INTO teams
    (
      token,
      name,
      budget,
      connected
    )
    VALUES
    (
      ?,
      ?,
      ?,
      1
    )
  `).run(
    token,
    name,
    Number(startingBudget.value)
  );

  const teamId = Number(result.lastInsertRowid);

  const slots = [
    "QB",
    "RB1",
    "RB2",
    "WR1",
    "WR2",
    "TE",
    "FLEX",
    "DEF",
    "K",
    "BENCH1",
    "BENCH2",
    "BENCH3",
    "BENCH4",
    "BENCH5",
    "BENCH6"
  ];

  const insertRoster = db.prepare(`
    INSERT INTO roster
    (
      team_id,
      slot
    )
    VALUES
    (
      ?,
      ?
    )
  `);

  for (const slot of slots) {
    insertRoster.run(teamId, slot);
  }

  res.json({
    token
  });

});

export default router;