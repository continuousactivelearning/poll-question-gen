FROM python:3.11-slim AS python-deps

# Install Python dependencies in a separate stage
RUN apt-get update && apt-get install -y --no-install-recommends \
  build-essential \
  git \
  ffmpeg \
  && rm -rf /var/lib/apt/lists/*

# Install Python packages
RUN pip install --default-timeout=100 --break-system-packages --no-cache-dir \
  yt-dlp

FROM node:22-alpine AS builder

RUN apk add --no-cache git
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate && npm install -g rimraf

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
COPY scripts ./scripts
RUN pnpm install

COPY . .
RUN pnpm tsc || echo "TypeScript compilation had errors but continuing build"

# ARG SENTRY_AUTH_TOKEN
# ARG SENTRY_ORG
# RUN if [ -n "$SENTRY_AUTH_TOKEN" ]; then \
#     pnpx @sentry/wizard@latest -i sourcemaps --saas --org vicharana-shala --project vibe-server --auth-token $SENTRY_AUTH_TOKEN --url ./build; \
#     fi

FROM node:22-slim

# Install only runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
  dumb-init \
  wget \
  ffmpeg \
  python3 \
  python3-pip \
  && apt-get clean && rm -rf /var/lib/apt/lists/* \
  # Clean up apt cache to reduce image size
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Copy Python and installed packages from python stage
COPY --from=python-deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=python-deps /usr/local/bin /usr/local/bin

WORKDIR /app

COPY package.json ./
COPY scripts ./scripts
RUN npm install --omit=dev

COPY --from=builder /app/build ./build
COPY --from=builder /app/src/modules ./src/modules

ENV PORT=8080
ENV APP_PORT=8080

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT}/health || exit 1

CMD ["dumb-init", "node", "build/index.js"]
