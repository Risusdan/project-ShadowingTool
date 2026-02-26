import YouTube from 'react-youtube';
import type { YouTubeEvent, YouTubePlayer } from 'react-youtube';

interface VideoPlayerProps {
  videoId: string;
  onReady: (player: YouTubePlayer) => void;
  onStateChange?: (event: YouTubeEvent) => void;
}

export default function VideoPlayer({ videoId, onReady, onStateChange }: VideoPlayerProps) {
  const handleReady = (event: YouTubeEvent) => {
    onReady(event.target);
  };

  return (
    <div className="w-full aspect-video">
      <YouTube
        videoId={videoId}
        opts={{
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 0,
            modestbranding: 1,
            rel: 0,
          },
        }}
        onReady={handleReady}
        onStateChange={onStateChange}
        className="w-full h-full"
        iframeClassName="w-full h-full rounded-lg"
      />
    </div>
  );
}
