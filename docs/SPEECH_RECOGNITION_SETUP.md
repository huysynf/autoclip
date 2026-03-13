# 🎤 Speech Recognition Setup Guide

## 📋 Overview

AutoClip supports multiple speech recognition methods to generate subtitle files. When a video has no subtitles, the system can automatically generate subtitles to ensure the pipeline can run end-to-end.

## 🔧 Supported speech recognition methods

### 1. Local Whisper (recommended)

**Highlights:**

- ✅ Runs fully locally (no network required)
- ✅ No API key required
- ✅ Free to use
- ✅ Supports many languages
- ✅ Good accuracy

**Installation:**

```bash
# Option 1: install via pip
pip install openai-whisper

# Option 2: install via conda
conda install -c conda-forge openai-whisper

# Option 3: install from source
git clone https://github.com/openai/whisper.git
cd whisper
pip install -e .
```

**Verify installation:**

```bash
whisper --help
```

**Model selection:**

- `tiny`: 39MB, fastest, lower accuracy
- `base`: 74MB, fast, medium accuracy (default)
- `small`: 244MB, medium speed, higher accuracy
- `medium`: 769MB, slower, very high accuracy
- `large`: 1550MB, slowest, highest accuracy

### 2. OpenAI API (planned)

**Highlights:**

- ✅ Highest accuracy
- ✅ Supports many languages
- ❌ Requires an API key
- ❌ Requires network connectivity
- ❌ Usage cost applies

**Setup:**

```bash
export OPENAI_API_KEY="your-api-key-here"
```

### 3. Test subtitles (fallback option)

**Highlights:**

- ✅ No dependencies required
- ✅ Available immediately
- ❌ Only placeholder content, not real subtitles
- ❌ Limited usefulness for real pipeline quality

## 🚀 How to use

### Auto mode (default)

The system automatically selects the best available method:

```python
from shared.utils.speech_recognizer import generate_subtitle_for_video

# Auto-select the best method
result = generate_subtitle_for_video(video_path, method="auto")
```

### Specify a method manually

```python
# Force local Whisper
result = generate_subtitle_for_video(video_path, method="whisper_local")

# Force OpenAI API
result = generate_subtitle_for_video(video_path, method="openai_api")

# Force test subtitles
result = generate_subtitle_for_video(video_path, method="simple")
```

### Check available methods

```python
from shared.utils.speech_recognizer import get_available_speech_recognition_methods

methods = get_available_speech_recognition_methods()
print(methods)
# Example output:
# {
#     "whisper_local": True,
#     "openai_api": False,
#     "simple": True
# }
```

## 📝 Configuration options

### Adjust Whisper parameters

You can tune Whisper parameters in `shared/utils/speech_recognizer.py`:

```python
cmd = [
    'whisper',
    str(video_path),
    '--output_dir', str(output_path.parent),
    '--output_format', 'srt',
    '--language', 'zh',  # zh (Chinese), en (English), auto (auto-detect)
    '--model', 'base'    # tiny, base, small, medium, large
]
```

### Common parameters

- `--language`: specify the language to improve accuracy
- `--model`: choose model size (trade-off between speed and accuracy)
- `--output_format`: output format (srt, vtt, txt, etc.)
- `--task`: `transcribe` or `translate`

## 🔍 Troubleshooting

### Whisper installation issues

**Issue:** `whisper: command not found`

**Fix:**

```bash
# Check installation
pip list | grep whisper

# Reinstall
pip uninstall openai-whisper
pip install openai-whisper

# Check PATH
which whisper
```

**Issue:** missing dependencies

**Fix:**

```bash
# System dependencies (Ubuntu/Debian)
sudo apt update
sudo apt install ffmpeg

# System dependencies (macOS)
brew install ffmpeg

# Python deps (if needed)
pip install torch torchvision torchaudio
```

### Performance tuning

**Issue:** Whisper is too slow

**Fix:**

1. Use a smaller model: `--model tiny`
2. Use GPU acceleration (if available)
3. Split long videos into segments

**Issue:** out of memory

**Fix:**

1. Use a smaller model
2. Increase system RAM
3. Use CPU mode

## 📊 Performance comparison

| Method | Speed | Accuracy | Cost | Network | Setup difficulty |
|------|------|--------|------|----------|----------|
| Whisper tiny | ⭐⭐⭐⭐⭐ | ⭐⭐ | Free | No | Easy |
| Whisper base | ⭐⭐⭐⭐ | ⭐⭐⭐ | Free | No | Easy |
| Whisper small | ⭐⭐⭐ | ⭐⭐⭐⭐ | Free | No | Easy |
| Whisper medium | ⭐⭐ | ⭐⭐⭐⭐⭐ | Free | No | Easy |
| OpenAI API | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Paid | Yes | Easy |
| Test subtitles | ⭐⭐⭐⭐⭐ | ⭐ | Free | No | None |

## 🎯 Recommended setup

### Development

```bash
# Install base model (balanced speed and accuracy)
pip install openai-whisper
```

### Production

```bash
# Consider small/medium for higher accuracy
pip install openai-whisper
# Consider enabling GPU acceleration
```

### Testing

```bash
# No installation required when using test subtitles
```

## 📞 Support

If you run into issues:

1. Check error messages in logs
2. Verify Whisper is installed correctly
3. Confirm the video format is supported
4. Check system resources

References:

- [Whisper docs](https://github.com/openai/whisper)
- [OpenAI API docs](https://platform.openai.com/docs/api-reference)
