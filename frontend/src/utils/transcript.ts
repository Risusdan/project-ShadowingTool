import type { TranscriptSegment } from '../types';

/**
 * Find the index of the active transcript segment for a given playback time.
 *
 * Uses a reverse linear scan to find the last segment whose `start` is <= currentTime.
 * Returns -1 if no segment matches (e.g. empty transcript or time before first segment).
 */
export function findActiveSegmentIndex(
  segments: TranscriptSegment[],
  currentTime: number,
): number {
  for (let i = segments.length - 1; i >= 0; i--) {
    if (segments[i].start <= currentTime) {
      return i;
    }
  }
  return -1;
}
