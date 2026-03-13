# AutoClip System Architecture

## 🏗️ Overall System Architecture

AutoClip is a video automatic clipping and collection generation system based on Python + React, using a frontend-backend separation architecture.

### **Architecture Components**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Frontend (React)│    │ Backend (FastAPI)│    │  File System    │
│                 │    │                 │    │                 │
│ - Project Mgmt  │◄──►│ - API Service   │◄──►│ - Project Files │
│ - Video Preview │    │ - Business Logic│    │ - Output Files  │
│ - Status Monitor│    │ - Data Process  │    │ - Metadata      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │ Database (SQLite)│
                       │                 │
                       │ - Project Info  │
                       │ - Clip Metadata │
                       │ - Collection    │
                       │ - Task Status   │
                       └─────────────────┘
```

## 📁 Data Storage Architecture

### **1. Database Layer (SQLite)**

**Core Table Structure:**
- `projects`: Project basic information
- `clips`: Clip metadata
- `collections`: Collection metadata
- `tasks`: Processing task status
- `bilibili_accounts`: Bilibili account information
- `upload_records`: File upload records

**Data Relationships:**
```
projects (1) ──► (N) clips
projects (1) ──► (N) collections
projects (1) ──► (N) tasks
```

### **2. File System Layer**

**Directory Structure:**
```
data/
├── projects/                    # Project raw files
│   └── {project_id}/           # One directory per project
│       ├── raw/                # Raw video files
│       ├── step1_outline/      # Outline generation results
│       ├── step2_timeline/     # Timeline analysis
│       ├── step3_scoring/      # Content scoring
│       ├── step4_title/        # Title generation
│       ├── step5_clustering/   # Content clustering
│       └── step6_video/        # Video generation
│           ├── clips_metadata.json    # Clip metadata
│           └── collections_metadata.json # Collection metadata
├── output/                      # Final output files
│   ├── clips/                  # Clip video files
│   │   └── {project_id}/       # Organized by project
│   ├── collections/            # Collection video files
│   │   └── {project_id}/       # Organized by project
│   └── metadata/               # Global metadata
├── temp/                       # Temporary files
├── cache/                      # Cache files
├── uploads/                    # Upload files
└── backups/                    # Database backups
```

## 🔄 Data Flow

### **1. Project Creation Flow**

```
User uploads video → Create project record → Store raw file → Start processing
     ↓
Database: New record in projects table
File System: Store video in data/projects/{project_id}/raw/
```

### **2. Video Processing Flow**

```
Raw video → Subtitle extraction → Content analysis → Clip generation → Collection generation → Final output
    ↓           ↓                  ↓                 ↓                  ↓                      ↓
step1_outline → step2_timeline → step3_scoring → step4_title → step5_clustering → step6_video
```

### **3. Data Synchronization Flow**

```
File system processing complete → Metadata generation → Sync to database → Frontend display
        ↓                            ↓                    ↓                  ↓
   clips_metadata.json → Parse metadata → Write to clips table → API returns
collections_metadata.json → Parse metadata → Write to collections table → API returns
```

## 🔧 Key Technical Implementation

### **1. Data Synchronization Mechanism**

- **Auto Sync**: Automatically sync metadata to database after processing
- **Manual Sync**: Provide sync scripts for historical data
- **Incremental Sync**: Only sync new or modified data

### **2. Path Management**

- **Unified Path Manager**: `backend/core/unified_paths.py`
- **Dynamic Path Detection**: Automatically detect best output path
- **Path Validation**: Regularly check path configuration consistency

### **3. State Management**

- **Project Status**: pending → processing → completed
- **Task Status**: pending → running → completed/failed
- **Real-time Updates**: WebSocket + polling mechanism

## 🚨 Common Issues and Solutions

### **1. Data Inconsistency**

**Symptom**: Files exist in file system but not in database
**Cause**: Data sync failed or not executed
**Solution**: Run `scripts/sync_complete_metadata.py`

### **2. Path Confusion**

**Symptom**: Files scattered across multiple directories
**Cause**: Hardcoded paths conflict with configured paths
**Solution**: Use unified path manager

### **3. Frontend Display Issues**

**Symptom**: Backend API works but frontend displays abnormally
**Cause**: Frontend cache or state management issues
**Solution**: Clear browser cache, restart frontend service

## 📋 Maintenance and Monitoring

### **1. Regular Checks**

- **Data Consistency**: Check consistency between file system and database
- **Path Configuration**: Verify path configuration correctness
- **Storage Space**: Monitor disk space usage

### **2. Backup Strategy**

- **Database Backup**: Regular SQLite database backups
- **File Backup**: Backup important project files
- **Configuration Backup**: Backup system configuration files

### **3. Log Monitoring**

- **Application Logs**: Monitor application running status
- **Error Logs**: Detect issues promptly
- **Performance Logs**: Monitor system performance

## 🚀 Best Practices

### **1. Data Management**

- Run data sync scripts regularly
- Clean temporary files and cache promptly
- Keep file system structure clear

### **2. Development Process**

- Clean test data before developing new features
- Use unified path configuration
- Update documentation and comments promptly

### **3. Deployment and Maintenance**

- Regular data backups in production environment
- Monitor system resource usage
- Update dependencies and fix security vulnerabilities promptly
