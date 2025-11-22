# frontend/Dockerfile

# Base stage
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

# Development stage
FROM base AS development
COPY . .
EXPOSE 5173
CMD [ "npm", "run", "dev", "--", "--host" ]

# Build stage
FROM base AS build
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
# Validate that VITE_API_URL is set to prevent building with localhost fallback
RUN if [ -z "$VITE_API_URL" ]; then \
      echo "ERROR: VITE_API_URL build argument is required for production builds"; \
      echo "Usage: docker build --build-arg VITE_API_URL=<your-api-url> ..."; \
      exit 1; \
    fi
RUN npm run build

# Production stage
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]