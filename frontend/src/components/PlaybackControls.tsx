import { PLAYBACK_SPEEDS } from '../types';
import type { PlaybackSpeed } from '../types';

interface PlaybackControlsProps {
  playbackRate: PlaybackSpeed;
  onSpeedChange: (speed: PlaybackSpeed) => void;
  loopEnabled: boolean;
  onLoopToggle: () => void;
  pauseAfterSegment: boolean;
  onPauseAfterSegmentToggle: () => void;
}

export default function PlaybackControls({
  playbackRate,
  onSpeedChange,
  loopEnabled,
  onLoopToggle,
  pauseAfterSegment,
  onPauseAfterSegmentToggle,
}: PlaybackControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 py-2">
      {/* Speed buttons */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500 mr-1">Speed</span>
        {PLAYBACK_SPEEDS.map((speed) => (
          <button
            key={speed}
            onClick={() => onSpeedChange(speed)}
            className={`px-2 py-1 text-xs rounded ${
              playbackRate === speed
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {speed === 1.0 ? '1x' : `${speed}x`}
          </button>
        ))}
      </div>

      <div className="hidden sm:block h-4 w-px bg-gray-300" />

      {/* Loop toggle */}
      <button
        onClick={onLoopToggle}
        aria-pressed={loopEnabled}
        className={`px-3 py-1 text-xs rounded ${
          loopEnabled
            ? 'bg-green-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Loop {loopEnabled ? 'ON' : 'OFF'}
      </button>

      {/* Pause after segment toggle */}
      <button
        onClick={onPauseAfterSegmentToggle}
        aria-pressed={pauseAfterSegment}
        className={`px-3 py-1 text-xs rounded ${
          pauseAfterSegment
            ? 'bg-amber-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Pause After {pauseAfterSegment ? 'ON' : 'OFF'}
      </button>
    </div>
  );
}
