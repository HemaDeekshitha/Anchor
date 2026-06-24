# BUILD STAGE
FROM node:18-alpine AS build
WORKDIR /app
# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code & build project
COPY . .
RUN npm run build

# STEP 2: Production stage
FROM node:18-alpine
WORKDIR /app
# Install only production dependencies
COPY package*.json ./
RUN npm install --only=production
# Copy build output from STEP 1
COPY --from=build /app/dist ./dist
# Start the NestJS app
CMD ["node","dist/main.js"]

