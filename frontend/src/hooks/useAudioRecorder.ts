import { useState, useRef, useCallback } from 'react';
import type { RecordingStatus, MicPermission, AudioRecording } from '../types';

/** Probe for a supported MIME type at runtime. */
function detectMimeType(): string | undefined {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t));
}

export interface UseAudioRecorderReturn {
  status: RecordingStatus;
  permission: MicPermission;
  recording: AudioRecording | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearRecording: () => void;
}

/**
 * Wraps the MediaRecorder API into a clean React hook.
 * Stores recorder/stream/chunks in refs to avoid unnecessary re-renders.
 */
export function useAudioRecorder(): UseAudioRecorderReturn {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [permission, setPermission] = useState<MicPermission>('prompt');
  const [recording, setRecording] = useState<AudioRecording | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    setStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermission('granted');

      const mimeType = detectMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType ?? 'audio/webm',
        });
        const url = URL.createObjectURL(blob);
        const duration = (Date.now() - startTimeRef.current) / 1000;

        setRecording({ blob, url, duration, createdAt: Date.now() });
        setStatus('stopped');
      };

      recorderRef.current = recorder;
      startTimeRef.current = Date.now();
      recorder.start();
      setStatus('recording');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setPermission('denied');
      } else {
        setPermission('error');
      }
      setStatus('idle');
    }
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== 'recording') return;

    recorder.stop();

    // Release mic tracks
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
  }, []);

  const clearRecording = useCallback(() => {
    if (recording) {
      URL.revokeObjectURL(recording.url);
    }
    setRecording(null);
    setStatus('idle');
  }, [recording]);

  return { status, permission, recording, startRecording, stopRecording, clearRecording };
}
