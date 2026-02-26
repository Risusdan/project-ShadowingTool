# 100LS English Shadowing Tool — Project Specification

## Project Overview

A web application that helps English learners practice the **100LS (100 Repetitions of Listening and Speaking)** method. Users paste a YouTube video link, the tool automatically fetches the video and transcript, and provides an interactive shadowing interface with playback controls, section looping, and voice recording for self-comparison.

**Target User:** Intermediate English learners who can read English but struggle with speaking fluency.

**Project Type:** Solo proof-of-concept prototype (personal use first, public release later).

**Timeline:** 4 weekends (~32 hours total).

**Development Approach:** Assisted by Claude Code for rapid prototyping.

---

## Core Features (MVP)

### 1. YouTube Video Input
- User pastes a YouTube URL
- Tool validates the URL and fetches video metadata (title, duration, thumbnail)
- Embeds the YouTube player via the YouTube IFrame API

### 2. Automatic Transcript Extraction
- Fetches available captions/subtitles from YouTube
- Falls back to auto-generated captions if manual captions aren't available
- Displays transcript as a list of timestamped segments

### 3. Synchronized Playback Interface
- YouTube video player embedded at the top
- Transcript displayed below with **highlighted current segment** that scrolls automatically
- Click any transcript segment to jump to that timestamp

### 4. Playback Controls
- **Speed adjustment:** 0.5x, 0.75x, 1.0x, 1.25x, 1.5x
- **Loop mode:** Select a segment or range of segments to loop continuously
- **Pause after each segment:** Optional mode that auto-pauses after each line, giving the user time to repeat

### 5. Voice Recording & Comparison
- Record user's voice while shadowing
- Play back the recording alongside the original audio for self-comparison
- Simple waveform visualization (stretch goal)

### 6. 100LS Progress Tracker
- Track which "round" the user is on for each video
- Visual progress indicator (e.g., "Round 12 / 100")
- Notes field for each round (optional)

---

## 100LS Method Integration

The tool should guide users through the five steps of the 100LS protocol:

| Step | Description | Tool Behavior |
|------|-------------|---------------|
| 1. Contextual Immersion | Watch with no subtitles | Hide transcript, play video normally |
| 2. Meaning Confirmation | Watch with native language subtitles | Show translated subtitles (if available) |
| 3. Sound-to-Text Linking | Watch with English subtitles | Show English transcript, highlight current line |
| 4. Delayed Shadowing | Listen and repeat aloud | Pause-after-segment mode + voice recording |
| 5. Pure Listening & Speaking | No subtitles, repeat from memory | Hide transcript, enable voice recording |

Users can switch between steps freely, but the interface should suggest the recommended progression.

---

## Tech Stack

### Backend: Python + Flask
- **Why Flask:** Lightweight, minimal boilerplate, excellent for prototyping
- **YouTube transcript:** `youtube-transcript-api` Python library
- **Video metadata:** `yt-dlp` for extracting video info (title, duration, etc.)
- **API design:** RESTful JSON endpoints

### Frontend: TypeScript + React
- **Why React:** Component-based architecture fits the UI well
- **Why TypeScript:** Type safety, better IDE support, catches errors early
- **Build tool:** Vite (fast dev server, simple config)
- **Styling:** Tailwind CSS (rapid prototyping without writing custom CSS)
- **YouTube player:** `react-youtube` wrapper or YouTube IFrame API directly
- **Audio recording:** Web Audio API + MediaRecorder API

### Database: SQLite (via Flask-SQLAlchemy)
- **Why SQLite:** Zero configuration, file-based, perfect for a prototype
- Stores: video metadata, user progress, recording references

### Project Structure
```
100ls-shadowing-tool/
├── backend/
│   ├── app.py                  # Flask app entry point
│   ├── requirements.txt
│   ├── models.py               # SQLAlchemy models
│   ├── routes/
│   │   ├── video.py            # YouTube fetch & transcript endpoints
│   │   └── progress.py         # Progress tracking endpoints
│   └── services/
│       ├── youtube_service.py  # YouTube transcript & metadata logic
│       └── audio_service.py    # Audio file handling
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── App.tsx
│       ├── components/
│       │   ├── VideoPlayer.tsx         # YouTube embed + controls
│       │   ├── TranscriptPanel.tsx     # Synced transcript display
│       │   ├── PlaybackControls.tsx    # Speed, loop, pause controls
│       │   ├── VoiceRecorder.tsx       # Record & playback
│       │   ├── ProgressTracker.tsx     # 100LS round tracking
│       │   └── StepGuide.tsx           # 100LS step navigation
│       ├── hooks/
│       │   ├── useYouTubePlayer.ts
│       │   └── useAudioRecorder.ts
│       ├── types/
│       │   └── index.ts
│       └── api/
│           └── client.ts               # API call helpers
└── README.md
```

---

## API Endpoints

### `POST /api/video`
**Request:** `{ "url": "https://www.youtube.com/watch?v=..." }`
**Response:**
```json
{
  "video_id": "abc123",
  "title": "Peppa Pig - The Playground",
  "duration": 312,
  "thumbnail": "https://img.youtube.com/...",
  "transcript": [
    { "start": 0.0, "duration": 2.5, "text": "Hello, I'm Peppa Pig." },
    { "start": 2.5, "duration": 3.1, "text": "This is my little brother George." }
  ]
}
```

### `GET /api/video/<video_id>/transcript`
Returns cached transcript for a previously fetched video.

### `POST /api/progress`
**Request:** `{ "video_id": "abc123", "round": 12, "step": 4, "notes": "Getting smoother" }`
Saves user progress for a video.

### `GET /api/progress/<video_id>`
Returns progress history for a video.

---

## Development Roadmap (4 Weekends)

### Weekend 1: Foundation & Video Integration
**Goal:** Paste a YouTube URL → see the video and transcript side by side.

- [ ] Set up Flask backend with basic project structure
- [ ] Set up React + TypeScript + Vite frontend
- [ ] Implement YouTube URL input and validation
- [ ] Integrate `youtube-transcript-api` to fetch transcripts
- [ ] Embed YouTube player using IFrame API
- [ ] Display transcript as a scrollable list below the video
- [ ] Basic click-to-jump: click a transcript line → video jumps to that timestamp

**Milestone:** A working page where you paste a URL and see the video + transcript.

### Weekend 2: Playback Controls & Transcript Sync
**Goal:** Fully interactive playback with synchronized transcript highlighting.

- [ ] Implement playback speed controls (0.5x–1.5x)
- [ ] Sync transcript highlighting with video playback (highlight current segment)
- [ ] Auto-scroll transcript to follow video position
- [ ] Implement segment looping (select start/end segments, loop between them)
- [ ] Add "pause after segment" mode for shadowing practice
- [ ] Set up SQLite database and progress models

**Milestone:** Smooth, interactive shadowing experience with speed and loop controls.

### Weekend 3: Voice Recording & 100LS Steps
**Goal:** Record your voice, compare with original, and navigate 100LS steps.

- [ ] Implement voice recording using MediaRecorder API
- [ ] Save recordings and allow playback
- [ ] Build comparison UI: play original segment → play your recording
- [ ] Implement 100LS step guide (5 steps with different UI states)
- [ ] Step 1: Hide transcript mode
- [ ] Step 2: Show translated subtitles (if available)
- [ ] Step 3: Show English transcript with highlighting
- [ ] Step 4: Pause-after-segment + recording mode
- [ ] Step 5: Hide transcript + recording mode

**Milestone:** Complete 100LS workflow with voice recording.

### Weekend 4: Progress Tracking & Polish
**Goal:** Track rounds, polish UI, fix bugs, prepare for personal use.

- [ ] Implement progress tracker (round counter, step tracking)
- [ ] Save/load progress per video
- [ ] Add video library (list of previously practiced videos)
- [ ] UI polish: responsive layout, loading states, error handling
- [ ] Bug fixes and edge case handling
- [ ] Write README with setup instructions

**Milestone:** A polished prototype ready for daily personal use.

---

## Stretch Goals (After MVP)

- **Waveform visualization:** Show audio waveforms for visual comparison
- **Pronunciation scoring:** Integrate speech recognition API for basic feedback
- **Spaced repetition:** Suggest which videos to revisit based on practice history
- **Export practice stats:** Track total hours, rounds completed, etc.
- **Mobile-responsive design:** Optimize for phone use during commutes
- **Multi-language support:** Allow Chinese UI for broader audience
- **Community features:** Share video recommendations with other learners

---

## Getting Started with Claude Code

When working with Claude Code, use this spec as your reference. Here are suggested prompts for each weekend:

**Weekend 1:**
> "Set up a Flask + React/TypeScript project with Vite. The Flask backend should have an endpoint that accepts a YouTube URL, fetches the transcript using youtube-transcript-api, and returns it as JSON. The React frontend should have an input field for the URL, embed the YouTube player, and display the transcript below."

**Weekend 2:**
> "Add playback speed controls, transcript highlighting that syncs with the YouTube player position, and a segment looping feature. Also add a 'pause after segment' mode that automatically pauses the video after each transcript line."

**Weekend 3:**
> "Add voice recording using the MediaRecorder API. Users should be able to record while a segment plays, then compare their recording with the original. Also implement the 5-step 100LS workflow that changes the UI based on which step the user is on."

**Weekend 4:**
> "Add a progress tracker that counts rounds per video, saves progress to SQLite, and shows a library of all practiced videos. Polish the UI with loading states, error handling, and responsive design."

---

## Legal Considerations

- **YouTube Terms of Service:** The tool embeds videos via the official YouTube IFrame API (allowed). It does NOT download videos. Transcripts are fetched via YouTube's caption API.
- **Personal use:** As a personal learning tool, this falls within fair use. If scaling to public use, review YouTube API Terms of Service and consider applying for a YouTube Data API key.

---

## Key Design Principles

1. **Simplicity first:** The UI should get out of the way. The focus is on listening and speaking, not clicking buttons.
2. **Mobile-friendly:** Even for the prototype, keep the layout responsive so it works on a phone.
3. **Progress visibility:** Always show the user how far they've come—round count, step indicator, time practiced.
4. **Low friction:** Pasting a URL and starting practice should take under 10 seconds.
