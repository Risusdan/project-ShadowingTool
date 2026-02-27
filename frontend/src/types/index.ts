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

// --- Voice Recording Types ---

export type RecordingStatus = 'idle' | 'requesting' | 'recording' | 'stopped';
export type MicPermission = 'prompt' | 'granted' | 'denied' | 'error';

export interface AudioRecording {
  blob: Blob;
  url: string;          // Object URL for playback
  duration: number;     // seconds
  createdAt: number;    // Date.now()
}

// --- 100LS Step Types ---

export type ShadowingStep = 1 | 2 | 3 | 4 | 5;

export const STEP_LABELS: Record<ShadowingStep, string> = {
  1: 'Contextual Immersion',
  2: 'Meaning Confirmation',
  3: 'Sound-to-Text Linking',
  4: 'Delayed Shadowing',
  5: 'Pure Listening & Speaking',
};

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
