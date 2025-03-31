#!/bin/bash

# Script to start both backend and frontend development servers

echo "Starting AvocatAssist development servers..."

# Check if concurrently is installed
if ! command -v concurrently &> /dev/null; then
    echo "concurrently is not installed. Installing..."
    npm install -g concurrently
fi

# Start both servers using concurrently
concurrently \
    "cd back && npm run dev" \
    "cd front && npm start"

# Alternative method if concurrently doesn't work
# Open two terminal windows/tabs and run:
# Terminal 1: cd back && npm run dev
# Terminal 2: cd front && npm start
