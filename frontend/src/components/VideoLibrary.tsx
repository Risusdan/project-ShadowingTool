import type { LibraryVideo } from '../types';

interface VideoLibraryProps {
  videos: LibraryVideo[];
  loading: boolean;
  error: string;
  onSelectVideo: (videoId: string) => void;
  onRemoveVideo: (videoId: string) => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleDateString();
}

export default function VideoLibrary({
  videos,
  loading,
  error,
  onSelectVideo,
  onRemoveVideo,
}: VideoLibraryProps) {
  if (loading) {
    return <p className="text-gray-500 text-sm">Loading library...</p>;
  }

  if (error) {
    return <p className="text-red-600 text-sm">{error}</p>;
  }

  if (videos.length === 0) {
    return (
      <p className="text-gray-500 text-sm">
        No videos yet. Paste a YouTube URL above to get started.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {videos.map((v) => (
        <div
          key={v.video_id}
          onClick={() => onSelectVideo(v.video_id)}
          className="flex gap-4 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <img
            src={v.thumbnail}
            alt={v.title}
            className="w-32 h-20 object-cover rounded flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{v.title}</h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span>{formatDuration(v.duration)}</span>
              <span>Round {v.current_round}</span>
              <span>Last: {formatDate(v.last_practiced)}</span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveVideo(v.video_id);
            }}
            className="self-center px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
            aria-label={`Remove ${v.title}`}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
