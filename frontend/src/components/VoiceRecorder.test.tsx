import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VoiceRecorder from './VoiceRecorder';
import type { AudioRecording, RecordingStatus, MicPermission } from '../types';

const defaultProps = {
  status: 'idle' as RecordingStatus,
  permission: 'prompt' as MicPermission,
  recording: null as AudioRecording | null,
  disabled: false,
  onStartRecording: vi.fn(),
  onStopRecording: vi.fn(),
  onClearRecording: vi.fn(),
  onPlayOriginal: vi.fn(),
};

describe('VoiceRecorder', () => {
  it('renders record button in idle state', () => {
    render(<VoiceRecorder {...defaultProps} />);
    expect(screen.getByRole('button', { name: /record/i })).toBeInTheDocument();
  });

  it('calls onStartRecording when record button clicked', async () => {
    const user = userEvent.setup();
    const onStartRecording = vi.fn();
    render(<VoiceRecorder {...defaultProps} onStartRecording={onStartRecording} />);

    await user.click(screen.getByRole('button', { name: /record/i }));
    expect(onStartRecording).toHaveBeenCalled();
  });

  it('shows stop button when recording', () => {
    render(<VoiceRecorder {...defaultProps} status="recording" />);
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
  });

  it('shows recording indicator when recording', () => {
    render(<VoiceRecorder {...defaultProps} status="recording" />);
    expect(screen.getByText(/recording/i)).toBeInTheDocument();
  });

  it('calls onStopRecording when stop button clicked', async () => {
    const user = userEvent.setup();
    const onStopRecording = vi.fn();
    render(<VoiceRecorder {...defaultProps} status="recording" onStopRecording={onStopRecording} />);

    await user.click(screen.getByRole('button', { name: /stop/i }));
    expect(onStopRecording).toHaveBeenCalled();
  });

  it('shows playback controls after recording', () => {
    const recording: AudioRecording = {
      blob: new Blob(),
      url: 'blob:mock-url',
      duration: 3.5,
      createdAt: Date.now(),
    };
    render(<VoiceRecorder {...defaultProps} status="stopped" recording={recording} />);

    expect(screen.getByRole('button', { name: /play mine/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    expect(screen.getByText(/3\.5s/)).toBeInTheDocument();
  });

  it('shows Play Original button after recording', () => {
    const recording: AudioRecording = {
      blob: new Blob(),
      url: 'blob:mock-url',
      duration: 2.0,
      createdAt: Date.now(),
    };
    render(<VoiceRecorder {...defaultProps} status="stopped" recording={recording} />);

    expect(screen.getByRole('button', { name: /play original/i })).toBeInTheDocument();
  });

  it('calls onPlayOriginal when Play Original clicked', async () => {
    const user = userEvent.setup();
    const onPlayOriginal = vi.fn();
    const recording: AudioRecording = {
      blob: new Blob(),
      url: 'blob:mock-url',
      duration: 2.0,
      createdAt: Date.now(),
    };
    render(
      <VoiceRecorder
        {...defaultProps}
        status="stopped"
        recording={recording}
        onPlayOriginal={onPlayOriginal}
      />,
    );

    await user.click(screen.getByRole('button', { name: /play original/i }));
    expect(onPlayOriginal).toHaveBeenCalled();
  });

  it('calls onClearRecording when clear clicked', async () => {
    const user = userEvent.setup();
    const onClearRecording = vi.fn();
    const recording: AudioRecording = {
      blob: new Blob(),
      url: 'blob:mock-url',
      duration: 2.0,
      createdAt: Date.now(),
    };
    render(
      <VoiceRecorder
        {...defaultProps}
        status="stopped"
        recording={recording}
        onClearRecording={onClearRecording}
      />,
    );

    await user.click(screen.getByRole('button', { name: /clear/i }));
    expect(onClearRecording).toHaveBeenCalled();
  });

  it('shows permission denied message', () => {
    render(<VoiceRecorder {...defaultProps} permission="denied" />);
    expect(screen.getByText(/microphone access denied/i)).toBeInTheDocument();
  });

  it('disables record button when disabled prop is true', () => {
    render(<VoiceRecorder {...defaultProps} disabled={true} />);
    expect(screen.getByRole('button', { name: /record/i })).toBeDisabled();
  });
});
