import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchVideo } from './client';

// We test fetchVideo as representative — all functions share the same helpers.

const API_BASE = '/api';

describe('API client resilience', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('throws with message and code from JSON error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: () => Promise.resolve({ error: 'Transcript is unavailable', error_code: 'TRANSCRIPT_UNAVAILABLE' }),
    });

    try {
      await fetchVideo('https://youtube.com/watch?v=abc');
      expect.fail('should have thrown');
    } catch (err: any) {
      expect(err.message).toBe('Transcript is unavailable');
      expect(err.code).toBe('TRANSCRIPT_UNAVAILABLE');
    }
  });

  it('throws fallback message when error response is not JSON (HTML)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new SyntaxError('Unexpected token <')),
    });

    try {
      await fetchVideo('https://youtube.com/watch?v=abc');
      expect.fail('should have thrown');
    } catch (err: any) {
      expect(err.message).toBe('Server error (status 500)');
      expect(err.code).toBeUndefined();
    }
  });

  it('throws "Request timed out" when request exceeds timeout', async () => {
    globalThis.fetch = vi.fn().mockImplementation((_input: string, init: RequestInit) => {
      // Immediately abort to simulate timeout
      const signal = init?.signal;
      if (signal) {
        (signal as any).addEventListener('abort', () => {});
      }
      return new Promise((_resolve, reject) => {
        // Simulate the abort
        const abortError = new DOMException('The operation was aborted.', 'AbortError');
        if (signal?.aborted) {
          reject(abortError);
          return;
        }
        signal?.addEventListener('abort', () => reject(abortError));
      });
    });

    // Use a very short timeout for testing
    const { fetchWithTimeout } = await import('./client');
    const controller = new AbortController();
    // Abort immediately
    setTimeout(() => controller.abort(), 0);

    try {
      await fetchWithTimeout(`${API_BASE}/video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'test' }),
        signal: controller.signal,
      }, 1);
      expect.fail('should have thrown');
    } catch (err: any) {
      expect(err.message).toBe('Request timed out');
    }
  });

  it('throws with original message on network failure', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    try {
      await fetchVideo('https://youtube.com/watch?v=abc');
      expect.fail('should have thrown');
    } catch (err: any) {
      expect(err.message).toBe('Failed to fetch');
    }
  });
});
