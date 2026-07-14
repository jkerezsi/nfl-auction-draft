import request from "supertest";

import {
  describe,
  expect,
  it
} from "vitest";

import app from "../../src/app";

import {
  createTestPlayer,
  createTestTeam,
  setGameState
} from "../helpers/database";


describe(
  "team routes",
  () => {
    it(
      "creates and lists teams",
      async () => {
        const createResponse =
          await request(
            app
          )
            .post(
              "/api/team"
            )
            .send({
              name:
                "Alpha"
            });


        expect(
          createResponse.status
        ).toBe(
          201
        );

        expect(
          createResponse.body
        ).toMatchObject({
          name:
            "Alpha",
          budget:
            200
        });


        const listResponse =
          await request(
            app
          )
            .get(
              "/api/team"
            );


        expect(
          listResponse.status
        ).toBe(
          200
        );

        expect(
          listResponse.body
        ).toHaveLength(
          1
        );

        expect(
          listResponse.body[0]
            .name
        ).toBe(
          "Alpha"
        );
      }
    );


    it(
      "rejects an empty team name",
      async () => {
        const response =
          await request(
            app
          )
            .post(
              "/api/team"
            )
            .send({
              name:
                "   "
            });


        expect(
          response.status
        ).toBe(
          400
        );

        expect(
          response.body.error
        ).toBe(
          "Team name required"
        );
      }
    );


    it(
      "renames a team",
      async () => {
        const teamId =
          createTestTeam(
            "Alpha"
          );


        const response =
          await request(
            app
          )
            .patch(
              `/api/team/${teamId}`
            )
            .send({
              name:
                "Beta"
            });


        expect(
          response.status
        ).toBe(
          200
        );

        expect(
          response.body.name
        ).toBe(
          "Beta"
        );
      }
    );


    it(
      "rejects a duplicate renamed team",
      async () => {
        const firstTeamId =
          createTestTeam(
            "Alpha"
          );

        createTestTeam(
          "Beta"
        );


        const response =
          await request(
            app
          )
            .patch(
              `/api/team/${firstTeamId}`
            )
            .send({
              name:
                " beta "
            });


        expect(
          response.status
        ).toBe(
          400
        );

        expect(
          response.body.error
        ).toBe(
          "A team with that name already exists"
        );
      }
    );


    it(
      "deletes a team",
      async () => {
        const teamId =
          createTestTeam(
            "Alpha"
          );


        const response =
          await request(
            app
          )
            .delete(
              `/api/team/${teamId}`
            );


        expect(
          response.status
        ).toBe(
          200
        );

        expect(
          response.body
        ).toMatchObject({
          message:
            "Team deleted",
          teamId,
          teamName:
            "Alpha"
        });


        const teamsResponse =
          await request(
            app
          )
            .get(
              "/api/team"
            );


        expect(
          teamsResponse.body
        ).toEqual([]);
      }
    );


    it(
      "rejects deletion during an active auction",
      async () => {
        const teamId =
          createTestTeam(
            "Alpha"
          );

        const playerId =
          createTestPlayer();


        setGameState({
          status:
            "AUCTION",
          currentPlayerId:
            playerId,
          countdown:
            30
        });


        const response =
          await request(
            app
          )
            .delete(
              `/api/team/${teamId}`
            );


        expect(
          response.status
        ).toBe(
          400
        );

        expect(
          response.body.error
        ).toBe(
          "A team cannot be deleted during an active auction"
        );
      }
    );
  }
);
