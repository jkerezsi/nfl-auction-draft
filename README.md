# Fantasy Auction Draft

A real-time fantasy football auction draft application built for live draft night.

Players bid privately on their phones while the commissioner controls the draft from a projector screen.

Hidden sealed bidding keeps every auction fair and exciting until the countdown ends.

---

## Features

### Player Experience

- Join a fantasy team
- Submit hidden bids
- Live countdown
- Automatic bid locking
- Win/Lose result screen
- Live roster updates
- Remaining budget tracking

### Commissioner Experience

- Manage teams
- Nominate players
- Live auction board
- Hidden bid counter
- Reveal winning bid
- Prevent duplicate drafting

### Realtime

- Socket.IO synchronization
- Live countdown
- Live auction updates
- Automatic roster refresh
- Automatic budget updates

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

---

## Architecture

### Backend

```
Routes
    ↓
Services
    ↓
SQLite
```

### Frontend

```
Pages
    ↓
Hooks
    ↓
Shared Components
    ↓
Services
```

The server owns all game state.

Business logic stays on the backend.

The frontend focuses on presentation and user interaction.

---

## Project Structure

```
src/

components/
    admin/
    player/
    shared/

hooks/
    useAuction/

pages/

services/

types/

utils/
```

---

## Core Design Principles

- Server is the single source of truth.
- Hidden bids remain hidden until the auction ends.
- Shared UI components instead of duplication.
- Thin pages.
- Composition over inheritance.
- Mobile-first experience.
- Optimize for real draft night.

---

## Current Status

### Completed

- Team management
- Hidden bidding
- Live countdown
- Automatic auction resolution
- Live roster updates
- Mobile player interface
- Shared PlayerCard
- Shared TeamCard

### In Progress

- Admin UI polish
- Shared UI rollout
- Commissioner tools

---

## Planned Features

- Undo last auction
- Search players
- Position filters
- Draft completion screen
- Draft reset
- Enhanced projector layout

---

## Development

### Install

```bash
npm install
```

### Backend

```bash
npm run dev
```

### Frontend

```bash
npm run dev
```

---

## Vision

The goal of this project is to create the best possible live fantasy football auction draft experience.

The application is designed around three principles:

- Fast
- Mobile-first
- Realtime