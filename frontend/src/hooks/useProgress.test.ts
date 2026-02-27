import { renderHook, act, waitFor } from '@testing-library/react';
import { useProgress } from './useProgress';
import * as client from '../api/client';
import type { ProgressResponse } from '../types';

vi.mock('../api/client', () => ({
  fetchProgress: vi.fn(),
  saveProgress: vi.fn(),
}));

const mockFetchProgress = vi.mocked(client.fetchProgress);
const mockSaveProgress = vi.mocked(client.saveProgress);

const emptyResponse: ProgressResponse = {
  video_id: 'abc123',
  current_round: 0,
  current_step: 0,
  entries: [],
};

const existingResponse: ProgressResponse = {
  video_id: 'abc123',
  current_round: 5,
  current_step: 3,
  entries: [
    { id: 1, video_id: 'abc123', round: 5, step: 3, notes: null, created_at: '2025-01-01T00:00:00' },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useProgress', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useProgress(null));

    expect(result.current.currentRound).toBe(0);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('');
  });

  it('loads progress on mount when videoId is provided', async () => {
    mockFetchProgress.mockResolvedValueOnce(existingResponse);

    const { result } = renderHook(() => useProgress('abc123'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetchProgress).toHaveBeenCalledWith('abc123');
    expect(result.current.currentRound).toBe(5);
  });

  it('does not fetch when videoId is null', () => {
    renderHook(() => useProgress(null));

    expect(mockFetchProgress).not.toHaveBeenCalled();
  });

  it('treats 404 as round 0 (no progress yet)', async () => {
    mockFetchProgress.mockRejectedValueOnce(new Error('Video not found'));

    const { result } = renderHook(() => useProgress('abc123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.currentRound).toBe(0);
    expect(result.current.error).toBe('');
  });

  it('completeRound saves and increments round', async () => {
    mockFetchProgress.mockResolvedValueOnce(emptyResponse);
    mockSaveProgress.mockResolvedValueOnce({
      id: 1,
      video_id: 'abc123',
      round: 1,
      step: 3,
      notes: null,
      created_at: '2025-01-01T00:00:00',
    });

    const { result } = renderHook(() => useProgress('abc123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.completeRound(3);
    });

    expect(mockSaveProgress).toHaveBeenCalledWith('abc123', 1, 3, undefined);
    expect(result.current.currentRound).toBe(1);
  });

  it('passes notes to saveProgress', async () => {
    mockFetchProgress.mockResolvedValueOnce(existingResponse);
    mockSaveProgress.mockResolvedValueOnce({
      id: 2,
      video_id: 'abc123',
      round: 6,
      step: 4,
      notes: 'Great session',
      created_at: '2025-01-01T00:00:00',
    });

    const { result } = renderHook(() => useProgress('abc123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.completeRound(4, 'Great session');
    });

    expect(mockSaveProgress).toHaveBeenCalledWith('abc123', 6, 4, 'Great session');
    expect(result.current.currentRound).toBe(6);
  });

  it('refetches on videoId change', async () => {
    mockFetchProgress.mockResolvedValueOnce(existingResponse);

    const { result, rerender } = renderHook(
      ({ videoId }) => useProgress(videoId),
      { initialProps: { videoId: 'abc123' as string | null } },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.currentRound).toBe(5);

    const newResponse: ProgressResponse = {
      video_id: 'xyz789',
      current_round: 2,
      current_step: 1,
      entries: [],
    };
    mockFetchProgress.mockResolvedValueOnce(newResponse);

    rerender({ videoId: 'xyz789' });

    await waitFor(() => {
      expect(result.current.currentRound).toBe(2);
    });

    expect(mockFetchProgress).toHaveBeenCalledTimes(2);
    expect(mockFetchProgress).toHaveBeenLastCalledWith('xyz789');
  });

  it('sets error on save failure', async () => {
    mockFetchProgress.mockResolvedValueOnce(emptyResponse);
    mockSaveProgress.mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useProgress('abc123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.completeRound(3);
    });

    expect(result.current.error).toBe('Server error');
    expect(result.current.currentRound).toBe(0); // unchanged
  });
});
