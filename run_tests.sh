#!/bin/bash

# Build and run the test environment
docker compose -f docker-compose.test.yml down -v
docker compose -f docker-compose.test.yml build
docker compose -f docker-compose.test.yml up --abort-on-container-exit

# Print out the test results
echo "Test run completed" 