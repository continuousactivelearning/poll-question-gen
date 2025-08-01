FROM node:22-slim AS builder

# Install git and corepack
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && corepack enable \
    && corepack prepare pnpm@10.4.1 --activate \
    && npm install -g rimraf \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
COPY scripts ./scripts
RUN pnpm install

COPY . .
RUN pnpm tsc || echo "TypeScript compilation had errors but continuing build"

# Uncomment if Sentry integration is needed
# ARG SENTRY_AUTH_TOKEN
# ARG SENTRY_ORG
# RUN if [ -n "$SENTRY_AUTH_TOKEN" ]; then \
#     pnpx @sentry/wizard@latest -i sourcemaps --saas --org vicharana-shala --project vibe-server --auth-token $SENTRY_AUTH_TOKEN --url ./build; \
#     fi

# ---- Final Stage ----
FROM node:22-slim

# Install dependencies for whisper, ffmpeg, yt-dlp
RUN apt-get update && apt-get install -y \
    dumb-init \
    git \
    wget \
    ffmpeg \
    python3 \
    python3-pip \
    build-essential \
    && python3 -m pip install --no-cache-dir --upgrade pip setuptools wheel \
    && pip3 install yt-dlp \
    && pip3 install --no-cache-dir git+https://github.com/openai/whisper.git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Enable corepack and install rimraf again (runtime)
RUN corepack enable \
    && corepack prepare pnpm@10.4.1 --activate \
    && npm install -g rimraf

WORKDIR /app

COPY package.json ./
COPY scripts ./scripts
RUN npm install

COPY --from=builder /app/build ./build
COPY --from=builder /app/src/modules ./src/modules

ENV PORT=8080
ENV APP_PORT=8080

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT}/health || exit 1

CMD ["dumb-init", "node", "build/index.js"]
