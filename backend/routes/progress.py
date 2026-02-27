"""REST endpoints for tracking shadowing practice progress."""

from flask import Blueprint, Response, jsonify, request

from app import db
from models import Progress, Video

progress_bp = Blueprint("progress", __name__)


def _progress_to_dict(entry: Progress) -> dict:
    """Serialize a Progress model instance to an API-friendly dict."""
    return {
        "id": entry.id,
        "video_id": entry.video_id,
        "round": entry.round,
        "step": entry.step,
        "notes": entry.notes,
        "created_at": entry.created_at.isoformat(),
    }


@progress_bp.route("/progress", methods=["POST"])
def create_progress() -> tuple[Response, int]:
    """Save a new progress entry for a video.

    Request body:
        ``{"video_id": "...", "round": 1, "step": 3, "notes": "optional"}``

    Returns:
        201 with the created entry. 400 for validation errors. 404 if
        the video doesn't exist in the database.
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Missing request body"}), 400

    # Required fields
    video_id = data.get("video_id")
    round_num = data.get("round")
    step = data.get("step")

    if not video_id:
        return jsonify({"error": "Missing 'video_id' field"}), 400
    if round_num is None:
        return jsonify({"error": "Missing 'round' field"}), 400
    if step is None:
        return jsonify({"error": "Missing 'step' field"}), 400

    # Validate types and ranges
    if not isinstance(round_num, int) or round_num < 1:
        return jsonify({"error": "'round' must be an integer >= 1"}), 400
    if not isinstance(step, int) or step < 1 or step > 5:
        return jsonify({"error": "'step' must be an integer between 1 and 5"}), 400

    # Check video exists
    video = db.session.get(Video, video_id)
    if not video:
        return jsonify({"error": "Video not found"}), 404

    entry = Progress(
        video_id=video_id,
        round=round_num,
        step=step,
        notes=data.get("notes"),
    )
    db.session.add(entry)
    db.session.commit()

    return jsonify(_progress_to_dict(entry)), 201


@progress_bp.route("/progress/<video_id>", methods=["GET"])
def get_progress(video_id: str) -> tuple[Response, int] | Response:
    """Return progress history for a video.

    Args:
        video_id: The YouTube video ID (URL path parameter).

    Returns:
        JSON with video_id, current_round, current_step, and entries[].
        404 if the video doesn't exist in the database.
    """
    video = db.session.get(Video, video_id)
    if not video:
        return jsonify({"error": "Video not found"}), 404

    entries = (
        Progress.query.filter_by(video_id=video_id)
        .order_by(Progress.created_at)
        .all()
    )

    if entries:
        latest = entries[-1]
        current_round = latest.round
        current_step = latest.step
    else:
        current_round = 0
        current_step = 0

    return jsonify({
        "video_id": video_id,
        "current_round": current_round,
        "current_step": current_step,
        "entries": [_progress_to_dict(e) for e in entries],
    })
