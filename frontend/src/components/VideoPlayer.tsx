import YouTube from 'react-youtube';
import type { YouTubeEvent, YouTubePlayer } from 'react-youtube';

/** Props for the {@link VideoPlayer} component. */
interface VideoPlayerProps {
  /** The 11-character YouTube video ID to embed. */
  videoId: string;
  /** Called once the iframe player is ready, providing the player instance. */
  onReady: (player: YouTubePlayer) => void;
}

/** Embeds a YouTube video via the react-youtube iframe wrapper. */
export default function VideoPlayer({ videoId, onReady }: VideoPlayerProps) {
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
        className="w-full h-full"
        iframeClassName="w-full h-full rounded-lg"
      />
    </div>
  );
}
