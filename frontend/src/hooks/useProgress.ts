import { useState, useEffect, useCallback } from 'react';
import { fetchProgress, saveProgress } from '../api/client';

export function useProgress(videoId: string | null) {
  const [currentRound, setCurrentRound] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!videoId) {
      setCurrentRound(0);
      setLoading(false);
      setError('');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    fetchProgress(videoId)
      .then((data) => {
        if (!cancelled) {
          setCurrentRound(data.current_round);
        }
      })
      .catch(() => {
        // 404 = no progress yet → treat as round 0
        if (!cancelled) {
          setCurrentRound(0);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [videoId]);

  const completeRound = useCallback(
    async (step: number, notes?: string) => {
      if (!videoId) return;

      const nextRound = currentRound + 1;
      setError('');

      try {
        await saveProgress(videoId, nextRound, step, notes);
        setCurrentRound(nextRound);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save progress');
      }
    },
    [videoId, currentRound],
  );

  return { currentRound, loading, error, completeRound };
}
