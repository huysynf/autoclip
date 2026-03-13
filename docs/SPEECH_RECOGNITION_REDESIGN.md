# 🎤 Speech Recognition Module Redesign

## 📋 Overview

Based on user requirements, we redesigned the speech recognition module end-to-end. Key improvements include:

1. **Removed test subtitle data**: if transcription fails, the task fails (no more mock subtitles).
2. **Multi-language recognition**: supports Chinese, English, Japanese, Korean, and more.
3. **Multiple provider integrations**: local Whisper, OpenAI API, Azure Speech Services, etc.

## 🔧 Key improvements

### 1. Remove the “test subtitles” feature

**Problems before:**

- When speech recognition failed, the system generated a test subtitle file.
- Test subtitle content was inaccurate and reduced downstream processing quality.
- Users could mistakenly think the task succeeded.

**Now:**

- Test subtitle generation is completely removed.
- Speech recognition failures raise exceptions directly.
- Improves data quality in production.

```python
# Before: return None or test subtitles
result = generate_subtitle_for_video(video_path)
if result is None:
    # generate test subtitles...

# Now: raise an exception on failure
try:
    result = generate_subtitle_for_video(video_path)
except SpeechRecognitionError as e:
    logger.error(f"Speech recognition failed: {e}")
    raise
```

### 2. Multi-language support

**Supported languages:**

- Chinese (Simplified/Traditional)
- English (US/UK)
- Japanese
- Korean
- French
- German
- Spanish
- Russian
- Arabic
- Portuguese
- Italian
- Auto-detect

**Usage:**

```python
from shared.utils.speech_recognizer import generate_subtitle_for_video, LanguageCode

# Specify language
result = generate_subtitle_for_video(
    video_path,
    language=LanguageCode.CHINESE_SIMPLIFIED
)

# Auto-detect language
result = generate_subtitle_for_video(
    video_path,
    language=LanguageCode.AUTO
)
```

### 3. Multiple speech recognition services

**Supported providers:**

| Provider | Highlights | Requirements |
|------|------|----------|
| Local Whisper | Free, offline, high accuracy | Install whisper + ffmpeg |
| OpenAI API | Highest accuracy, multilingual | OpenAI API key |
| Azure Speech | Enterprise-grade, feature-rich | Azure account + API key |
| Google Speech | High accuracy, advanced features | Google Cloud account |
| Alibaba Cloud Speech | Strong Chinese performance | Alibaba Cloud account + API key |

**Auto-selection strategy (priority order):**

1. Local Whisper (recommended)
2. OpenAI API
3. Azure Speech Services
4. Google Speech-to-Text
5. Alibaba Cloud Speech Recognition

## 🚀 New API endpoints

### Speech recognition status

```bash
GET /api/v1/speech-recognition/status
```

Response:

```json
{
  "available_methods": {
    "whisper_local": true,
    "openai_api": false,
    "azure_speech": false,
    "google_speech": false,
    "aliyun_speech": false
  },
  "supported_languages": ["zh", "en", "ja", "ko", "auto"],
  "whisper_models": ["tiny", "base", "small", "medium", "large"],
  "default_config": {
    "method": "whisper_local",
    "language": "auto",
    "model": "base",
    "timeout": 300
  }
}
```

### Configuration test

```bash
POST /api/v1/speech-recognition/test
```

Request body:

```json
{
  "method": "whisper_local",
  "language": "zh",
  "model": "base",
  "timeout": 300
}
```

### Installation guide

```bash
GET /api/v1/speech-recognition/install-guide?method=whisper_local
```

## 📝 Configuration management

### Environment variables

```bash
export SPEECH_RECOGNITION_METHOD="whisper_local"
export SPEECH_RECOGNITION_LANGUAGE="zh"
export SPEECH_RECOGNITION_MODEL="base"
export SPEECH_RECOGNITION_TIMEOUT="300"

# API keys (depending on provider)
export OPENAI_API_KEY="your-openai-key"
export AZURE_SPEECH_KEY="your-azure-key"
export AZURE_SPEECH_REGION="your-region"
export GOOGLE_APPLICATION_CREDENTIALS="path/to/credentials.json"
export ALIYUN_ACCESS_KEY_ID="your-access-key"
export ALIYUN_ACCESS_KEY_SECRET="your-secret-key"
export ALIYUN_SPEECH_APP_KEY="your-app-key"
```

### Settings file

Configure in `data/settings.json`:

```json
{
  "speech_recognition_method": "whisper_local",
  "speech_recognition_language": "zh",
  "speech_recognition_model": "base",
  "speech_recognition_timeout": 300
}
```

## 🔍 Error handling

### New exception type

```python
from shared.utils.speech_recognizer import SpeechRecognitionError

try:
    result = generate_subtitle_for_video(video_path)
except SpeechRecognitionError as e:
    logger.error(f"Speech recognition failed: {e}")
    # Optionally retry or choose a different method
```

### Error categories

1. **Service unavailable**: provider is not installed/configured.
2. **File not found**: video file missing or inaccessible.
3. **Timeout**: recognition timed out.
4. **Execution failure**: provider failed during execution.
5. **Configuration error**: invalid parameters.

## 📊 Performance tuning

### Whisper model selection

| Model | Size | Speed | Accuracy | Use case |
|------|------|------|--------|----------|
| tiny | 39MB | ⭐⭐⭐⭐⭐ | ⭐⭐ | quick testing |
| base | 74MB | ⭐⭐⭐⭐ | ⭐⭐⭐ | daily usage |
| small | 244MB | ⭐⭐⭐ | ⭐⭐⭐⭐ | higher quality |
| medium | 769MB | ⭐⭐ | ⭐⭐⭐⭐⭐ | professional |
| large | 1550MB | ⭐ | ⭐⭐⭐⭐⭐ | best quality |

### Timeout recommendations

- Short videos (<5 minutes): 60s
- Medium videos (5-30 minutes): 300s
- Long videos (>30 minutes): 600s

## 🛠️ Installation guide

### Local Whisper installation

```bash
pip install openai-whisper

# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Windows: download ffmpeg and add it to PATH

whisper --help
```

### API provider configuration

#### OpenAI API

```bash
export OPENAI_API_KEY="your-api-key"
```

#### Azure Speech Services

```bash
export AZURE_SPEECH_KEY="your-api-key"
export AZURE_SPEECH_REGION="your-region"
```

#### Google Speech-to-Text

```bash
export GOOGLE_APPLICATION_CREDENTIALS="path/to/credentials.json"
```

#### Alibaba Cloud Speech Recognition

```bash
export ALIYUN_ACCESS_KEY_ID="your-access-key"
export ALIYUN_ACCESS_KEY_SECRET="your-secret-key"
export ALIYUN_SPEECH_APP_KEY="your-app-key"
```

## 🔄 Migration guide

### Migrating from the old version

1. **Update imports**

```python
# Old
from shared.utils.speech_recognizer import generate_subtitle_for_video

# New
from shared.utils.speech_recognizer import (
    generate_subtitle_for_video,
    SpeechRecognitionError,
    LanguageCode
)
```

2. **Update error handling**

```python
# Old
result = generate_subtitle_for_video(video_path)
if result is None:
    # handle failure

# New
try:
    result = generate_subtitle_for_video(video_path)
except SpeechRecognitionError as e:
    # handle failure
```

3. **Remove test subtitle code**

```python
# Delete this
if method == "simple":
    return recognizer.generate_subtitle_simple(video_path, output_path)
```

## 📈 Monitoring and logging

### Logging

```python
import logging
logger = logging.getLogger(__name__)

logger.info(f"Speech recognition started: {video_path}")
logger.info(f"Speech recognition succeeded: {output_path}")
logger.error(f"Speech recognition failed: {error}")
```

### Performance monitoring

Recommended metrics:

- Speech recognition success rate
- Processing latency
- Error category distribution
- Provider usage breakdown

## 🎯 Best practices

1. **Production**
   - Use `small` or `medium`
   - Configure reasonable timeouts
   - Add retries where appropriate

2. **Multilingual**
   - Prefer auto language detection
   - Specify language explicitly when known
   - Consider specialized providers for certain languages

3. **Error handling**
   - Handle failures gracefully
   - Provide user-friendly messages
   - Consider degradation/fallback strategies

4. **Performance**
   - Pick model size based on video length
   - Use GPU acceleration (if available)
   - Consider parallel processing for multiple videos

## 🔮 Roadmap

1. **More providers**
   - Baidu Speech Recognition
   - Tencent Cloud Speech Recognition
   - Huawei Cloud Speech Recognition

2. **Feature enhancements**
   - Speaker diarization
   - Emotion recognition
   - Keyword extraction

3. **Performance**
   - Streaming processing
   - Caching
   - Distributed processing

## 📞 Support

If you run into issues:

1. Check error messages in logs
2. Verify providers are installed/configured correctly
3. Confirm configuration values
4. Review API docs and installation guides

References:

- [Whisper docs](https://github.com/openai/whisper)
- [OpenAI API docs](https://platform.openai.com/docs/api-reference)
- [Azure Speech Services docs](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/)
- [Google Speech-to-Text docs](https://cloud.google.com/speech-to-text/docs)
- [Alibaba Cloud Speech docs](https://help.aliyun.com/product/30413.html)
