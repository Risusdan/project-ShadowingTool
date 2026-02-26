# 100LS Shadowing Tool

A web app for practicing English fluency using the **100LS method** (100 Repetitions of Listening and Speaking). Paste a YouTube URL, get the video and transcript side by side, and click any line to jump to that timestamp.

## Tech Stack

- **Backend:** Python 3.12 / Flask / SQLAlchemy / SQLite
- **Frontend:** React 19 / TypeScript / Tailwind CSS / Vite
- **APIs:** yt-dlp (video metadata), youtube-transcript-api (captions)

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

The API server starts at `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server starts at `http://localhost:5173` and proxies `/api` requests to the backend.

### Running Tests

```bash
# Backend
cd backend
uv run pytest tests/ -v

# Frontend type check
cd frontend
npx tsc --noEmit
```

## Project Structure

```
backend/
  app.py                  # Flask app factory
  models.py               # SQLAlchemy models (Video, Progress)
  routes/video.py         # REST endpoints (/api/video, /api/video/<id>/transcript)
  services/youtube_service.py  # YouTube data fetching helpers
  tests/                  # pytest suite

frontend/
  src/
    api/client.ts         # Backend API client
    components/
      VideoPlayer.tsx     # YouTube iframe embed
      TranscriptPanel.tsx # Scrollable transcript with click-to-seek
    types/index.ts        # Shared TypeScript interfaces
    App.tsx               # Root component
```

## License

Private — personal use.
