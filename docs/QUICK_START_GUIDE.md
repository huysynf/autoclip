# 🚀 AI Clip Project Refactoring - Quick Start Guide

## 📋 Project Overview

AI Clip Tool is an AI-based automatic video clipping tool that can automatically split long videos into multiple highlight clips. This project is undergoing refactoring with the goal of establishing a modern backend architecture.

## 🎯 Refactoring Goals

1. **Data Persistence**: Introduce SQLite + SQLAlchemy for data management
2. **Service Modularization**: Refactor FastAPI to implement modular service management
3. **Task Scheduling**: Connect frontend and backend task scheduling system

## 🏗️ Project Structure

```
autoclip/
├── backend/                    # Backend service
│   ├── app/                   # FastAPI application
│   ├── api/                   # API routes
│   ├── core/                  # Core modules
│   ├── models/                # Data models
│   ├── services/              # Business services
│   └── tasks/                 # Task queue
├── frontend/                   # Frontend application
├── shared/                     # Shared code
├── docs/                       # Documentation
└── data/                       # Data files
```

## 🛠️ Development Environment Setup

### Required Tools
- Python 3.9+
- Node.js 16+
- Redis
- Git

### Installation Steps

1. **Clone the project**
```bash
git clone <repository-url>
cd autoclip
```

2. **Backend environment setup**
```bash
cd backend
# Install Poetry (if not installed)
curl -sSL https://install.python-poetry.org | python3 -

# Install dependencies
poetry install

# Activate virtual environment
poetry shell
```

3. **Frontend environment setup**
```bash
cd frontend
npm install
```

4. **Start Redis**
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu
sudo apt-get install redis-server
sudo systemctl start redis
```

## 🚀 Quick Start

### 1. Start backend service
```bash
cd backend
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start frontend service
```bash
cd frontend
npm run dev
```

### 3. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 📚 Development Guide

### Backend Development

#### Adding new API routes
1. Create a new route file under `backend/api/v1/`
2. Register the route in `backend/app/main.py`
3. Implement corresponding service logic under `backend/services/`

```python
# backend/api/v1/example.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.services.example_service import ExampleService

router = APIRouter()

@router.get("/example")
async def get_example(db: Session = Depends(get_db)):
    service = ExampleService(db)
    return service.get_examples()
```

#### Adding new data models
1. Create a new model file under `backend/models/`
2. Inherit from `Base` class and add necessary fields
3. Run database migration

```python
# backend/models/example.py
from sqlalchemy import Column, String, DateTime
from backend.models.base import Base, TimestampMixin

class Example(Base, TimestampMixin):
    __tablename__ = "examples"
    
    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(500))
```

#### Adding new services
1. Create a new service file under `backend/services/`
2. Implement business logic
3. Add error handling and logging

```python
# backend/services/example_service.py
from sqlalchemy.orm import Session
from backend.models.example import Example
from backend.schemas.example import ExampleCreate

class ExampleService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_example(self, example_data: ExampleCreate) -> Example:
        example = Example(**example_data.dict())
        self.db.add(example)
        self.db.commit()
        self.db.refresh(example)
        return example
```

### Frontend Development

#### Adding new pages
1. Create a new page component under `frontend/src/pages/`
2. Add the new page to route configuration
3. Add link to navigation menu

```typescript
// frontend/src/pages/ExamplePage.tsx
import React from 'react';
import { Card, Table } from 'antd';

const ExamplePage: React.FC = () => {
  return (
    <Card title="Example Page">
      <Table />
    </Card>
  );
};

export default ExamplePage;
```

#### Adding new API calls
1. Add API methods under `frontend/src/services/`
2. Use API calls in components
3. Add error handling and loading states

```typescript
// frontend/src/services/api.ts
export const exampleApi = {
  getExamples: async (): Promise<Example[]> => {
    const response = await apiService.get('/examples');
    return response.data;
  },
  
  createExample: async (data: ExampleCreate): Promise<Example> => {
    const response = await apiService.post('/examples', data);
    return response.data;
  }
};
```

## 🧪 Testing Guide

### Run backend tests
```bash
cd backend
poetry run pytest
```

### Run frontend tests
```bash
cd frontend
npm test
```

### Run end-to-end tests
```bash
# Start all services
npm run test:e2e
```

## 📊 Database Operations

### Create migration
```bash
cd backend
alembic revision --autogenerate -m "Describe changes"
```

### Apply migration
```bash
alembic upgrade head
```

### Rollback migration
```bash
alembic downgrade -1
```

## 🔧 Common Commands

### Development commands
```bash
# Start backend development server
poetry run uvicorn app.main:app --reload

# Start frontend development server
npm run dev

# Build frontend
npm run build

# Run tests
poetry run pytest
npm test
```

### Database commands
```bash
# Create migration
alembic revision --autogenerate -m "Description"

# Apply migration
alembic upgrade head

# View migration history
alembic history
```

### Deployment commands
```bash
# Build Docker image
docker build -t autoclip .

# Run Docker container
docker run -p 8000:8000 autoclip
```

## 🐛 Common Issues

### 1. Database connection failure
**Issue**: Cannot connect to database
**Solution**:
- Check if database file exists
- Confirm database permission settings
- Check database connection string

### 2. Redis connection failure
**Issue**: Celery cannot connect to Redis
**Solution**:
- Confirm Redis service is running
- Check Redis connection configuration
- Confirm Redis port is not occupied

### 3. Frontend build failure
**Issue**: npm run build fails
**Solution**:
- Clear node_modules and reinstall
- Check TypeScript type errors
- Confirm all dependencies are installed

### 4. API call failure
**Issue**: Frontend cannot call backend API
**Solution**:
- Confirm backend service is running
- Check CORS configuration
- Verify API endpoint path

## 📞 Get Help

### Documentation Resources
- [Refactoring Implementation Plan](./REFACTOR_IMPLEMENTATION_PLAN.md)
- [Work Items Breakdown](./WORK_ITEMS_BREAKDOWN.md)
- [Project Management](./PROJECT_MANAGEMENT.md)

### Tech Stack Documentation
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Celery Documentation](https://docs.celeryproject.org/)
- [React Documentation](https://reactjs.org/docs/)

### Issue Feedback
- Create GitHub Issue
- Contact project maintainers
- Check project Wiki

## 🎉 Next Steps

1. **Familiarize with project structure**: Read code and documentation
2. **Set up development environment**: Configure environment following the steps above
3. **Run examples**: Start services and test functionality
4. **Start development**: Choose work items to begin development
5. **Submit code**: Follow project coding standards

---

**Documentation Version**: 1.0  
**Created**: December 2024  
**Last Updated**: December 2024
