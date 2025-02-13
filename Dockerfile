# Stage 1: Build the application
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Create the final image
FROM alpine:3.18

# Install Node.js and npm
RUN apk add --no-cache nodejs npm

# Set working directory
WORKDIR /app

# Copy built application from the build stage
COPY --from=build /app .

# Install production dependencies
RUN npm install --only=production

# Expose the necessary port
EXPOSE 8081

# Start the application
CMD ["npm", "run", "serve"]
