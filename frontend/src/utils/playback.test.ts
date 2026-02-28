import { describe, it, expect } from 'vitest';
import { shouldPauseAfterSegment } from './playback';

describe('shouldPauseAfterSegment', () => {
  // Normal advance: segment 2 → 3 (diff = +1)
  it('returns true on normal +1 advance', () => {
    expect(shouldPauseAfterSegment(3, 2, true, false, true)).toBe(true);
  });

  // Skipped segment: segment 2 → 4 (diff = +2)
  it('returns true when segments are skipped (+2)', () => {
    expect(shouldPauseAfterSegment(4, 2, true, false, true)).toBe(true);
  });

  // No change: segment stays at 2
  it('returns false when segment has not changed', () => {
    expect(shouldPauseAfterSegment(2, 2, true, false, true)).toBe(false);
  });

  // Backward seek: segment 5 → 2
  it('returns false on backward seek', () => {
    expect(shouldPauseAfterSegment(2, 5, true, false, true)).toBe(false);
  });

  // Initial load: -1 → 0
  it('returns false on initial load (-1 → 0)', () => {
    expect(shouldPauseAfterSegment(0, -1, true, false, true)).toBe(false);
  });

  // Pause disabled
  it('returns false when pause is disabled', () => {
    expect(shouldPauseAfterSegment(3, 2, false, false, true)).toBe(false);
  });

  // Loop enabled (loop takes priority)
  it('returns false when loop is enabled', () => {
    expect(shouldPauseAfterSegment(3, 2, true, true, true)).toBe(false);
  });

  // Not playing
  it('returns false when not playing', () => {
    expect(shouldPauseAfterSegment(3, 2, true, false, false)).toBe(false);
  });
});
