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

export const STEP_DESCRIPTIONS: Record<ShadowingStep, string> = {
  1: 'Watch without subtitles to absorb rhythm and context',
  2: 'Read the transcript and confirm meaning',
  3: 'Listen while following the transcript text',
  4: 'Pause after each segment and repeat aloud',
  5: 'Shadow freely without transcript support',
};

export const STEP_FEATURES: Record<ShadowingStep, string[]> = {
  1: ['Video'],
  2: ['Video', 'Transcript', 'Speed'],
  3: ['Video', 'Transcript', 'Speed', 'Loop'],
  4: ['Video', 'Transcript', 'Speed', 'Recording'],
  5: ['Video', 'Speed', 'Recording'],
};

// --- Progress Types ---

export interface ProgressEntry {
  id: number;
  video_id: string;
  round: number;
  step: number;
  notes: string | null;
  created_at: string;
}

export interface ProgressResponse {
  video_id: string;
  current_round: number;
  current_step: number;
  entries: ProgressEntry[];
}

/** Video summary for the library view (no transcript). */
export interface LibraryVideo {
  video_id: string;
  title: string;
  duration: number;
  thumbnail: string;
  last_practiced: string | null;
  current_round: number;
}

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
