/** A single timed segment within a video transcript. */
export interface TranscriptSegment {
  /** Offset from the start of the video, in seconds. */
  start: number;
  /** Length of this segment, in seconds. */
  duration: number;
  /** The spoken text for this segment. */
  text: string;
}

/** A loop range defined by transcript segment indices (inclusive). */
export interface LoopRange {
  startIndex: number;
  endIndex: number;
}

/** Available playback speed multipliers. */
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5] as const;

/** One of the supported playback speed values. */
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

/** Video metadata and full transcript returned by the backend API. */
export interface Video {
  /** The 11-character YouTube video ID. */
  video_id: string;
  /** The video title as reported by YouTube. */
  title: string;
  /** Total video length in seconds. */
  duration: number;
  /** URL of the video thumbnail image. */
  thumbnail: string;
  /** Ordered list of transcript segments for the video. */
  transcript: TranscriptSegment[];
}
