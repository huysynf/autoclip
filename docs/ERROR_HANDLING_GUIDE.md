# Unified Error Handling Guide

## 📋 Overview

This project has implemented a unified error handling mechanism, providing consistent error response formats and automatic error handling capabilities.

## 🏗️ Error Handling Architecture

### Error Classification

```python
class ErrorCategory(Enum):
    CONFIGURATION = "CONFIGURATION"  # Configuration errors
    NETWORK = "NETWORK"              # Network errors
    API = "API"                      # API errors
    FILE_IO = "FILE_IO"              # File I/O errors
    PROCESSING = "PROCESSING"        # Processing errors
    VALIDATION = "VALIDATION"        # Validation errors
    SYSTEM = "SYSTEM"                # System errors
```

### Error Levels

```python
class ErrorLevel(Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"
```

## 🚀 Usage

### 1. Throwing Custom Exceptions

```python
from backend.utils.error_handler import AutoClipsException, ErrorCategory

# Throw configuration error
raise AutoClipsException(
    message="API key is not configured",
    category=ErrorCategory.CONFIGURATION,
    details={"config_key": "DASHSCOPE_API_KEY"}
)

# Throw file error
raise AutoClipsException(
    message="File does not exist",
    category=ErrorCategory.FILE_IO,
    details={"file_path": "/path/to/file.mp4"}
)
```

### 2. Using Error Handling Decorator

```python
from backend.core.error_middleware import handle_errors
from backend.utils.error_handler import ErrorCategory

@handle_errors(ErrorCategory.PROCESSING)
async def process_video(video_path: str):
    # Any exceptions within this function are automatically converted to AutoClipsException
    if not os.path.exists(video_path):
        raise FileNotFoundError("Video file does not exist")
    
    # Processing logic...
    return result
```

### 3. Using Error Context Manager

```python
from backend.core.error_middleware import error_context
from backend.utils.error_handler import ErrorCategory

def upload_file(file_path: str):
    with error_context(ErrorCategory.FILE_IO, {"file_path": file_path}):
        # Any exception thrown inside this context will be converted to AutoClipsException
        with open(file_path, 'r') as f:
            content = f.read()
        return content
```

### 4. Using in API Routes

```python
from fastapi import APIRouter, HTTPException
from backend.utils.error_handler import AutoClipsException, ErrorCategory

router = APIRouter()

@router.get("/projects/{project_id}")
async def get_project(project_id: str):
    try:
        # Business logic
        project = await get_project_from_db(project_id)
        if not project:
            raise AutoClipsException(
                message=f"Project does not exist: {project_id}",
                category=ErrorCategory.VALIDATION,
                details={"project_id": project_id}
            )
        return project
    except AutoClipsException:
        # Re-raise it to be handled by the global exception handler
        raise
    except Exception as e:
        # Other exceptions will be converted into AutoClipsException
        raise AutoClipsException(
            message="Failed to retrieve project",
            category=ErrorCategory.SYSTEM,
            original_exception=e
        )
```

## 📊 Error Response Format

All error responses follow a unified format:

```json
{
  "error": {
    "code": "AUTOCLIPS_VALIDATION",
    "message": "Project does not exist: abc123",
    "details": {
      "project_id": "abc123"
    },
    "request_id": "req_123456",
    "timestamp": 1640995200.0
  }
}
```

### Field Descriptions

- `code`: Error code, formatted as `AUTOCLIPS_{CATEGORY}` or `HTTP_{STATUS_CODE}`
- `message`: Error message, user-friendly description
- `details`: Error details, containing debugging information
- `request_id`: Request ID, used for tracking
- `timestamp`: The timestamp when the error occurred

## 🔧 HTTP Status Code Mapping

| Error Category | HTTP Status Code | Description |
|---------|-----------|------|
| CONFIGURATION | 500 | Configuration errors |
| NETWORK | 503 | Network errors |
| API | 502 | API errors |
| FILE_IO | 500 | File I/O errors |
| PROCESSING | 500 | Processing errors |
| VALIDATION | 400 | Validation errors |
| SYSTEM | 500 | System errors |

## 📝 Best Practices

### 1. Writing Error Messages

```python
# ✅ Good error message
raise AutoClipsException(
    message="Video file format is not supported, please use MP4 format",
    category=ErrorCategory.VALIDATION,
    details={"supported_formats": ["mp4", "avi", "mov"]}
)

# ❌ Bad error message
raise AutoClipsException(
    message="Error: Invalid file",
    category=ErrorCategory.VALIDATION
)
```

### 2. Including Error Details

```python
# ✅ Contains useful debugging information
raise AutoClipsException(
    message="Failed to process video",
    category=ErrorCategory.PROCESSING,
    details={
        "project_id": project_id,
        "step": "video_cutting",
        "error_code": "FFMPEG_ERROR",
        "file_size": file_size
    }
)
```

### 3. Choosing Error Categories

```python
# ✅ Choose the right category based on the nature of the error
if not api_key:
    raise AutoClipsException(
        message="API key is not configured",
        category=ErrorCategory.CONFIGURATION  # Configuration issue
    )

if response.status_code == 429:
    raise AutoClipsException(
        message="API rate limit exceeded",
        category=ErrorCategory.API  # API issue
    )

if not os.path.exists(file_path):
    raise AutoClipsException(
        message="File does not exist",
        category=ErrorCategory.FILE_IO  # File issue
    )
```

### 4. Preserving Exception Chains

```python
# ✅ Preserve original exception information
try:
    result = some_risky_operation()
except Exception as e:
    raise AutoClipsException(
        message="Operation failed",
        category=ErrorCategory.SYSTEM,
        original_exception=e  # Keep original exception
    )
```

## 🧪 Testing Error Handling

### 1. Testing Custom Exceptions

```python
import pytest
from backend.utils.error_handler import AutoClipsException, ErrorCategory

def test_custom_exception():
    with pytest.raises(AutoClipsException) as exc_info:
        raise AutoClipsException(
            message="Test error",
            category=ErrorCategory.VALIDATION
        )
    
    assert exc_info.value.category == ErrorCategory.VALIDATION
    assert exc_info.value.message == "Test error"
```

### 2. Testing API Error Responses

```python
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_api_error_response():
    response = client.get("/api/v1/projects/nonexistent")
    
    assert response.status_code == 400
    assert "error" in response.json()
    assert response.json()["error"]["code"] == "AUTOCLIPS_VALIDATION"
```

## 🔍 Error Monitoring and Logging

### 1. Error Log Format

All errors are automatically logged in the following format:

```
2024-01-01 12:00:00 - ERROR - Unhandled exception: AutoClipsException: Project does not exist: abc123
request_id: req_123456
path: /api/v1/projects/abc123
method: GET
traceback: [Full stack trace]
```

### 2. Error Statistics

You can use log analysis tools to count errors:

```bash
# Count by error type
grep "AUTOCLIPS_" backend.log | cut -d' ' -f4 | sort | uniq -c

# Count error frequency
grep "ERROR" backend.log | wc -l
```

## 🚨 Common Error Handling Scenarios

### 1. File Operation Errors

```python
@handle_errors(ErrorCategory.FILE_IO)
async def save_file(file_path: str, content: bytes):
    try:
        with open(file_path, 'wb') as f:
            f.write(content)
    except PermissionError:
        raise AutoClipsException(
            message="No file write permissions",
            category=ErrorCategory.FILE_IO,
            details={"file_path": file_path}
        )
    except OSError as e:
        raise AutoClipsException(
            message="File system error",
            category=ErrorCategory.FILE_IO,
            details={"file_path": file_path, "os_error": str(e)}
        )
```

### 2. API Call Errors

```python
@handle_errors(ErrorCategory.API)
async def call_external_api(url: str, data: dict):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=data) as response:
                if response.status == 429:
                    raise AutoClipsException(
                        message="API rate limit exceeded",
                        category=ErrorCategory.API,
                        details={"url": url, "status": 429}
                    )
                return await response.json()
    except aiohttp.ClientError as e:
        raise AutoClipsException(
            message="Network request failed",
            category=ErrorCategory.NETWORK,
            details={"url": url, "error": str(e)}
        )
```

### 3. Data Processing Errors

```python
@handle_errors(ErrorCategory.PROCESSING)
async def process_video_data(video_path: str):
    try:
        # Processing logic
        result = await video_processor.process(video_path)
        return result
    except VideoProcessingError as e:
        raise AutoClipsException(
            message="Video processing failed",
            category=ErrorCategory.PROCESSING,
            details={
                "video_path": video_path,
                "error_code": e.code,
                "step": e.step
            },
            original_exception=e
        )
```

## 📚 Related Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Configuration Guide](./CONFIGURATION_GUIDE.md)
- [Logging Management Guide](./LOGGING_GUIDE.md)
