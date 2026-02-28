import { useState, useEffect, useRef } from 'react';
import type { ShadowingStep } from '../types';
import { STEP_LABELS } from '../types';
import Spinner from './Spinner';

interface ProgressTrackerProps {
  currentRound: number;
  loading: boolean;
  error: string;
  onCompleteRound: (notes?: string) => void;
  currentStep?: ShadowingStep;
  onAdvanceStep?: (step: ShadowingStep) => void;
}

export default function ProgressTracker({
  currentRound,
  loading,
  error,
  onCompleteRound,
  currentStep = 1,
  onAdvanceStep,
}: ProgressTrackerProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [showCompletionPrompt, setShowCompletionPrompt] = useState(false);
  const waitingForCompleteRef = useRef(false);
  const prevRoundRef = useRef(currentRound);

  const percentage = Math.min(currentRound, 100);

  // Detect successful round completion (round incremented after clicking Complete)
  useEffect(() => {
    if (waitingForCompleteRef.current && currentRound > prevRoundRef.current) {
      setShowCompletionPrompt(true);
      waitingForCompleteRef.current = false;
    }
    prevRoundRef.current = currentRound;
  }, [currentRound]);

  const handleComplete = () => {
    const trimmed = notes.trim();
    waitingForCompleteRef.current = true;
    onCompleteRound(trimmed || undefined);
    setNotes('');
    setShowNotes(false);
  };

  const nextStep = (currentStep + 1) as ShadowingStep;

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
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">{error}</p>
      )}

      {showCompletionPrompt ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-green-800">
            Round completed!
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCompletionPrompt(false)}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Continue practicing
            </button>
            {currentStep < 5 && onAdvanceStep && (
              <button
                onClick={() => {
                  onAdvanceStep(nextStep);
                  setShowCompletionPrompt(false);
                }}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Advance to Step {nextStep}: {STEP_LABELS[nextStep]}
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <button
              onClick={handleComplete}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? <Spinner size="sm" label="Saving..." /> : 'Complete Round'}
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
        </>
      )}
    </div>
  );
}
