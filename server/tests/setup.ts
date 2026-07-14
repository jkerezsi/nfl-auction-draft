import {
  afterAll,
  beforeAll,
  beforeEach,
  vi
} from "vitest";


process.env.FANTASY_DB_PATH =
  ":memory:";


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
    } = await import(
      "./helpers/database"
    );


    initializeTestDatabase();
  }
);


beforeEach(
  async () => {
    const {
      resetTestDatabase
    } = await import(
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
    } = await import(
      "../src/database/connection"
    );


    db.close();
  }
);
