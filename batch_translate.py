#!/usr/bin/env python3
"""
Batch translation script for AutoClip documentation
Translates Chinese documentation to English while preserving formatting
"""
import os
import re
from pathlib import Path

# Translation mapping for common technical terms
TERM_MAPPING = {
    "项目": "project",
    "切片": "clip",
    "合集": "collection",
    "处理": "processing",
    "上传": "upload",
    "下载": "download",
    "配置": "configuration",
    "设置": "settings",
    "文件": "file",
    "视频": "video",
    "字幕": "subtitle",
    "数据库": "database",
    "前端": "frontend",
    "后端": "backend",
    "接口": "API",
    "服务": "service",
    "任务": "task",
    "状态": "status",
    "错误": "error",
    "成功": "success",
    "失败": "failure",
    "完成": "completed",
    "进行中": "in progress",
    "等待": "pending",
}

def has_chinese(text):
    """Check if text contains Chinese characters"""
    return bool(re.search(r'[\u4e00-\u9fff]', text))

def get_files_to_translate():
    """Get list of files that need translation"""
    docs_dir = Path("docs")
    files_with_chinese = []
    
    for md_file in docs_dir.glob("*.md"):
        try:
            content = md_file.read_text(encoding='utf-8')
            if has_chinese(content):
                files_with_chinese.append(md_file)
        except Exception as e:
            print(f"Error reading {md_file}: {e}")
    
    return files_with_chinese

def main():
    files = get_files_to_translate()
    
    print(f"Found {len(files)} files with Chinese content:\n")
    
    # Group files by category
    categories = {
        "Fix Reports": [],
        "Guides": [],
        "Implementation": [],
        "System": [],
        "Other": []
    }
    
    for f in sorted(files):
        name = f.name
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
    
    for category, file_list in categories.items():
        if file_list:
            print(f"\n{category} ({len(file_list)} files):")
            for fname in file_list:
                print(f"  - {fname}")
    
    print(f"\n\nTotal: {len(files)} files need translation")
    print("\nTo translate these files, use Kiro with commands like:")
    print("  'Translate docs/BACKEND_ARCHITECTURE.md from Chinese to English'")
    print("\nOr translate by category:")
    print("  'Translate all Fix Reports in docs/ from Chinese to English'")

if __name__ == "__main__":
    main()
