FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY index.html tsconfig.json vite.config.ts ./
COPY public ./public
COPY scripts ./scripts
COPY src ./src

RUN npm run build

FROM node:22-alpine AS runtime

LABEL com.receipts.local="true"
LABEL org.opencontainers.image.title="receipts-local"

WORKDIR /app

ENV PORT=4173

COPY --from=build /app/dist ./dist
COPY scripts/serve-dist.mjs ./scripts/serve-dist.mjs

EXPOSE 4173

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:${PORT}/receipts/ >/dev/null || exit 1

CMD ["node", "scripts/serve-dist.mjs"]
