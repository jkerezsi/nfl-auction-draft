# API Integration Tests

The integration tests use Supertest against `src/app.ts`. No network port is opened.

The same in-memory SQLite database setup used by the unit tests is reused and reset before every test.

## Included route coverage

- Root API route
- Team create/list/update/delete
- Player listing
- Game state, nomination, and reset
- Roster retrieval
- Bid submission
- Hidden bids before result
- Bid reveal after result
- Automatic resolution when all teams bid
- Complete auction flow

## Required application change

`src/app.ts` contains the Express application.

`src/server.ts` is responsible only for:

- database initialization
- HTTP server creation
- Socket.IO initialization
- listening on port 3000
- resuming an auction timer

This prevents Supertest from opening a real port or starting timers.

## Run all tests

```bash
npm test
```

## Integration tests only

```bash
npx vitest run tests/routes
```

## Unit tests only

```bash
npx vitest run tests/services
```

## Coverage

```bash
npm run test:coverage
```
