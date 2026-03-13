# AutoClip System Rebuild Guide

## 🎯 Rebuild Objectives

After data cleanup, the system has returned to a completely clean state. Now we can start fresh and establish a clean, consistent, and maintainable system.

## 📋 Current Status

### **✅ Completed**
- [x] Database completely cleared (all tables have 0 records)
- [x] File system cleanup completed
- [x] Temporary files and logs cleaned
- [x] Clean directory structure created
- [x] Database backup saved

### **🏗️ Needs Rebuilding**
- [ ] Database table structure validation
- [ ] System configuration check
- [ ] Frontend state reset
- [ ] New project creation test

## 🔧 Rebuild Steps

### **Step 1: Validate System Foundation**

1. **Check database table structure**
   ```bash
   sqlite3 data/autoclip.db ".schema"
   ```

2. **Check directory structure**
   ```bash
   tree data/ -L 3
   ```

3. **Verify configuration files**
   - `backend/core/config.py`
   - `backend/core/unified_paths.py`

### **Step 2: System Startup Test**

1. **Start backend service**
   ```bash
   cd backend
   python main.py
   ```

2. **Start frontend service**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Check service status**
   - Backend API: http://localhost:8000/health
   - Frontend page: http://localhost:3000

### **Step 3: Create Test Project**

1. **Upload test video**
   - Use frontend interface to upload a short video
   - Verify project creation process

2. **Check data consistency**
   - Verify database records
   - Verify file system structure
   - Verify frontend display

## 📁 New Directory Structure

```
data/
├── autoclip.db                 # Clean database
├── autoclip_backup_*.db        # Database backups
├── projects/                   # Empty project directory
├── output/                     # Empty output directory
│   ├── clips/                  # Clip videos
│   ├── collections/            # Collection videos
│   └── metadata/               # Metadata
├── temp/                       # Temporary files
├── cache/                      # Cache files
├── uploads/                    # Upload files
└── backups/                    # Backup files
```

## 🚀 Best Practices

### **1. Data Management**
- Sync metadata to database immediately after each project completion
- Run data consistency checks regularly
- Clean temporary files and cache promptly

### **2. Path Management**
- Use unified path manager
- Avoid hardcoded paths
- Validate path configuration regularly

### **3. State Synchronization**
- Ensure file system, database, and frontend state consistency
- Use WebSocket for real-time status updates
- Provide manual sync mechanism

## 🔍 Monitoring and Checking

### **1. Regular Project Checks**
```bash
# Check database status
python scripts/check_database_status.py

# Check file system consistency
python scripts/validate_paths.py

# Check frontend state
python scripts/check_frontend_state.py
```

### **2. Data Synchronization**
```bash
# Sync all project metadata
python scripts/sync_complete_metadata.py

# Sync specific project
python scripts/sync_complete_metadata.py <project_id>
```

### **3. Path Validation**
```bash
# Validate all path configurations
python scripts/validate_paths.py
```

## 🚨 Important Notes

### **1. Development Phase**
- Backup important data before each test
- Use small files for functionality testing
- Clean test data promptly

### **2. Production Environment**
- Regular backups of database and important files
- Monitor disk space usage
- Set up log rotation and cleanup

### **3. Disaster Recovery**
- Keep database backups
- Record system configuration changes
- Establish disaster recovery procedures

## 📚 Related Documentation

- [System Architecture](SYSTEM_ARCHITECTURE.md)
- [Path Fix Summary](PATH_FIX_SUMMARY.md)
- [Quick Start Guide](../QUICK_START_GUIDE.md)

## 🎉 Rebuild Completion Checklist

- [ ] System starts normally
- [ ] Database connection normal
- [ ] Frontend display normal
- [ ] Project creation process normal
- [ ] Data consistency check passed
- [ ] Path configuration validation passed
- [ ] Documentation updated

---

**After rebuild completion, the system will have:**
- Clear data storage architecture
- Consistent data synchronization mechanism
- Reliable path management
- Complete monitoring and checking tools
- Detailed documentation and guides
