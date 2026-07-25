# Docker build for Render / Railway / any Docker host
# Installs Node 20 + Chromium (for Puppeteer PDF generation) + Prisma

FROM node:20-slim AS base

# Install Chromium and dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to use the installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copy package files first (better Docker layer caching)
COPY package.json package-lock.json* ./

# Install all dependencies (including dev for prisma generate)
RUN npm install

# Copy Prisma schema and generate client
COPY src/prisma/db/schema.prisma ./src/prisma/db/
RUN npx prisma generate --schema=src/prisma/db/schema.prisma

# Copy application source
COPY . .

# Remove dev dependencies to keep image small
RUN npm prune --omit=dev

# Copy and make entrypoint executable (runs prisma db push on each start)
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["./docker-entrypoint.sh"]
