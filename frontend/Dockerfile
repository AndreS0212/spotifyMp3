# Use an official Node.js runtime as a parent image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app
# Declare build arguments
ARG DATABASE_URL
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG CLERK_SECRET_KEY
ARG NEXT_PUBLIC_CLERK_SIGN_IN_URL
ARG NEXT_PUBLIC_CLERK_SIGN_UP_URL
ARG NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
ARG NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
ARG BACKEND_URL

# Set environment variables from build arguments
ENV DATABASE_URL=$DATABASE_URL
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV CLERK_SECRET_KEY=$CLERK_SECRET_KEY
ENV NEXT_PUBLIC_CLERK_SIGN_IN_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_URL
ENV NEXT_PUBLIC_CLERK_SIGN_UP_URL=$NEXT_PUBLIC_CLERK_SIGN_UP_URL
ENV NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=$NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
ENV NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=$NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
ENV BACKEND_URL=$BACKEND_URL
# Copy package.json and package-lock.json
COPY package.json package-lock.json ./
# Set SKIP_ENV_VALIDATION to skip environment variable validation
ENV SKIP_ENV_VALIDATION=true
# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Copy the Prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Build the ext.js application
RUN npm run build
# Production stage to reduce image size
FROM node:18-alpine AS runner

# Set working directory
WORKDIR /app

# Copy the built Next.js application and node_modules from the builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY prisma ./prisma/
COPY --chown=nextjs:nodejs prisma ./prisma/
# Ensure Node.js knows to run in production mode
ENV NODE_ENV production
# Expose the port that Next.js listens to
EXPOSE 3000

# Start the Next.js application
CMD ["node","server.js"]