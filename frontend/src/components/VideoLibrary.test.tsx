import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VideoLibrary from './VideoLibrary';
import type { LibraryVideo } from '../types';

const sampleVideos: LibraryVideo[] = [
  {
    video_id: 'abc123',
    title: 'English Pronunciation',
    duration: 720,
    thumbnail: 'https://img.youtube.com/abc123.jpg',
    last_practiced: '2025-06-15T10:30:00',
    current_round: 12,
  },
  {
    video_id: 'xyz789',
    title: 'Daily Conversation',
    duration: 300,
    thumbnail: 'https://img.youtube.com/xyz789.jpg',
    last_practiced: null,
    current_round: 0,
  },
];

const defaults = {
  videos: sampleVideos,
  loading: false,
  error: '',
  onSelectVideo: vi.fn(),
  onRemoveVideo: vi.fn(),
  onRetry: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('VideoLibrary', () => {
  it('renders video titles', () => {
    render(<VideoLibrary {...defaults} />);
    expect(screen.getByText('English Pronunciation')).toBeInTheDocument();
    expect(screen.getByText('Daily Conversation')).toBeInTheDocument();
  });

  it('renders thumbnails', () => {
    render(<VideoLibrary {...defaults} />);
    const images = screen.getAllByRole('img');
    expect(images[0]).toHaveAttribute('src', 'https://img.youtube.com/abc123.jpg');
    expect(images[1]).toHaveAttribute('src', 'https://img.youtube.com/xyz789.jpg');
  });

  it('renders round counts', () => {
    render(<VideoLibrary {...defaults} />);
    expect(screen.getByText(/round 12/i)).toBeInTheDocument();
    expect(screen.getByText(/round 0/i)).toBeInTheDocument();
  });

  it('renders formatted duration', () => {
    render(<VideoLibrary {...defaults} />);
    expect(screen.getByText('12:00')).toBeInTheDocument();
    expect(screen.getByText('5:00')).toBeInTheDocument();
  });

  it('renders last practiced dates', () => {
    render(<VideoLibrary {...defaults} />);
    // The first video has a last_practiced date
    expect(screen.getByText(/6\/15\/2025/)).toBeInTheDocument();
    // The second video has never been practiced
    expect(screen.getByText(/never/i)).toBeInTheDocument();
  });

  it('calls onSelectVideo on card click', async () => {
    const user = userEvent.setup();
    render(<VideoLibrary {...defaults} />);

    await user.click(screen.getByText('English Pronunciation'));
    expect(defaults.onSelectVideo).toHaveBeenCalledWith('abc123');
  });

  it('calls onRemoveVideo on remove click without propagating to select', async () => {
    const user = userEvent.setup();
    render(<VideoLibrary {...defaults} />);

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await user.click(removeButtons[0]);

    expect(defaults.onRemoveVideo).toHaveBeenCalledWith('abc123');
    expect(defaults.onSelectVideo).not.toHaveBeenCalled();
  });

  it('shows loading state with spinner', () => {
    render(<VideoLibrary {...defaults} loading={true} videos={[]} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/loading library/i)).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(<VideoLibrary {...defaults} error="Network error" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/network error/i)).toBeInTheDocument();
  });

  it('calls onRetry when Try again is clicked', async () => {
    const user = userEvent.setup();
    render(<VideoLibrary {...defaults} error="Network error" />);

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(defaults.onRetry).toHaveBeenCalled();
  });

  it('shows empty state', () => {
    render(<VideoLibrary {...defaults} videos={[]} />);
    expect(screen.getByText(/no videos/i)).toBeInTheDocument();
  });
});
