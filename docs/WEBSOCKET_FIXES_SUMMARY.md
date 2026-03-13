# WebSocket Issue Fix Summary

## Problem analysis

Log analysis revealed three main problems:

1. **Automatic disconnect/reconnect**: Connections dropped and reconnected roughly every 10 seconds, indicating a missing heartbeat.
2. **Duplicate logs**: Repeated log line every ~10 seconds: `"新增0，移除0，未变8"` (“added 0, removed 0, unchanged 8”).
3. **Progress jumps**: Frontend progress jumped from 0% directly to 100%, implying missing progress snapshots.

## Fix plan

### 1. Fix WebSocket auto-disconnect / reconnect ✅

**Root cause**: No heartbeat. Proxies/browsers reclaimed “idle” connections after 10–60 seconds.

**Solution:**
- Frontend sends `ping` every 25 seconds.
- Backend replies `pong` immediately.
- If the frontend doesn’t receive `pong` within 5 seconds, it triggers a reconnect.
- Added exponential-backoff reconnect strategy.

**Files changed:**
- `frontend/src/hooks/useWebSocket.ts`: heartbeat + reconnect logic.

### 2. Fix duplicate logging ✅

**Root cause**: Frontend called `syncSubscriptions` too frequently; backend logged INFO every time.

**Solution:**
- Added a 300ms debounce on the frontend.
- Backend logs INFO only when there’s an actual change.
- Unchanged syncs are downgraded to DEBUG level.

**Files changed:**
- `frontend/src/hooks/useWebSocket.ts`: debounce logic.
- `backend/services/websocket_gateway_service.py`: log-level tuning.

### 3. Implement progress snapshot mechanism ✅

**Root cause**: Frontend missed mid-stream WebSocket updates, and there was no “latest snapshot / replay” mechanism.

**Solution:**
- On every progress publish, backend saves a snapshot into a Redis hash.
- When a user subscribes, the latest snapshot is sent immediately.
- Snapshot messages are tagged with `snapshot: true` so frontend can handle them specially.

**Files changed:**
- `backend/services/progress_event_service.py`: snapshot store/fetch.
- `backend/services/websocket_gateway_service.py`: send snapshot on subscribe.

### 4. Fix `asyncio.run()` errors ✅

**Root cause**: `asyncio.run()` was called while an event loop was already running.

**Solution:**
- Use `asyncio.get_running_loop()` and `create_task()` instead.
- Avoid creating a new loop inside async contexts.

**Files changed:**
- `backend/api/v1/bilibili.py`: event-loop conflict fix.

### 5. Optimize WebSocket send mechanism ✅

**Root cause**: Direct calls to `websocket.send_text()` could fail when the connection closed between checks.

**Solution:**
- Route all outbound messages through a queue-based sender.
- Avoid sending messages after a connection has already closed.

**Files changed:**
- `backend/core/websocket_manager.py`: unified queued sending.

## Technical details

### Heartbeat implementation

```typescript
// Frontend heartbeat
const HEARTBEAT_INTERVAL = 25000; // 25s
const HEARTBEAT_TIMEOUT = 5000;   // 5s timeout

// Send ping
globalWs.send(JSON.stringify({ type: 'ping' }));

// Handle pong
if (data.type === 'pong') {
  clearTimeout(heartbeatTimeout);
}
```

### Snapshot implementation

```python
# Save snapshot when publishing progress
snapshot_key = f"progress:last:{channel}"
await redis_client.hset(snapshot_key, mapping=filtered_dict)

# Send snapshot on subscribe
snapshot = await progress_event_service.get_task_snapshot(task_id)
if snapshot:
    snapshot_message = {**snapshot, "snapshot": True}
    await manager.send_personal_message(snapshot_message, user_id)
```

### Debounce implementation

```typescript
// 300ms debounce
if (syncDebounceTimeout) {
  clearTimeout(syncDebounceTimeout);
}
syncDebounceTimeout = window.setTimeout(() => {
  // Send sync request
}, SYNC_DEBOUNCE_DELAY);
```

## Testing

We added end-to-end tests to verify the fixes:

- ✅ Redis connectivity tests.
- ✅ Progress snapshot tests.  
- ✅ WebSocket gateway tests.

All tests pass and observed behavior matches expectations.

## Expected behavior after fixes

1. **Stable WebSocket connections**: No more frequent disconnect/reconnect cycles.
2. **Cleaner logs**: Reduced noise; INFO logs only on real changes.
3. **Smooth progress display**: Frontend immediately shows the latest progress instead of jumping 0% → 100%.
4. **Stable runtime**: No more `asyncio` event-loop errors.
5. **Reliable messaging**: No errors from sending on closed WebSocket connections.

## Usage tips

1. **Monitor logs**: Check that disconnect/reconnect events are no longer frequent.
2. **Test progress**: Run a processing task and confirm that progress updates smoothly.
3. **Confirm snapshots**: After a page refresh, the latest progress should appear immediately.
4. **Verify heartbeat**: You should see ping/pong messages in browser DevTools.

## Future improvements

1. **Redis Streams**: Consider using Streams for a richer message history.
2. **Connection pooling**: Improve Redis connection management.
3. **Metrics**: Add WebSocket-connection and message-rate metrics.
4. **Resilience**: Enhance auto-recovery under network instability.
