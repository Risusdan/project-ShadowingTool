import { renderHook, act } from '@testing-library/react';
import { useAudioRecorder } from './useAudioRecorder';

// --- Mock MediaRecorder ---

let mockOnDataAvailable: ((e: { data: Blob }) => void) | null = null;
let mockOnStop: (() => void) | null = null;

const mockStop = vi.fn();
const mockStart = vi.fn();
const mockTrackStop = vi.fn();

class MockMediaRecorder {
  state = 'inactive';
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;

  constructor() {
    // capture handlers for test control
    setTimeout(() => {
      mockOnDataAvailable = this.ondataavailable;
      mockOnStop = this.onstop;
    }, 0);
  }

  start() {
    this.state = 'recording';
    mockStart();
    // re-capture in case handlers were set after construction
    mockOnDataAvailable = this.ondataavailable;
    mockOnStop = this.onstop;
  }

  stop() {
    this.state = 'inactive';
    mockStop();
    // Simulate async data + stop events
    if (this.ondataavailable) {
      this.ondataavailable({ data: new Blob(['audio'], { type: 'audio/webm' }) });
    }
    if (this.onstop) {
      this.onstop();
    }
  }

  static isTypeSupported(mimeType: string) {
    return mimeType === 'audio/webm;codecs=opus';
  }
}

vi.stubGlobal('MediaRecorder', MockMediaRecorder);

// --- Mock getUserMedia stream ---

function createMockStream() {
  return {
    getTracks: () => [{ stop: mockTrackStop }],
  } as unknown as MediaStream;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockOnDataAvailable = null;
  mockOnStop = null;
});

describe('useAudioRecorder', () => {
  it('returns idle initial state', () => {
    const { result } = renderHook(() => useAudioRecorder());

    expect(result.current.status).toBe('idle');
    expect(result.current.permission).toBe('prompt');
    expect(result.current.recording).toBeNull();
  });

  it('starts recording after permission grant', async () => {
    const stream = createMockStream();
    vi.mocked(navigator.mediaDevices.getUserMedia).mockResolvedValueOnce(stream);

    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(result.current.status).toBe('recording');
    expect(result.current.permission).toBe('granted');
    expect(mockStart).toHaveBeenCalled();
  });

  it('handles denial (NotAllowedError → permission=denied)', async () => {
    const err = new DOMException('Permission denied', 'NotAllowedError');
    vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValueOnce(err);

    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.permission).toBe('denied');
    expect(result.current.status).toBe('idle');
  });

  it('handles generic errors → permission=error', async () => {
    vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValueOnce(
      new Error('Device not found'),
    );

    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.permission).toBe('error');
    expect(result.current.status).toBe('idle');
  });

  it('produces blob on stop', async () => {
    const stream = createMockStream();
    vi.mocked(navigator.mediaDevices.getUserMedia).mockResolvedValueOnce(stream);

    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    act(() => {
      result.current.stopRecording();
    });

    expect(mockStop).toHaveBeenCalled();
    expect(result.current.status).toBe('stopped');
    expect(result.current.recording).not.toBeNull();
    expect(result.current.recording!.url).toBe('blob:mock-url');
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('releases mic tracks on stop', async () => {
    const stream = createMockStream();
    vi.mocked(navigator.mediaDevices.getUserMedia).mockResolvedValueOnce(stream);

    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    act(() => {
      result.current.stopRecording();
    });

    expect(mockTrackStop).toHaveBeenCalled();
  });

  it('clears recording and revokes URL', async () => {
    const stream = createMockStream();
    vi.mocked(navigator.mediaDevices.getUserMedia).mockResolvedValueOnce(stream);

    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    act(() => {
      result.current.stopRecording();
    });

    const url = result.current.recording!.url;

    act(() => {
      result.current.clearRecording();
    });

    expect(result.current.recording).toBeNull();
    expect(result.current.status).toBe('idle');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(url);
  });

  it('stopRecording is a no-op when not recording', () => {
    const { result } = renderHook(() => useAudioRecorder());

    act(() => {
      result.current.stopRecording();
    });

    expect(result.current.status).toBe('idle');
    expect(mockStop).not.toHaveBeenCalled();
  });
});
