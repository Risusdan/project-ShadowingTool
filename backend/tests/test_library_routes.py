"""Tests for the video library endpoints (list, get, delete)."""

from models import Progress, Video


class TestGetVideos:
    """GET /api/videos — list all videos without transcript."""

    def test_empty_library(self, client, db):
        resp = client.get("/api/videos")
        assert resp.status_code == 200
        assert resp.get_json() == []

    def test_returns_videos_without_transcript(self, client, sample_video):
        resp = client.get("/api/videos")
        assert resp.status_code == 200
        data = resp.get_json()
        assert len(data) == 1
        v = data[0]
        assert v["video_id"] == sample_video.video_id
        assert v["title"] == sample_video.title
        assert v["duration"] == sample_video.duration
        assert v["thumbnail"] == sample_video.thumbnail
        assert "transcript" not in v

    def test_includes_last_practiced_and_current_round(self, client, db, sample_video):
        # Add progress entries
        db.session.add(Progress(video_id=sample_video.video_id, round=1, step=3))
        db.session.add(Progress(video_id=sample_video.video_id, round=2, step=5))
        db.session.commit()

        resp = client.get("/api/videos")
        data = resp.get_json()
        v = data[0]
        assert v["current_round"] == 2
        assert v["last_practiced"] is not None

    def test_no_progress_returns_null_and_zero(self, client, sample_video):
        resp = client.get("/api/videos")
        data = resp.get_json()
        v = data[0]
        assert v["current_round"] == 0
        assert v["last_practiced"] is None

    def test_multiple_videos_sorted_by_last_practiced(self, client, db):
        # Video A — practiced earlier
        video_a = Video(
            video_id="aaaaaaaaaaa",
            title="Video A",
            duration=60,
            thumbnail="https://img.youtube.com/a.jpg",
            transcript_json=[{"start": 0, "duration": 1, "text": "A"}],
        )
        db.session.add(video_a)
        db.session.commit()
        db.session.add(Progress(video_id="aaaaaaaaaaa", round=1, step=1))
        db.session.commit()

        # Video B — practiced later
        video_b = Video(
            video_id="bbbbbbbbbbb",
            title="Video B",
            duration=90,
            thumbnail="https://img.youtube.com/b.jpg",
            transcript_json=[{"start": 0, "duration": 1, "text": "B"}],
        )
        db.session.add(video_b)
        db.session.commit()
        db.session.add(Progress(video_id="bbbbbbbbbbb", round=1, step=1))
        db.session.commit()

        resp = client.get("/api/videos")
        data = resp.get_json()
        assert len(data) == 2
        # Most recently practiced first
        assert data[0]["video_id"] == "bbbbbbbbbbb"
        assert data[1]["video_id"] == "aaaaaaaaaaa"


class TestGetVideoById:
    """GET /api/video/<video_id> — return full video with transcript."""

    def test_not_found(self, client, db):
        resp = client.get("/api/video/nonexistent")
        assert resp.status_code == 404

    def test_returns_full_video_with_transcript(self, client, sample_video):
        resp = client.get(f"/api/video/{sample_video.video_id}")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["video_id"] == sample_video.video_id
        assert data["title"] == sample_video.title
        assert "transcript" in data
        assert len(data["transcript"]) == 1


class TestDeleteVideo:
    """DELETE /api/video/<video_id> — remove video and cascade progress."""

    def test_not_found(self, client, db):
        resp = client.delete("/api/video/nonexistent")
        assert resp.status_code == 404

    def test_deletes_video(self, client, db, sample_video):
        resp = client.delete(f"/api/video/{sample_video.video_id}")
        assert resp.status_code == 200
        assert resp.get_json()["message"] == "Video deleted"

        # Verify gone
        assert db.session.get(Video, sample_video.video_id) is None

    def test_cascade_deletes_progress(self, client, db, sample_video):
        db.session.add(Progress(video_id=sample_video.video_id, round=1, step=3))
        db.session.add(Progress(video_id=sample_video.video_id, round=2, step=5))
        db.session.commit()

        resp = client.delete(f"/api/video/{sample_video.video_id}")
        assert resp.status_code == 200

        # Both progress entries should be gone
        remaining = db.session.query(Progress).filter_by(
            video_id=sample_video.video_id
        ).count()
        assert remaining == 0
