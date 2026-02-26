import { useState } from 'react';
import type { YouTubePlayer } from 'react-youtube';
import type { Video } from './types';
import { fetchVideo } from './api/client';
import VideoPlayer from './components/VideoPlayer';
import TranscriptPanel from './components/TranscriptPanel';

/** Root application component for the 100LS Shadowing Tool. */
function App() {
  const [url, setUrl] = useState('');
  const [video, setVideo] = useState<Video | null>(null);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /** Submit the YouTube URL to the backend and display the result. */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await fetchVideo(url);
      setVideo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  /** Seek the embedded player to the given timestamp and start playing. */
  const handleSegmentClick = (startTime: number) => {
    if (player) {
      player.seekTo(startTime, true);
      player.playVideo();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          100LS Shadowing Tool
        </h1>

        {/* URL Input */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a YouTube URL..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Load'}
          </button>
        </form>

        {error && (
          <p className="text-red-600 text-sm mb-4">{error}</p>
        )}

        {video && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">{video.title}</h2>

            <VideoPlayer
              videoId={video.video_id}
              onReady={setPlayer}
            />

            <TranscriptPanel
              transcript={video.transcript}
              onSegmentClick={handleSegmentClick}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
