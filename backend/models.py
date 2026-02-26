"""SQLAlchemy models for persisting video metadata and user progress."""

from datetime import datetime, timezone

from app import db


class Video(db.Model):
    """A cached YouTube video with its metadata and transcript.

    Stores the result of a YouTube fetch so repeated requests for the same
    video are served from the database instead of hitting external APIs.
    """

    __tablename__ = "videos"

    video_id = db.Column(db.String(20), primary_key=True)
    title = db.Column(db.String(500), nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    thumbnail = db.Column(db.String(500))
    transcript_json = db.Column(db.JSON, nullable=False)
    created_at = db.Column(
        db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )


class Progress(db.Model):
    """A single shadowing practice entry linked to a video.

    Tracks which round and step the user has reached for a given video,
    along with optional free-text notes.
    """

    __tablename__ = "progress"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    video_id = db.Column(
        db.String(20), db.ForeignKey("videos.video_id"), nullable=False
    )
    round = db.Column(db.Integer, nullable=False)
    step = db.Column(db.Integer, nullable=False)
    notes = db.Column(db.Text)
    created_at = db.Column(
        db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    video = db.relationship("Video", backref=db.backref("progress_entries", lazy=True))
