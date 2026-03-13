#!/bin/bash
# Script to help identify and translate remaining Chinese documentation files

echo "=== AutoClip Documentation Translation Status ==="
echo ""
echo "✅ Already Translated:"
echo "  - docs/README.md"
echo "  - docs/QUICK_START_GUIDE.md"
echo "  - docs/SYSTEM_ARCHITECTURE.md"
echo "  - docs/FRONTEND_DRAG_SORT_DEBUG_GUIDE.md (renamed from 前端拖拽排序调试指南.md)"
echo ""
echo "📝 Remaining files with Chinese content (62 files):"
echo ""

# List all files with Chinese content
for file in docs/*.md; do
    if grep -q '[一-龥]' "$file" 2>/dev/null; then
        basename "$file"
    fi
done | sort

echo ""
echo "💡 To translate a specific file, use Kiro to:"
echo "   1. Read the file"
echo "   2. Translate Chinese to English"
echo "   3. Write back to the same file"
echo ""
echo "Example: 'Translate docs/BACKEND_ARCHITECTURE.md from Chinese to English'"
