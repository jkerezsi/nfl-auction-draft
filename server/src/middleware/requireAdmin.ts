import type {
  NextFunction,
  Request,
  Response
} from "express";

import {
  verifyAdminToken
} from "../services/adminAuthService";


export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorization =
    req.header(
      "Authorization"
    );


  if (
    !authorization ||
    !authorization.startsWith(
      "Bearer "
    )
  ) {
    return res
      .status(401)
      .json({
        error:
          "Admin authentication required"
      });
  }


  const token =
    authorization
      .slice(
        "Bearer ".length
      )
      .trim();


  if (!token) {
    return res
      .status(401)
      .json({
        error:
          "Admin authentication required"
      });
  }


  try {
    verifyAdminToken(
      token
    );


    next();
  } catch (
    error: unknown
  ) {
    const message =
      error instanceof Error
        ? error.message
        : "Invalid admin session";


    return res
      .status(401)
      .json({
        error:
          message
      });
  }
}