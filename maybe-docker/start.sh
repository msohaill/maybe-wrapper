#!/usr/bin/env bash

export PATH="/usr/local/bin:$PATH"

if docker info &> /dev/null ; then
  echo "Docker daemon is already running"
else
  echo "Starting Docker"
  open --background -a Docker

  while ! docker info &> /dev/null ; do
    sleep 0.2
  done
fi

if ! docker ps --format="{{.Names}}" | grep -q maybe- ; then
  docker compose -f "$(dirname "$0")/compose.yml" -p maybe-docker up --no-recreate --wait

  while ! curl http://localhost:3000 ; do
    sleep 0.1
  done
fi
