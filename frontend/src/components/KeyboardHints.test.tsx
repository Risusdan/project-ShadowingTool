import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KeyboardHints from './KeyboardHints';

describe('KeyboardHints', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders expanded by default on first visit', () => {
    render(<KeyboardHints showRecording={false} />);
    expect(screen.getByText('Space')).toBeInTheDocument();
  });

  it('shows play/pause, prev, next shortcuts', () => {
    render(<KeyboardHints showRecording={false} />);
    expect(screen.getByText('Space')).toBeInTheDocument();
    expect(screen.getByText(/play\/pause/i)).toBeInTheDocument();
  });

  it('shows R shortcut when showRecording is true', () => {
    render(<KeyboardHints showRecording={true} />);
    expect(screen.getByText('R')).toBeInTheDocument();
    expect(screen.getByText(/record/i)).toBeInTheDocument();
  });

  it('hides R shortcut when showRecording is false', () => {
    render(<KeyboardHints showRecording={false} />);
    expect(screen.queryByText('R')).not.toBeInTheDocument();
  });

  it('collapses when toggle is clicked', async () => {
    const user = userEvent.setup();
    render(<KeyboardHints showRecording={false} />);

    await user.click(screen.getByRole('button', { name: /keyboard shortcuts/i }));
    expect(screen.queryByText('Space')).not.toBeInTheDocument();
  });

  it('expands when toggle is clicked again', async () => {
    const user = userEvent.setup();
    render(<KeyboardHints showRecording={false} />);

    // Collapse
    await user.click(screen.getByRole('button', { name: /keyboard shortcuts/i }));
    // Expand
    await user.click(screen.getByRole('button', { name: /keyboard shortcuts/i }));
    expect(screen.getByText('Space')).toBeInTheDocument();
  });

  it('starts collapsed on subsequent visits', () => {
    localStorage.setItem('shortcuts-seen', 'true');
    render(<KeyboardHints showRecording={false} />);
    expect(screen.queryByText('Space')).not.toBeInTheDocument();
  });

  it('sets localStorage after first render', () => {
    render(<KeyboardHints showRecording={false} />);
    expect(localStorage.getItem('shortcuts-seen')).toBe('true');
  });
});
