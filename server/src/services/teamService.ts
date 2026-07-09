import { db } from "../database/connection";


export interface Team {

  id: number;

  name: string;

  budget: number;

  connected: number;

}



export function getTeams(): Team[] {


  return db
    .prepare(
      `
      SELECT

        id,

        name,

        budget,

        connected

      FROM teams

      ORDER BY id ASC

      `
    )
    .all() as Team[];


}



export function createTeam(
  name: string
): Team {


  const setting =
    db
      .prepare(
        `
        SELECT value
        FROM settings
        WHERE key = 'startingBudget'
        `
      )
      .get() as {
        value: string
      };



  const budget =
    Number(setting.value);



  const result =
    db
      .prepare(
        `
        INSERT INTO teams

        (
          name,
          budget
        )

        VALUES

        (
          ?,
          ?
        )

        `
      )
      .run(
        name,
        budget
      );



  return db
    .prepare(
      `
      SELECT

        id,

        name,

        budget,

        connected

      FROM teams

      WHERE id = ?

      `
    )
    .get(
      result.lastInsertRowid
    ) as Team;

}