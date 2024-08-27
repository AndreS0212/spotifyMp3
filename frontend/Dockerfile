# Use an official Node.js runtime as a parent image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

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
COPY migrate-and-start.sh .
RUN chmod +x migrate-and-start.sh
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
COPY migrate-and-start.sh .
# Ensure Node.js knows to run in production mode
ENV NODE_ENV production
# Expose the port that Next.js listens to
EXPOSE 3000

# Start the Next.js application
CMD ["./migrate-and-start.sh"]