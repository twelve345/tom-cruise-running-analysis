# syntax=docker/dockerfile:1
#
# Frontend image. The build context is the REPOSITORY ROOT: the npm workspaces share one
# root package-lock.json, and `npm ci` needs it plus every workspace manifest to validate
# the lock graph. Base images are pinned by digest; Dependabot's docker ecosystem bumps them.
#
#   docker build -f frontend/Dockerfile --target production \
#     --build-arg VITE_API_URL=https://<backend>/graphql .
#
# The serving runtime follows the Abacus fleet pattern (abacus-fleet-control conventions
# §16): nginx assembled from Wolfi packages into a scratch image, unprivileged, on :8080.

# --------------------------------------------------------------------------- dependencies
FROM node:26.11-trixie-slim@sha256:193fe51b64e77981119c98c2002c9e32a70e2f006fb4d25068ce0558998917f0 AS base
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json
# --ignore-scripts: no install-time lifecycle scripts run (a supply-chain worm vector);
# nothing this build needs relies on one.
RUN npm ci --ignore-scripts --workspace=frontend

# --------------------------------------------------------------------------- development
# Used by docker-compose.yml (Vite dev server).
FROM base AS development
COPY frontend ./frontend
WORKDIR /app/frontend
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# --------------------------------------------------------------------------- build
FROM base AS build
COPY frontend ./frontend
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
# Refuse to build a production bundle that would silently fall back to localhost.
RUN if [ -z "$VITE_API_URL" ]; then \
      echo "ERROR: VITE_API_URL build argument is required for production builds"; \
      echo "Usage: docker build -f frontend/Dockerfile --build-arg VITE_API_URL=<your-api-url> ."; \
      exit 1; \
    fi
RUN npm run build --workspace=frontend

# --------------------------------------------------------------------------- rootfs
# The serving runtime's whole filesystem, assembled by apk into /rootfs so the scratch
# stage carries exactly these packages and their database (image scanners read it).
# nginx comes from a version line, so every build takes Wolfi's newest security rebuild.
# --no-scripts: nothing here needs an install hook; the runtime user is added by hand.
FROM cgr.dev/chainguard/wolfi-base:latest@sha256:256c88bb066424045021090932d50be93c8e3f2ce3586707702a401b146f3e43 AS rootfs
RUN apk add --no-cache --no-scripts --root /rootfs --initdb \
      --keys-dir /etc/apk/keys --repositories-file /etc/apk/repositories \
      wolfi-baselayout "nginx-mainline~1.31" \
    && echo 'nginx:x:65532:65532:nginx:/usr/share/nginx/html:/sbin/nologin' >> /rootfs/etc/passwd \
    && echo 'nginx:x:65532:' >> /rootfs/etc/group \
    && install -d -m 1777 /rootfs/tmp

# --------------------------------------------------------------------------- production
FROM scratch AS production
COPY --from=rootfs /rootfs/ /
# nginx-main.conf keeps every runtime write under /tmp or on stdio, so the unprivileged
# user needs no writable system paths.
COPY frontend/nginx-main.conf /etc/nginx/nginx.conf
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html
# A scratch image inherits no environment.
ENV PATH="/usr/bin:/bin"
USER 65532:65532
EXPOSE 8080
CMD ["/usr/bin/nginx", "-e", "stderr", "-g", "daemon off;"]
