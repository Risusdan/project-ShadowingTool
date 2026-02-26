"""Tests for the /api/video endpoints (create + transcript retrieval)."""

from unittest.mock import patch

import pytest


@pytest.fixture()
def mock_video_data() -> dict:
    """Canonical mock video metadata + transcript used across route tests."""
    return {
        "metadata": {
            "video_id": "dQw4w9WgXcQ",
            "title": "Test Video",
            "duration": 120,
            "thumbnail": "https://img.youtube.com/test.jpg",
        },
        "transcript": [{"start": 0.0, "duration": 2.5, "text": "Hello world"}],
    }


class TestPostVideo:
    """POST /api/video — submit a YouTube URL, receive video data."""

    def test_missing_url_field(self, client):
        resp = client.post("/api/video", json={})
        assert resp.status_code == 400
        assert "Missing" in resp.get_json()["error"]

    def test_invalid_youtube_url(self, client):
        resp = client.post("/api/video", json={"url": "https://google.com"})
        assert resp.status_code == 400
        assert "Invalid" in resp.get_json()["error"]

    @patch("routes.video.fetch_video_metadata")
    @patch("routes.video.fetch_transcript")
    def test_valid_url_returns_data(
        self, mock_transcript, mock_metadata, client, mock_video_data
    ):
        mock_metadata.return_value = mock_video_data["metadata"]
        mock_transcript.return_value = mock_video_data["transcript"]

        resp = client.post(
            "/api/video",
            json={"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["video_id"] == "dQw4w9WgXcQ"
        assert data["title"] == "Test Video"
        assert len(data["transcript"]) == 1

    @patch("routes.video.fetch_video_metadata")
    @patch("routes.video.fetch_transcript")
    def test_cached_video_returns_without_refetch(
        self, mock_transcript, mock_metadata, client, mock_video_data
    ):
        mock_metadata.return_value = mock_video_data["metadata"]
        mock_transcript.return_value = mock_video_data["transcript"]

        # First call — fetches and caches
        client.post(
            "/api/video",
            json={"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
        )
        # Second call — should use cache
        resp = client.post(
            "/api/video",
            json={"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
        )
        assert resp.status_code == 200
        # Metadata was only fetched once
        mock_metadata.assert_called_once()


class TestGetTranscript:
    """GET /api/video/<id>/transcript — retrieve a cached transcript."""

    def test_video_not_found(self, client):
        resp = client.get("/api/video/nonexistent/transcript")
        assert resp.status_code == 404

    @patch("routes.video.fetch_video_metadata")
    @patch("routes.video.fetch_transcript")
    def test_returns_cached_transcript(
        self, mock_transcript, mock_metadata, client, mock_video_data
    ):
        mock_metadata.return_value = mock_video_data["metadata"]
        mock_transcript.return_value = mock_video_data["transcript"]

        # Create the video first
        client.post(
            "/api/video",
            json={"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
        )

        resp = client.get("/api/video/dQw4w9WgXcQ/transcript")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["video_id"] == "dQw4w9WgXcQ"
        assert len(data["transcript"]) == 1
