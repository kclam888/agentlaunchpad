#!/bin/sh
set -ex # Add -x for verbose logging

echo "Waiting for PostgreSQL..."
./wait-for-it.sh postgres:5432 -- echo "PostgreSQL is up"

echo "Waiting for Redis..."
./wait-for-it.sh redis:6379 -- echo "Redis is up"

echo "Running database migrations..."
npx prisma migrate deploy

echo "Checking network..."
nc -zv localhost 3000 || echo "Port 3000 not yet listening"

echo "Starting the application..."
node server.js 