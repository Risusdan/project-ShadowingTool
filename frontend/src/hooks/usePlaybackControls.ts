import { useState, useCallback } from 'react';
import type { PlaybackSpeed } from '../types';

interface PlaybackControls {
  playbackRate: PlaybackSpeed;
  setSpeed: (speed: PlaybackSpeed) => void;
  seekTo: (seconds: number) => void;
  play: () => void;
  pause: () => void;
}

interface PlayerLike {
  setPlaybackRate(rate: number): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  playVideo(): void;
  pauseVideo(): void;
}

/**
 * Wraps YouTube player methods into a clean React interface
 * with tracked playback rate state.
 */
export function usePlaybackControls(player: PlayerLike | null): PlaybackControls {
  const [playbackRate, setPlaybackRate] = useState<PlaybackSpeed>(1.0);

  const setSpeed = useCallback(
    (speed: PlaybackSpeed) => {
      setPlaybackRate(speed);
      player?.setPlaybackRate(speed);
    },
    [player],
  );

  const seekTo = useCallback(
    (seconds: number) => {
      player?.seekTo(seconds, true);
    },
    [player],
  );

  const play = useCallback(() => {
    player?.playVideo();
  }, [player]);

  const pause = useCallback(() => {
    player?.pauseVideo();
  }, [player]);

  return { playbackRate, setSpeed, seekTo, play, pause };
}
