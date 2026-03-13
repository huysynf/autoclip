# 🎤 bcut-asr Integration Guide

## 📋 Overview

AutoClip has successfully integrated the **bcut-asr** speech recognition API and implements a strategy of **calling bcut-asr first, then automatically falling back to the local Whisper model on failure**. This significantly improves transcription speed while preserving reliability.

## ✨ Key features

### 🚀 Performance advantages

- **Faster**: bcut-asr is a cloud service and is much faster than local Whisper
- **High accuracy**: JianYing/BiJian speech recognition is generally accurate
- **Multiple formats**: Supports `flac`, `aac`, `m4a`, `mp3`, `wav`, etc.
- **Automatic transcoding**: Automatically uses ffmpeg to extract audio and handle other formats

### 🔄 Smart fallback mechanism

- **Primary method**: Prefer bcut-asr for speech recognition
- **Fallback method**: Automatically switch to the local Whisper model if bcut-asr fails
- **Seamless switching**: No user intervention required

### 🎯 Multiple output formats

- **SRT**: Standard subtitle format (default)
- **JSON**: Structured output
- **LRC**: Lyrics format
- **TXT**: Plain text

## 🔧 Installation and configuration

### 🚀 Automatic installation (recommended)

AutoClip can automatically install and set up bcut-asr dependencies:

```python
# Use directly; dependencies are installed automatically
from backend.utils.speech_recognizer import generate_subtitle_for_video
from pathlib import Path

video_path = Path("your_video.mp4")
subtitle_path = generate_subtitle_for_video(video_path, method="auto")
```

### 📋 Manual installation (fallback option)

If automatic installation fails, you can install manually.

#### 1. Run the install scripts

```bash
# Run the bcut-asr install script
python scripts/install_bcut_asr.py

# Or run the speech-recognition environment setup script
python scripts/setup_speech_recognition.py
```

#### 2. Install bcut-asr manually

```bash
# Clone the repo
git clone https://github.com/SocialSisterYi/bcut-asr.git
cd bcut-asr

# Build
poetry lock
poetry build -f wheel

# Install the wheel
pip install dist/bcut_asr-0.0.3-py3-none-any.whl
```

#### 3. Ensure ffmpeg is installed

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows
winget install ffmpeg
```

#### 4. Get a step-by-step manual guide

```bash
python scripts/manual_install_guide.py
```

### 3. Verify the installation

```bash
python scripts/test_auto_install.py
```

## 🚀 Usage

### Auto mode (recommended)

```python
from backend.utils.speech_recognizer import generate_subtitle_for_video
from pathlib import Path

# Automatically pick the best method (prefer bcut-asr, fallback to Whisper)
video_path = Path("your_video.mp4")
subtitle_path = generate_subtitle_for_video(
    video_path,
    method="auto",
    enable_fallback=True
)
```

### Specify methods manually

```python
from backend.utils.speech_recognizer import (
    SpeechRecognizer,
    SpeechRecognitionConfig,
    SpeechRecognitionMethod
)

# Create config
config = SpeechRecognitionConfig(
    method=SpeechRecognitionMethod.BCUT_ASR,
    fallback_method=SpeechRecognitionMethod.WHISPER_LOCAL,
    enable_fallback=True,
    output_format="srt"
)

# Create recognizer
recognizer = SpeechRecognizer(config)

# Generate subtitles
subtitle_path = recognizer.generate_subtitle(video_path, config=config)
```

### Use bcut-asr only

```python
config = SpeechRecognitionConfig(
    method=SpeechRecognitionMethod.BCUT_ASR,
    enable_fallback=False  # disable fallback
)
```

### Use Whisper only

```python
config = SpeechRecognitionConfig(
    method=SpeechRecognitionMethod.WHISPER_LOCAL,
    enable_fallback=False
)
```

## 📊 Method priority

AutoClip selects speech recognition methods in the following priority order:

1. **bcut-asr** - Cloud service, fast
2. **whisper_local** - Local model, reliable
3. **openai_api** - OpenAI API (requires configuration)
4. **azure_speech** - Azure Speech (requires configuration)
5. **google_speech** - Google Speech (requires configuration)
6. **aliyun_speech** - Alibaba Cloud Speech (requires configuration)

## 🔍 Status checks

### Check available methods

```python
from backend.utils.speech_recognizer import get_available_speech_recognition_methods

available_methods = get_available_speech_recognition_methods()
print(available_methods)
# Example: {'bcut_asr': True, 'whisper_local': True, ...}
```

### Check recognizer status

```python
from backend.utils.speech_recognizer import SpeechRecognizer

recognizer = SpeechRecognizer()
available_methods = recognizer.get_available_methods()
supported_languages = recognizer.get_supported_languages()
whisper_models = recognizer.get_whisper_models()
```

## ⚠️ Notes

### Network requirements

- bcut-asr requires an internet connection
- If the network is unstable, AutoClip will automatically fall back to Whisper

### File size limits

- bcut-asr may impose file size limits
- For very large files, consider compressing or splitting first

### Privacy considerations

- bcut-asr uploads audio to the cloud for processing
- For sensitive content, prefer local Whisper

## 🐛 Troubleshooting

### bcut-asr is not available

```bash
# Check if installed
python -c "import bcut_asr; print('bcut-asr is installed')"

# Reinstall
pip uninstall bcut-asr
# Then follow the installation steps again
```

### ffmpeg is not available

```bash
ffmpeg -version
```

### Fallback does not work

```python
from backend.utils.speech_recognizer import get_available_speech_recognition_methods

available_methods = get_available_speech_recognition_methods()
print(f"bcut-asr: {available_methods.get('bcut_asr', False)}")
print(f"whisper: {available_methods.get('whisper_local', False)}")
```

## 📈 Performance comparison

| Method | Speed | Accuracy | Network required | Privacy |
|------|------|--------|----------|--------|
| bcut-asr | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Yes | Cloud processing |
| whisper | ⭐⭐ | ⭐⭐⭐⭐⭐ | No | Local processing |

## 🔮 Roadmap

1. **More cloud services**: integrate additional speech recognition providers
2. **Smarter selection**: choose methods based on file size and network conditions
3. **Batch processing**: support speech recognition for multiple files
4. **Real-time recognition**: support streaming / real-time speech recognition

## 📞 Support

If you run into issues:

1. Check the log file at `logs/backend.log`
2. Run the test script `python scripts/test_bcut_asr_integration.py`
3. Verify network connectivity and dependencies
4. Open an issue in the project repository

---

**🎉 Enjoy a faster speech recognition experience!**
