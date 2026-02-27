/**
 * HTTP client for the MyShadowing backend API.
 *
 * All functions target the `/api` prefix and assume the Vite dev server
 * proxies requests to the Flask backend.
 */

import type { Video, LibraryVideo, ProgressEntry, ProgressResponse } from '../types';

const API_BASE = '/api';

/**
 * Submit a YouTube URL and receive video metadata + transcript.
 *
 * @param url - A full YouTube URL (standard or short form).
 * @returns The video object including title, duration, thumbnail, and transcript.
 * @throws {Error} If the backend returns a non-OK status (includes the server error message).
 */
export async function fetchVideo(url: string): Promise<Video> {
  const res = await fetch(`${API_BASE}/video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to fetch video');
  }

  return res.json();
}

/**
 * Retrieve the cached transcript for a previously fetched video.
 *
 * @param videoId - The 11-character YouTube video ID.
 * @returns An array of transcript segments.
 * @throws {Error} If the video hasn't been fetched yet (404) or another server error occurs.
 */
export async function fetchTranscript(videoId: string): Promise<Video['transcript']> {
  const res = await fetch(`${API_BASE}/video/${videoId}/transcript`);

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to fetch transcript');
  }

  const data = await res.json();
  return data.transcript;
}

/**
 * Fetch progress history for a video.
 *
 * @param videoId - The 11-character YouTube video ID.
 * @returns Progress data including current round, step, and all entries.
 * @throws {Error} If the video hasn't been fetched yet (404) or another server error occurs.
 */
export async function fetchProgress(videoId: string): Promise<ProgressResponse> {
  const res = await fetch(`${API_BASE}/progress/${videoId}`);

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to fetch progress');
  }

  return res.json();
}

/**
 * Save a new progress entry for a video.
 *
 * @param videoId - The 11-character YouTube video ID.
 * @param round - The round number (>= 1).
 * @param step - The current step (1-5).
 * @param notes - Optional notes for this round.
 * @returns The created progress entry.
 * @throws {Error} If validation fails (400) or the video doesn't exist (404).
 */
export async function saveProgress(
  videoId: string,
  round: number,
  step: number,
  notes?: string,
): Promise<ProgressEntry> {
  const res = await fetch(`${API_BASE}/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ video_id: videoId, round, step, notes }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to save progress');
  }

  return res.json();
}

/**
 * Fetch the video library — all cached videos without transcript.
 */
export async function fetchLibrary(): Promise<LibraryVideo[]> {
  const res = await fetch(`${API_BASE}/videos`);

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to fetch library');
  }

  return res.json();
}

/**
 * Fetch a single video by ID (full data including transcript).
 */
export async function fetchVideoById(videoId: string): Promise<Video> {
  const res = await fetch(`${API_BASE}/video/${videoId}`);

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to fetch video');
  }

  return res.json();
}

/**
 * Delete a video and all its progress entries.
 */
export async function deleteVideo(videoId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/video/${videoId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete video');
  }
}
