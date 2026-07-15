import {
  Router
} from "express";

import {
  authenticateAdmin,
  verifyAdminToken
} from "../services/adminAuthService";


const router =
  Router();


router.post(
  "/login",
  async (
    req,
    res
  ) => {
    try {
      const pin =
        typeof req.body?.pin ===
          "string"
          ? req.body.pin
          : "";


      const session =
        await authenticateAdmin(
          pin
        );


      res.json({
        authenticated:
          true,

        token:
          session.token,

        expiresInSeconds:
          session.expiresInSeconds
      });
    } catch (
      error: unknown
    ) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not authenticate administrator";


      const configurationError =
        message.includes(
          "is not configured"
        ) ||
        message.includes(
          "must contain"
        ) ||
        message.includes(
          "ADMIN_SESSION_HOURS"
        );


      res
        .status(
          configurationError
            ? 500
            : 401
        )
        .json({
          error:
            configurationError
              ? "Admin authentication is not configured"
              : "Invalid commissioner PIN"
        });
    }
  }
);


router.get(
  "/session",
  (
    req,
    res
  ) => {
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
      return res.json({
        authenticated:
          false
      });
    }


    const token =
      authorization
        .slice(
          "Bearer ".length
        )
        .trim();


    try {
      verifyAdminToken(
        token
      );


      return res.json({
        authenticated:
          true
      });
    } catch {
      return res.json({
        authenticated:
          false
      });
    }
  }
);


export default router;