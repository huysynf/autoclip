# 🏗️ Backend Architecture Design Document

## 📋 Overview

The automatic clipping tool backend adopts a modular design that supports parallel processing of multiple projects with comprehensive error handling, configuration management, and security mechanisms.

## 🏛️ Architecture Layers

### 1. Configuration Management Layer (Configuration Layer)

```
src/config.py
├── ConfigManager          # Unified configuration manager
├── Settings              # Application settings class
├── APIConfig             # API configuration
├── ProcessingConfig      # Processing parameter configuration
└── PathConfig           # Path configuration
```

**Features:**
- Environment variable support
- Configuration validation
- Backward compatibility
- Multi-project configuration

### 2. Error Handling Layer (Error Handling Layer)

```
src/utils/error_handler.py
├── AutoClipsException    # Base exception class
├── Specific Exceptions   # APIError, NetworkError, etc.
├── ErrorHandler         # Error handler
├── CircuitBreaker       # Circuit breaker
└── RetryConfig          # Retry configuration
```

**Features:**
- Layered error handling
- Automatic retry mechanism
- Circuit breaker pattern
- Error context management

### 3. Security Management Layer (Security Layer)

```
src/utils/api_key_manager.py
├── APIKeyManager        # API key manager
├── Encrypted Storage    # Fernet encryption
├── Key Rotation         # Key update
└── Usage Statistics     # Usage monitoring
```

**Features:**
- Encrypted API key storage
- Key format validation
- Automatic expiration management
- Usage statistics tracking

### 4. Processing Pipeline Layer (Pipeline Layer)

```
src/pipeline/
├── step1_outline.py     # Outline extraction
├── step2_timeline.py    # Timeline positioning
├── step3_scoring.py     # Content scoring
├── step4_title.py       # Title generation
├── step5_clustering.py  # Topic clustering
└── step6_cutting.py     # Video cutting
```

**Features:**
- Modular design
- Independent processing steps
- Intermediate result caching
- Error recovery mechanism

### 5. Utilities Layer (Utilities Layer)

```
src/utils/
├── llm_client.py        # LLM client
├── text_processor.py    # Text processing
├── video_processor.py   # Video processing
└── file_manager.py      # File management
```

**Features:**
- Unified LLM call interface
- Text chunking and merging
- Video processing encapsulation
- File operation abstraction

## 🔄 Data Flow

### Processing Flow

```
Input File → Config Validation → Chunk Processing → LLM Call → Result Parsing → File Generation → Output
    ↓         ↓                  ↓                  ↓          ↓                ↓                ↓
  Validator  Config Manager    Text Processor    API Manager  Error Handler   File Manager    Metadata
```

### Error Handling Flow

```
Exception Occurs → Exception Classification → Error Handling → Retry/Circuit Breaker → Logging → User Feedback
    ↓                ↓                        ↓                ↓                       ↓         ↓
  Catcher         Classifier               Handler          Recovery               Logger    Feedback
```

## 🛡️ Security Design

### 1. API Key Management

- **Encrypted Storage**: Use Fernet symmetric encryption
- **Key Rotation**: Support key update and rotation
- **Access Control**: Role-based key access
- **Usage Monitoring**: Key usage statistics and audit

### 2. Input Validation

- **File Type Validation**: Restrict upload file types
- **Size Limits**: Prevent large file attacks
- **Content Validation**: Verify file content integrity
- **Path Security**: Prevent path traversal attacks

### 3. Error Message Handling

- **Sensitive Information Filtering**: Don't expose internal error details
- **Error Classification**: Distinguish user errors from system errors
- **Log Desensitization**: Don't record sensitive information in logs

## 📊 Performance Optimization

### 1. Concurrent Processing

- **Async Processing**: Use asyncio for concurrency support
- **Task Queue**: Support background task processing
- **Resource Pool**: Connection pool and thread pool management

### 2. Caching Mechanism

- **Result Caching**: Cache LLM call results
- **Configuration Caching**: Cache configuration information
- **File Caching**: Cache processing intermediate results

### 3. Resource Management

- **Memory Optimization**: Stream processing for large files
- **Disk Optimization**: Temporary file cleanup
- **Network Optimization**: Connection reuse and timeout control

## 🔧 Configuration Management

### Environment Variables

```bash
# Required configuration
DASHSCOPE_API_KEY=your_api_key_here
AUTO_CLIPS_MASTER_PASSWORD=your_master_password

# Optional configuration
MODEL_NAME=qwen-plus
CHUNK_SIZE=5000
MIN_SCORE_THRESHOLD=0.7
MAX_CLIPS_PER_COLLECTION=5
LOG_LEVEL=INFO
```

### Configuration File

```json
{
  "api_config": {
    "model_name": "qwen-plus",
    "max_tokens": 4096,
    "timeout": 30
  },
  "processing_config": {
    "chunk_size": 5000,
    "min_score_threshold": 0.7,
    "max_retries": 3
  },
  "paths": {
    "project_root": "/path/to/project",
    "uploads_dir": "/path/to/uploads",
    "temp_dir": "/path/to/temp"
  }
}
```

## 🧪 Testing Strategy

### 1. Unit Tests

- **Configuration Tests**: Test configuration loading and validation
- **Error Handling Tests**: Test exception handling and retry
- **API Tests**: Test LLM client
- **Utility Tests**: Test various utility functions

### 2. Integration Tests

- **Pipeline Tests**: Test complete processing flow
- **File Processing Tests**: Test file upload and download
- **API Integration Tests**: Test integration with external APIs

### 3. Performance Tests

- **Load Tests**: Test concurrent processing capability
- **Memory Tests**: Test memory usage
- **Network Tests**: Test network request performance

## 📈 Monitoring and Logging

### 1. Logging System

```python
# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('auto_clips.log'),
        logging.StreamHandler()
    ]
)
```

### 2. Performance Monitoring

- **Processing Time**: Record processing time for each step
- **Resource Usage**: Monitor CPU, memory, disk usage
- **Error Rate**: Statistics on error frequency
- **Success Rate**: Statistics on processing success rate

### 3. Health Checks

- **Service Status**: Check if each service is normal
- **Dependency Check**: Check if external dependencies are available
- **Resource Check**: Check if system resources are sufficient

## 🚀 Deployment Architecture

### Development Environment

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Streamlit     │    │   React Dev     │    │   FastAPI Dev   │
│   (Prototype)   │    │   (Dev Frontend)│    │   (Dev Backend) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Production Environment

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx         │    │   React Build   │    │   FastAPI       │
│   (Reverse Proxy)│   │   (Prod Frontend)│   │   (Prod Backend)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Redis Cache   │
                    │   (Cache Layer) │
                    └─────────────────┘
```

## 🔄 Version Control

### Semantic Versioning

- **Major Version**: Incompatible API changes
- **Minor Version**: Backward compatible feature additions
- **Patch Version**: Backward compatible bug fixes

### Migration Strategy

- **Backward Compatibility**: New versions maintain compatibility with old versions
- **Progressive Migration**: Support progressive feature migration
- **Rollback Mechanism**: Support quick rollback to old versions

## 📚 Best Practices

### 1. Code Standards

- **PEP 8**: Follow Python code standards
- **Type Annotations**: Use type hints
- **Docstrings**: Complete function and class documentation
- **Error Handling**: Unified error handling approach

### 2. Security Practices

- **Least Privilege**: Use minimum necessary permissions
- **Input Validation**: Strictly validate all inputs
- **Encrypted Transmission**: Encrypt sensitive data transmission
- **Regular Updates**: Regularly update dependencies

### 3. Performance Practices

- **Async Processing**: Use async processing for better performance
- **Caching Strategy**: Use caching appropriately
- **Resource Cleanup**: Clean up temporary resources promptly
- **Monitoring Alerts**: Set up performance monitoring and alerts

---

**Note**: This document will be continuously updated as the project evolves. Please refer to the latest version.
