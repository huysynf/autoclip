# Upload Status Page Guide

## Feature Overview

The upload status page is a dedicated interface for viewing and managing Bilibili upload tasks, providing complete task monitoring and management functionality.

## Page Access

- **URL**: `http://localhost:3000/upload-status`
- **Navigation**: Click the "Upload Status" button in the top navigation bar

## Main Features

### 1. Task List Display

The page displays all upload tasks in table format with the following information:

- **Task ID**: Unique identifier
- **Title**: Title of the uploaded video
- **Upload Account**: Bilibili account used (displays nickname and username)
- **Category**: Upload category information
- **Status**: Current task status (Pending/Processing/Success/Failed/Cancelled)
- **Progress**: Upload progress bar (0-100%)
- **File Size**: Video file size
- **Created Time**: Task creation time

### 2. Statistics Information

Statistics cards displayed at the top of the page:

- **Total Tasks**: Total number of all upload tasks
- **Success**: Number of successfully completed tasks
- **Failed**: Number of failed tasks
- **In Progress**: Number of tasks being processed or pending

### 3. Task Management Operations

Each task supports the following operations:

#### View Details
- Click the "Details" button to view complete task information
- Includes task ID, status, account information, project information, progress, file information, BV/AV number, etc.
- Displays error messages (if any)

#### Retry Task
- "Retry" button only appears for failed tasks
- Click to resubmit the task to the queue
- Requires confirmation

#### Cancel Task
- "Cancel" button only appears for pending or processing tasks
- Click to stop task execution
- Requires confirmation

### 4. Auto Refresh

- Page automatically refreshes data every 30 seconds
- Click "Refresh" button to update immediately
- Real-time display of task status changes

## Status Explanation

### Task Status

| Status | Icon | Description | Available Operations |
|--------|------|-------------|----------------------|
| Pending | ⏰ | Task created, waiting for processing | View Details, Cancel |
| Processing | ▶️ | Task is executing | View Details, Cancel |
| Success | ✅ | Task completed successfully | View Details |
| Completed | ✅ | Task completed (same as success) | View Details |
| Failed | ❌ | Task execution failed | View Details, Retry |
| Cancelled | ⏹️ | Task was cancelled | View Details |

### Progress Display

- **0%**: Task not started or just started
- **1-99%**: Task in progress, showing actual progress
- **100%**: Task completed
- **Abnormal**: Failed status shows red progress bar

## Technical Features

### Responsive Design
- Supports different screen sizes
- Table supports horizontal scrolling
- Mobile-friendly

### Performance Optimization
- Pagination display, default 20 items per page
- Supports quick jump and page size adjustment
- Auto refresh avoids frequent requests

### User Experience
- Clear status indicators and icons
- Detailed operation confirmation prompts
- Friendly error message display
- Real-time status updates

## Use Cases

### 1. Monitor Upload Progress
- View real-time status of all upload tasks
- Understand task execution progress
- Detect abnormal situations promptly

### 2. Manage Upload Tasks
- Retry failed tasks
- Cancel unwanted tasks
- View detailed execution information

### 3. Troubleshooting
- View error messages to locate problems
- Analyze task execution history
- Optimize upload strategy

## Important Notes

1. **Network Connection**: Ensure frontend and backend services are running normally
2. **Permission Management**: Only administrators can execute retry and cancel operations
3. **Data Refresh**: Page auto-refreshes, no need to manually refresh browser
4. **Task Status**: Task status changes may have delays, please wait patiently

## Troubleshooting

### Page Cannot Access
- Check if frontend service is running on port 3000
- Confirm route configuration is correct

### Data Not Displaying
- Check if backend API service is normal
- Confirm database connection is normal
- Check browser console for error messages

### Operation Failed
- Check network connection
- Confirm backend service status
- Check error prompt messages

## Changelog

- **v1.0.0** (2025-09-11): Initial release
  - Basic task list display
  - Status management and operation functionality
  - Auto refresh mechanism
  - Responsive design
