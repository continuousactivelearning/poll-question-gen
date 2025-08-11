#!/bin/sh
set -e

mkdir -p /var/run/tailscale /var/cache/tailscale /var/lib/tailscale

echo "Starting tailscaled..."
tailscaled --state=/var/lib/tailscale/tailscaled.state --socket=/var/run/tailscale/tailscaled.sock &

# Wait for the daemon to start
sleep 2

if [ -n "$TAILSCALE_AUTHKEY" ]; then
  echo "Authenticating with Tailscale..."
  tailscale up --authkey="$TAILSCALE_AUTHKEY" --hostname="poll-question-gen-backend" --accept-routes
else
  echo "ERROR: TAILSCALE_AUTHKEY environment variable is not set"
  exit 1
fi

echo "Waiting for Tailscale connection..."
timeout=30
counter=0
while ! tailscale status | grep -q "Connected"; do
  if [ "$counter" -ge "$timeout" ]; then
    echo "Timed out waiting for Tailscale to connect"
    exit 1
  fi
  counter=$((counter+1))
  sleep 1
done

echo "Tailscale connected successfully!"
tailscale status

if [ -n "$AI_SERVER_IP" ]; then
  echo "Setting OLLAMA_HOST environment variable to $AI_SERVER_IP"
  export OLLAMA_HOST="$AI_SERVER_IP"
else
  echo "WARNING: AI_SERVER_IP environment variable is not set"
fi

echo "Starting Node.js application..."
exec dumb-init node build/index.js
