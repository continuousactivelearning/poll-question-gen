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
  
  echo "Testing Tailscale connection to Ollama server..."
  /app/tailscale ping -c 1 100.100.108.13 || echo "Warning: Cannot ping Ollama server. Network may not be fully established."
  
  sleep 5
else
  echo "TAILSCALE_AUTHKEY not set, skipping Tailscale up"
fi

export AI_SERVER_IP="100.100.108.13"
export AI_SERVER_PORT="11434"
export AI_PROXY_ADDRESS="socks5://localhost:1055"
echo "AI server connection configured with proxy: $AI_PROXY_ADDRESS"

exec dumb-init node build/index.js
