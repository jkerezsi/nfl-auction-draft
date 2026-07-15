import bcrypt from "bcryptjs";

import {
  afterAll,
  beforeAll,
  beforeEach,
  vi
} from "vitest";


process.env.FANTASY_DB_PATH =
  ":memory:";


process.env.ADMIN_PIN_HASH =
  bcrypt.hashSync(
    "4827",
    4
  );


process.env.ADMIN_JWT_SECRET =
  "test-admin-jwt-secret-that-is-at-least-32-characters";


process.env.ADMIN_SESSION_HOURS =
  "12";


vi.mock(
  "../src/socket/socket",
  () => ({
    broadcastGameUpdated:
      vi.fn(),

    broadcastTeamUpdated:
      vi.fn()
  })
);


vi.mock(
  "../src/services/auctionTimerService",
  () => ({
    startAuctionTimer:
      vi.fn(),

    stopAuctionTimer:
      vi.fn(),

    resumeAuctionTimer:
      vi.fn()
  })
);


beforeAll(
  async () => {
    const {
      initializeTestDatabase
    } =
      await import(
        "./helpers/database"
      );


    initializeTestDatabase();
  }
);


beforeEach(
  async () => {
    const {
      resetTestDatabase
    } =
      await import(
        "./helpers/database"
      );


    resetTestDatabase();


    vi.clearAllMocks();
  }
);


afterAll(
  async () => {
    const {
      db
    } =
      await import(
        "../src/database/connection"
      );


    db.close();
  }
);