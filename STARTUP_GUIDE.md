# AutoClip System Startup Guide

## 📋 Overview

AutoClip is an AI-powered video clipping and processing system with a separated frontend/backend architecture. This guide will help you quickly start and run the entire system.

## 🚀 Quick Start

### 1. One-Click Launch (Recommended)

```bash
# Full startup (with detailed checks and health monitoring)
./start_autoclip.sh

# Quick startup (development environment, skips detailed checks)
./quick_start.sh
```

### 2. System Management

```bash
# Check system status
./status_autoclip.sh

# Stop all services
./stop_autoclip.sh
```

## 📊 System Architecture

### Backend Services
- **FastAPI**: RESTful API and WebSocket support
- **Celery**: Asynchronous task queue
- **Redis**: Message broker and cache
- **SQLite**: Data storage

### Frontend Services
- **React**: User interface
- **Vite**: Development server
- **TypeScript**: Type safety

## 🔧 Requirements

### System Requirements
- macOS or Linux
- Python 3.8+
- Node.js 16+
- Redis server

### Installing Dependencies

```bash
# 1. Create virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Install frontend dependencies
cd frontend
npm install
cd ..

# 4. Install Redis (macOS)
brew install redis
brew services start redis

# 5. Configure environment variables
cp env.example .env
# Edit the .env file and fill in the necessary configuration
```

## 📝 Configuration Files

### Environment Variables (.env)

```bash
# Database configuration
DATABASE_URL=sqlite:///./data/autoclip.db

# Redis configuration
REDIS_URL=redis://localhost:6379/0

# API configuration
API_DASHSCOPE_API_KEY=your_api_key_here
API_MODEL_NAME=qwen-plus

# Logging configuration
LOG_LEVEL=INFO
ENVIRONMENT=development
DEBUG=true
```

## 🌐 Service Ports

| Service | Port | Description |
|---------|------|-------------|
| Frontend UI | 3000 | React development server |
| Backend API | 8000 | FastAPI server |
| Redis | 6379 | Message broker |
| API Docs | 8000/docs | Swagger UI |

## 📁 Directory Structure

```
autoclip/
├── backend/                 # Backend code
│   ├── api/                # API routes
│   ├── core/               # Core configuration
│   ├── models/             # Data models
│   ├── services/           # Business logic
│   └── tasks/              # Celery tasks
├── frontend/               # Frontend code
│   ├── src/                # Source code
│   └── public/             # Static assets
├── data/                   # Data storage
│   ├── projects/           # Project data
│   └── uploads/            # Uploaded files
├── logs/                   # Log files
├── scripts/                # Utility scripts
└── *.sh                    # Startup scripts
```

## 🔍 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check port usage
   lsof -i :8000
   lsof -i :3000
   
   # Kill the process using the port
   kill -9 <PID>
   ```

2. **Redis connection failed**
   ```bash
   # Check Redis status
   redis-cli ping
   
   # Start Redis
   brew services start redis  # macOS
   systemctl start redis      # Linux
   ```

3. **Python dependency issues**
   ```bash
   # Reinstall dependencies
   pip install -r requirements.txt --force-reinstall
   ```

4. **Frontend dependency issues**
   ```bash
   # Clean and reinstall
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

### Viewing Logs

```bash
# View all logs
tail -f logs/*.log

# View logs for a specific service
tail -f logs/backend.log
tail -f logs/frontend.log
tail -f logs/celery.log
```

### System Status Check

```bash
# Detailed status check
./status_autoclip.sh

# Manually check services
curl http://localhost:8000/api/v1/health/
curl http://localhost:3000/
redis-cli ping
```

## 🛠️ Development Mode

### Backend Development

```bash
# Activate virtual environment
source venv/bin/activate

# Set Python path
export PYTHONPATH="${PWD}:${PYTHONPATH}"

# Start backend (development mode)
python -m uvicorn backend.main:app --reload --port 8000
```

### Frontend Development

```bash
# Navigate to frontend directory
cd frontend

# Start development server
npm run dev
```

### Celery Worker

```bash
# Start Worker
celery -A backend.core.celery_app worker --loglevel=info

# Start Beat scheduler
celery -A backend.core.celery_app beat --loglevel=info

# Start Flower monitoring
celery -A backend.core.celery_app flower --port=5555
```

## 📈 Performance Optimization

### Production Configuration

1. **Database optimization**
   - Use PostgreSQL instead of SQLite
   - Configure connection pooling
   - Enable query caching

2. **Redis optimization**
   - Configure memory limits
   - Enable persistence
   - Set expiration policies

3. **Celery optimization**
   - Adjust concurrency
   - Configure task routing
   - Enable result backend

## 🔒 Security Configuration

### Production Security

1. **Environment variables**
   - Use strong passwords
   - Rotate keys regularly
   - Restrict API access

2. **Network security**
   - Configure firewall
   - Use HTTPS
   - Restrict CORS

3. **Data security**
   - Regular backups
   - Encrypt sensitive data
   - Access control

## 📞 Support

If you encounter any issues, please:

1. Check the log files
2. Run the status check script
3. Review the environment configuration
4. Refer to the Troubleshooting section

## 📄 License

This project is licensed under the MIT License.
