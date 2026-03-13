# Simple Progress System Implementation Guide

## Overview

This is a simplified progress synchronization system based on the "keep it simple and stable" philosophy, using fixed stages + fixed weights to drive progress, no longer relying on complex subscription mechanisms.

## Core Features

- **Fixed Stages**: 6 predefined stages, each with fixed weight
- **Simple Polling**: Frontend polls progress via HTTP API, no WebSocket needed
- **Redis Storage**: Backend uses Redis to store progress snapshots, supports persistence
- **Minimal Events**: Send one event per stage transition, maximum 6 times

## System Architecture

### Backend Components

1. **`backend/services/simple_progress.py`** - Core progress service
   - Stage definition and weight calculation
   - Redis storage and event publishing
   - Progress snapshot management

2. **`backend/api/v1/simple_progress.py`** - API interface
   - `/api/v1/simple-progress/snapshot` - Batch get progress snapshots
   - `/api/v1/simple-progress/snapshot/{project_id}` - Single project progress
   - `/api/v1/simple-progress/stages` - Get stage configuration

3. **`backend/services/simple_pipeline_adapter.py`** - Pipeline adapter
   - Integrate progress reporting into existing pipeline
   - Automatically send stage transition events

### Frontend Components

1. **`frontend/src/stores/useSimpleProgressStore.ts`** - State management
   - Zustand state management
   - Polling control
   - Progress data caching

2. **`frontend/src/components/SimpleProgressBar.tsx`** - Progress bar component
   - Single project progress display
   - Batch project progress display
   - Auto-polling integration

3. **`frontend/src/components/SimpleProjectCard.tsx`** - Project card
   - Integrated progress display
   - State management
   - Action buttons

## Stage Definition

```python
STAGES = [
    ("INGEST", 10),        # Download/Ready
    ("SUBTITLE", 15),      # Subtitle/Alignment  
    ("ANALYZE", 20),       # Semantic Analysis/Outline
    ("HIGHLIGHT", 25),     # Segment Location/Scoring
    ("EXPORT", 20),        # Export/Packaging
    ("DONE", 10),          # Validation/Archive
]
```

## Progress Calculation

```python
def compute_percent(stage: str, subpercent: Optional[float] = None) -> int:
    # Accumulate previous stage weights
    done = 0
    for s in ORDER:
        if s == stage:
            break
        done += WEIGHTS[s]
    
    # Current stage
    cur = WEIGHTS.get(stage, 0)
    
    if subpercent is None:
        return min(100, done + cur) if stage == "DONE" else min(99, done)
    else:
        return min(99, done + int(cur * subpercent / 100))
```

## Event Format

```json
{
  "project_id": "46ab50a6-....",
  "stage": "HIGHLIGHT", 
  "percent": 70,
  "message": "Segment location completed, 12 candidate segments found",
  "ts": 1640995200
}
```

## Usage

### Backend Integration

1. **Send progress events in pipeline**:
```python
from backend.services.simple_progress import emit_progress

# Stage transition
emit_progress(project_id, "ANALYZE", "Starting content analysis")

# With sub-progress
emit_progress(project_id, "ANALYZE", "Analyzing (50%)", subpercent=50)
```

2. **Use simplified pipeline adapter**:
```python
from backend.services.simple_pipeline_adapter import create_simple_pipeline_adapter

adapter = create_simple_pipeline_adapter(project_id, task_id)
result = adapter.process_project_sync(video_path, srt_path)
```

### Frontend Integration

1. **Use progress state management**:
```typescript
import { useSimpleProgressStore } from '../stores/useSimpleProgressStore'

const { startPolling, stopPolling, getProgress } = useSimpleProgressStore()

// Start polling
startPolling(['project-1', 'project-2'], 2000)

// Get progress
const progress = getProgress('project-1')
```

2. **Use progress bar component**:
```tsx
import { SimpleProgressBar } from '../components/SimpleProgressBar'

<SimpleProgressBar
  projectId="project-1"
  autoStart={true}
  pollingInterval={2000}
  showDetails={true}
  onProgressUpdate={(progress) => console.log(progress)}
/>
```

3. **Use project card component**:
```tsx
import { SimpleProjectCard } from '../components/SimpleProjectCard'

<SimpleProjectCard
  project={project}
  onStartProcessing={handleStart}
  onViewDetails={handleView}
  onDelete={handleDelete}
  onRetry={handleRetry}
/>
```

## API Interfaces

### Get Progress Snapshots

```bash
# Batch get
GET /api/v1/simple-progress/snapshot?project_ids=project-1&project_ids=project-2

# Single get
GET /api/v1/simple-progress/snapshot/project-1
```

### Get Stage Configuration

```bash
GET /api/v1/simple-progress/stages
```

## Configuration Options

### Polling Interval
- Default: 2000ms (2 seconds)
- Recommended range: 1000-5000ms
- Can be adjusted based on network conditions

### Stage Weights
- Total weight: 100
- Can adjust individual stage weights to match actual processing time
- Weight allocation should consider actual time consumption of each stage

## Error Handling

### Redis Connection Failure
- System will log warning messages
- Progress event sending will be skipped
- Frontend polling will return empty data

### Network Interruption
- Frontend polling will automatically retry
- Progress data will be cached in local state
- Automatic sync when network recovers

### Stage Exceptions
- Support failure state detection
- Automatically mark as failed state
- Provide retry mechanism

## Performance Optimization

1. **Batch Polling**: Get multiple project progress in one request
2. **Smart Caching**: Avoid duplicate requests for same data
3. **Conditional Polling**: Only start polling when needed
4. **Auto Cleanup**: Periodically clean expired progress data

## Extensibility

1. **Add New Stages**: Simply modify STAGES configuration
2. **Adjust Weights**: Redistribute stage weights
3. **Custom Messages**: Support stage-specific message formats
4. **Multi-environment Support**: Support different environments through configuration

## Monitoring and Debugging

1. **Logging**: Detailed progress event logs
2. **Status Check**: Real-time progress status queries
3. **Error Tracking**: Complete error information recording
4. **Performance Metrics**: Polling frequency and response time monitoring

## Migration Guide

Migrating from old complex progress system to simplified system:

1. **Backend Migration**:
   - Replace progress callbacks with emit_progress calls
   - Use SimplePipelineAdapter to replace old adapters
   - Remove complex WebSocket progress publishing

2. **Frontend Migration**:
   - Use useSimpleProgressStore to replace old state management
   - Use SimpleProgressBar to replace old progress components
   - Configure polling to replace WebSocket subscriptions

3. **Data Migration**:
   - Clean old progress data
   - Initialize new Redis progress storage
   - Update project status mapping

## Summary

This simplified progress system provides through the "keep it simple and stable" design philosophy:

- ✅ **Reliability**: Based on HTTP polling, no WebSocket dependency
- ✅ **Simplicity**: Fixed stages, easy to understand and maintain
- ✅ **Performance**: Minimize network requests, smart caching
- ✅ **Extensibility**: Easy to add new stages and features
- ✅ **Debuggability**: Complete logging and status tracking

Compared to the previous complex system, this solution is more stable and reliable, easier to maintain and extend.
