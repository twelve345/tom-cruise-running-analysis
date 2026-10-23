# syntax=docker/dockerfile:1
#
# Backend image. The build context is the REPOSITORY ROOT: the npm workspaces share one
# root package-lock.json, and `npm ci` needs it plus every workspace manifest to validate
# the lock graph. Base images are pinned by digest; Dependabot's docker ecosystem bumps them.
#
#   docker build -f backend/Dockerfile --target production .
#
# The production runtime follows the Abacus fleet pattern (abacus-fleet-control
# conventions §16): distroless Node 24 on Debian 13, built by a matching trixie builder.
# It has no shell or npm, so it starts a plain .js entrypoint.

# --------------------------------------------------------------------------- manifests
FROM node:26.11-trixie-slim@sha256:193fe51b64e77981119c98c2002c9e32a70e2f006fb4d25068ce0558998917f0 AS base
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json

# --------------------------------------------------------------------------- development
# Used by docker-compose.yml (`node --watch`). Installs devDependencies too.
# --ignore-scripts: no install-time lifecycle scripts run (a supply-chain worm vector).
FROM base AS development
RUN npm ci --ignore-scripts --workspace=backend
COPY backend ./backend
WORKDIR /app/backend
EXPOSE 4000
CMD ["npm", "run", "dev"]

# --------------------------------------------------------------------------- dependencies
# Production dependencies only. The source is copied after the install so any
# non-hoisted backend/node_modules survives (.dockerignore keeps the host's out).
FROM base AS dependencies
RUN npm ci --omit=dev --ignore-scripts --workspace=backend
COPY backend ./backend

# --------------------------------------------------------------------------- production
FROM gcr.io/distroless/nodejs24-debian13:nonroot@sha256:78f07ef1b5ea71ad7c055df15d0dd8997f2d288f9158623c4d4ae3d765b7d50d AS production
ENV NODE_ENV=production
WORKDIR /app
COPY --from=dependencies --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=dependencies --chown=nonroot:nonroot /app/backend ./backend
WORKDIR /app/backend
USER nonroot
EXPOSE 4000
# The distroless entrypoint is `node`, so CMD is the script to run.
CMD ["scripts/start-railway.js"]
