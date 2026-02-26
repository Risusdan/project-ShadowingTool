import type { TranscriptSegment } from '../types';
import { findActiveSegmentIndex } from './transcript';

const segments: TranscriptSegment[] = [
  { start: 0, duration: 5, text: 'Hello' },
  { start: 5, duration: 4, text: 'World' },
  { start: 9, duration: 3, text: 'Foo' },
  { start: 12, duration: 6, text: 'Bar' },
];

describe('findActiveSegmentIndex', () => {
  it('returns -1 for an empty transcript', () => {
    expect(findActiveSegmentIndex([], 5)).toBe(-1);
  });

  it('returns -1 when currentTime is before the first segment', () => {
    expect(findActiveSegmentIndex(segments, -1)).toBe(-1);
  });

  it('returns 0 when currentTime equals the first segment start', () => {
    expect(findActiveSegmentIndex(segments, 0)).toBe(0);
  });

  it('returns the correct segment for a mid-segment time', () => {
    expect(findActiveSegmentIndex(segments, 2.5)).toBe(0);
    expect(findActiveSegmentIndex(segments, 7)).toBe(1);
    expect(findActiveSegmentIndex(segments, 10)).toBe(2);
  });

  it('returns the segment whose start equals currentTime exactly', () => {
    expect(findActiveSegmentIndex(segments, 5)).toBe(1);
    expect(findActiveSegmentIndex(segments, 9)).toBe(2);
    expect(findActiveSegmentIndex(segments, 12)).toBe(3);
  });

  it('returns the last segment when currentTime exceeds all starts', () => {
    expect(findActiveSegmentIndex(segments, 100)).toBe(3);
  });
});
