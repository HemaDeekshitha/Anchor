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
# Apply every committed migration before accepting production traffic. TypeORM
# migrations are transactional, and a failure prevents the API from starting
# against a partially compatible schema.
CMD ["sh", "-c", "npm run migration:run && exec node dist/main.js"]
