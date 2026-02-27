import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProgressTracker from './ProgressTracker';

describe('ProgressTracker', () => {
  const defaults = {
    currentRound: 12,
    loading: false,
    error: '',
    onCompleteRound: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders round counter', () => {
    render(<ProgressTracker {...defaults} />);
    expect(screen.getByText(/round 12 \/ 100/i)).toBeInTheDocument();
  });

  it('renders progress bar with correct width', () => {
    render(<ProgressTracker {...defaults} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '12');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders Complete Round button', () => {
    render(<ProgressTracker {...defaults} />);
    expect(screen.getByRole('button', { name: /complete round/i })).toBeInTheDocument();
  });

  it('calls onCompleteRound without notes when button is clicked', async () => {
    const user = userEvent.setup();
    render(<ProgressTracker {...defaults} />);

    await user.click(screen.getByRole('button', { name: /complete round/i }));
    expect(defaults.onCompleteRound).toHaveBeenCalledWith(undefined);
  });

  it('toggles notes textarea', async () => {
    const user = userEvent.setup();
    render(<ProgressTracker {...defaults} />);

    // Notes area should not be visible initially
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    // Click toggle to show notes
    await user.click(screen.getByRole('button', { name: /add notes/i }));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('passes notes on submit', async () => {
    const user = userEvent.setup();
    const onCompleteRound = vi.fn();
    render(<ProgressTracker {...defaults} onCompleteRound={onCompleteRound} />);

    await user.click(screen.getByRole('button', { name: /add notes/i }));
    await user.type(screen.getByRole('textbox'), 'My notes');
    await user.click(screen.getByRole('button', { name: /complete round/i }));

    expect(onCompleteRound).toHaveBeenCalledWith('My notes');
  });

  it('clears notes after submit', async () => {
    const user = userEvent.setup();
    render(<ProgressTracker {...defaults} />);

    await user.click(screen.getByRole('button', { name: /add notes/i }));
    await user.type(screen.getByRole('textbox'), 'My notes');
    await user.click(screen.getByRole('button', { name: /complete round/i }));

    // Notes should be cleared and collapsed
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<ProgressTracker {...defaults} loading={true} />);
    const btn = screen.getByRole('button', { name: /saving/i });
    expect(btn).toBeDisabled();
  });

  it('shows error message', () => {
    render(<ProgressTracker {...defaults} error="Something went wrong" />);
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('disables button during loading', () => {
    render(<ProgressTracker {...defaults} loading={true} />);
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
  });

  it('caps display at 100', () => {
    render(<ProgressTracker {...defaults} currentRound={100} />);
    expect(screen.getByText(/round 100 \/ 100/i)).toBeInTheDocument();
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '100');
  });
});
