import type { TranscriptSegment } from '../types';

/** Props for the {@link TranscriptPanel} component. */
interface TranscriptPanelProps {
  /** Ordered transcript segments to display. */
  transcript: TranscriptSegment[];
  /** Called when the user clicks a segment; receives the start time in seconds. */
  onSegmentClick: (startTime: number) => void;
}

/**
 * Format a time value in seconds to an `m:ss` display string.
 *
 * @param seconds - Time offset in seconds (fractional part is truncated).
 * @returns A string like `"1:05"` or `"0:00"`.
 */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Scrollable list of transcript segments with click-to-seek behaviour. */
export default function TranscriptPanel({ transcript, onSegmentClick }: TranscriptPanelProps) {
  return (
    <div className="h-96 overflow-y-auto border border-gray-200 rounded-lg">
      <ul className="divide-y divide-gray-100">
        {transcript.map((segment) => (
          <li
            key={segment.start}
            onClick={() => onSegmentClick(segment.start)}
            className="flex gap-3 px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors"
          >
            <span className="text-xs text-gray-400 font-mono pt-0.5 shrink-0">
              {formatTime(segment.start)}
            </span>
            <span className="text-sm text-gray-700">
              {segment.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
