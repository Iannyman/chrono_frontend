FROM node:24 AS base

RUN apt update && apt install -y less man-db
RUN apt upgrade -y

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm config set strict-ssl false && npm install

# --- Build ---
FROM base AS builder
COPY . .
RUN npm run build

# --- Production ---
FROM node:24 AS production

RUN apt update && apt install -y less man-db
RUN apt upgrade -y

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
