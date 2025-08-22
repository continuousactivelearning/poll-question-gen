#!/bin/sh
set -e

echo "Starting Tailscale daemon with SOCKS5 proxy on localhost:1055..."
/app/tailscaled --tun=userspace-networking --socks5-server=localhost:1055 --verbose=1 &

TAILSCALED_PID=$!

sleep 10

# test connection to Ollama server
test_ollama_connection() {
  echo "Testing Tailscale connection to Ollama server..."
  if /app/tailscale ping -c 1 100.100.108.13 > /dev/null 2>&1; then
    echo " Successfully connected to Ollama server!"
    return 0
  else
    echo " Cannot ping Ollama server. Network may not be fully established."
    return 1
  fi
}

# Bring Tailscale up if auth key is provided
if [ -n "$TAILSCALE_AUTHKEY" ]; then
  echo "Authenticating Tailscale with provided auth key..."
  /app/tailscale up --authkey="$TAILSCALE_AUTHKEY" --accept-routes --accept-dns --hostname="gcp-poll"
  echo "Tailscale is up and running"
  
  echo "Waiting for Tailscale network to stabilize..."
  sleep 10
  
  MAX_RETRIES=5
  RETRY_COUNT=0
  CONNECTION_ESTABLISHED=false
  
  while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if test_ollama_connection; then
      CONNECTION_ESTABLISHED=true
      break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "Retry $RETRY_COUNT of $MAX_RETRIES. Waiting before next attempt..."
    sleep 5
  done
  
  if [ "$CONNECTION_ESTABLISHED" = "false" ]; then
    echo "WARNING: Could not establish connection to Ollama server after $MAX_RETRIES attempts."
    echo "The application will continue, but AI features may not work correctly."
  fi
  
  echo "Verifying SOCKS proxy is operational..."
  netstat -tulpn | grep 1055 || echo "Warning: SOCKS proxy not detected on port 1055"
  
  sleep 5
else
  echo "TAILSCALE_AUTHKEY not set, skipping Tailscale up"
fi

export AI_SERVER_IP="100.100.108.13"
export AI_SERVER_PORT="11434"
export AI_PROXY_ADDRESS="socks5://localhost:1055"
export NODE_TLS_REJECT_UNAUTHORIZED="0" # Disable TLS verification for internal connections
echo "AI server connection configured with proxy: $AI_PROXY_ADDRESS"

exec dumb-init node build/index.js
