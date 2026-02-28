import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { TranscriptSegment, LoopRange } from '../types';
import TranscriptPanel from './TranscriptPanel';

const transcript: TranscriptSegment[] = [
  { start: 0, duration: 5, text: 'Hello world' },
  { start: 5, duration: 4, text: 'Second line' },
  { start: 9, duration: 3, text: 'Third line' },
  { start: 12, duration: 6, text: 'Fourth line' },
];

const defaultProps = {
  transcript,
  onSegmentClick: vi.fn(),
  activeSegmentIndex: -1,
  loopRange: null as LoopRange | null,
  onSegmentShiftClick: vi.fn(),
};

describe('TranscriptPanel', () => {
  it('renders all transcript segments', () => {
    render(<TranscriptPanel {...defaultProps} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('Second line')).toBeInTheDocument();
    expect(screen.getByText('Third line')).toBeInTheDocument();
    expect(screen.getByText('Fourth line')).toBeInTheDocument();
  });

  it('calls onSegmentClick on regular click', async () => {
    const user = userEvent.setup();
    const onSegmentClick = vi.fn();
    render(<TranscriptPanel {...defaultProps} onSegmentClick={onSegmentClick} />);

    await user.click(screen.getByText('Second line'));
    expect(onSegmentClick).toHaveBeenCalledWith(5);
  });

  it('calls onSegmentShiftClick on shift+click', async () => {
    const user = userEvent.setup();
    const onSegmentShiftClick = vi.fn();
    render(
      <TranscriptPanel {...defaultProps} onSegmentShiftClick={onSegmentShiftClick} />,
    );

    await user.keyboard('{Shift>}');
    await user.click(screen.getByText('Third line'));
    await user.keyboard('{/Shift}');
    expect(onSegmentShiftClick).toHaveBeenCalledWith(2);
  });

  it('highlights the active segment', () => {
    render(<TranscriptPanel {...defaultProps} activeSegmentIndex={1} />);
    const activeItem = screen.getByText('Second line').closest('li');
    expect(activeItem?.className).toMatch(/bg-blue-100/);
    expect(activeItem?.className).toMatch(/border-blue-500/);
  });

  it('highlights loop range segments', () => {
    const loopRange: LoopRange = { startIndex: 1, endIndex: 2 };
    render(<TranscriptPanel {...defaultProps} loopRange={loopRange} />);

    const secondItem = screen.getByText('Second line').closest('li');
    const thirdItem = screen.getByText('Third line').closest('li');
    const firstItem = screen.getByText('Hello world').closest('li');

    expect(secondItem?.className).toMatch(/bg-green-50/);
    expect(thirdItem?.className).toMatch(/bg-green-50/);
    expect(firstItem?.className).not.toMatch(/bg-green-50/);
  });

  it('active segment style takes priority over loop range style', () => {
    const loopRange: LoopRange = { startIndex: 1, endIndex: 2 };
    render(
      <TranscriptPanel {...defaultProps} activeSegmentIndex={1} loopRange={loopRange} />,
    );

    const activeItem = screen.getByText('Second line').closest('li');
    expect(activeItem?.className).toMatch(/bg-blue-100/);
  });

  it('renders empty state when transcript is empty', () => {
    render(<TranscriptPanel {...defaultProps} transcript={[]} />);
    expect(screen.getByText('No transcript segments available')).toBeInTheDocument();
  });

  it('does not render list role when transcript is empty', () => {
    render(<TranscriptPanel {...defaultProps} transcript={[]} />);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  // --- Phase 3: Header hints ---

  it('renders "Click a segment to jump" hint', () => {
    render(<TranscriptPanel {...defaultProps} />);
    expect(screen.getByText(/click a segment to jump/i)).toBeInTheDocument();
  });

  it('renders loop selection tooltip with Shift+Click info', () => {
    render(<TranscriptPanel {...defaultProps} />);
    // The tooltip text is in the DOM (CSS-hidden until hover)
    expect(screen.getByText(/shift\+click to select loop range/i)).toBeInTheDocument();
  });

  it('does not render header hints in empty state', () => {
    render(<TranscriptPanel {...defaultProps} transcript={[]} />);
    expect(screen.queryByText(/click a segment to jump/i)).not.toBeInTheDocument();
  });
});
