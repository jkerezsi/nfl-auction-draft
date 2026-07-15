import request from "supertest";

import {
  describe,
  expect,
  it
} from "vitest";

import app from "../../src/app";

import {
  TEST_ADMIN_PIN
} from "../helpers/adminAuth";


describe(
  "admin authentication routes",
  () => {
    it(
      "creates an admin session for the correct PIN",
      async () => {
        const response =
          await request(
            app
          )
            .post(
              "/api/admin-auth/login"
            )
            .send({
              pin:
                TEST_ADMIN_PIN
            });


        expect(
          response.status
        ).toBe(
          200
        );

        expect(
          response.body
        ).toMatchObject({
          authenticated:
            true,

          expiresInSeconds:
            43200
        });

        expect(
          typeof response.body.token
        ).toBe(
          "string"
        );
      }
    );


    it(
      "rejects an incorrect PIN",
      async () => {
        const response =
          await request(
            app
          )
            .post(
              "/api/admin-auth/login"
            )
            .send({
              pin:
                "9999"
            });


        expect(
          response.status
        ).toBe(
          401
        );

        expect(
          response.body.error
        ).toBe(
          "Invalid commissioner PIN"
        );
      }
    );


    it(
      "reports an authenticated session for a valid token",
      async () => {
        const loginResponse =
          await request(
            app
          )
            .post(
              "/api/admin-auth/login"
            )
            .send({
              pin:
                TEST_ADMIN_PIN
            });


        const response =
          await request(
            app
          )
            .get(
              "/api/admin-auth/session"
            )
            .set(
              "Authorization",
              `Bearer ${
                loginResponse.body.token
              }`
            );


        expect(
          response.status
        ).toBe(
          200
        );

        expect(
          response.body
        ).toEqual({
          authenticated:
            true
        });
      }
    );


    it(
      "reports an unauthenticated session without a token",
      async () => {
        const response =
          await request(
            app
          )
            .get(
              "/api/admin-auth/session"
            );


        expect(
          response.status
        ).toBe(
          200
        );

        expect(
          response.body
        ).toEqual({
          authenticated:
            false
        });
      }
    );
  }
);