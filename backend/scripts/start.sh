#!/bin/sh
set -e

# Start tailscaled in the background
/app/tailscaled --tun=userspace-networking --socks5-server=localhost:1055 &

TAILSCALED_PID=$!

# Wait a few seconds to ensure tailscaled is ready
sleep 5

# Bring Tailscale up if auth key is provided
if [ -n "$TAILSCALE_AUTHKEY" ]; then
  /app/tailscale up --authkey="$TAILSCALE_AUTHKEY" --accept-routes --accept-dns --hostname="gcp-poll"
  echo "Tailscale is up and running"
else
  echo "TAILSCALE_AUTHKEY not set, skipping Tailscale up"
fi

exec dumb-init node build/index.js
