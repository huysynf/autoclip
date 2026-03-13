# 🎤 Whisper-First Subtitle Generation Strategy

## 📋 Overview

Based on user feedback, we redesigned the subtitle generation strategy to **prioritize generating subtitles with Whisper** instead of relying on subtitles from Bilibili/YouTube. This delivers a better user experience and more consistent subtitle quality.

## 🔄 New subtitle generation flow

### 1. Priority order

```text
User SRT upload → Whisper-generated subtitles → Platform subtitles (fallback)
```

**Detailed flow:**

1. **User-provided subtitles**: If the user uploads an SRT file, use it directly.
2. **Whisper generation**: If there is no user SRT, run Whisper first.
3. **Platform subtitles as backup**: If Whisper fails, attempt to fetch platform subtitles only.

### 2. Intelligent model selection

Whisper model is selected based on content type:

| Content type         | Model   | Characteristics          | Typical use cases                              |
|----------------------|---------|--------------------------|-----------------------------------------------|
| Business / Knowledge | `small` | Higher accuracy          | Tutorials, courses, explainers, tech content  |
| Speeches / Lectures  | `medium`| Very high precision      | Talks, keynotes, lecture recordings           |
| Entertainment        | `base`  | Balanced speed/accuracy  | Entertainment, gaming, lifestyle              |
| Default              | `base`  | General-purpose          | Other types                                   |

### 3. Language detection strategy

- **Auto-detect**: Default is `auto` so Whisper detects the language.
- **Chinese-heavy content**: Business/knowledge/speech content can be explicitly set to `zh`.
- **Multi-language support**: Supports ~15 languages (Chinese, English, Japanese, etc.).

## 🚀 Technical advantages

### 1. Consistency

- ✅ All videos follow a uniform subtitle-generation pipeline.
- ✅ Unified subtitle format simplifies downstream processing.
- ✅ Quality is controllable and not tied to external platforms.

### 2. Better editing experience

- ✅ Whisper’s SRT output is editor-friendly.
- ✅ Timestamp accuracy is generally higher.
- ✅ Supports fine-grained timestamps (word/segment-level).

### 3. Multi-language support

- ✅ Supports many languages (Chinese, English, Japanese, etc.).
- ✅ Automatic language detection.
- ✅ Works reasonably well with different accents and dialects.

### 4. Operational advantages

- ✅ Runs locally; no network dependency required.
- ✅ Free to use; no per-request API cost.
- ✅ Model size is configurable (from `tiny` to `large`).
- ✅ Can be extended to support speaker diarization in the future.

## 📊 Whisper vs platform subtitles

| Aspect               | Whisper-generated          | Platform subtitles            |
|----------------------|----------------------------|-------------------------------|
| Availability         | 100% (if model is local)   | Only if platform provides it |
| Format consistency   | High                       | Varies by video/platform     |
| Timestamp precision  | High                       | Medium                        |
| Multi-language       | 15+ languages              | Platform-dependent            |
| Editor friendliness  | High (clean SRT)           | Medium                        |
| Network dependency   | None (local)               | Yes                           |
| Cost                 | Free                       | Free but limited by platform |

## 🔧 Configuration

### Environment requirements

```bash
# Install Whisper
pip install openai-whisper

# Install FFmpeg (required)
# macOS
brew install ffmpeg

# Ubuntu
sudo apt update && sudo apt install ffmpeg

# Windows
# Download FFmpeg and add it to PATH
```

### Model selection examples

```python
# Choose model based on content type
if content_type in ("business", "knowledge"):
    model = "small"   # higher accuracy for important content
elif content_type == "speech":
    model = "medium"  # very high precision, OK to be slower
else:
    model = "base"    # good balance between speed and quality
```

## 📈 Impact

### 1. Subtitle quality

- More accurate timestamps.
- More accurate text recognition (especially with `small` / `medium`).
- Consistent formatting across videos.

### 2. Editing workflow

- Supports fine-grained editing.
- Better alignment with timelines.
- Unified SRT structure across all projects.

### 3. Pipeline robustness

- Reduced dependence on third-party subtitle availability.
- Lower failure rate due to missing/unsupported platform subtitles.
- More predictable processing time.

## 🛠️ Troubleshooting

### FAQ

1. **Whisper not installed**

   ```bash
   pip install openai-whisper
   ```

2. **FFmpeg not installed**

   ```bash
   ffmpeg -version
   ```

3. **Model download failed**

   ```bash
   # Force a model download / verify install
   whisper --model base --help
   ```

4. **Out-of-memory issues**

- Use smaller models (`tiny` or `base`).
- Increase system RAM or use swap.
- Split long videos into smaller chunks.

### Performance tuning

1. **Model choice**
   - Short videos: `tiny` or `base`.
   - Long videos: `base` or `small`.
   - Critical quality: `medium` or `large` (if resources allow).

2. **Language configuration**
   - Known language: explicitly specify `--language`.
   - Unknown / mixed content: use `auto` for detection.

3. **Batch processing**
   - Run multiple videos in parallel where hardware allows.
   - Use a queue system to manage jobs.

## 📝 Summary

Adopting a Whisper-first strategy for subtitle generation provides:

1. **Better user experience**: More consistent subtitle quality and fewer failures.
2. **Stronger technical capabilities**: Multi-language support, high-precision timestamps.
3. **Simpler maintenance**: Less reliance on external subtitle sources.
4. **Lower cost**: No per-request API fees when running locally.

This strategy is particularly suitable for workflows that demand high-quality subtitle editing and provides a stronger foundation for downstream video-processing steps.

