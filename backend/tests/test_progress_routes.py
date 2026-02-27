"""Tests for the /api/progress endpoints (create + retrieve)."""

import pytest


class TestPostProgress:
    """POST /api/progress — save a progress entry."""

    def test_missing_body(self, client):
        resp = client.post("/api/progress", content_type="application/json")
        assert resp.status_code == 400

    def test_missing_video_id(self, client, sample_video):
        resp = client.post("/api/progress", json={"round": 1, "step": 3})
        assert resp.status_code == 400
        assert "video_id" in resp.get_json()["error"]

    def test_missing_round(self, client, sample_video):
        resp = client.post(
            "/api/progress", json={"video_id": sample_video.video_id, "step": 3}
        )
        assert resp.status_code == 400
        assert "round" in resp.get_json()["error"]

    def test_missing_step(self, client, sample_video):
        resp = client.post(
            "/api/progress", json={"video_id": sample_video.video_id, "round": 1}
        )
        assert resp.status_code == 400
        assert "step" in resp.get_json()["error"]

    def test_invalid_round_zero(self, client, sample_video):
        resp = client.post(
            "/api/progress",
            json={"video_id": sample_video.video_id, "round": 0, "step": 1},
        )
        assert resp.status_code == 400
        assert "round" in resp.get_json()["error"]

    def test_invalid_round_negative(self, client, sample_video):
        resp = client.post(
            "/api/progress",
            json={"video_id": sample_video.video_id, "round": -1, "step": 1},
        )
        assert resp.status_code == 400

    def test_invalid_step_zero(self, client, sample_video):
        resp = client.post(
            "/api/progress",
            json={"video_id": sample_video.video_id, "round": 1, "step": 0},
        )
        assert resp.status_code == 400
        assert "step" in resp.get_json()["error"]

    def test_invalid_step_six(self, client, sample_video):
        resp = client.post(
            "/api/progress",
            json={"video_id": sample_video.video_id, "round": 1, "step": 6},
        )
        assert resp.status_code == 400

    def test_video_not_found(self, client, db):
        resp = client.post(
            "/api/progress",
            json={"video_id": "nonexistent", "round": 1, "step": 3},
        )
        assert resp.status_code == 404

    def test_saves_entry(self, client, sample_video):
        resp = client.post(
            "/api/progress",
            json={
                "video_id": sample_video.video_id,
                "round": 1,
                "step": 3,
                "notes": "Good progress",
            },
        )
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["video_id"] == sample_video.video_id
        assert data["round"] == 1
        assert data["step"] == 3
        assert data["notes"] == "Good progress"
        assert "id" in data
        assert "created_at" in data

    def test_saves_entry_without_notes(self, client, sample_video):
        resp = client.post(
            "/api/progress",
            json={"video_id": sample_video.video_id, "round": 2, "step": 5},
        )
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["notes"] is None


class TestGetProgress:
    """GET /api/progress/<video_id> — retrieve progress history."""

    def test_video_not_found(self, client, db):
        resp = client.get("/api/progress/nonexistent")
        assert resp.status_code == 404

    def test_empty_progress(self, client, sample_video):
        resp = client.get(f"/api/progress/{sample_video.video_id}")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["video_id"] == sample_video.video_id
        assert data["current_round"] == 0
        assert data["current_step"] == 0
        assert data["entries"] == []

    def test_returns_entries_with_current_round(self, client, sample_video):
        # Create two entries
        client.post(
            "/api/progress",
            json={"video_id": sample_video.video_id, "round": 1, "step": 5},
        )
        client.post(
            "/api/progress",
            json={
                "video_id": sample_video.video_id,
                "round": 2,
                "step": 3,
                "notes": "Second round",
            },
        )

        resp = client.get(f"/api/progress/{sample_video.video_id}")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["current_round"] == 2
        assert data["current_step"] == 3
        assert len(data["entries"]) == 2
        assert data["entries"][0]["round"] == 1
        assert data["entries"][1]["round"] == 2
        assert data["entries"][1]["notes"] == "Second round"
