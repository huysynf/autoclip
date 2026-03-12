#!/bin/bash

# Docker container startup script
# Designed for Docker environment, handles permissions and configuration

set -euo pipefail

# Set environment variables
export PYTHONPATH=/app
export PYTHONUNBUFFERED=1

# Ensure data directories exist with correct permissions
mkdir -p /app/data/projects /app/data/uploads /app/data/temp /app/data/output /app/logs

# Initialize database if it doesn't exist
if [[ ! -f /app/data/autoclip.db ]]; then
    echo "Initializing database..."
    python -c "
import sys
sys.path.insert(0, '/app')
from backend.core.database import engine, Base
from backend.models import project, task, clip, collection, bilibili
try:
    Base.metadata.create_all(bind=engine)
    print('Database initialized successfully')
except Exception as e:
    print(f'Database initialization failed: {e}')
    sys.exit(1)
"
fi

# Check Redis connection
echo "Checking Redis connection..."
python -c "
import os
import redis
try:
    redis_url = os.getenv('REDIS_URL', 'redis://redis:6379/0')
    r = redis.Redis.from_url(redis_url, decode_responses=True)
    r.ping()
    print(f'Redis connected: {redis_url}')
except Exception as e:
    print(f'Redis connection failed: {e}')
    print('Falling back to SQLite storage')
"

# Start application
echo "Starting AutoClip application..."
exec "$@"