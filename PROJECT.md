# Fantasy Auction Draft

## Current Sprint

### Sprint 1 — Frontend Architecture Refactor

#### Status

- ✅ Shared frontend types
- ✅ TeamSelector component
- ✅ Countdown component
- ✅ AuctionPanel component
- ⏳ MyTeamPanel component
- ⏳ useAuction hook
- ⏳ PlayerPage cleanup

---

### Current Goal

Complete the frontend refactor **without changing application behavior**.

After this sprint:

- PlayerPage is only responsible for orchestration.
- Business logic lives in `useAuction`.
- UI is split into reusable components.
- No `any` types on the frontend.

---

### Current Blocker

MyTeamPanel currently displays **"Loading..."** after winning an auction.

Possible causes:

- roster never loads
- roster request fails
- PlayerPage does not refresh roster after auction completion

Next step:

- Inspect roster loading inside PlayerPage.

---

### Last Completed Milestone

AuctionPanel extracted successfully.

Completed:

- Team selection
- Countdown
- Auction UI

No behavior changes.

---

### Next Tasks

1. Fix roster loading.
2. Finish MyTeamPanel.
3. Create `useAuction`.
4. Simplify PlayerPage.
5. Test the complete player flow.

---

### Definition of Done

- Team selection works.
- Auction works.
- Countdown works.
- Bid submission works.
- My Team refreshes automatically.
- PlayerPage is mostly orchestration.

---

# Project Overview

Fantasy football auction draft application where:

- Commissioner controls the draft.
- Players bid privately on their phones.
- A projector displays the live auction.
- Bids remain hidden until the auction ends.

The application is designed specifically for **live draft night**.

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

Routes stay thin.

Business logic belongs in services.

The server is always the source of truth.

---

# Frontend Architecture

```
pages/

AdminPage
PlayerPage
```

```
components/player/

TeamSelector
Countdown
AuctionPanel
MyTeamPanel
```

```
hooks/

useAuction (planned)
```

```
services/

gameService
bidService
teamService
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

# Database

Main tables

- draft_players
- teams
- roster
- auction_bids
- game

Game stores

- current player
- countdown
- current auction
- last winner
- winning price
- winning player

---

# Current Features

## Teams

- Create teams
- Team budgets
- Team selection

## Auction

- Nominate player
- Hidden sealed bids
- One bid per team
- Server countdown
- Automatic resolution
- Finish immediately when all teams submit
- Budget deduction
- Add winner to roster

## Mobile

- Join team
- Live countdown
- Submit bid
- Bid locking
- WIN / LOSE screen

## Admin

- Projector board
- Live countdown
- Submitted bid counter
- Reveal bids after auction
- Prevent nominating drafted players

## Realtime

- Socket.IO
- Live countdown
- Live auction updates
- Live winner announcement

---

# Remaining Roadmap

## Sprint 1

Frontend Refactor

- Shared types
- MyTeamPanel
- useAuction
- PlayerPage cleanup

---

## Sprint 2

My Team

- Live roster
- Budget remaining
- Money spent
- Player count

---

## Sprint 3

Undo Last Auction

- Restore budget
- Remove roster entry
- Undraft player
- Clear last winner
- Waiting state

---

## Sprint 4

Admin Board Polish

- Better projector layout
- Better countdown
- Better winner reveal
- Better auction result presentation

---

## Sprint 5

Commissioner Tools

- Search players
- Position filter
- Draft complete screen
- Reset draft

---

## Sprint 6

UI Polish

- Better spacing
- Mobile improvements
- Loading indicators
- Error banners
- Keyboard shortcuts
- Countdown animation

---

# Design Principles

- Server owns all game state.
- Hidden bids remain hidden until auction completion.
- Routes stay thin.
- Services contain business logic.
- Prefer composition over large React components.
- Refactor before files become too large.
- One feature per commit.
- One milestone at a time.
- Optimize for the real draft-night experience.

---

# Git Commit Style

Examples

```
feat: realtime countdown

feat: my team roster

feat: undo last auction

refactor: split player page

refactor: extract auction panel

fix: roster refresh after auction
```

---

# Version 1.0 Checklist

## Player

- [x] Team selection
- [x] Hidden bidding
- [x] Countdown
- [x] Win / Lose screen
- [ ] My Team

## Admin

- [x] Team management
- [x] Nominate player
- [x] Big-screen board
- [x] Reveal bids
- [ ] Undo Last Auction
- [ ] Search
- [ ] Position filters

## System

- [x] Socket.IO
- [x] Server countdown
- [x] Automatic auction resolution
- [x] Automatic finish when everyone submits

---

# Development Log

## 2026-07-12

Completed

- Server-owned countdown
- Hidden sealed bidding
- Automatic auction resolution
- Projector-style admin board
- Shared frontend types
- TeamSelector extraction
- Countdown extraction
- AuctionPanel extraction

Current work

- MyTeamPanel