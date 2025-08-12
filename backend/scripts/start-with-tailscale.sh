#!/bin/sh
set -e

# Start Tailscale setup in the background
(mkdir -p /var/run/tailscale /var/cache/tailscale /var/lib/tailscale

echo "Starting tailscaled in background..."
tailscaled --state=/var/lib/tailscale/tailscaled.state --socket=/var/run/tailscale/tailscaled.sock &

sleep 2

if [ -n "$TAILSCALE_AUTHKEY" ]; then
  echo "Authenticating with Tailscale..."
  tailscale up --authkey="$TAILSCALE_AUTHKEY" --hostname="poll-question-gen-backend" --accept-routes
  
  echo "Waiting for Tailscale connection..."
  timeout=100
  counter=0
  connected=false
  while ! tailscale status | grep -q "Connected"; do
    if [ "$counter" -ge "$timeout" ]; then
      echo "Timed out waiting for Tailscale connection, but application will continue running"
      break
    fi
    counter=$((counter+1))
    echo "Waiting for Tailscale connection... ($counter/$timeout)"
    sleep 1
  done
  
  echo "Tailscale setup completed!"
  tailscale status
  
  if [ -n "$AI_SERVER_IP" ]; then
    echo "Using AI_SERVER_IP environment variable: $AI_SERVER_IP"
  else
    export AI_SERVER_IP="100.100.108.13"
    echo "AI_SERVER_IP was not set, using default Tailscale IP: $AI_SERVER_IP"
  fi
  
  export AI_PROXY_ADDRESS=""
  echo "Disabled proxy for direct Tailscale connection"
else
  echo "WARNING: TAILSCALE_AUTHKEY environment variable is not set, Tailscale will not be available"
fi) &

echo "Starting Node.js application..."
exec node build/index.js
