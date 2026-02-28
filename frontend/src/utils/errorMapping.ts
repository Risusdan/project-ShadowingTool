/** Structured error object used throughout the frontend. */
export interface AppError {
  message: string;
  code?: string;
}

/** Return a short, user-friendly title for an error. */
export function getErrorTitle(error: AppError): string {
  // Structured code takes priority
  switch (error.code) {
    case 'TRANSCRIPT_UNAVAILABLE':
      return 'Transcript unavailable';
    case 'VIDEO_UNAVAILABLE':
      return 'Video unavailable';
  }

  // Regex fallback for browser-level or unstructured errors
  const msg = error.message;
  if (/invalid.*url/i.test(msg)) return 'Invalid YouTube URL';
  if (/no transcript|transcriptsdisabled/i.test(msg)) return 'Transcript unavailable';
  if (/timed?\s?out/i.test(msg)) return 'Request timed out';
  if (/network|econnrefused/i.test(msg)) return 'Connection error';
  return 'Something went wrong';
}

/** Return actionable guidance text for an error. */
export function getErrorGuidance(error: AppError): string {
  switch (error.code) {
    case 'TRANSCRIPT_UNAVAILABLE':
      return 'This video does not have captions available. Try a different video with subtitles enabled.';
    case 'VIDEO_UNAVAILABLE':
      return 'The video could not be retrieved from YouTube. It may be private, deleted, or region-restricted.';
  }

  const msg = error.message;
  if (/invalid.*url/i.test(msg))
    return 'Please enter a valid YouTube URL (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...).';
  if (/no transcript|transcriptsdisabled/i.test(msg))
    return 'This video does not have captions available. Try a different video with subtitles enabled.';
  if (/timed?\s?out/i.test(msg))
    return 'The request took too long. Please try again.';
  if (/network|econnrefused/i.test(msg))
    return 'Please check your internet connection and make sure the backend server is running.';
  return error.message;
}
