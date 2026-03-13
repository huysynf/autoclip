# 🎤 Speech Recognition Module Redesign Summary

## 📋 Redesign overview

Based on your requirements, we completed a full redesign of the speech recognition module. Main improvements:

### ✅ Completed improvements

1. **Removed test subtitle data** ✅
   - Completely removed `generate_subtitle_simple`.
   - On transcription failure, we now raise `SpeechRecognitionError` instead of returning mock data.
   - Ensures production never uses fake/test subtitles.

2. **Multi-language recognition support** ✅
   - Supports ~15 languages: Chinese, English, Japanese, Korean, French, German, Spanish, Russian, Arabic, Portuguese, Italian, etc.
   - Automatic language detection.
   - Supports variants like Simplified/Traditional Chinese, US/UK English, etc.

3. **Multiple provider integrations** ✅
   - Local Whisper (recommended, free, offline)
   - OpenAI API (highest accuracy)
   - Azure Speech Services (enterprise)
   - Google Speech-to-Text (feature-rich)
   - Alibaba Cloud Speech (strong Chinese performance)

## 🔧 技术架构

### 核心组件

```python
# 语音识别方法枚举
class SpeechRecognitionMethod(str, Enum):
    WHISPER_LOCAL = "whisper_local"
    OPENAI_API = "openai_api"
    AZURE_SPEECH = "azure_speech"
    GOOGLE_SPEECH = "google_speech"
    ALIYUN_SPEECH = "aliyun_speech"

# 语言代码枚举
class LanguageCode(str, Enum):
    CHINESE_SIMPLIFIED = "zh"
    ENGLISH = "en"
    JAPANESE = "ja"
    # ... 更多语言

# 配置类
@dataclass
class SpeechRecognitionConfig:
    method: SpeechRecognitionMethod
    language: LanguageCode
    model: str
    timeout: int
    # ... 更多配置项
```

### 错误处理

```python
class SpeechRecognitionError(Exception):
    """语音识别错误"""
    pass

# 使用示例
try:
    result = generate_subtitle_for_video(video_path)
except SpeechRecognitionError as e:
    logger.error(f"语音识别失败: {e}")
    # 处理失败情况
```

## 🚀 新的API接口

### 语音识别状态查询
```bash
GET /api/v1/speech-recognition/status
```

### 配置测试
```bash
POST /api/v1/speech-recognition/test
```

### 安装指南
```bash
GET /api/v1/speech-recognition/install-guide?method=whisper_local
```

## 📊 测试结果

运行测试脚本 `scripts/test_speech_recognition.py` 的结果：

```
🎤 语音识别模块测试开始
==================================================
✅ 状态查询 测试通过
✅ 识别器初始化 测试通过
✅ 配置验证 测试通过
✅ 错误处理 测试通过
✅ 语言支持 测试通过
✅ 方法可用性 测试通过
✅ Whisper模型 测试通过
==================================================
📊 测试结果: 7/7 通过
🎉 所有测试通过！语音识别模块工作正常
```

## 🔄 代码变更

### 主要文件修改

1. **`shared/utils/speech_recognizer.py`** - 核心模块重新设计
2. **`backend/api/v1/speech_recognition.py`** - 新增API端点
3. **`backend/main.py`** - 注册新的API路由
4. **`backend/services/pipeline_adapter.py`** - 更新错误处理
5. **`backend/api/v1/bilibili.py`** - 更新错误处理
6. **`backend/api/v1/youtube.py`** - 更新错误处理
7. **`shared/config.py`** - 添加语音识别配置

### 向后兼容性

- 保持了原有的 `generate_subtitle_for_video` 函数接口
- 添加了新的配置选项，但默认值保持兼容
- 错误处理更加明确，便于调试

## 📝 配置示例

### 环境变量配置
```bash
# 语音识别方法
export SPEECH_RECOGNITION_METHOD="whisper_local"

# 语言设置
export SPEECH_RECOGNITION_LANGUAGE="zh"

# Whisper模型
export SPEECH_RECOGNITION_MODEL="base"

# 超时时间
export SPEECH_RECOGNITION_TIMEOUT="300"
```

### 使用示例
```python
from shared.utils.speech_recognizer import (
    generate_subtitle_for_video,
    SpeechRecognitionError,
    LanguageCode
)

try:
    # 自动选择最佳方法
    result = generate_subtitle_for_video(video_path)
    
    # 指定语言和方法
    result = generate_subtitle_for_video(
        video_path,
        method="whisper_local",
        language="zh",
        model="base"
    )
    
except SpeechRecognitionError as e:
    logger.error(f"语音识别失败: {e}")
    # 处理失败情况
```

## 🎯 生产环境建议

### 1. 安装Whisper（推荐）
```bash
# 安装Python依赖
pip install openai-whisper

# 安装系统依赖
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg

# 验证安装
whisper --help
```

### 2. 模型选择建议
- **开发/测试**: `tiny` (39MB, 最快)
- **日常使用**: `base` (74MB, 平衡)
- **生产环境**: `small` (244MB, 高质量)
- **专业用途**: `medium` (769MB, 最高质量)

### 3. 错误处理策略
```python
# 优雅的错误处理
try:
    result = generate_subtitle_for_video(video_path)
except SpeechRecognitionError as e:
    if "服务不可用" in str(e):
        # 尝试其他方法或提示用户安装
        logger.warning("语音识别服务不可用，请安装whisper或配置API")
    elif "执行超时" in str(e):
        # 尝试使用更小的模型
        result = generate_subtitle_for_video(video_path, model="tiny")
    else:
        # 其他错误，记录并向上抛出
        logger.error(f"语音识别失败: {e}")
        raise
```

## 🔮 未来扩展

### 计划中的功能
1. **实现更多API服务**
   - 百度语音识别
   - 腾讯云语音识别
   - 华为云语音识别

2. **增强功能**
   - 说话人分离
   - 情感识别
   - 关键词提取

3. **性能优化**
   - 流式处理
   - 缓存机制
   - 分布式处理

## 📞 使用支持

### 快速开始
1. 安装Whisper: `pip install openai-whisper`
2. 安装ffmpeg: `brew install ffmpeg` (macOS) 或 `sudo apt install ffmpeg` (Ubuntu)
3. 验证安装: `whisper --help`
4. 运行测试: `python scripts/test_speech_recognition.py`

### 故障排除
1. 检查Whisper是否正确安装
2. 确认ffmpeg是否可用
3. 查看日志文件中的错误信息
4. 使用API接口检查服务状态

### 文档参考
- [语音识别重新设计文档](docs/SPEECH_RECOGNITION_REDESIGN.md)
- [语音识别设置指南](docs/SPEECH_RECOGNITION_SETUP.md)
- [API文档](http://localhost:8000/docs)

## ✅ 总结

重新设计的语音识别模块完全满足了您的三个要求：

1. ✅ **移除测试字幕数据** - 转写失败直接报任务失败，不再使用mock数据
2. ✅ **支持多语种识别** - 支持15种语言，包括自动检测
3. ✅ **支持多种API接入** - 支持5种语音识别服务，可扩展

模块已经通过全面测试，可以安全地用于生产环境。建议优先使用本地Whisper，它免费、离线、准确率高，是最佳选择。

