import { memo, useEffect, useRef, useCallback } from 'react';
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

interface SegmentItemProps {
  segment: TranscriptSegment;
  index: number;
  isActive: boolean;
  isInLoop: boolean;
  onClick: (e: React.MouseEvent, index: number, startTime: number) => void;
}

const TranscriptSegmentItem = memo(function TranscriptSegmentItem({
  segment,
  index,
  isActive,
  isInLoop,
  onClick,
}: SegmentItemProps) {
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (isActive) {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isActive]);

  let bgClass = 'hover:bg-blue-50';
  if (isActive) {
    bgClass = 'bg-blue-100 border-l-4 border-blue-500';
  } else if (isInLoop) {
    bgClass = 'bg-green-50 hover:bg-green-100';
  }

  return (
    <li
      ref={ref}
      onClick={(e) => onClick(e, index, segment.start)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e as unknown as React.MouseEvent, index, segment.start);
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
});

export default function TranscriptPanel({
  transcript,
  onSegmentClick,
  activeSegmentIndex,
  loopRange,
  onSegmentShiftClick,
}: TranscriptPanelProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent, index: number, startTime: number) => {
      if (e.shiftKey) {
        onSegmentShiftClick(index);
      } else {
        onSegmentClick(startTime);
      }
    },
    [onSegmentClick, onSegmentShiftClick],
  );

  if (transcript.length === 0) {
    return (
      <div className="h-64 sm:h-96 flex items-center justify-center border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-400">No transcript segments available</p>
      </div>
    );
  }

  return (
    <div className="h-64 sm:h-96 overflow-y-auto border border-gray-200 rounded-lg">
      <ul className="divide-y divide-gray-100" role="list" aria-label="Transcript segments">
        {transcript.map((segment, index) => (
          <TranscriptSegmentItem
            key={segment.start}
            segment={segment}
            index={index}
            isActive={index === activeSegmentIndex}
            isInLoop={
              loopRange !== null &&
              index >= loopRange.startIndex &&
              index <= loopRange.endIndex
            }
            onClick={handleClick}
          />
        ))}
      </ul>
    </div>
  );
}
