import { useEffect, useRef } from 'react';
import type { TranscriptSegment, LoopRange } from '../types';

interface TranscriptPanelProps {
  transcript: TranscriptSegment[];
  onSegmentClick: (startTime: number) => void;
  activeSegmentIndex: number;
  loopRange: LoopRange | null;
  onSegmentShiftClick: (index: number) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function TranscriptPanel({
  transcript,
  onSegmentClick,
  activeSegmentIndex,
  loopRange,
  onSegmentShiftClick,
}: TranscriptPanelProps) {
  const activeRef = useRef<HTMLLIElement>(null);

  // Auto-scroll active segment into view
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeSegmentIndex]);

  const handleClick = (e: React.MouseEvent, index: number, startTime: number) => {
    if (e.shiftKey) {
      onSegmentShiftClick(index);
    } else {
      onSegmentClick(startTime);
    }
  };

  return (
    <div className="h-64 sm:h-96 overflow-y-auto border border-gray-200 rounded-lg">
      <ul className="divide-y divide-gray-100" role="list" aria-label="Transcript segments">
        {transcript.map((segment, index) => {
          const isActive = index === activeSegmentIndex;
          const isInLoop =
            loopRange !== null &&
            index >= loopRange.startIndex &&
            index <= loopRange.endIndex;

          let bgClass = 'hover:bg-blue-50';
          if (isActive) {
            bgClass = 'bg-blue-100 border-l-4 border-blue-500';
          } else if (isInLoop) {
            bgClass = 'bg-green-50 hover:bg-green-100';
          }

          return (
            <li
              key={segment.start}
              ref={isActive ? activeRef : undefined}
              onClick={(e) => handleClick(e, index, segment.start)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClick(e as unknown as React.MouseEvent, index, segment.start);
                }
              }}
              tabIndex={isActive ? 0 : -1}
              aria-current={isActive ? 'true' : undefined}
              className={`flex gap-3 px-4 py-2 cursor-pointer transition-colors ${bgClass}`}
            >
              <span className="text-xs text-gray-400 font-mono pt-0.5 shrink-0">
                {formatTime(segment.start)}
              </span>
              <span className="text-sm text-gray-700">
                {segment.text}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
