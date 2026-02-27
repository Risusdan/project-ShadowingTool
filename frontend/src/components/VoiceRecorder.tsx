import { useRef, useCallback } from 'react';
import type { RecordingStatus, MicPermission, AudioRecording } from '../types';

interface VoiceRecorderProps {
  status: RecordingStatus;
  permission: MicPermission;
  recording: AudioRecording | null;
  disabled: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onClearRecording: () => void;
  onPlayOriginal: () => void;
}

export default function VoiceRecorder({
  status,
  permission,
  recording,
  disabled,
  onStartRecording,
  onStopRecording,
  onClearRecording,
  onPlayOriginal,
}: VoiceRecorderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayMine = useCallback(() => {
    if (!recording) return;
    // Stop any existing playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(recording.url);
    audioRef.current = audio;
    audio.play();
  }, [recording]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-3">
        {status === 'recording' ? (
          <>
            <button
              onClick={onStopRecording}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              Stop
            </button>
            <span className="flex items-center gap-2 text-red-600 text-sm font-medium">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              Recording...
            </span>
          </>
        ) : (
          <button
            onClick={onStartRecording}
            disabled={disabled}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 bg-white rounded-full" />
            Record
          </button>
        )}

        {status === 'requesting' && (
          <span className="text-sm text-gray-500">Requesting mic access...</span>
        )}
      </div>

      {permission === 'denied' && (
        <p className="text-sm text-red-600">
          Microphone access denied. Please allow microphone access in your browser settings.
        </p>
      )}

      {permission === 'error' && (
        <p className="text-sm text-red-600">
          Failed to access microphone. Please check your device settings.
        </p>
      )}

      {recording && status === 'stopped' && (
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onPlayOriginal}
            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium"
          >
            Play Original
          </button>
          <button
            onClick={handlePlayMine}
            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm font-medium"
          >
            Play Mine
          </button>
          <span className="text-sm text-gray-500">{recording.duration.toFixed(1)}s</span>
          <button
            onClick={onClearRecording}
            className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 text-sm"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
