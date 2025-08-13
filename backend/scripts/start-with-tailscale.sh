#!/bin/sh
set -e

echo "Starting tailscaled in userspace mode..."
/app/tailscaled --tun=userspace-networking --state=mem: &

sleep 2

if [ -n "$TAILSCALE_AUTHKEY" ]; then
  echo "Authenticating with Tailscale..."
  /app/tailscale up \
    --authkey="$TAILSCALE_AUTHKEY" \
    --hostname="poll-question-gen-backend" \
    --accept-routes \
    --netfilter-mode=off \
    --no-single-router \
    --reset \
    --no-dns
  
  echo "Waiting for Tailscale connection..."
  timeout=60
  counter=0
  while ! /app/tailscale status | grep -q "Connected"; do
    if [ "$counter" -ge "$timeout" ]; then
      echo "Timed out waiting for Tailscale connection, but application will continue running"
      break
    fi
    counter=$((counter+1))
    echo "Waiting for Tailscale connection... ($counter/$timeout)"
    sleep 1
  done
  
  echo "Tailscale setup completed!"
  /app/tailscale status

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
