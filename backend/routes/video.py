"""REST endpoints for fetching and retrieving YouTube video data."""

from flask import Blueprint, Response, jsonify, request
from yt_dlp.utils import DownloadError
from youtube_transcript_api import NoTranscriptFound, TranscriptsDisabled

from app import db
from models import Progress, Video
from services.youtube_service import (
    extract_video_id,
    fetch_transcript,
    fetch_video_metadata,
)

video_bp = Blueprint("video", __name__)


def _video_to_dict(video: Video) -> dict:
    """Serialize a Video model instance to an API-friendly dict."""
    return {
        "video_id": video.video_id,
        "title": video.title,
        "duration": video.duration,
        "thumbnail": video.thumbnail,
        "transcript": video.transcript_json,
    }


@video_bp.route("/video", methods=["POST"])
def create_video() -> tuple[Response, int] | Response:
    """Accept a YouTube URL, fetch metadata + transcript, return JSON.

    Request body:
        ``{"url": "<YouTube URL>"}``

    Returns:
        JSON with video_id, title, duration, thumbnail, and transcript.
        400 if the URL is missing or invalid, 502 if the upstream fetch fails.
    """
    data = request.get_json(silent=True)
    if not data or "url" not in data:
        return jsonify({"error": "Missing 'url' field"}), 400

    video_id = extract_video_id(data["url"])
    if not video_id:
        return jsonify({"error": "Invalid YouTube URL"}), 400

    # Return cached data if we already have this video
    existing = db.session.get(Video, video_id)
    if existing:
        return jsonify(_video_to_dict(existing))

    try:
        metadata = fetch_video_metadata(video_id)
        transcript = fetch_transcript(video_id)
    except (DownloadError, NoTranscriptFound, TranscriptsDisabled) as e:
        return jsonify({"error": f"Failed to fetch video data: {e}"}), 502

    # Persist to database
    video = Video(
        video_id=video_id,
        title=metadata["title"],
        duration=metadata["duration"],
        thumbnail=metadata["thumbnail"],
        transcript_json=transcript,
    )
    db.session.add(video)
    db.session.commit()

    return jsonify(_video_to_dict(video))


@video_bp.route("/video/<video_id>/transcript", methods=["GET"])
def get_transcript(video_id: str) -> tuple[Response, int] | Response:
    """Return cached transcript for a previously fetched video.

    Args:
        video_id: The 11-character YouTube video ID (URL path parameter).

    Returns:
        JSON with video_id and transcript array. 404 if the video hasn't
        been fetched yet.
    """
    video = db.session.get(Video, video_id)
    if not video:
        return jsonify({"error": "Video not found"}), 404

    return jsonify({"video_id": video.video_id, "transcript": video.transcript_json})


@video_bp.route("/videos", methods=["GET"])
def list_videos() -> Response:
    """Return all cached videos without transcript, sorted by last practiced."""
    videos = Video.query.all()

    result = []
    for v in videos:
        latest = (
            Progress.query.filter_by(video_id=v.video_id)
            .order_by(Progress.created_at.desc())
            .first()
        )
        result.append({
            "video_id": v.video_id,
            "title": v.title,
            "duration": v.duration,
            "thumbnail": v.thumbnail,
            "last_practiced": latest.created_at.isoformat() if latest else None,
            "current_round": latest.round if latest else 0,
        })

    # Sort by last_practiced descending (None values last)
    result.sort(key=lambda x: x["last_practiced"] or "", reverse=True)
    return jsonify(result)


@video_bp.route("/video/<video_id>", methods=["GET"])
def get_video(video_id: str) -> tuple[Response, int] | Response:
    """Return full cached video with transcript."""
    video = db.session.get(Video, video_id)
    if not video:
        return jsonify({"error": "Video not found"}), 404

    return jsonify(_video_to_dict(video))


@video_bp.route("/video/<video_id>", methods=["DELETE"])
def delete_video(video_id: str) -> tuple[Response, int] | Response:
    """Delete a video and all its progress entries (cascade)."""
    video = db.session.get(Video, video_id)
    if not video:
        return jsonify({"error": "Video not found"}), 404

    db.session.delete(video)
    db.session.commit()
    return jsonify({"message": "Video deleted"})
