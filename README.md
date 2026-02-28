# 100LS Shadowing Tool

A web app for practicing English fluency using the **100LS method** — 100 repetitions of listening and speaking on a single piece of content, progressing through five steps from passive immersion to active speaking. Paste a YouTube URL, get the video and transcript side by side, and practice shadowing with built-in playback controls, voice recording, and progress tracking.

## Features

- **YouTube URL → instant practice** — paste any URL to get the video and synchronized transcript side by side
- **Click-to-seek transcript** — click any line to jump the video to that timestamp; current segment highlights and auto-scrolls
- **Playback speed** — adjust from 0.5x to 1.5x in real time
- **Segment looping** — Shift+click to select a range of segments and loop them continuously
- **Pause-after-segment mode** — auto-pauses after each segment for shadowing practice
- **Voice recording & comparison** — record yourself, then play back your recording alongside the original
- **5-step 100LS workflow** — step-aware UI adapts controls, transcript visibility, and recording based on the current step
- **Progress tracking** — log rounds per video with step and optional notes
- **Video library** — browse all practiced videos, see current round, and resume where you left off
- **Keyboard shortcuts** — Space, arrow keys, R for hands-free practice

## The 100LS Method

The 100LS method builds fluency through repetition across five progressive steps:

| Step | Name | Focus |
|------|------|-------|
| 1 | Contextual Immersion | Listen without subtitles to absorb rhythm and intonation |
| 2 | Meaning Confirmation | Watch with translated subtitles to understand content |
| 3 | Sound-to-Text Linking | Follow along with the English transcript |
| 4 | Delayed Shadowing | Pause after each segment, then repeat aloud |
| 5 | Pure Listening & Speaking | No transcript — listen and shadow in real time |

Repeat each step ~20 times (100 total rounds) per video to internalize natural speech patterns.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Backend | Python 3.12, Flask, SQLAlchemy, SQLite |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| APIs | yt-dlp (video metadata), youtube-transcript-api (captions) |
| Testing | pytest (42 backend tests), Vitest (124 frontend tests) |

## Getting Started

### Prerequisites

- Python 3.12+
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- Node.js 18+

### Backend

```bash
cd backend
uv sync
uv run python app.py
```

The API server starts at `http://localhost:5001`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server starts at `http://localhost:5173` and proxies `/api` requests to the backend.

## Usage Guide

1. **Paste a YouTube URL** into the input field and submit
2. **Pick a 100LS step** from the step guide bar — the UI adapts automatically
3. **Use playback controls** to adjust speed, enable looping, or turn on pause-after-segment mode
4. **Click transcript lines** to jump to specific segments; Shift+click two lines to set a loop range
5. **Record yourself** with the Record button (or press R) — play back your recording to compare with the original
6. **Log your progress** after each session — track rounds and steps per video
7. **Browse your library** to resume practice on any previously loaded video

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `←` | Previous segment |
| `→` | Next segment |
| `R` | Start / Stop recording |
| `Shift` + click | Set loop range (click start segment, then end segment) |

## API Reference

| Method | Path | Description | Status Codes |
|--------|------|-------------|-------------|
| `POST` | `/api/video` | Submit a YouTube URL; returns metadata + transcript | 200, 400, 422, 502 |
| `GET` | `/api/video/<video_id>/transcript` | Get cached transcript for a video | 200, 404 |
| `GET` | `/api/video/<video_id>` | Get full video data with transcript | 200, 404 |
| `GET` | `/api/videos` | List all cached videos (library) | 200 |
| `DELETE` | `/api/video/<video_id>` | Delete a video and its progress | 200, 404 |
| `POST` | `/api/progress` | Save a progress entry (round, step, notes) | 201, 400, 404 |
| `GET` | `/api/progress/<video_id>` | Get progress history for a video | 200, 404 |

## Project Structure

```
backend/
  app.py                          # Flask app factory + blueprint registration
  models.py                       # SQLAlchemy models (Video, Progress)
  routes/
    video.py                      # Video & library endpoints
    progress.py                   # Progress tracking endpoints
  services/
    youtube_service.py            # yt-dlp + youtube-transcript-api helpers
  tests/
    conftest.py                   # Shared fixtures
    test_video_routes.py          # Video endpoint tests
    test_library_routes.py        # Library endpoint tests
    test_progress_routes.py       # Progress endpoint tests
    test_youtube_service.py       # YouTube service unit tests

frontend/
  src/
    api/
      client.ts                   # Backend API client
    components/
      VideoPlayer.tsx             # YouTube iframe embed
      TranscriptPanel.tsx         # Scrollable transcript with click-to-seek
      PlaybackControls.tsx        # Speed, loop, pause-after-segment controls
      StepGuide.tsx               # 100LS 5-step navigation bar
      VoiceRecorder.tsx           # Record / playback / compare UI
      ProgressTracker.tsx         # Round logging and progress display
      VideoLibrary.tsx            # Library grid of practiced videos
      Spinner.tsx                 # Loading indicator
    hooks/
      usePlayerSync.ts            # YouTube player time tracking
      usePlaybackControls.ts      # Playback state management
      useAudioRecorder.ts         # MediaRecorder API wrapper
      useProgress.ts              # Progress API integration
      useLibrary.ts               # Library API integration
    utils/
      transcript.ts               # Transcript search and helpers
      playback.ts                 # Playback utility functions
      errorMapping.ts             # API error → user message mapping
    types/
      index.ts                    # Shared TypeScript interfaces
    App.tsx                       # Root component
    main.tsx                      # Entry point
  vite.config.ts                  # Vite config with API proxy
```

## Running Tests

```bash
# Backend (42 tests)
cd backend
uv run pytest tests/ -v

# Frontend (124 tests)
cd frontend
npx vitest run

# Frontend type check
cd frontend
npx tsc --noEmit
```

## License

Private — personal use.
