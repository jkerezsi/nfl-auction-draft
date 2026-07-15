import request from "supertest";

import app from "../../src/app";


export const TEST_ADMIN_PIN =
  "4827";


export async function getAdminToken():
  Promise<string> {
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


  if (
    response.status !== 200 ||
    typeof response.body?.token !==
      "string"
  ) {
    throw new Error(
      `Could not create test admin session: ${
        JSON.stringify(
          response.body
        )
      }`
    );
  }


  return response.body.token;
}


export async function getAdminAuthorizationHeader():
  Promise<string> {
  const token =
    await getAdminToken();


  return `Bearer ${token}`;
}