# Fantasy Auction Draft

A real-time Fantasy Football Auction Draft application built with React, TypeScript, Express, SQLite and Socket.IO.

The application provides a commissioner (Admin) interface for managing the auction and a player interface for submitting hidden bids from any device.

---

## Features

### Commissioner

- Create teams
- Edit teams
- Delete teams
- Nominate players
- Hidden auction bidding
- Automatic winner determination
- Live draft board
- Reset draft
- Live auction countdown
- Player search & filters
- Player cards with:
  - Position
  - Overall Rank
  - Bye Week
  - Auction Value ($)

### Players

- Select and remember team
- Hidden bidding
- Live auction updates
- Auction countdown
- Win/Loss screen
- Budget tracking
- My Team roster
- Responsive mobile interface

### Auction

- Hidden bids
- Highest bid wins
- Tie breaker = earliest bid
- Budget validation
- Automatic roster updates
- Automatic budget updates
- Automatic auction resolution when all teams submit

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Axios
- Socket.IO Client

### Backend

- Node.js
- Express
- TypeScript
- Socket.IO
- SQLite
- better-sqlite3

### Testing

- Vitest
- Supertest

---

## Installation

### Backend

```bash
cd server
npm install
npm run dev
```

Runs on:

```
http://localhost:3000
```

---

### Frontend

```bash
cd client
npm install
npm run dev
```

Runs on:

```
http://localhost:5173
```

---

## Import Players

```bash
npm run import:players
```

Imports:

- Rank
- Name
- Position
- NFL Team
- Bye Week

Auction Values can be imported separately using the included import script.

---

## Tests

Run all tests:

```bash
npm test
```

Run unit tests only:

```bash
npx vitest run tests/services
```

Run integration tests only:

```bash
npx vitest run tests/routes
```

Coverage:

```bash
npm run test:coverage
```

Current test suite:

- 56 automated tests
- Unit tests
- Integration tests
- End-to-end auction flow

---

## Architecture

```
client/
    React
    Components
    Hooks
    Services

server/
    Routes
    Services
    Database
    Socket.IO
    Tests

database/
    SQLite
```

---

## License

Personal project.