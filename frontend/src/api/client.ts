/**
 * HTTP client for the MyShadowing backend API.
 *
 * All functions target the `/api` prefix and assume the Vite dev server
 * proxies requests to the Flask backend.
 */

import type { Video, LibraryVideo, ProgressEntry, ProgressResponse } from '../types';

const API_BASE = '/api';
const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Safely parse JSON from a Response. Returns parsed data or an empty object
 * if the body is not valid JSON (e.g. HTML error pages).
 */
async function safeJsonParse(res: Response): Promise<Record<string, unknown>> {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

/**
 * Wrap fetch with an AbortController-based timeout.
 * Rejects with "Request timed out" if the request exceeds `timeoutMs`.
 */
export async function fetchWithTimeout(
  input: string,
  init?: RequestInit,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const existingSignal = init?.signal;

  // If caller passed a signal that's already aborted, respect it
  if (existingSignal?.aborted) {
    throw new DOMException('The operation was aborted.', 'AbortError');
  }

  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  // Forward external abort to our controller
  existingSignal?.addEventListener('abort', () => controller.abort());

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Handle a non-OK response: parse the JSON body safely, throw an Error
 * with the server message and attach `error_code` if present.
 */
async function handleErrorResponse(res: Response): Promise<never> {
  const data = await safeJsonParse(res);
  const message = (typeof data.error === 'string' ? data.error : null)
    || `Server error (status ${res.status})`;
  const err = new Error(message);
  if (typeof data.error_code === 'string') {
    (err as any).code = data.error_code;
  }
  throw err;
}

/**
 * Submit a YouTube URL and receive video metadata + transcript.
 */
export async function fetchVideo(url: string): Promise<Video> {
  const res = await fetchWithTimeout(`${API_BASE}/video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) await handleErrorResponse(res);
  return res.json();
}

/**
 * Retrieve the cached transcript for a previously fetched video.
 */
export async function fetchTranscript(videoId: string): Promise<Video['transcript']> {
  const res = await fetchWithTimeout(`${API_BASE}/video/${videoId}/transcript`);
  if (!res.ok) await handleErrorResponse(res);
  const data = await res.json();
  return data.transcript;
}

/**
 * Fetch progress history for a video.
 */
export async function fetchProgress(videoId: string): Promise<ProgressResponse> {
  const res = await fetchWithTimeout(`${API_BASE}/progress/${videoId}`);
  if (!res.ok) await handleErrorResponse(res);
  return res.json();
}

/**
 * Save a new progress entry for a video.
 */
export async function saveProgress(
  videoId: string,
  round: number,
  step: number,
  notes?: string,
): Promise<ProgressEntry> {
  const res = await fetchWithTimeout(`${API_BASE}/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ video_id: videoId, round, step, notes }),
  });
  if (!res.ok) await handleErrorResponse(res);
  return res.json();
}

/**
 * Fetch the video library — all cached videos without transcript.
 */
export async function fetchLibrary(): Promise<LibraryVideo[]> {
  const res = await fetchWithTimeout(`${API_BASE}/videos`);
  if (!res.ok) await handleErrorResponse(res);
  return res.json();
}

/**
 * Fetch a single video by ID (full data including transcript).
 */
export async function fetchVideoById(videoId: string): Promise<Video> {
  const res = await fetchWithTimeout(`${API_BASE}/video/${videoId}`);
  if (!res.ok) await handleErrorResponse(res);
  return res.json();
}

/**
 * Delete a video and all its progress entries.
 */
export async function deleteVideo(videoId: string): Promise<void> {
  const res = await fetchWithTimeout(`${API_BASE}/video/${videoId}`, {
    method: 'DELETE',
  });
  if (!res.ok) await handleErrorResponse(res);
}
