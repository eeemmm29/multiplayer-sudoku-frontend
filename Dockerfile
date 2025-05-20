# Stage 1: Build the application
FROM node:23-alpine AS builder
WORKDIR /app

# Install dependencies
# Copy package.json and package-lock.json (if available)
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
# The NEXT_PUBLIC_BACKEND_URL can be passed during build time if needed,
# but it's usually better to set it at runtime.
# ARG NEXT_PUBLIC_BACKEND_URL
# ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
RUN npm run build

# Stage 2: Production image
FROM node:23-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy package.json and lock file to install only production dependencies
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev

# Copy necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.js ./next.config.js

# Expose the port the app runs on (default 3000)
EXPOSE 3000

# Command to run the application
# Use hostname "0.0.0.0" to accept connections from outside the container
CMD ["npm", "start", "--", "-H", "0.0.0.0"]
