import { renderHook, act } from '@testing-library/react';
import { usePlaybackControls } from './usePlaybackControls';

function createMockPlayer() {
  return {
    setPlaybackRate: vi.fn(),
    seekTo: vi.fn(),
    playVideo: vi.fn(),
    pauseVideo: vi.fn(),
  };
}

describe('usePlaybackControls', () => {
  it('returns defaults when player is null', () => {
    const { result } = renderHook(() => usePlaybackControls(null));
    expect(result.current.playbackRate).toBe(1.0);
  });

  it('setSpeed updates playbackRate and calls player.setPlaybackRate', () => {
    const player = createMockPlayer();
    const { result } = renderHook(() => usePlaybackControls(player));

    act(() => {
      result.current.setSpeed(0.75);
    });

    expect(result.current.playbackRate).toBe(0.75);
    expect(player.setPlaybackRate).toHaveBeenCalledWith(0.75);
  });

  it('seekTo calls player.seekTo with allowSeekAhead=true', () => {
    const player = createMockPlayer();
    const { result } = renderHook(() => usePlaybackControls(player));

    act(() => {
      result.current.seekTo(42);
    });

    expect(player.seekTo).toHaveBeenCalledWith(42, true);
  });

  it('play calls player.playVideo', () => {
    const player = createMockPlayer();
    const { result } = renderHook(() => usePlaybackControls(player));

    act(() => {
      result.current.play();
    });

    expect(player.playVideo).toHaveBeenCalled();
  });

  it('pause calls player.pauseVideo', () => {
    const player = createMockPlayer();
    const { result } = renderHook(() => usePlaybackControls(player));

    act(() => {
      result.current.pause();
    });

    expect(player.pauseVideo).toHaveBeenCalled();
  });

  it('methods are no-ops when player is null', () => {
    const { result } = renderHook(() => usePlaybackControls(null));

    // Should not throw
    act(() => {
      result.current.setSpeed(0.5);
      result.current.seekTo(10);
      result.current.play();
      result.current.pause();
    });

    expect(result.current.playbackRate).toBe(0.5);
  });
});
