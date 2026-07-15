Library
/
PROJECT_UPDATED.md


# Fantasy Auction Draft

## Project Status

**Status:** MVP Complete ✅

The application is ready to run a live fantasy football auction draft. Core functionality, commissioner tools, mobile player flows, automated tests, and real-time synchronization are complete.

---

# MVP

## Commissioner

- ✅ Create teams
- ✅ Edit teams
- ✅ Delete teams
- ✅ Nominate players
- ✅ Filter players by position
- ✅ Live auction board
- ✅ Hidden bid count
- ✅ Winner reveal
- ✅ Reset Draft with confirmation
- ✅ Prevent nomination of drafted players
- ✅ Prevent unsafe team deletion during an active auction

## Player

- ✅ Choose and remember team
- ✅ Mobile-first auction page
- ✅ Hidden sealed bid submission
- ✅ Bid locking after submission
- ✅ Live countdown
- ✅ Win/Lose result state
- ✅ Budget display
- ✅ My Team roster
- ✅ Automatic roster refresh
- ✅ Automatic budget refresh
- ✅ Improved Choose Your Team screen

## Draft Logic

- ✅ Hidden sealed bids
- ✅ Highest bid wins
- ✅ Earliest bid wins ties
- ✅ Budget validation
- ✅ Automatic winner calculation
- ✅ Automatic finish when all teams submit
- ✅ Automatic finish when countdown expires
- ✅ Budget deduction
- ✅ Roster update
- ✅ Player drafted-state update
- ✅ Reset Draft
- ✅ Stale local bid-lock cleanup after reset

## Player Data

- ✅ Player name
- ✅ NFL team
- ✅ Positional rank
- ✅ Overall rank
- ✅ Bye week
- ✅ Auction value / AAV
- ✅ Default starting budget of **$200**
- ✅ Reusable auction-value import utility

## Shared UI

- ✅ Shared `PlayerCard`
- ✅ Shared `TeamCard`
- ✅ Shared position color system
- ✅ Shared frontend types
- ✅ `useAuction` hook
- ✅ Refactored PlayerPage
- ✅ Refactored AdminPage
- ✅ TeamSelector using TeamCard

## Realtime

- ✅ Socket.IO integration
- ✅ Live countdown updates
- ✅ Live game-state updates
- ✅ Live submitted-bid count
- ✅ Live winner reveal
- ✅ Live roster updates
- ✅ Live budget updates
- ✅ Reset synchronization across connected clients

## Testing

- ✅ Unit tests
- ✅ Integration tests
- ✅ Full auction-flow tests
- ✅ Isolated in-memory SQLite database
- ✅ Production database protected from tests

### Current automated test status

- **56 tests passed**
- **12 test files passed**
- **0 failures**

### Services covered

- `bidService`
- `teamService`
- `gameService`
- `rosterService`
- `playerService`

### API routes covered

- Team
- Player
- Game
- Bid
- Roster
- Complete draft flow

---

# Post MVP

## 1. Structured Fantasy Roster — 2–3 days

Replace the current roster list with fixed lineup slots:

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

Rules:

- FLEX accepts only RB, WR, or TE.
- Server assigns the first eligible empty slot.
- Overflow moves to the first empty bench slot.
- Empty slots remain visible.
- Slot assignment remains server-owned.

## 2. Release Drafted Player — 1–2 days

Allow a drafted player to be released after an auction.

The operation must:

- Remove the player from the roster.
- Refund the amount paid.
- Mark the player as undrafted.
- Return the player to the player pool.
- Run in one database transaction.
- Be unavailable during an active auction.
- Require confirmation.

This replaces the need for an Undo Previous Auction feature.

## 3. Commissioner PIN Authentication — 0.5–1 day

Protect the Admin page with a simple commissioner PIN.

Recommended approach:

- No accounts.
- No usernames.
- One league-level PIN.
- Store a hashed PIN on the server.
- Issue a short-lived admin session after successful entry.
- Require the session for destructive or commissioner-only routes.

## 4. League Settings — 1–2 days

Allow the commissioner to configure:

- Starting budget
- Auction timer duration

Roster configuration is intentionally excluded.

## 5. Team Logos / Branding — 0.5–1 day

Allow fantasy teams to have:

- Uploaded logo or selected icon
- Team color or simple branding
- Logo shown in TeamSelector, Admin, and My Team

## 6. In-App Player Notifications — 1 day

Show temporary notifications for important events:

- Bid submitted
- Player won
- Player lost
- New player nominated
- Connection lost
- Connection restored

## 7. Optional Sound Effects — 0.5–1 day

Optional sounds, disabled by default:

- Final countdown
- Player won
- Draft complete

Each player can enable or disable sounds locally.

## 8. ESPN PDF Player Data Import — 4–6 days

Allow the commissioner to upload an ESPN fantasy football cheat-sheet PDF before the draft.

The importer should parse:

- Player name
- NFL team
- AAV
- Bye week
- Positional ranking
- Overall ranking

Recommended workflow:

1. Upload PDF.
2. Parse player records.
3. Show preview.
4. Report invalid or ambiguous rows.
5. Back up the database.
6. Replace or rebuild the preseason player pool.
7. Block full replacement once the draft has started.

## 9. Team Auto-Bid Profiles — 4–6 days

Allow an absent manager to provide a CSV or Excel file containing personal maximum bids before the draft.

### Auto-bid rules

- Maximum 1 QB
- Maximum 1 TE
- Maximum 1 K
- Maximum 1 DST
- Once one of those positions is filled, the engine stops bidding for that position.
- All remaining roster spots are filled using RB or WR.
- Auto-bids remain hidden.
- Auto-bidding is server-controlled.
- The commissioner can enable or disable auto-bidding per team.

### Budget protection

The engine must reserve at least `$1` for every remaining roster spot.

```text
maximumSafeBid =
  currentBudget -
  remainingSpotsAfterWinning
```

The submitted bid is:

```text
min(uploadedMaximumBid, maximumSafeBid)
```

This prevents an auto-managed team from reaching `$0` while roster spots remain empty.

### Roster completion

- If an uploaded value exists, use the capped value.
- If a required position is still empty and no value exists, submit a `$1` fallback bid.
- If only RB/WR spots remain, use `$1` fallback bids when needed to finish the roster.
- Position availability is assumed sufficient.

### Import workflow

1. Select fantasy team.
2. Upload CSV or Excel.
3. Match rows to current players.
4. Preview matched, invalid, duplicate, and unmatched entries.
5. Confirm import.
6. Enable auto-bid mode for that team.

---

# Nice to Have

## Update Existing Players from ESPN PDF — 2–3 days

Update the current player database without replacing it.

The update should preserve:

- Player IDs
- Drafted state
- Roster ownership
- Bid history
- Team budgets
- Sale prices

It may update:

- NFL team
- Positional rank
- Overall rank
- Bye week
- AAV

The preview should show:

- Matched
- Unmatched
- Ambiguous
- Changed
- Unchanged

## Draft Complete Screen — 0.5–1 day

Show a dedicated completion view with:

- Total drafted players
- Final team budgets
- Final team rosters
- Start New Draft action

## Auction Reaction GIFs — 1 day

Show a random local GIF during auction results:

- Overpay GIF when final price is more than 10% above AAV
- Good-deal GIF when final price is more than 10% below AAV
- No GIF for fair-price results
- No GIF when AAV is zero
- GIF disappears when the next nomination starts

## Admin Toast Notifications — 0.5 day

Examples:

- Team created
- Team renamed
- Team deleted
- Draft reset
- Player nominated

## Loading Skeletons — 0.5 day

Replace basic loading text with lightweight skeleton UI.

## Improved Confirmation Dialogs — 0.5–1 day

Use consistent custom confirmation UI for destructive actions.

## Socket Connection Indicator — 0.5 day

Show:

- Connected
- Reconnecting
- Offline

## Draft Analytics — 3–5 days

Possible views:

- Spending by position
- AAV versus sale price
- Remaining budgets
- Best bargains
- Largest overpays

## CSV Export — 1 day

Export final results with:

- Team
- Player
- Position
- Paid price
- AAV
- Difference from AAV

---

# Not Planned

- Pause / Resume Auction
- Undo Previous Auction
- Multiple Commissioners
- Draft History
- Search My Team
- Dark Mode
- Keeper League Support
- Dynasty League Support
- Auction Value Recommendations
- Roster configuration in League Settings

---

# Architecture

## Backend

```text
Routes
    ↓
Services
    ↓
Database
```

Principles:

- Server owns all game state.
- Routes remain thin.
- Services contain business logic.
- Multi-record changes use transactions.
- Hidden bids remain private until auction resolution.
- Tests never touch the production database.

## Frontend

```text
pages/
  AdminPage
  PlayerPage

components/
  admin/
  player/

shared/
  PlayerCard
  TeamCard

hooks/
  useAuction

services/
  gameService
  teamService
  bidService
  playerService
  rosterService
```

---

# Current Milestone

## MVP Complete ✅

The application can run a complete live fantasy football auction draft with:

- Commissioner team management
- Hidden sealed bidding
- Live countdown and results
- Budget and roster updates
- Rich player data
- Reset functionality
- Responsive player experience
- Automated unit and integration tests

Future work focuses on draft flexibility, automation, annual player-data maintenance, and entertainment features.