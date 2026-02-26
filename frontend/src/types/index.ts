/** A single timed segment within a video transcript. */
export interface TranscriptSegment {
  /** Offset from the start of the video, in seconds. */
  start: number;
  /** Length of this segment, in seconds. */
  duration: number;
  /** The spoken text for this segment. */
  text: string;
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
