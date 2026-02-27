import { useState } from 'react';

interface ProgressTrackerProps {
  currentRound: number;
  loading: boolean;
  error: string;
  onCompleteRound: (notes?: string) => void;
}

export default function ProgressTracker({
  currentRound,
  loading,
  error,
  onCompleteRound,
}: ProgressTrackerProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  const percentage = Math.min(currentRound, 100);

  const handleComplete = () => {
    const trimmed = notes.trim();
    onCompleteRound(trimmed || undefined);
    setNotes('');
    setShowNotes(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Round {currentRound} / 100
        </span>
        <span className="text-xs text-gray-500">{percentage}%</span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        className="w-full bg-gray-200 rounded-full h-2.5"
      >
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={handleComplete}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Complete Round'}
        </button>

        {!showNotes && (
          <button
            onClick={() => setShowNotes(true)}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Add notes
          </button>
        )}
      </div>

      {showNotes && (
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes for this round..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
      )}
    </div>
  );
}
