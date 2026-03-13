# Incomplete Projects Retry Fix Summary

## Problem description

Two incomplete projects could not be restarted even after clicking “Retry”:

1. **Project 1**: `19cdeea4-16fb-49ce-b114-54cdff7419cd` (iPhone 17/Pro/Air Impressions)  
2. **Project 2**: `e11ab97b-6dd2-4d50-97c6-d934b835232c` (Chinese title: “43 days as a creator, I shot a film”)

## Analysis

### Project 1
- ✅ Video file exists (42.5 MB).  
- ❌ 18 duplicate task records.  
- ❌ Project status marked as failed.  
- ❌ Multiple conflicting Celery task IDs.  
- ❌ Variable scope issue in pipeline code.

### Project 2
- ❌ Video file is missing.  
- ❌ Project status stuck in “pending/waiting”.  
- ❌ Needs Bilibili video to be re-downloaded.  
- ⚠️ Source URL: `https://www.bilibili.com/video/BV1ihbYzGErq/`

## Fixes

### 1. Fix pipeline variable-scope issue

**Error**: `cannot access local variable 'timeline_data' where it is not associated with a value`

**Fix**: Initialize all required variables in `backend/services/simple_pipeline_adapter.py` when outline data is missing.

```python
# Before: when there is no outline data, timeline_data is not defined
else:
    logger.warning("No outline data, skipping timeline extraction and scoring")
    # Create empty files...

# After: initialize all required variables
else:
    logger.warning("No outline data, skipping timeline extraction and scoring")
    # Create empty files...
    # Initialize empty variables
    timeline_data = []
    scored_clips = []
    titled_clips = []
    collections = []
```

### 2. Clean up duplicate tasks

**Issue**: Project 1 had 18 duplicate task records causing conflicts.

**Fix**: Added `scripts/fix_incomplete_projects.py`:

- Remove duplicate task records.  
- Keep the latest valid task.  
- Clean up conflicting Celery task IDs.

### 3. Implement automatic re-download

**Issue**: Project 2 had no video file; retry needs to re-download the video.

**Fix**: Updated the retry API in `backend/api/v1/projects.py`:

- Check if the video file exists.  
- Pull the source URL from project metadata.  
- Choose download method based on URL type (Bilibili / YouTube).  
- Use the safe async task manager to kick off a new download.

```python
# If video is missing, try to re-download
if not video_path.exists():
    logger.warning(f"Video file missing: {video_path}, attempting re-download")

    if hasattr(project, "project_metadata") and project.project_metadata:
        source_url = project.project_metadata.get("source_url")
        if source_url:
            if "bilibili.com" in source_url:
                # Bilibili re-download
                ...
            elif "youtube.com" in source_url or "youtu.be" in source_url:
                # YouTube re-download
                ...
```

### 4. Improve exception handling

**Fix**: Use `backend/api/v1/async_task_manager.py` as a safe task manager:

- Prevent unhandled exceptions from crashing/restarting the backend.  
- Track task state for debugging.  
- Support task cancellation and cleanup.

## Results

### Project 1
- ✅ Duplicate tasks cleaned up.  
- ✅ Variable-scope bug fixed.  
- ✅ Retry API now works correctly.  
- ✅ Pipeline can be restarted successfully.

### Project 2
- ✅ Automatic re-download logic implemented.  
- ✅ Source URL detected and used to start a new download.  
- ✅ Uses the safe task manager.  
- ✅ Supports both Bilibili and YouTube re-downloads.

## Testing

### Test scripts

1. `scripts/check_incomplete_projects.py` – Scan for incomplete projects.  
2. `scripts/fix_incomplete_projects.py` – Apply fixes to those projects.  
3. `scripts/test_retry_api.py` – Verify retry endpoint behavior.  
4. `scripts/test_bilibili_redownload.py` – Verify Bilibili re-download.

### Test outcomes

- ✅ Project 1 retry works as expected.  
- ✅ Project 2 auto re-download works as expected.  
- ✅ Pipeline variable-scope issue fixed.  
- ✅ Duplicate-task cleanup works correctly.

## Impact

**Before fixes:**

- Retry failed for some projects.  
- Pipeline crashed or errored for specific states.  
- Duplicate tasks created conflicts.  
- No automatic re-download for missing video files.

**After fixes:**

- Retry works reliably.  
- Pipeline runs stably even for edge cases.  
- Task management is cleaner.  
- Automatic re-download is fully wired into the retry flow.

## Technical takeaways

1. **Variable scope**: Always initialize variables before use in all branches.  
2. **Task de-duplication**: Remove duplicate records to avoid conflicting state.  
3. **Auto re-download**: Detect missing files and recover via re-download.  
4. **Exception handling**: Use a safe task manager to avoid unhandled exceptions.  
5. **API behavior**: Retry API now includes file-existence checks and re-download support.

## Recommendations

1. Monitor project processing for a period to confirm stability.  
2. Periodically clean duplicate tasks in the database.  
3. Continue improving error logs for easier debugging.  
4. Consider adding a dedicated task-queue management/monitoring UI.
