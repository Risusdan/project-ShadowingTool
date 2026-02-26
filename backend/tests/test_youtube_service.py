"""Tests for the youtube_service helper functions."""

from services.youtube_service import extract_video_id


class TestExtractVideoId:
    """extract_video_id() — parse a YouTube video ID from various URL formats."""

    def test_standard_url(self):
        url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        assert extract_video_id(url) == "dQw4w9WgXcQ"

    def test_short_url(self):
        url = "https://youtu.be/dQw4w9WgXcQ"
        assert extract_video_id(url) == "dQw4w9WgXcQ"

    def test_url_with_extra_params(self):
        url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42"
        assert extract_video_id(url) == "dQw4w9WgXcQ"

    def test_no_protocol(self):
        url = "youtube.com/watch?v=dQw4w9WgXcQ"
        assert extract_video_id(url) == "dQw4w9WgXcQ"

    def test_invalid_url(self):
        assert extract_video_id("https://google.com") is None

    def test_empty_string(self):
        assert extract_video_id("") is None

    def test_random_text(self):
        assert extract_video_id("not a url at all") is None
