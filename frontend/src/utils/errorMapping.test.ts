import { describe, it, expect } from 'vitest';
import { getErrorTitle, getErrorGuidance } from './errorMapping';
import type { AppError } from './errorMapping';

describe('getErrorTitle', () => {
  it('returns "Transcript unavailable" for TRANSCRIPT_UNAVAILABLE code', () => {
    const err: AppError = { message: 'Transcript is unavailable', code: 'TRANSCRIPT_UNAVAILABLE' };
    expect(getErrorTitle(err)).toBe('Transcript unavailable');
  });

  it('returns "Video unavailable" for VIDEO_UNAVAILABLE code', () => {
    const err: AppError = { message: 'Failed to fetch video data: ...', code: 'VIDEO_UNAVAILABLE' };
    expect(getErrorTitle(err)).toBe('Video unavailable');
  });

  it('returns "Invalid YouTube URL" for invalid URL messages', () => {
    const err: AppError = { message: 'Invalid YouTube URL' };
    expect(getErrorTitle(err)).toBe('Invalid YouTube URL');
  });

  it('returns "Request timed out" for timeout errors', () => {
    const err: AppError = { message: 'Request timed out' };
    expect(getErrorTitle(err)).toBe('Request timed out');
  });

  it('returns "Connection error" for network errors', () => {
    const err: AppError = { message: 'NetworkError when attempting to fetch resource.' };
    expect(getErrorTitle(err)).toBe('Connection error');
  });

  it('returns "Something went wrong" for unknown errors', () => {
    const err: AppError = { message: 'Some random error' };
    expect(getErrorTitle(err)).toBe('Something went wrong');
  });

  // REGRESSION: "Failed to fetch video data" must NOT trigger "Connection error"
  it('does NOT classify "Failed to fetch video data" as connection error', () => {
    const err: AppError = { message: 'Failed to fetch video data: some yt-dlp error' };
    expect(getErrorTitle(err)).not.toBe('Connection error');
  });
});

describe('getErrorGuidance', () => {
  it('returns transcript guidance for TRANSCRIPT_UNAVAILABLE code', () => {
    const err: AppError = { message: 'whatever', code: 'TRANSCRIPT_UNAVAILABLE' };
    expect(getErrorGuidance(err)).toContain('captions');
  });

  it('returns video guidance for VIDEO_UNAVAILABLE code', () => {
    const err: AppError = { message: 'whatever', code: 'VIDEO_UNAVAILABLE' };
    expect(getErrorGuidance(err)).toContain('private');
  });

  it('returns URL guidance for invalid URL', () => {
    const err: AppError = { message: 'Invalid YouTube URL' };
    expect(getErrorGuidance(err)).toContain('valid YouTube URL');
  });

  it('returns timeout guidance for timeout errors', () => {
    const err: AppError = { message: 'Request timed out' };
    expect(getErrorGuidance(err)).toContain('try again');
  });

  it('returns network guidance for ECONNREFUSED', () => {
    const err: AppError = { message: 'ECONNREFUSED' };
    expect(getErrorGuidance(err)).toContain('internet connection');
  });

  it('falls back to error message for unknown errors', () => {
    const err: AppError = { message: 'Something unexpected happened' };
    expect(getErrorGuidance(err)).toBe('Something unexpected happened');
  });
});
