import { useState, useEffect } from 'react';

interface KeyboardHintsProps {
  showRecording: boolean;
}

const STORAGE_KEY = 'shortcuts-seen';

export default function KeyboardHints({ showRecording }: KeyboardHintsProps) {
  const [expanded, setExpanded] = useState(() => {
    return !localStorage.getItem(STORAGE_KEY);
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  return (
    <div className="text-xs text-gray-500">
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center gap-1 hover:text-gray-700 transition-colors"
        aria-label="Keyboard shortcuts"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.95 7.07l-.71-.71M4.05 4.93l-.71-.71" />
        </svg>
        Keyboard shortcuts
        <svg
          className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="flex flex-wrap gap-3 mt-1.5">
          <span>
            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[11px] font-mono">Space</kbd>{' '}
            Play/Pause
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[11px] font-mono">&larr;</kbd>{' '}
            Prev
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[11px] font-mono">&rarr;</kbd>{' '}
            Next
          </span>
          {showRecording && (
            <span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[11px] font-mono">R</kbd>{' '}
              Record
            </span>
          )}
        </div>
      )}
    </div>
  );
}
