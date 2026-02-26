import { useState, useEffect, useRef } from 'react';
import type { TranscriptSegment } from '../types';
import { findActiveSegmentIndex } from '../utils/transcript';

interface PlayerSyncState {
  currentTime: number;
  activeSegmentIndex: number;
  isPlaying: boolean;
}

const POLL_INTERVAL_MS = 200;

/**
 * Polls the YouTube player every 200ms to track current playback time,
 * the active transcript segment, and play/pause state.
 */
export function usePlayerSync(
  player: { getCurrentTime(): Promise<number>; getPlayerState(): Promise<number> } | null,
  transcript: TranscriptSegment[],
): PlayerSyncState {
  const [state, setState] = useState<PlayerSyncState>({
    currentTime: 0,
    activeSegmentIndex: -1,
    isPlaying: false,
  });

  const transcriptRef = useRef(transcript);
  transcriptRef.current = transcript;

  useEffect(() => {
    if (!player) return;

    const poll = async () => {
      try {
        const [time, playerState] = await Promise.all([
          player.getCurrentTime(),
          player.getPlayerState(),
        ]);
        const idx = findActiveSegmentIndex(transcriptRef.current, time);
        setState({
          currentTime: time,
          activeSegmentIndex: idx,
          isPlaying: playerState === 1,
        });
      } catch {
        // Player may be destroyed; silently ignore
      }
    };

    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [player]);

  return state;
}
