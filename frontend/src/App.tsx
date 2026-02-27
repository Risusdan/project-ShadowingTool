import { useState, useEffect, useRef, useCallback } from 'react';
import type { YouTubePlayer } from 'react-youtube';
import type { Video, LoopRange, ShadowingStep } from './types';
import { fetchVideo } from './api/client';
import { usePlayerSync } from './hooks/usePlayerSync';
import { usePlaybackControls } from './hooks/usePlaybackControls';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { useProgress } from './hooks/useProgress';
import VideoPlayer from './components/VideoPlayer';
import PlaybackControls from './components/PlaybackControls';
import TranscriptPanel from './components/TranscriptPanel';
import StepGuide from './components/StepGuide';
import ProgressTracker from './components/ProgressTracker';
import VoiceRecorder from './components/VoiceRecorder';

function App() {
  const [url, setUrl] = useState('');
  const [video, setVideo] = useState<Video | null>(null);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 100LS step state (default: step 3 — matches existing transcript view)
  const [currentStep, setCurrentStep] = useState<ShadowingStep>(3);

  // Playback control state
  const [loopRange, setLoopRange] = useState<LoopRange | null>(null);
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [pauseAfterSegment, setPauseAfterSegment] = useState(false);
  const [pausedBanner, setPausedBanner] = useState(false);

  const transcript = video?.transcript ?? [];
  const { activeSegmentIndex, isPlaying } = usePlayerSync(player, transcript);
  const { playbackRate, setSpeed, seekTo, play, pause } = usePlaybackControls(player);
  const recorder = useAudioRecorder();
  const progress = useProgress(video?.video_id ?? null);

  // Derive visibility flags from current step
  const showTranscript = currentStep === 2 || currentStep === 3 || currentStep === 4;
  const enableRecording = currentStep === 4 || currentStep === 5;
  const showControls = currentStep !== 1;

  // Track previous segment for pause-after-segment detection
  const prevSegmentRef = useRef(activeSegmentIndex);

  // Shift+click state for loop range selection
  const shiftClickCountRef = useRef(0);
  const loopStartRef = useRef(0);

  const handleCompleteRound = useCallback(
    (notes?: string) => {
      progress.completeRound(currentStep, notes);
    },
    [progress, currentStep],
  );

  const handleStepChange = useCallback((step: ShadowingStep) => {
    setCurrentStep(step);

    // Auto-configure: Step 4 enables pause-after-segment
    if (step === 4) {
      setPauseAfterSegment(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await fetchVideo(url);
      setVideo(data);
      // Reset playback state for new video
      setLoopRange(null);
      setLoopEnabled(false);
      setPauseAfterSegment(false);
      setPausedBanner(false);
      recorder.clearRecording();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSegmentClick = (startTime: number) => {
    seekTo(startTime);
    play();
    setPausedBanner(false);
  };

  const handleSegmentShiftClick = useCallback(
    (index: number) => {
      const clickNum = shiftClickCountRef.current;
      if (clickNum === 0) {
        loopStartRef.current = index;
        shiftClickCountRef.current = 1;
        setLoopRange({ startIndex: index, endIndex: index });
      } else if (clickNum === 1) {
        const start = Math.min(loopStartRef.current, index);
        const end = Math.max(loopStartRef.current, index);
        setLoopRange({ startIndex: start, endIndex: end });
        setLoopEnabled(true);
        shiftClickCountRef.current = 2;
      } else {
        setLoopRange(null);
        setLoopEnabled(false);
        shiftClickCountRef.current = 0;
      }
    },
    [],
  );

  // "Play Original": seek to the active segment's start and play
  const handlePlayOriginal = useCallback(() => {
    if (activeSegmentIndex >= 0 && transcript[activeSegmentIndex]) {
      seekTo(transcript[activeSegmentIndex].start);
      play();
    }
  }, [activeSegmentIndex, transcript, seekTo, play]);

  // Loop: when active segment exceeds loop end, seek back to start
  useEffect(() => {
    if (!loopEnabled || !loopRange || activeSegmentIndex < 0) return;
    if (activeSegmentIndex > loopRange.endIndex) {
      const startTime = transcript[loopRange.startIndex]?.start;
      if (startTime !== undefined) {
        seekTo(startTime);
      }
    }
  }, [activeSegmentIndex, loopEnabled, loopRange, transcript, seekTo]);

  // Pause-after-segment: when segment advances naturally by 1, pause
  // Loop takes priority — don't pause if loop is enabled
  useEffect(() => {
    const prev = prevSegmentRef.current;
    prevSegmentRef.current = activeSegmentIndex;

    if (!pauseAfterSegment || loopEnabled || !isPlaying) return;
    if (activeSegmentIndex >= 0 && activeSegmentIndex === prev + 1) {
      pause();
      setPausedBanner(true);
    }
  }, [activeSegmentIndex, pauseAfterSegment, loopEnabled, isPlaying, pause]);

  // Clear paused banner when playback resumes
  useEffect(() => {
    if (isPlaying) {
      setPausedBanner(false);
    }
  }, [isPlaying]);

  // Keyboard shortcut: Space to play/pause (when no input focused)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') return;
      e.preventDefault();
      if (isPlaying) {
        pause();
      } else {
        play();
        setPausedBanner(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, play, pause]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          100LS Shadowing Tool
        </h1>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a YouTube URL..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Load'}
          </button>
        </form>

        {error && (
          <p className="text-red-600 text-sm mb-4">{error}</p>
        )}

        {video && (
          <div className="space-y-4">
            <StepGuide currentStep={currentStep} onStepChange={handleStepChange} />

            <ProgressTracker
              currentRound={progress.currentRound}
              loading={progress.loading}
              error={progress.error}
              onCompleteRound={handleCompleteRound}
            />

            <h2 className="text-lg font-semibold text-gray-800">{video.title}</h2>

            <VideoPlayer
              videoId={video.video_id}
              onReady={setPlayer}
            />

            {showControls && (
              <PlaybackControls
                playbackRate={playbackRate}
                onSpeedChange={setSpeed}
                loopEnabled={loopEnabled}
                onLoopToggle={() => setLoopEnabled((prev) => !prev)}
                pauseAfterSegment={pauseAfterSegment}
                onPauseAfterSegmentToggle={() => setPauseAfterSegment((prev) => !prev)}
              />
            )}

            {pausedBanner && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-2 rounded-lg">
                Paused — press Space to continue
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-3 rounded-lg">
                Translation not available yet. Use an external dictionary or translation tool while reviewing the transcript below.
              </div>
            )}

            {showTranscript && (
              <TranscriptPanel
                transcript={transcript}
                onSegmentClick={handleSegmentClick}
                activeSegmentIndex={activeSegmentIndex}
                loopRange={loopRange}
                onSegmentShiftClick={handleSegmentShiftClick}
              />
            )}

            {enableRecording && (
              <VoiceRecorder
                status={recorder.status}
                permission={recorder.permission}
                recording={recorder.recording}
                disabled={false}
                onStartRecording={recorder.startRecording}
                onStopRecording={recorder.stopRecording}
                onClearRecording={recorder.clearRecording}
                onPlayOriginal={handlePlayOriginal}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
