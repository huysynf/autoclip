# Optional SRT Upload Feature Guide

## Overview

AutoClip supports two upload workflows:

1. **Video + subtitle file**: user uploads both a video and an `.srt` subtitle file.  
2. **Video only**: user uploads only a video; the system uses speech recognition to generate subtitles.

## Feature behavior

### ✅ Smart upload mode

- **User-first**: if the user provides an SRT file, always use it.  
- **AI assist**: if only a video is uploaded, AutoClip generates subtitles via speech recognition.  
- **Error handling**: if speech recognition fails, the user gets a clear, actionable error.

### ✅ Multi-language support

- Supports ~15 languages.  
- Language can be chosen based on video category:
  - Business / knowledge: prefer Chinese (`zh`).  
  - Entertainment: auto-detect.  
  - Other: auto-detect.

### ✅ Multiple recognition backends

- Local Whisper (recommended).  
- OpenAI API.  
- Azure Speech Services.  
- Google Speech-to-Text.  
- Alibaba Cloud Speech.

## Usage

### Frontend UI changes

1. **Upload hint text**
   - Old: “You must upload a video and an `.srt` subtitle file.”  
   - New: “You can upload an `.srt` subtitle file or let AI generate subtitles automatically.”

2. **Smart UI hints**
   - Video + SRT: show both files.  
   - Video only: show “Subtitles will be generated automatically using AI speech recognition.”

3. **Button validation**
   - Old: required video + SRT + project name.  
   - New: requires video + project name (SRT optional).

### API changes

#### Upload endpoint `POST /api/v1/projects/upload`

**Parameter change:**

```python
# Before: srt_file required
srt_file: UploadFile = File(...)

# Now: srt_file optional
srt_file: Optional[UploadFile] = File(None)
```

**Request examples**

1. **Video + SRT**

```python
files = {
    "video_file": ("video.mp4", video_content, "video/mp4"),
    "srt_file": ("subtitle.srt", srt_content, "application/x-subrip"),
}
data = {
    "project_name": "My Project",
    "video_category": "knowledge",
}
```

2. **Video only**

```python
files = {
    "video_file": ("video.mp4", video_content, "video/mp4"),
}
data = {
    "project_name": "My Project",
    "video_category": "knowledge",
}
```

**Response example**

Success responses are structurally unchanged; the project description reflects how subtitles will be obtained:

```json
{
  "id": "project-id",
  "name": "My Project",
  "description": "Video: video.mp4 (Will generate subtitle using speech recognition)",
  "settings": {
    "auto_generate_subtitle": true,
    "video_category": "knowledge"
  }
}
```

**Error behavior**

If speech recognition fails, the API returns a 400 with detail:

```json
{
  "detail": "Speech recognition failed: no available recognition service. Please install Whisper or configure an API key, or upload an SRT subtitle file manually."
}
```

## Implementation details

### Backend

1. **Validation**

```python
# Video validation (required)
if not video_file.filename.lower().endswith((".mp4", ".avi", ".mov", ".mkv", ".webm")):
    raise HTTPException(status_code=400, detail="Invalid video file format")

# Subtitle validation (optional)
if srt_file and not srt_file.filename.lower().endswith(".srt"):
    raise HTTPException(status_code=400, detail="Invalid subtitle file format")
```

2. **Subtitle handling logic**

```python
if srt_file:
    # Save user-provided subtitle
    srt_path = save_user_subtitle(srt_file)
else:
    # Use speech recognition to generate subtitles
    srt_path = generate_subtitle_with_speech_recognition(video_path, language, model)
```

3. **Language-selection strategy**

```python
# Choose language based on video category
language = "auto"  # default: auto-detect

if video_category in ["business", "knowledge"]:
    language = "zh"
elif video_category == "entertainment":
    language = "auto"  # often multi-language
```

### Frontend

1. **Upload logic**

```typescript
// Subtitle file is now optional
if (!files.video) {
  message.error("Please select a video file");
  return;
}
// Old requirement for mandatory SRT is removed
// if (!files.srt) {
//   message.error("Please upload a subtitle (.srt) file");
//   return;
// }
```

2. **UI hints**

```typescript
// Smart hint
{files.video && !files.srt && (
  <div>Subtitles will be generated automatically using AI speech recognition.</div>
)}
```

3. **API call**

```typescript
const formData = new FormData();
formData.append("video_file", data.video_file);
if (data.srt_file) {
  formData.append("srt_file", data.srt_file);
}
```

## Configuration

### Speech-recognition backends

At least one backend must be configured.

#### 1. Local Whisper (recommended)

```bash
pip install openai-whisper

# FFmpeg
# macOS
brew install ffmpeg
# Ubuntu/Debian
sudo apt install ffmpeg
```

#### 2. OpenAI API

```bash
export OPENAI_API_KEY="your-api-key"
```

#### 3. Azure Speech Services

```bash
export AZURE_SPEECH_KEY="your-api-key"
export AZURE_SPEECH_REGION="your-region"
```

#### 4. Google Speech-to-Text

```bash
export GOOGLE_APPLICATION_CREDENTIALS="path/to/credentials.json"
```

#### 5. Alibaba Cloud Speech

```bash
export ALIYUN_ACCESS_KEY_ID="your-access-key"
export ALIYUN_ACCESS_KEY_SECRET="your-secret-key"
export ALIYUN_SPEECH_APP_KEY="your-app-key"
```

### Checking configuration

Use the status endpoint:

```bash
GET /api/v1/speech-recognition/status
```

Example response:

```json
{
  "available_methods": {
    "whisper_local": true,
    "openai_api": false,
    "azure_speech": false,
    "google_speech": false,
    "aliyun_speech": false
  },
  "supported_languages": ["zh", "en", "ja", "ko", "fr", "de", "..."],
  "whisper_models": ["tiny", "base", "small", "medium", "large"],
  "default_config": {
    "method": "whisper_local",
    "language": "auto",
    "model": "base",
    "timeout": 300
  }
}
```

## Best practices

### 1. UX

- **Clarity**: Tell users explicitly that subtitles are optional.  
- **Runtime expectations**: Communicate that AI subtitles may take longer for large videos.  
- **Fallbacks**: Always provide a manual-SRT option when AI fails.

### 2. Performance

- **Model choice**: default to `base` for speed/accuracy balance.  
- **Language hints**: choose language based on content category.  
- **Timeouts**: set reasonable timeouts (e.g. 5 minutes).

### 3. Error handling

- **Service checks**: verify at least one backend is available.  
- **Fallback chain**: try backends in priority order.  
- **User messages**: provide specific and actionable error messages.

## Troubleshooting

### Common issues

1. **“No available speech recognition service”**
   - Check Whisper: `which whisper`.  
   - Verify API keys.  
   - Inspect `GET /api/v1/speech-recognition/status`.

2. **“Speech recognition timeout”**
   - Check video size (ideally < 100 MB).  
   - Increase timeout.  
   - Use a faster model (`tiny` / `base`).

3. **“Subtitle file not found”**
   - Confirm Whisper and ffmpeg installs.  
   - Inspect backend logs.  
   - Try running Whisper manually.

### Debug steps

```bash
# Check status
curl http://localhost:8000/api/v1/speech-recognition/status

# Check logs
tail -f backend/backend.log

# Verify Whisper
whisper --help
ffmpeg -version
```

## Changelog

### v1.0.0

- ✅ Optional SRT upload supported.  
- ✅ Integrated multiple speech-recognition providers.  
- ✅ Smart language selection.  
- ✅ Robust error handling.  
- ✅ User-friendly UI hints.

---

## Related docs

- `SPEECH_RECOGNITION_REDESIGN.md`  
- `SPEECH_RECOGNITION_SETUP.md`  
- `BACKEND_ARCHITECTURE.md`

