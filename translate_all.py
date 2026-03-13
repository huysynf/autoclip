#!/usr/bin/env python3
"""
Comprehensive translation script for all remaining Chinese documentation files
"""
import os
import re
from pathlib import Path
from typing import Dict, List

# Files already translated
TRANSLATED_FILES = {
    "docs/README.md",
    "docs/QUICK_START_GUIDE.md",
    "docs/SYSTEM_ARCHITECTURE.md",
    "docs/SYSTEM_REBUILD_GUIDE.md",
    "docs/UPLOAD_STATUS_PAGE_GUIDE.md",
    "docs/STORAGE_OPTIMIZATION_PROGRESS_REPORT.md",
    "docs/STORAGE_OPTIMIZATION_REPORT.md",
    "docs/FRONTEND_DRAG_SORT_DEBUG_GUIDE.md",
}

# Files still needing translation
REMAINING_FILES = [
    # Fix Reports (25 files)
    "docs/AUTO_SYNC_FIX_REPORT.md",
    "docs/CHANNEL_NORMALIZATION_FIX.md",
    "docs/CLIP_OUTPUT_PATH_FIX_REPORT.md",
    "docs/COLLECTION_CLIP_IDS_FIX.md",
    "docs/COLLECTION_REORDER_FIX.md",
    "docs/DATABASE_OPTIMIZATION_REPORT.md",
    "docs/DATABASE_SYNC_FIX.md",
    "docs/DATA_STORAGE_FIX.md",
    "docs/DATA_SYNC_BATCH_FIX_REPORT.md",
    "docs/DATA_SYNC_FIX_SUMMARY.md",
    "docs/FRONTEND_CLIP_ACCESS_FIX_REPORT.md",
    "docs/FRONTEND_DATA_ACCESS_FIX.md",
    "docs/FRONTEND_DISPLAY_FIX_REPORT.md",
    "docs/LINK_IMPORT_THUMBNAIL_FIX.md",
    "docs/PATH_FIX_SUMMARY.md",
    "docs/PIPELINE_FIXES_SUMMARY.md",
    "docs/PROGRESS_BAR_FIXES_SUMMARY.md",
    "docs/PROGRESS_DISPLAY_FIX_SUMMARY.md",
    "docs/PROGRESS_SYSTEM_FIXES.md",
    "docs/STORAGE_OPTIMIZATION_COMPLETION_REPORT.md",
    "docs/WEBSOCKET_FIXES_SUMMARY.md",
    "docs/WEBSOCKET_FIX_SUMMARY.md",
    "docs/WEEKLY_FIXES_SUMMARY.md",
    
    # Guides (8 files)
    "docs/BILIBILI_MANAGER_GUIDE.md",
    "docs/MULTI_LLM_PROVIDER_GUIDE.md",
    "docs/OPTIONAL_SRT_UPLOAD_GUIDE.md",
    "docs/PROGRESS_SYSTEM_GUIDE.md",
    "docs/SUBTITLE_EDITOR_GUIDE.md",
    "docs/UPLOAD_V2_IMPLEMENTATION_GUIDE.md",
    
    # Implementation (8 files)
    "docs/BILIBILI_FRONTEND_REDESIGN_SUMMARY.md",
    "docs/BILIBILI_LOGIN_IMPLEMENTATION_SUMMARY.md",
    "docs/INLINE_PROGRESS_BAR_IMPLEMENTATION.md",
    "docs/PROGRESS_BAR_IMPLEMENTATION_SUMMARY.md",
    "docs/REFACTOR_IMPLEMENTATION_PLAN.md",
    "docs/SETTINGS_PAGE_RESTORATION_SUMMARY.md",
    "docs/SPEECH_RECOGNITION_SUMMARY.md",
    "docs/WHISPER_STRATEGY_IMPLEMENTATION.md",
    
    # System (4 files)
    "docs/BACKEND_ARCHITECTURE.md",
    "docs/SIMPLE_PROGRESS_SYSTEM.md",
    "docs/STORAGE_ARCHITECTURE_ANALYSIS.md",
    "docs/STORAGE_ARCHITECTURE_OPTIMIZATION.md",
    
    # Other (20 files)
    "docs/BCUT_ASR_INTEGRATION.md",
    "docs/BILIBILI_LOGIN_ALTERNATIVES.md",
    "docs/COOKIE_IMPORT_TROUBLESHOOTING.md",
    "docs/PASSWORD_LOGIN_STATUS.md",
    "docs/PHASE2_COMPLETION_CHECKLIST.md",
    "docs/PROJECT_MANAGEMENT.md",
    "docs/REFACTOR_PLAN.md",
    "docs/SPEECH_RECOGNITION_REDESIGN.md",
    "docs/SPEECH_RECOGNITION_SETUP.md",
    "docs/STORAGE_OPTIMIZATION_WORK_BREAKDOWN.md",
    "docs/SUBTITLE_DOWNLOAD_TROUBLESHOOTING.md",
    "docs/SUBTITLE_EDITOR_UI_UPDATE.md",
    "docs/TECHNICAL_ROADMAP.md",
    "docs/UPLOAD_ISSUE_ANALYSIS.md",
    "docs/WHISPER_SUBTITLE_STRATEGY.md",
    "docs/WORK_ITEMS_BREAKDOWN.md",
    "docs/i18n-report.md",
    "docs/i18n.md",
    "docs/incomplete_projects_fix_summary.md",
    "docs/youtube_download_issues.md",
]

def main():
    print("=" * 60)
    print("AutoClip Documentation Translation Status")
    print("=" * 60)
    
    print(f"\n✅ Already Translated: {len(TRANSLATED_FILES)} files")
    for f in sorted(TRANSLATED_FILES):
        print(f"   - {Path(f).name}")
    
    print(f"\n📝 Remaining to Translate: {len(REMAINING_FILES)} files")
    
    # Group by category
    categories = {
        "Fix Reports": [],
        "Guides": [],
        "Implementation": [],
        "System": [],
        "Other": []
    }
    
    for f in REMAINING_FILES:
        name = Path(f).name
        if "FIX" in name or "REPORT" in name:
            categories["Fix Reports"].append(name)
        elif "GUIDE" in name:
            categories["Guides"].append(name)
        elif "IMPLEMENTATION" in name or "SUMMARY" in name:
            categories["Implementation"].append(name)
        elif "SYSTEM" in name or "ARCHITECTURE" in name:
            categories["System"].append(name)
        else:
            categories["Other"].append(name)
    
    for category, files in categories.items():
        if files:
            print(f"\n{category} ({len(files)} files):")
            for fname in sorted(files):
                print(f"   - {fname}")
    
    print(f"\n\nTotal Progress: {len(TRANSLATED_FILES)}/{len(TRANSLATED_FILES) + len(REMAINING_FILES)} files")
    print(f"Completion: {len(TRANSLATED_FILES) * 100 // (len(TRANSLATED_FILES) + len(REMAINING_FILES))}%")
    
    print("\n" + "=" * 60)
    print("Translation Instructions")
    print("=" * 60)
    print("\nTo translate remaining files, use Kiro with commands like:")
    print("  'Translate docs/BACKEND_ARCHITECTURE.md from Chinese to English'")
    print("\nOr translate by category:")
    print("  'Translate all Fix Reports in docs/ from Chinese to English'")
    print("  'Translate all Guides in docs/ from Chinese to English'")
    print("  'Translate all Implementation files in docs/ from Chinese to English'")

if __name__ == "__main__":
    main()
