#!/usr/bin/env bash

export PATH="/usr/local/bin:$PATH"

stopDocker=$1

docker compose -f "$(dirname "$0")/compose.yml" stop

if [ "$stopDocker" = "true" ]; then
  osascript -e 'quit app "Docker Desktop"'
fi
