import { renderHook, act, waitFor } from '@testing-library/react';
import { useLibrary } from './useLibrary';
import * as client from '../api/client';
import type { LibraryVideo } from '../types';

vi.mock('../api/client', () => ({
  fetchLibrary: vi.fn(),
  deleteVideo: vi.fn(),
}));

const mockFetchLibrary = vi.mocked(client.fetchLibrary);
const mockDeleteVideo = vi.mocked(client.deleteVideo);

const sampleVideos: LibraryVideo[] = [
  {
    video_id: 'abc123',
    title: 'Video A',
    duration: 120,
    thumbnail: 'https://img.youtube.com/a.jpg',
    last_practiced: '2025-06-01T10:00:00',
    current_round: 5,
  },
  {
    video_id: 'xyz789',
    title: 'Video B',
    duration: 300,
    thumbnail: 'https://img.youtube.com/b.jpg',
    last_practiced: null,
    current_round: 0,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useLibrary', () => {
  it('starts in loading state', () => {
    mockFetchLibrary.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useLibrary());

    expect(result.current.loading).toBe(true);
    expect(result.current.videos).toEqual([]);
    expect(result.current.error).toBe('');
  });

  it('loads videos on mount', async () => {
    mockFetchLibrary.mockResolvedValueOnce(sampleVideos);

    const { result } = renderHook(() => useLibrary());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.videos).toEqual(sampleVideos);
    expect(mockFetchLibrary).toHaveBeenCalledOnce();
  });

  it('sets error on fetch failure', async () => {
    mockFetchLibrary.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useLibrary());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.videos).toEqual([]);
  });

  it('removeVideo deletes and refreshes', async () => {
    mockFetchLibrary.mockResolvedValueOnce(sampleVideos);

    const { result } = renderHook(() => useLibrary());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockDeleteVideo.mockResolvedValueOnce(undefined);
    mockFetchLibrary.mockResolvedValueOnce([sampleVideos[1]]);

    await act(async () => {
      await result.current.removeVideo('abc123');
    });

    expect(mockDeleteVideo).toHaveBeenCalledWith('abc123');
    expect(result.current.videos).toEqual([sampleVideos[1]]);
  });

  it('sets error on delete failure', async () => {
    mockFetchLibrary.mockResolvedValueOnce(sampleVideos);

    const { result } = renderHook(() => useLibrary());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockDeleteVideo.mockRejectedValueOnce(new Error('Delete failed'));

    await act(async () => {
      await result.current.removeVideo('abc123');
    });

    expect(result.current.error).toBe('Delete failed');
  });

  it('refresh reloads the library', async () => {
    mockFetchLibrary.mockResolvedValueOnce(sampleVideos);

    const { result } = renderHook(() => useLibrary());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockFetchLibrary.mockResolvedValueOnce([]);

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockFetchLibrary).toHaveBeenCalledTimes(2);
    expect(result.current.videos).toEqual([]);
  });
});
