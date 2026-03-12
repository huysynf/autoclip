#!/bin/bash

# Docker development environment startup script
# Designed specifically for development, resolves frontend vite issues

set -euo pipefail

echo "🚀 Starting AutoClip development environment..."

# Set environment variables
export PYTHONPATH=/app
export PYTHONUNBUFFERED=1

# Ensure data directories exist
mkdir -p /app/data/projects /app/data/uploads /app/data/temp /app/data/output /app/logs

# Activate virtual environment
source /app/venv/bin/activate

# Check and install frontend dependencies
echo "📦 Checking frontend dependencies..."
cd /app/frontend
if [ ! -d node_modules ] || [ ! -f node_modules/.bin/vite ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Verify vite is correctly installed
if [ ! -f node_modules/.bin/vite ]; then
    echo "❌ vite not installed correctly, reinstalling..."
    npm install vite
fi

# Return to root directory
cd /app

# Start backend service
echo "🔧 Starting backend service..."
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend service
echo "🌐 Starting frontend service..."
cd /app/frontend
npx vite --host 0.0.0.0 --port 3000 &
FRONTEND_PID=$!

# Return to root directory
cd /app

echo "✅ All services started"
echo "  Backend API:  http://localhost:8000"
echo "  Frontend UI:  http://localhost:3000"

# Wait for all processes
wait