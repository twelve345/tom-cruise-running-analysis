# backend/Dockerfile

# Base stage
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

# Development stage
FROM base AS development
COPY . .
EXPOSE 4000
CMD [ "npm", "run", "dev" ]

# Production stage
FROM base AS production
COPY . .
RUN npm ci --only=production
EXPOSE 4000
CMD [ "npm", "run", "start" ]