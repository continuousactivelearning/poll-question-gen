#!/bin/sh
set -e

mkdir -p /tmp/tailscale
export TS_SOCKET_PATH=/tmp/tailscale/tailscaled.sock
export TS_STATE_DIR=/tmp/tailscale

echo "Starting tailscaled in userspace mode..."
# Run tailscaled with explicit socket path and state path in /tmp
/app/tailscaled \
  --tun=userspace-networking \
  --socket=$TS_SOCKET_PATH \
  --state=$TS_STATE_DIR/tailscaled.state \
  --port=41641 &

tailscaled_pid=$!

echo "Checking if tailscaled is running (PID: $tailscaled_pid)..."
ps -p $tailscaled_pid >/dev/null 2>&1 || { echo "ERROR: tailscaled failed to start"; exit 1; }

echo "Waiting for tailscaled to initialize..."
sleep 5

if [ -n "$TAILSCALE_AUTHKEY" ]; then
  echo "Authenticating with Tailscale..."
  /app/tailscale \
    --socket=$TS_SOCKET_PATH \
    up \
    --authkey="$TAILSCALE_AUTHKEY" \
    --hostname="poll-question-gen-backend" \
    --accept-routes \
    --netfilter-mode=off \
    --no-single-router \
    --reset \
    --no-dns \
    --timeout=30s
  
  echo "Checking Tailscale connection status..."
  timeout=45
  counter=0
  connected=false
  
  while [ $counter -lt $timeout ]; do
    if /app/tailscale --socket=$TS_SOCKET_PATH status | grep -q "Connected"; then
      connected=true
      break
    fi
    counter=$((counter+1))
    echo "Waiting for Tailscale connection... ($counter/$timeout)"
    sleep 1
  done
  
  if [ "$connected" = true ]; then
    echo "Tailscale connected successfully!"
    /app/tailscale --socket=$TS_SOCKET_PATH status
  else
    echo "WARNING: Timed out waiting for Tailscale connection, continuing anyway"
  fi

  if [ -z "$AI_SERVER_IP" ]; then
    export AI_SERVER_IP="100.100.108.13"
  fi
  echo "Using Ollama server at: $AI_SERVER_IP:11434"
  
  unset ALL_PROXY
  export AI_PROXY_ADDRESS=""
  echo "Direct connection configured (no proxy)"
else
  echo "ERROR: TAILSCALE_AUTHKEY environment variable is not set"
  exit 1
fi

echo "Starting Node.js application..."
exec node build/index.js
