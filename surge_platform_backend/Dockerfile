# -----------------------------
# Stage 1: Build
# -----------------------------
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install all dependencies
RUN bun install --frozen-lockfile

# Copy project files
COPY . .

# Generate Prisma Client
RUN bun run prisma generate

# Build NestJS application
RUN bun run build


# -----------------------------
# Stage 2: Production
# -----------------------------
FROM oven/bun:1-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package.json bun.lock ./

# Install only production dependencies
RUN bun install --production --frozen-lockfile

# Copy Prisma engine and generated client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy application files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Copy templates
COPY --from=builder /app/templates ./templates

# Expose application port
EXPOSE 3030

# Start application with Bun
CMD ["bun", "dist/main.js"]