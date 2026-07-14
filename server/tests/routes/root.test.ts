import request from "supertest";

import {
  describe,
  expect,
  it
} from "vitest";

import app from "../../src/app";


describe(
  "root route",
  () => {
    it(
      "returns the API identity",
      async () => {
        const response =
          await request(
            app
          )
            .get(
              "/"
            );


        expect(
          response.status
        ).toBe(
          200
        );

        expect(
          response.body
        ).toEqual({
          message:
            "Fantasy Auction Draft API"
        });
      }
    );
  }
);
