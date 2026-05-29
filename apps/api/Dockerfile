FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
RUN npm install --workspace=@placepro/api --workspace=@placepro/database --workspace=@placepro/shared 2>/dev/null || npm install

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run db:generate -w @placepro/database 2>/dev/null || true
RUN npm run build -w @placepro/api 2>/dev/null || true

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app .
EXPOSE 4000
CMD ["npm", "run", "dev", "-w", "@placepro/api"]
