import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


interface AdminTokenPayload {
  role: "admin";
}


export interface AdminSession {
  token: string;
  expiresInSeconds: number;
}


function getAdminPinHash(): string {
  const pinHash =
    process.env.ADMIN_PIN_HASH;


  if (!pinHash) {
    throw new Error(
      "ADMIN_PIN_HASH is not configured"
    );
  }


  return pinHash;
}


function getJwtSecret(): string {
  const secret =
    process.env.ADMIN_JWT_SECRET;


  if (!secret) {
    throw new Error(
      "ADMIN_JWT_SECRET is not configured"
    );
  }


  if (
    secret.length < 32
  ) {
    throw new Error(
      "ADMIN_JWT_SECRET must contain at least 32 characters"
    );
  }


  return secret;
}


function getSessionHours(): number {
  const configuredHours =
    Number(
      process.env.ADMIN_SESSION_HOURS ??
      12
    );


  if (
    !Number.isFinite(
      configuredHours
    ) ||
    configuredHours <= 0
  ) {
    throw new Error(
      "ADMIN_SESSION_HOURS must be a positive number"
    );
  }


  return configuredHours;
}


export async function authenticateAdmin(
  pin: string
): Promise<AdminSession> {
  const normalizedPin =
    pin.trim();


  if (
    !/^\d{4,12}$/.test(
      normalizedPin
    )
  ) {
    throw new Error(
      "Invalid commissioner PIN"
    );
  }


  const matches =
    await bcrypt.compare(
      normalizedPin,
      getAdminPinHash()
    );


  if (!matches) {
    throw new Error(
      "Invalid commissioner PIN"
    );
  }


  const sessionHours =
    getSessionHours();


  const expiresInSeconds =
    Math.floor(
      sessionHours *
      60 *
      60
    );


  const token =
    jwt.sign(
      {
        role: "admin"
      } satisfies AdminTokenPayload,
      getJwtSecret(),
      {
        algorithm: "HS256",
        expiresIn:
          expiresInSeconds,
        issuer:
          "fantasy-auction-draft",
        audience:
          "fantasy-auction-admin"
      }
    );


  return {
    token,
    expiresInSeconds
  };
}


export function verifyAdminToken(
  token: string
): AdminTokenPayload {
  try {
    const payload =
      jwt.verify(
        token,
        getJwtSecret(),
        {
          algorithms: [
            "HS256"
          ],
          issuer:
            "fantasy-auction-draft",
          audience:
            "fantasy-auction-admin"
        }
      );


    if (
      typeof payload ===
        "string" ||
      payload.role !==
        "admin"
    ) {
      throw new Error(
        "Invalid admin session"
      );
    }


    return {
      role: "admin"
    };
  } catch {
    throw new Error(
      "Invalid or expired admin session"
    );
  }
}