import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { PlaybackSpeed } from '../types';
import PlaybackControls from './PlaybackControls';

const defaultProps = {
  playbackRate: 1.0 as PlaybackSpeed,
  onSpeedChange: vi.fn(),
  loopEnabled: false,
  onLoopToggle: vi.fn(),
  pauseAfterSegment: false,
  onPauseAfterSegmentToggle: vi.fn(),
};

describe('PlaybackControls', () => {
  it('renders all speed buttons', () => {
    render(<PlaybackControls {...defaultProps} />);
    expect(screen.getByRole('button', { name: '0.5x' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '0.75x' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1x' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1.25x' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1.5x' })).toBeInTheDocument();
  });

  it('highlights the active speed button', () => {
    render(<PlaybackControls {...defaultProps} playbackRate={0.75} />);
    const activeBtn = screen.getByRole('button', { name: '0.75x' });
    expect(activeBtn.className).toMatch(/bg-blue-600/);
  });

  it('calls onSpeedChange when a speed button is clicked', async () => {
    const user = userEvent.setup();
    const onSpeedChange = vi.fn();
    render(<PlaybackControls {...defaultProps} onSpeedChange={onSpeedChange} />);

    await user.click(screen.getByRole('button', { name: '0.5x' }));
    expect(onSpeedChange).toHaveBeenCalledWith(0.5);
  });

  it('renders loop toggle and calls onLoopToggle', async () => {
    const user = userEvent.setup();
    const onLoopToggle = vi.fn();
    render(<PlaybackControls {...defaultProps} onLoopToggle={onLoopToggle} />);

    const loopBtn = screen.getByRole('button', { name: /loop/i });
    await user.click(loopBtn);
    expect(onLoopToggle).toHaveBeenCalled();
  });

  it('shows loop as active when loopEnabled is true', () => {
    render(<PlaybackControls {...defaultProps} loopEnabled={true} />);
    const loopBtn = screen.getByRole('button', { name: /loop/i });
    expect(loopBtn.className).toMatch(/bg-green-600/);
  });

  it('renders pause-after-segment toggle and calls handler', async () => {
    const user = userEvent.setup();
    const onPauseAfterSegmentToggle = vi.fn();
    render(
      <PlaybackControls
        {...defaultProps}
        onPauseAfterSegmentToggle={onPauseAfterSegmentToggle}
      />,
    );

    const pauseBtn = screen.getByRole('button', { name: /pause after/i });
    await user.click(pauseBtn);
    expect(onPauseAfterSegmentToggle).toHaveBeenCalled();
  });

  it('shows pause-after-segment as active when enabled', () => {
    render(<PlaybackControls {...defaultProps} pauseAfterSegment={true} />);
    const pauseBtn = screen.getByRole('button', { name: /pause after/i });
    expect(pauseBtn.className).toMatch(/bg-amber-600/);
  });
});
