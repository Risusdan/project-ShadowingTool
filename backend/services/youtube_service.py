"""YouTube data-fetching helpers using yt-dlp and youtube-transcript-api."""

import re

from youtube_transcript_api import YouTubeTranscriptApi
from yt_dlp import YoutubeDL

# Matches standard and short YouTube URLs
YOUTUBE_URL_PATTERN = re.compile(
    r"(?:https?://)?(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)([\w-]{11})"
)


def extract_video_id(url: str) -> str | None:
    """Extract the 11-character video ID from a YouTube URL.

    Args:
        url: Any YouTube URL (standard, short, with or without protocol).

    Returns:
        The 11-character video ID, or None if the URL doesn't match.
    """
    match = YOUTUBE_URL_PATTERN.search(url)
    return match.group(1) if match else None


def fetch_video_metadata(video_id: str) -> dict:
    """Fetch video title, duration, and thumbnail via yt-dlp (no download).

    Args:
        video_id: An 11-character YouTube video ID.

    Returns:
        A dict with keys ``video_id``, ``title``, ``duration`` (seconds),
        and ``thumbnail`` (URL).

    Raises:
        yt_dlp.utils.DownloadError: If the video is unavailable or the
            network request fails.
    """
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
    }
    with YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(
            f"https://www.youtube.com/watch?v={video_id}", download=False
        )
    return {
        "video_id": video_id,
        "title": info.get("title", ""),
        "duration": info.get("duration", 0),
        "thumbnail": info.get("thumbnail", ""),
    }


def fetch_transcript(video_id: str) -> list[dict]:
    """Fetch English transcript, falling back to auto-generated captions.

    Args:
        video_id: An 11-character YouTube video ID.

    Returns:
        A list of dicts, each with ``start`` (seconds), ``duration``
        (seconds), and ``text``.

    Raises:
        youtube_transcript_api.NoTranscriptFound: If no English transcript
            (manual or auto-generated) is available.
        youtube_transcript_api.TranscriptsDisabled: If the video has
            transcripts disabled entirely.
    """
    ytt_api = YouTubeTranscriptApi()
    transcript = ytt_api.fetch(video_id, languages=["en"])
    return [
        {
            "start": round(snippet.start, 2),
            "duration": round(snippet.duration, 2),
            "text": snippet.text,
        }
        for snippet in transcript
    ]
