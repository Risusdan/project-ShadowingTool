import { useState, useEffect, useCallback } from 'react';
import { fetchLibrary, deleteVideo } from '../api/client';
import type { LibraryVideo } from '../types';

export function useLibrary() {
  const [videos, setVideos] = useState<LibraryVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchLibrary();
      setVideos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch library');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const removeVideo = useCallback(
    async (videoId: string) => {
      setError('');
      try {
        await deleteVideo(videoId);
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete video');
      }
    },
    [load],
  );

  return { videos, loading, error, removeVideo, refresh: load };
}
