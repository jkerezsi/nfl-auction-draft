Library
/
PROJECT.md


# Fantasy Auction Draft

## Current Status

### MVP — In Progress

The core live auction flow is complete and usable. The remaining MVP work focuses on structured roster assignment, team administration, automated testing, and final draft-night validation.

---

## Completed

### Core Draft Flow

- ✅ Create teams
- ✅ Select a team on the player device
- ✅ Nominate players from the admin board
- ✅ Hidden sealed bidding
- ✅ Lock bids after submission
- ✅ Automatic countdown
- ✅ Automatic finish when all teams submit
- ✅ Automatic finish when the timer expires
- ✅ Winner calculation
- ✅ Deterministic bid tie-breaking
- ✅ Budget validation
- ✅ Budget deduction
- ✅ Mark won players as drafted
- ✅ Add won players to the team roster
- ✅ Prevent drafted players from being nominated again

### Realtime

- ✅ Socket.IO integration
- ✅ Live countdown updates
- ✅ Live auction state updates
- ✅ Live submitted-bid count
- ✅ Live winner reveal
- ✅ Automatic roster refresh
- ✅ Automatic budget refresh
- ✅ Reset updates broadcast to connected clients

### Player Experience

- ✅ Mobile-first player page
- ✅ Team selection
- ✅ Auction panel
- ✅ Countdown
- ✅ Bid submission and locking
- ✅ Win/Lose result state
- ✅ My Team panel
- ✅ Live roster updates
- ✅ Live budget updates

### Admin Experience

- ✅ Live draft board
- ✅ Team creation
- ✅ Player nomination
- ✅ Hidden bid count
- ✅ Winner and bid result display
- ✅ Position filters
- ✅ Reset Draft with two-step confirmation
- ✅ Shared PlayerCard in AdminPage
- ✅ Prevent nomination while an auction is active
- ✅ Prevent nomination of drafted players

### Shared Frontend Architecture

- ✅ Shared frontend types
- ✅ `useAuction` hook
- ✅ Shared `PlayerCard`
- ✅ Shared `TeamCard`
- ✅ Shared position color system
- ✅ `PlayerPage` refactor
- ✅ `AdminPage` refactor
- ✅ `TeamSelector` uses `TeamCard`
- ✅ Composition-based UI structure

### Player Data

- ✅ Overall rank
- ✅ Positional rank such as `RB12`
- ✅ NFL team
- ✅ Bye week
- ✅ Auction value / AAV
- ✅ Default starting budget changed to **$200**
- ✅ Auction values imported for all 250 current database players
- ✅ Reusable auction-value import script

### Reset Draft

Reset Draft currently:

- ✅ Stops an active auction timer
- ✅ Deletes all auction bids
- ✅ Deletes all roster entries
- ✅ Marks all players as undrafted
- ✅ Restores every team to the configured starting budget
- ✅ Clears current and previous auction state
- ✅ Returns the game to setup state
- ✅ Broadcasts the reset to connected clients

---

## Remaining MVP Tasks

### 1. Structured My Team Roster

Replace the current roster list with a fixed slot table in this order:

```text
QB
RB
RB
WR
WR
TE
FLEX
K
DST
BENCH1
BENCH2
BENCH3
BENCH4
BENCH5
BENCH6
```

The server must assign the first eligible empty slot when a player is won.

#### Eligibility and Assignment Priority

```text
QB  → QB → Bench
RB  → RB1 → RB2 → FLEX → Bench
WR  → WR1 → WR2 → FLEX → Bench
TE  → TE → FLEX → Bench
K   → K → Bench
DST → DST → Bench
```

Rules:

- FLEX may contain only `RB`, `WR`, or `TE`.
- QB, K, and DST may never fill FLEX.
- If all eligible starter slots are occupied, use the first empty bench slot.
- Slot assignment belongs on the server.
- The roster table should always render empty slots.
- Won players should appear in their assigned slot automatically.
- The roster should refresh live for the selected team.
- The server should reject a win if the full roster has no eligible empty slot.

### 2. Edit Teams from Admin Board

The commissioner must be able to edit a team's name.

Requirements:

- Add a backend team update service.
- Add a team update route.
- Validate the team ID.
- Trim the submitted name.
- Reject empty names.
- Preferably reject duplicate names case-insensitively.
- Broadcast the updated team state.
- Refresh the admin and player clients.
- Provide Save and Cancel controls in the admin board.

Suggested endpoint:

```http
PATCH /api/team/:teamId
```

### 3. Delete Teams from Admin Board

The commissioner must be able to delete a team safely.

Requirements:

- Add a backend team deletion transaction.
- Add a team deletion route.
- Use two-step confirmation in the admin UI.
- Disable deletion during an active auction.
- Delete the team's existing bids.
- Remove the team's roster entries.
- Mark players removed from that roster as undrafted.
- Prevent stale winner/current-game references.
- Broadcast the new game and team state.
- Refresh team, player, roster, and game data on connected clients.

Suggested endpoint:

```http
DELETE /api/team/:teamId
```

Deletion rules need to be finalized before implementation. The preferred MVP behavior is transactional cleanup rather than leaving orphaned bids or roster rows.

### 4. Unit Tests

Add focused unit tests for business rules.

Priority coverage:

- Position normalization, for example `RB12 → RB`
- FLEX eligibility
- Roster slot assignment
- Bench fallback
- Full-roster rejection
- Bid amount validation
- Team budget validation
- Duplicate bid rejection
- Winner selection
- Bid tie-breaking
- Team-name validation
- Reset Draft behavior
- Auction-value CSV parsing and validation

### 5. Integration Tests

Add integration tests against an isolated temporary SQLite database.

Priority flows:

- Create a team
- Rename a team
- Delete a team
- Nominate a player
- Submit bids
- Reject an invalid bid
- Resolve an auction
- Deduct the winning amount
- Mark the player drafted
- Assign the correct roster slot
- Return the updated roster
- Reset the draft
- Confirm all related tables are reset
- Confirm API error responses
- Confirm an unsafe operation is rejected

Preferred tooling:

- Vitest
- Supertest
- Temporary SQLite database
- Test-specific database setup and teardown

Tests must never use or modify `server/database/fantasy.db`.

### 6. Final Draft-Night Validation

- Mobile responsiveness testing
- Projector layout testing
- Long player-name testing
- Long team-name testing
- Empty-state testing
- Error-state testing
- Reconnect testing
- Reset during active auction testing
- Multiple-device synchronization testing

---

## Project Overview

Fantasy football auction draft application designed specifically for **live draft night**.

The commissioner controls the draft from the admin board while league members bid privately from their phones.

All bids remain hidden until the auction finishes.

---

## Tech Stack

### Backend

- Node.js
- Express
- TypeScript
- SQLite
- better-sqlite3
- Socket.IO

### Frontend

- React
- TypeScript
- Vite
- Axios
- Socket.IO Client

### Planned Testing

- Vitest
- Supertest
- Temporary SQLite test databases

---

## Backend Architecture

```text
Routes
    ↓
Services
    ↓
Database
```

Business logic belongs inside services.

The server is always the source of truth.

Important server responsibilities include:

- Auction state
- Bid validation
- Winner selection
- Budget changes
- Drafted status
- Roster slot assignment
- Team edit/delete transactions
- Draft reset

---

## Frontend Architecture

```text
pages/

AdminPage
PlayerPage
```

```text
components/

admin/
player/
```

```text
shared/

PlayerCard
TeamCard
```

```text
hooks/

useAuction
```

```text
services/

gameService
teamService
bidService
playerService
rosterService
```

```text
types/

game
team
player
roster
bid
```

---

## Current Data Model

### Game

Stores:

- Current status
- Current player
- Countdown
- Last winning team
- Last winning price
- Last winning player

### Teams

Stores:

- Team name
- Remaining budget
- Connection state
- Optional logo

Default starting budget:

```text
$200
```

### Draft Players

Stores:

- Overall rank
- Player name
- Positional rank
- NFL team
- Bye week
- Drafted state
- Auction value

### Auction Bids

Stores:

- Team
- Player
- Bid amount
- Submission time

Each team may submit only one bid for a given player.

### Roster

Currently stores:

- Team
- Player
- Player name
- Position
- Purchase price
- Slot

The next roster milestone will make `slot` a real fixed lineup slot such as `RB1`, `FLEX`, or `BENCH3`.

---

## Design Principles

- Server owns all game state.
- Hidden bids remain hidden until resolution.
- Routes stay thin.
- Services contain business logic.
- Database changes that affect multiple records use transactions.
- Composition over large components.
- Shared UI before duplication.
- One focused feature at a time.
- Optimize for draft night.
- Destructive commissioner actions require confirmation.
- Automated tests must use isolated databases.

---

## MVP Completion Criteria

The MVP is complete when:

- ✅ A full hidden-bid auction can be run live.
- ✅ The commissioner can filter and nominate players.
- ✅ Team budgets and rosters update automatically.
- ✅ The draft can be reset safely.
- ✅ Player cards show positional rank, bye week, overall rank, and AAV.
- ⏳ Won players are assigned to valid fixed roster slots.
- ⏳ The admin can rename and delete teams safely.
- ⏳ Core business rules have unit tests.
- ⏳ Main API and draft flows have integration tests.
- ⏳ Mobile and projector validation is complete.

---

## Post-MVP Backlog

### Commissioner Tools

- Undo last auction
- Draft complete screen
- Player search
- Pause/resume auction
- Commissioner authentication

### UI Polish

- Animations
- Improved loading states
- Improved error banners
- Keyboard shortcuts
- Countdown animations

### Future Expansion

- Configurable league settings
- Configurable budgets
- Configurable timer duration
- Configurable roster slots
- Improved annual player import pipeline
- Draft history
- Multiple saved drafts
- Docker deployment
- Cloud hosting

---

## Development Log

### 2026-07-12

Completed:

- Player architecture refactor
- `useAuction` hook
- Shared `PlayerCard`
- Shared `TeamCard`
- Position color system
- Mobile Player page
- Automatic roster refresh

### 2026-07-13

Completed:

- AdminPage migrated to shared `PlayerCard`
- TeamSelector migrated to shared `TeamCard`
- Admin position filtering
- Reset Draft backend and UI
- Default starting budget changed to $200
- Auction-value importer
- Auction values imported for all 250 current players
- Player cards enhanced with positional rank, NFL team, bye week, overall rank, and AAV

### 2026-07-14

MVP scope expanded to include:

- Structured fixed-slot roster
- Admin team rename
- Admin team deletion
- Unit tests
- Integration tests
- Final mobile and projector validation