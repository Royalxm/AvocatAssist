#!/bin/bash

# Script to initialize the database

echo "Running database initialization script..."
cd "$(dirname "$0")/.." && node scripts/init-db.js

echo "Database initialization completed!"
