import { useState, useEffect, useRef, useCallback } from 'react';
import type { YouTubePlayer } from 'react-youtube';
import type { Video, LoopRange, ShadowingStep } from './types';
import { fetchVideo, fetchVideoById } from './api/client';
import { usePlayerSync } from './hooks/usePlayerSync';
import { usePlaybackControls } from './hooks/usePlaybackControls';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { useProgress } from './hooks/useProgress';
import { useLibrary } from './hooks/useLibrary';
import { getErrorTitle, getErrorGuidance } from './utils/errorMapping';
import type { AppError } from './utils/errorMapping';
import { shouldPauseAfterSegment } from './utils/playback';
import VideoPlayer from './components/VideoPlayer';
import PlaybackControls from './components/PlaybackControls';
import TranscriptPanel from './components/TranscriptPanel';
import StepGuide from './components/StepGuide';
import ProgressTracker from './components/ProgressTracker';
import VoiceRecorder from './components/VoiceRecorder';
import VideoLibrary from './components/VideoLibrary';
import Spinner from './components/Spinner';

type View = 'library' | 'player';

function App() {
  const [view, setView] = useState<View>('library');
  const [url, setUrl] = useState('');
  const [video, setVideo] = useState<Video | null>(null);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  // 100LS step state
  const [currentStep, setCurrentStep] = useState<ShadowingStep>(1);

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
  const library = useLibrary();

  // Derive visibility flags from current step
  const showTranscript = currentStep === 2 || currentStep === 3 || currentStep === 4;
  const enableRecording = currentStep === 4 || currentStep === 5;
  const showControls = currentStep !== 1;

  // Track previous segment for pause-after-segment detection
  const prevSegmentRef = useRef(activeSegmentIndex);

  // Shift+click state for loop range selection
  const shiftClickCountRef = useRef(0);
  const loopStartRef = useRef(0);

  const resetPlayerState = useCallback(() => {
    setLoopRange(null);
    setLoopEnabled(false);
    setPauseAfterSegment(false);
    setPausedBanner(false);
    recorder.clearRecording();
  }, [recorder]);

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
    setError(null);
    setLoading(true);

    try {
      const data = await fetchVideo(url);
      setVideo(data);
      resetPlayerState();
      setView('player');
    } catch (err: any) {
      setError({
        message: err instanceof Error ? err.message : 'Something went wrong',
        code: err?.code,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVideo = useCallback(async (videoId: string) => {
    setError(null);
    setLoading(true);

    try {
      const data = await fetchVideoById(videoId);
      setVideo(data);
      setLoopRange(null);
      setLoopEnabled(false);
      setPauseAfterSegment(false);
      setPausedBanner(false);
      setView('player');
    } catch (err: any) {
      setError({
        message: err instanceof Error ? err.message : 'Something went wrong',
        code: err?.code,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRemoveVideo = useCallback(async (videoId: string) => {
    await library.removeVideo(videoId);
    // If the currently loaded video was removed, clear it
    if (video?.video_id === videoId) {
      setVideo(null);
      setPlayer(null);
    }
  }, [library, video]);

  const handleBackToLibrary = useCallback(() => {
    setVideo(null);
    setPlayer(null);
    setView('library');
    library.refresh();
  }, [library]);

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

  // Pause-after-segment: when segment advances forward, pause
  // Loop takes priority — don't pause if loop is enabled
  useEffect(() => {
    const prev = prevSegmentRef.current;
    prevSegmentRef.current = activeSegmentIndex;

    if (shouldPauseAfterSegment(activeSegmentIndex, prev, pauseAfterSegment, loopEnabled, isPlaying)) {
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

  // Keyboard shortcuts: Space play/pause, Arrow keys prev/next, R record
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      switch (e.code) {
        case 'Space':
          if (tag === 'BUTTON') return;
          e.preventDefault();
          if (isPlaying) {
            pause();
          } else {
            play();
            setPausedBanner(false);
          }
          break;
        case 'ArrowRight': {
          e.preventDefault();
          const nextIndex = activeSegmentIndex + 1;
          if (nextIndex < transcript.length) {
            seekTo(transcript[nextIndex].start);
            play();
            setPausedBanner(false);
          }
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          const prevIndex = activeSegmentIndex - 1;
          if (prevIndex >= 0) {
            seekTo(transcript[prevIndex].start);
            play();
            setPausedBanner(false);
          }
          break;
        }
        case 'KeyR':
          if (tag === 'BUTTON') return;
          if (!enableRecording) return;
          e.preventDefault();
          if (recorder.status === 'recording') {
            recorder.stopRecording();
          } else {
            recorder.startRecording();
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, play, pause, activeSegmentIndex, transcript, seekTo, enableRecording, recorder]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          100LS Shadowing Tool
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-6">
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
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? <Spinner size="sm" label="Loading..." /> : 'Load'}
          </button>
        </form>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-red-700 text-sm font-medium">{getErrorTitle(error)}</p>
                <p className="text-red-600 text-sm mt-1">{getErrorGuidance(error)}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
                aria-label="Dismiss error"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {view === 'library' && (
          <VideoLibrary
            videos={library.videos}
            loading={library.loading}
            error={library.error}
            onSelectVideo={handleSelectVideo}
            onRemoveVideo={handleRemoveVideo}
            onRetry={library.refresh}
          />
        )}

        {view === 'player' && video && (
          <div className="space-y-4">
            <button
              onClick={handleBackToLibrary}
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Library
            </button>

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

            <p className="text-xs text-gray-400">
              Shortcuts: Space play/pause &middot; &larr;&rarr; prev/next &middot; R record
            </p>

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
