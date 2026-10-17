# Stage 1: Install dependencies and build
FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install

COPY . .
RUN DATABASE_URL="postgresql://neondb_owner:npg_uRSoWT1cD3Ha@ep-cold-feather-b5p228i5-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require" bun run prisma generate
RUN bun run build

# Stage 2: Production runner
FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/templates ./templates

EXPOSE 3030

CMD ["sh", "-c", "bun dist/src/main.js || bun dist/main.js"]