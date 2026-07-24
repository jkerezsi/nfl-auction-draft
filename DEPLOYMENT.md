# Production Deployment Preparation

## What changed

- Added production TypeScript build and start scripts for the server.
- Made the server use Railway's `PORT` and bind to `0.0.0.0`.
- Added the `/api/health` endpoint.
- Configured Express to serve the Vite build in production.
- Added an SPA fallback so `/admin` can be opened or refreshed directly.
- Changed the browser API URL to same-origin `/api` by default.
- Changed Socket.IO to use the current browser origin by default.
- Added a multi-stage production `Dockerfile`.
- Added `.dockerignore` and strengthened `.gitignore`.

## Local build

Install clean dependencies first. Do not rely on copied `node_modules` directories.

```bash
npm ci --prefix client
npm ci --prefix server
npm run build
```

## Local Docker test

Generate a production admin PIN hash using the server script, then run:

```bash
docker build -t bigballers .

docker run --rm \
  -p 3000:3000 \
  -e PORT=3000 \
  -e FANTASY_DB_PATH=/app/data/fantasy.db \
  -e ADMIN_PIN_HASH='YOUR_BCRYPT_HASH' \
  -e ADMIN_JWT_SECRET='A_LONG_RANDOM_PRODUCTION_SECRET' \
  -e ADMIN_JWT_EXPIRES_IN='12h' \
  -v bigballers-data:/app/data \
  bigballers
```

Open:

- `http://localhost:3000`
- `http://localhost:3000/admin`
- `http://localhost:3000/api/health`

## Railway environment variables

```env
NODE_ENV=production
FANTASY_DB_PATH=/app/data/fantasy.db
ADMIN_PIN_HASH=<production bcrypt hash>
ADMIN_JWT_SECRET=<long random production secret>
ADMIN_JWT_EXPIRES_IN=12h
```

Do not commit `.env` files or production secrets.

Mount the Railway persistent volume at:

```text
/app/data
```

Use this health-check path:

```text
/api/health
```
