# Inline Progress Bar Implementation Plan

## Overview

This document describes the inline progress bar implemented for the AutoClip project. It replaces the old static “Processing” status with a real-time progress indicator embedded in the existing status bar.

## Design goals

1. **Preserve height**: Do not increase the height of the original “Processing” color bar.  
2. **Dynamic progress display**: Reflect real-time progress via background fill and a progress bar.  
3. **Real-time state sync**: Use WebSockets for live updates.  
4. **Step awareness**: Show the current pipeline step and detailed progress information.

## Implementation

### Frontend components

#### 1. `InlineProgressBar` component

**Location**: `frontend/src/components/InlineProgressBar.tsx`

**Key characteristics**:

- Inline design that reuses the existing status bar height.  
- Dynamic gradient background.  
- Realtime progress bar.  
- Step label and details.  
- WebSocket-driven updates.

**Core props**:

```typescript
interface InlineProgressBarProps {
  projectId: string;
  currentStep?: number;
  totalSteps?: number;
  status?: string;
  onProgressUpdate?: (progress: number, step: string) => void;
}
```

**Visual behavior**:

- Background gradient: fills from left to right from darker to lighter blue.  
- Animated fill: smooth progress-bar animation and optional shimmer.  
- Information hierarchy: main state → step label → percentage → detailed bar.

#### 2. Pipeline step configuration

```typescript
const PIPELINE_STEPS = [
  { id: 1, name: 'Outline extraction', description: 'Extract structural outline from transcript' },
  { id: 2, name: 'Timeline detection', description: 'Locate topic segments using SRT timestamps' },
  { id: 3, name: 'Content scoring', description: 'Score segments on quality and virality' },
  { id: 4, name: 'Title generation', description: 'Generate compelling titles for high-score clips' },
  { id: 5, name: 'Topic clustering', description: 'Group related clips into collections' },
  { id: 6, name: 'Video cutting', description: 'Use FFmpeg to produce clips and collection videos' }
];
```

### Backend integration

#### 1. Realtime progress publishing

**Location**: `backend/services/processing_orchestrator.py`

**New helper**:

```python
def _send_realtime_progress_update(
    self,
    status: TaskStatus,
    progress: Optional[float] = None,
    error_message: Optional[str] = None,
) -> None:
    """Send realtime progress update to the frontend."""
```

**Step-to-progress mapping**:

- Step 1 (Outline)       →  0–10%  
- Step 2 (Timeline)      → 10–30%  
- Step 3 (Scoring)       → 30–50%  
- Step 4 (Titles)        → 50–70%  
- Step 5 (Clustering)    → 70–85%  
- Step 6 (Cutting)       → 85–100%

#### 2. WebSocket message format

**Location**: `backend/services/websocket_notification_service.py`

**Message structure**:

```json
{
  "type": "task_progress_update",
  "task_id": "task_uuid",
  "project_id": "project_uuid",
  "status": "running",
  "progress": 45,
  "current_step": 3,
  "total_steps": 6,
  "step_name": "Content scoring",
  "message": "Running content scoring...",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Integration points

#### 1. `ProjectCard` updates

**Location**: `frontend/src/components/ProjectCard.tsx`

**Replacement**:

```typescript
// Old static display
<div style={{ ... }}>
  <LoadingOutlined />
  Processing
</div>

// New inline progress bar
<InlineProgressBar
  projectId={project.id}
  currentStep={project.current_step}
  totalSteps={project.total_steps}
  status={normalizedStatus}
  onProgressUpdate={(progress, stepName) => {
    console.log(`Project ${project.id} progress: ${progress}% - ${stepName}`);
  }}
/>
```

## UX improvements

### 1. Visual feedback

- **Dynamic background**: progress bar background fills as progress increases.  
- **Animations**: smooth fill animations.  
- **State indicator**: clear step name and percentage.

### 2. Information hierarchy

- **Primary status**: current step (e.g. “Outline extraction”).  
- **Progress info**: step count and overall percentage.  
- **Detailed bar**: fine-grained progress visualization.  
- **Step details**: optional description when needed.

### 3. Real-time behavior

- **WebSocket connection**: subscribes to progress updates.  
- **Immediate response**: UI updates as soon as backend publishes.  
- **State sync**: consistent view when multiple clients watch the same project.

## Technical benefits

### 1. Performance

- **Lightweight component**: minimizes re-renders.  
- **WebSocket reuse**: avoids polling and extra HTTP traffic.  
- **Scoped state**: only relevant parts of the UI update.

### 2. Extensibility

- **Modular design**: component can be reused in other views.  
- **Configurable steps**: easy to add or rename pipeline steps.  
- **Theming**: color and style tokens can be overridden.

### 3. Error handling

- **Connection failures**: graceful degradation when WebSocket disconnects.  
- **Data validation**: basic sanity checks on incoming progress payloads.  
- **Recovery**: auto-reconnect and drift correction via snapshot logic (when combined with the progress system).

## Deployment

### 1. Frontend

- Ensure WebSocket configuration (URL, auth) is correct.  
- Verify component imports and tree-shaking (if any).  
- Test across major browsers.

### 2. Backend

- Confirm WebSocket services are running.  
- Verify progress-publishing logic from the orchestrator.  
- Monitor connection counts and error logs.

### 3. Testing

- Functional tests: verify correct progress display for typical tasks.  
- Performance tests: validate that realtime updates remain smooth.  
- Compatibility tests: confirm behavior across browsers/devices.

## Future work

### 1. Feature enhancements

- **Pause/resume**: allow pausing and resuming long-running tasks.  
- **Cancel**: expose cancel controls in the UI.  
- **History**: show past runs and their final progress state.

### 2. UX

- **Customization**: let users toggle compact vs detailed view.  
- **Notifications**: toast or system notifications when tasks finish.  
- **Mobile**: refine responsive layout on narrow screens.

### 3. Technical

- **Caching**: local cache of last-known progress.  
- **Offline mode**: graceful handling when connectivity is lost.  
- **Metrics**: instrument realtime performance and error metrics.

## Summary

The inline progress bar achieves:

1. ✅ **Preserved height** – fully embedded in the existing “Processing” bar.  
2. ✅ **Dynamic progress** – realtime display of overall progress and current step.  
3. ✅ **Realtime sync** – WebSocket-based updates.  
4. ✅ **Improved UX** – richer visual feedback and clearer status information.

This implementation gives AutoClip a modern, realtime status display for background processing, significantly improving user experience and perceived responsiveness.
