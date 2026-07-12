# Current Sprint

## Sprint 1 — Frontend Architecture Refactor

### Status

- ✅ Shared frontend types
- ✅ TeamSelector component
- ✅ Countdown component
- ✅ AuctionPanel component
- ⏳ MyTeamPanel component
- ⏳ useAuction hook
- ⏳ PlayerPage cleanup

---

## Current Goal

Finish the frontend refactor without changing any application behavior.

After the refactor:

- PlayerPage should be a coordinator only.
- Business logic should move into `useAuction`.
- UI should be split into reusable components.
- No `any` types on the frontend.

---

## Current Blocker

MyTeamPanel currently displays **"Loading..."** after winning an auction.

Possible causes:

- roster is never loaded
- roster request fails
- PlayerPage does not refresh roster after auction resolution

Next debugging step:

- Inspect PlayerPage roster loading flow.

---

## Last Completed Milestone

AuctionPanel extracted from PlayerPage.

Completed:

- Team selection
- Countdown component
- Auction component

No behavior changes.

---

## Next Tasks

1. Fix roster loading.
2. Finish MyTeamPanel.
3. Create `useAuction` hook.
4. Simplify PlayerPage.
5. Test the complete player flow.

---

## Current Architecture

Backend

```
Routes
    ↓
Services
    ↓
SQLite
```

Frontend

```
PlayerPage
    │
    ├── TeamSelector
    ├── AuctionPanel
    ├── MyTeamPanel
    └── useAuction (planned)
```

---

## Definition of Done for this Sprint

- Team selection works.
- Auction works.
- Countdown works.
- Bid submission works.
- My Team updates automatically.
- PlayerPage contains only orchestration logic.