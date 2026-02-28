/**
 * Determine whether playback should pause after the current segment.
 *
 * Returns true when the active segment has advanced forward (not just by +1,
 * but by any positive amount) indicating a natural segment transition — even
 * if segments were skipped due to fast playback.
 *
 * Guards:
 * - Returns false if either index is -1 (initial/uninitialized state)
 * - Returns false if pause-after-segment is disabled
 * - Returns false if loop mode is enabled (loop takes priority)
 * - Returns false if not currently playing
 */
export function shouldPauseAfterSegment(
  activeIndex: number,
  prevIndex: number,
  pauseEnabled: boolean,
  loopEnabled: boolean,
  isPlaying: boolean,
): boolean {
  if (!pauseEnabled || loopEnabled || !isPlaying) return false;
  if (activeIndex < 0 || prevIndex < 0) return false;
  return activeIndex > prevIndex;
}
