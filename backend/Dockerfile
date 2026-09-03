# BUILD STAGE
FROM node:20-alpine AS build
WORKDIR /app
# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code & build project
COPY . .
RUN npm run build

# STEP 2: Production stage
FROM node:20-alpine
WORKDIR /app
# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev
# Copy build output from STEP 1
COPY --from=build /app/dist ./dist
USER node
# Start the compiled API directly. Production schema migrations are applied by
# TypeORM during DataSource initialization when DATABASE_MIGRATIONS_RUN=true.
# This startup path never invokes npm or changes installed packages.
CMD ["node", "dist/main.js"]
