#!/usr/bin/env bash

# load from .env file
export $(egrep -v '^#' .env | xargs)

# bring up and run app
docker-compose build
docker-compose up --no-build --timeout 1 -d
sleep 10
docker-compose run js node /app/index.js
docker-compose down --rmi local -v
docker-compose rm -f
