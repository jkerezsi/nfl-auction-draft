# Fantasy Auction Draft

## Current Status

### Sprint 2 — Mobile UX & Shared UI

#### Completed

- ✅ Shared frontend types
- ✅ TeamSelector
- ✅ Countdown
- ✅ AuctionPanel
- ✅ MyTeamPanel
- ✅ useAuction hook
- ✅ PlayerPage refactor
- ✅ Shared PlayerCard
- ✅ Shared TeamCard
- ✅ Position color system
- ✅ Mobile-first Player page
- ✅ Automatic roster refresh
- ✅ Automatic budget refresh

---

## Current Goal

Finish the shared UI system and polish the mobile/player experience before moving on to commissioner features.

After this sprint:

- AdminPage uses PlayerCard.
- TeamSelector uses TeamCard.
- Position colors are consistent throughout the application.
- Mobile UX is optimized.
- Shared components are reused across pages.

---

## Next Tasks

1. Apply PlayerCard to AdminPage.
2. Apply TeamCard to TeamSelector.
3. Mobile responsiveness testing.
4. Projector layout testing.
5. UI polish.

---

# Project Overview

Fantasy football auction draft application designed specifically for **live draft night**.

The commissioner controls the draft while league members bid privately on their phones.

All bids remain hidden until the auction ends.

---

# Tech Stack

## Backend

- Node.js
- Express
- TypeScript
- SQLite
- better-sqlite3
- Socket.IO

## Frontend

- React
- TypeScript
- Vite
- Axios
- Socket.IO Client

---

# Backend Architecture

```
Routes
    ↓
Services
    ↓
Database
```

Business logic belongs inside services.

The server is always the source of truth.

---

# Frontend Architecture

```
pages/

AdminPage
PlayerPage
```

```
components/

admin/
player/
shared/

PlayerCard
TeamCard
```

```
hooks/

useAuction
```

```
services/

gameService
teamService
bidService
playerService
rosterService
```

```
types/

game
team
player
roster
bid
```

---

# Current Features

## Teams

- Create teams
- Team selection
- Budget tracking

## Auction

- Nominate player
- Hidden sealed bids
- Automatic countdown
- Automatic finish when all teams submit
- Winner calculation
- Budget deduction
- Automatic roster update

## Player

- Mobile bidding
- Bid locking
- Countdown
- Win/Lose screen
- My Team
- Live roster updates

## Admin

- Live draft board
- Hidden bid count
- Winner reveal
- Prevent drafting already drafted players

## Realtime

- Socket.IO
- Live countdown
- Live auction updates
- Live roster refresh

---

# Roadmap

## Sprint 2

Shared UI

- PlayerCard everywhere
- TeamCard everywhere
- Mobile polish
- Projector polish

---

## Sprint 3

Undo Last Auction

- Restore budget
- Remove roster entry
- Undraft player
- Clear winner
- Return to waiting state

---

## Sprint 4

Commissioner Tools

- Search players
- Position filters
- Draft complete screen
- Reset draft

---

## Sprint 5

UI Polish

- Animations
- Better spacing
- Loading states
- Error banners
- Keyboard shortcuts
- Countdown animations

---

# Design Principles

- Server owns all game state.
- Hidden bids remain hidden.
- Routes stay thin.
- Services contain business logic.
- Composition over large components.
- Shared UI before duplication.
- One feature per commit.
- Optimize for draft night.

---

# Development Log

## 2026-07-12

Completed

- Player architecture refactor
- useAuction hook
- Shared PlayerCard
- Shared TeamCard
- Position color system
- Mobile Player page
- Automatic roster refresh