FROM node:22-bookworm-slim AS client-build

WORKDIR /app/client

COPY client/package.json client/package-lock.json ./
RUN npm ci --registry=https://registry.npmjs.org/

COPY client ./
RUN npm run build


FROM node:22-bookworm-slim AS server-build

WORKDIR /app/server

COPY server/package.json server/package-lock.json ./
RUN npm ci --registry=https://registry.npmjs.org/

COPY server ./
RUN npm run build


FROM node:22-bookworm-slim AS production

ENV NODE_ENV=production

WORKDIR /app/server

COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev --registry=https://registry.npmjs.org/

COPY --from=server-build /app/server/dist ./dist
COPY --from=client-build /app/client/dist ./public

RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "dist/server.js"]