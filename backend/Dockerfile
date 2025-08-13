FROM node:22-alpine AS builder

RUN apk add --no-cache git
RUN corepack enable && \
  (corepack prepare pnpm@10.4.1 --activate || corepack prepare pnpm@10.4.1 --activate) && \
  npm install -g rimraf

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

FROM node:22-alpine

# Install system deps and ca-certificates
RUN apk update && apk add --no-cache ca-certificates dumb-init

WORKDIR /app

COPY package.json ./
COPY scripts ./scripts
RUN npm install

COPY --from=builder /app/build ./build
COPY --from=builder /app/src/modules ./src/modules

COPY --from=docker.io/tailscale/tailscale:stable /usr/local/bin/tailscaled /app/tailscaled
COPY --from=docker.io/tailscale/tailscale:stable /usr/local/bin/tailscale /app/tailscale
RUN mkdir -p /var/run/tailscale /var/cache/tailscale /var/lib/tailscale

COPY scripts/start-with-tailscale.sh /app/start-with-tailscale.sh
RUN chmod +x /app/start-with-tailscale.sh

ENV PORT=8080
ENV APP_PORT=8080

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=30s --start-period=60s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT}/health || exit 1

CMD ["/app/start-with-tailscale.sh"]
