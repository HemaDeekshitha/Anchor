# BUILD STAGE
FROM node:20-alpine AS build
WORKDIR /app
# Install dependencies
COPY package*.json ./
RUN npm ci --no-audit

# Copy source code & build project
COPY . .
RUN npm run build

# STEP 2: Production stage
FROM node:20-alpine
WORKDIR /app
# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --no-audit
# Copy build output from STEP 1
COPY --from=build /app/dist ./dist
# Default migrations on in the image itself. data-source.ts only enables them
# for the exact string "true", so an older deployed compose file that predates
# this variable would silently skip migrations and leave the API failing its
# readiness probe. Compose can still override this to "false".
ENV DATABASE_MIGRATIONS_RUN=true
USER node
# Start the compiled API directly. Production schema migrations are applied by
# TypeORM during DataSource initialization when DATABASE_MIGRATIONS_RUN=true.
# This startup path never invokes npm or changes installed packages.
CMD ["node", "dist/main.js"]
