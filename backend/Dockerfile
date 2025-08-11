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

# Install system deps, Python build tools, and Tailscale dependencies
RUN apk add --no-cache dumb-init git wget ca-certificates iptables ip6tables tzdata

WORKDIR /app

COPY package.json ./
COPY scripts ./scripts
RUN npm install

COPY --from=builder /app/build ./build

COPY --from=builder /app/src/modules ./src/modules

# Install Tailscale
RUN wget https://pkgs.tailscale.com/stable/tailscale_1.60.0_amd64.tgz && \
  tar xzf tailscale_1.60.0_amd64.tgz && \
  cp tailscale_1.60.0_amd64/tailscaled /usr/sbin/tailscaled && \
  cp tailscale_1.60.0_amd64/tailscale /usr/bin/tailscale && \
  rm -rf tailscale_1.60.0_amd64*

# Create startup script for Tailscale and Node.js
COPY scripts/start-with-tailscale.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/start-with-tailscale.sh

ENV PORT=8080
ENV APP_PORT=8080

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT}/health || exit 1

CMD ["/usr/local/bin/start-with-tailscale.sh"]
