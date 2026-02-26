/**
 * HTTP client for the MyShadowing backend API.
 *
 * All functions target the `/api` prefix and assume the Vite dev server
 * proxies requests to the Flask backend.
 */

import type { Video } from '../types';

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
