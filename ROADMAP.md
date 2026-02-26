# ROADMAP — 100LS English Shadowing Tool

A living progress tracker for building the 100LS Shadowing Tool across **4 weekends (~32 hours)**.

The **100LS method** (100 Repetitions of Listening and Speaking) guides learners through five progressive steps—from contextual immersion to pure speaking—to build fluency. This tool automates that workflow around YouTube videos.

> **How to use this file:** Check off tasks as you complete them. Each phase ends with a checkpoint describing what "done" looks like.

---

## Phase 1 — Foundation & Video Integration (Weekend 1)

**Goal:** Paste a YouTube URL → see the video and transcript side by side.

### Backend Setup
- [ ] Initialize Flask project with virtual environment and `requirements.txt`
- [ ] Create project directory structure (`app.py`, `routes/`, `services/`, `models.py`)
- [ ] Install core dependencies: `flask`, `youtube-transcript-api`, `yt-dlp`, `flask-sqlalchemy`, `flask-cors`
- [ ] Create `app.py` entry point with CORS enabled

### Backend — Video & Transcript API
- [ ] Create `services/youtube_service.py` — extract video metadata (title, duration, thumbnail) via `yt-dlp`
- [ ] Create `services/youtube_service.py` — fetch transcript via `youtube-transcript-api` with auto-caption fallback
- [ ] Implement `POST /api/video` endpoint: accept YouTube URL, validate, return metadata + transcript JSON
- [ ] Implement `GET /api/video/<video_id>/transcript` endpoint: return cached transcript
- [ ] Add URL validation (reject non-YouTube URLs, handle short URLs like youtu.be)

### Frontend Setup
- [ ] Initialize React + TypeScript project with Vite
- [ ] Install dependencies: `react-youtube` (or YouTube IFrame API), `tailwindcss`
- [ ] Configure Tailwind CSS
- [ ] Configure Vite dev server proxy to Flask backend
- [ ] Define TypeScript types (`types/index.ts`): `Video`, `TranscriptSegment`, etc.
- [ ] Create `api/client.ts` with helper to call `POST /api/video`

### Frontend — Video Player & Transcript
- [ ] Build `VideoPlayer.tsx` — embed YouTube player via IFrame API / `react-youtube`
- [ ] Build `TranscriptPanel.tsx` — render transcript as a scrollable list of timestamped segments
- [ ] Wire up URL input form → call backend → display video + transcript
- [ ] Implement click-to-jump: clicking a transcript segment seeks the video to that timestamp

### Checkpoint
> **Done when:** You can paste a YouTube URL into the app, see the embedded video and its transcript listed below, and click any line to jump the video to that timestamp.

---

## Phase 2 — Playback Controls & Transcript Sync (Weekend 2)

**Goal:** Fully interactive playback with synchronized transcript highlighting, speed controls, and looping.

### Playback Speed
- [ ] Build `PlaybackControls.tsx` component
- [ ] Implement speed adjustment buttons: 0.5x, 0.75x, 1.0x, 1.25x, 1.5x
- [ ] Apply speed changes to the YouTube player in real time

### Transcript Synchronization
- [ ] Poll or listen to YouTube player time updates (e.g., every 100–250 ms)
- [ ] Highlight the current transcript segment based on playback position
- [ ] Auto-scroll the transcript panel to keep the active segment visible
- [ ] Create `hooks/useYouTubePlayer.ts` to encapsulate player state and time tracking

### Segment Looping
- [ ] Allow the user to select a start segment and end segment for looping
- [ ] Implement loop logic: when playback reaches the end segment, seek back to the start segment
- [ ] Add visual indicator for the selected loop range in the transcript
- [ ] Provide a button/toggle to enable/disable loop mode

### Pause-After-Segment Mode
- [ ] Add a toggle for "pause after each segment" mode
- [ ] Detect when a segment ends and auto-pause the video
- [ ] Show a visual cue (e.g., "Press play to continue" or a countdown) during the pause
- [ ] Allow the user to resume playback manually or with a keyboard shortcut

### Database Setup
- [ ] Create SQLite database configuration in Flask (`flask-sqlalchemy`)
- [ ] Define `Video` model: `video_id`, `title`, `duration`, `thumbnail`, `transcript_json`, `created_at`
- [ ] Define `Progress` model: `id`, `video_id`, `round`, `step`, `notes`, `created_at`
- [ ] Create database initialization / migration script
- [ ] Cache video metadata + transcript in the database on first fetch

### Checkpoint
> **Done when:** The transcript highlights and scrolls in sync with the video. You can change playback speed, select a range of segments to loop, and enable pause-after-segment mode for shadowing practice.

---

## Phase 3 — Voice Recording & 100LS Steps (Weekend 3)

**Goal:** Record your voice, compare with the original, and navigate all five 100LS steps.

### Voice Recording
- [ ] Create `hooks/useAudioRecorder.ts` wrapping the MediaRecorder API
- [ ] Build `VoiceRecorder.tsx` component with record / stop / playback buttons
- [ ] Request microphone permission and handle denial gracefully
- [ ] Save recordings as audio blobs (in-memory for playback)
- [ ] Optionally persist recordings to the backend (`services/audio_service.py`)

### Comparison Playback
- [ ] Build comparison UI: play the original segment, then play the user's recording back-to-back
- [ ] Allow side-by-side replay: "Play original" / "Play mine" buttons for the same segment
- [ ] Display recording duration alongside segment duration for quick comparison

### 100LS Step Guide
- [ ] Build `StepGuide.tsx` — step navigation bar showing all 5 steps with the current step highlighted
- [ ] Implement step switching: clicking a step changes the UI mode
- [ ] Show recommended progression (suggest moving to the next step)

### Step-Specific UI States
- [ ] **Step 1 — Contextual Immersion:** Hide transcript, play video normally
- [ ] **Step 2 — Meaning Confirmation:** Show translated subtitles if available; indicate when translations are unavailable
- [ ] **Step 3 — Sound-to-Text Linking:** Show English transcript with current-line highlighting (default playback view)
- [ ] **Step 4 — Delayed Shadowing:** Enable pause-after-segment mode + voice recording automatically
- [ ] **Step 5 — Pure Listening & Speaking:** Hide transcript, enable voice recording

### Integration
- [ ] Wire step state to `VideoPlayer`, `TranscriptPanel`, `PlaybackControls`, and `VoiceRecorder`
- [ ] Persist the user's current step per video in the backend

### Checkpoint
> **Done when:** You can record your voice on any segment, play it back alongside the original, and switch between all 5 100LS steps with the UI adapting accordingly (transcript shown/hidden, recording enabled/disabled, pause mode toggled).

---

## Phase 4 — Progress Tracking & Polish (Weekend 4)

**Goal:** Track rounds, polish the UI, fix bugs, and prepare the app for daily personal use.

### Progress Tracker
- [ ] Build `ProgressTracker.tsx` — display current round (e.g., "Round 12 / 100")
- [ ] Implement round increment: button or auto-increment after completing a full pass
- [ ] Track which 100LS step the user is on per round
- [ ] Add optional notes field per round
- [ ] Implement `POST /api/progress` endpoint: save round, step, and notes
- [ ] Implement `GET /api/progress/<video_id>` endpoint: return progress history

### Video Library
- [ ] Add a "library" view listing all previously practiced videos
- [ ] Show thumbnail, title, last practiced date, and current round for each video
- [ ] Allow selecting a video from the library to resume practice
- [ ] Add a way to remove videos from the library

### UI Polish
- [ ] Add loading spinners / skeleton states while fetching video data
- [ ] Add error messages for invalid URLs, network failures, and missing transcripts
- [ ] Make the layout responsive (usable on mobile screens)
- [ ] Ensure keyboard accessibility for core actions (play/pause, record, next segment)
- [ ] Visual polish: consistent spacing, typography, color scheme

### Bug Fixes & Edge Cases
- [ ] Handle videos with no available captions gracefully
- [ ] Handle very long transcripts (virtualized scrolling if needed)
- [ ] Handle network interruptions during video fetch
- [ ] Test with various YouTube video types (short, long, live recordings, music)
- [ ] Fix any playback sync drift issues

### Documentation
- [ ] Write `README.md` with project overview, setup instructions, and usage guide

### Checkpoint
> **Done when:** You can track your round progress per video, see a library of all practiced videos, and the app feels stable and polished enough for daily personal use. README is written.

---

## Stretch Goals (Post-MVP)

These are enhancements to consider after the core 4-weekend build is complete:

- [ ] **Waveform visualization** — show audio waveforms for visual comparison of original vs. recording
- [ ] **Pronunciation scoring** — integrate a speech recognition API (e.g., Web Speech API) for basic feedback
- [ ] **Spaced repetition** — suggest which videos to revisit based on practice history and time elapsed
- [ ] **Practice statistics & export** — track and export total hours practiced, rounds completed, streaks, etc.
- [ ] **Mobile-optimized design** — fully optimize touch interactions and layout for phone use
- [ ] **Multi-language UI** — support Chinese (or other languages) for the interface itself
- [ ] **Community features** — share video recommendations and progress with other learners
- [ ] **Offline support** — cache transcripts and recordings for offline practice
