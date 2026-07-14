# Server Unit Tests

## Install

From `server/`:

```bash
npm install -D vitest @vitest/coverage-v8
```

`supertest` is only needed for the later integration-test suite.

## Package scripts

Add these entries to the `scripts` object in `server/package.json`:

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
}
```

## Run

```bash
npm test
```

Coverage:

```bash
npm run test:coverage
```

## Safety

The suite sets `FANTASY_DB_PATH` to:

```text
server/tests/.tmp/fantasy-test.db
```

It never opens or modifies:

```text
server/database/fantasy.db
```

The test database is rebuilt before each test and deleted after the suite.
