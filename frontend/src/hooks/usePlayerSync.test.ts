import { renderHook, act } from '@testing-library/react';
import type { TranscriptSegment } from '../types';
import { usePlayerSync } from './usePlayerSync';

const segments: TranscriptSegment[] = [
  { start: 0, duration: 5, text: 'Hello' },
  { start: 5, duration: 4, text: 'World' },
  { start: 9, duration: 3, text: 'Foo' },
];

function createMockPlayer(time: number, state: number) {
  return {
    getCurrentTime: vi.fn().mockResolvedValue(time),
    getPlayerState: vi.fn().mockResolvedValue(state),
  };
}

describe('usePlayerSync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns defaults when player is null', () => {
    const { result } = renderHook(() => usePlayerSync(null, segments));
    expect(result.current.currentTime).toBe(0);
    expect(result.current.activeSegmentIndex).toBe(-1);
    expect(result.current.isPlaying).toBe(false);
  });

  it('polls player and updates currentTime and activeSegmentIndex', async () => {
    const player = createMockPlayer(6.5, 1);
    const { result } = renderHook(() => usePlayerSync(player, segments));

    // Advance past the 200ms polling interval
    await act(async () => {
      vi.advanceTimersByTime(250);
    });

    expect(player.getCurrentTime).toHaveBeenCalled();
    expect(result.current.currentTime).toBe(6.5);
    expect(result.current.activeSegmentIndex).toBe(1);
    expect(result.current.isPlaying).toBe(true);
  });

  it('detects paused state (playerState !== 1)', async () => {
    const player = createMockPlayer(3, 2); // state 2 = paused
    const { result } = renderHook(() => usePlayerSync(player, segments));

    await act(async () => {
      vi.advanceTimersByTime(250);
    });

    expect(result.current.isPlaying).toBe(false);
  });

  it('handles player errors gracefully', async () => {
    const player = {
      getCurrentTime: vi.fn().mockRejectedValue(new Error('destroyed')),
      getPlayerState: vi.fn().mockRejectedValue(new Error('destroyed')),
    };

    const { result } = renderHook(() => usePlayerSync(player, segments));

    await act(async () => {
      vi.advanceTimersByTime(250);
    });

    // Should keep defaults, not throw
    expect(result.current.currentTime).toBe(0);
  });

  it('clears interval on unmount', async () => {
    const player = createMockPlayer(0, 1);
    const { unmount } = renderHook(() => usePlayerSync(player, segments));

    await act(async () => {
      vi.advanceTimersByTime(250);
    });

    unmount();

    // After unmount, no more calls should happen
    const callCount = player.getCurrentTime.mock.calls.length;
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(player.getCurrentTime.mock.calls.length).toBe(callCount);
  });
});
