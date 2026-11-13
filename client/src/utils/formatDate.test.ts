import { describe, it, expect } from 'vitest';
import { formatTime, formatDate, formatRelativeTime, isSameDay } from '../utils/formatDate';

describe('formatTime', () => {
  it('should format time correctly', () => {
    const result = formatTime('2024-01-15T14:30:00Z');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
});

describe('formatDate', () => {
  it('should return "Today" for today', () => {
    const now = new Date().toISOString();
    expect(formatDate(now)).toBe('Today');
  });
});

describe('formatRelativeTime', () => {
  it('should return "Just now" for recent times', () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe('Just now');
  });
});

describe('isSameDay', () => {
  it('should return true for same day', () => {
    const d1 = new Date(2024, 5, 15, 10, 0, 0); // June 15 10am local
    const d2 = new Date(2024, 5, 15, 14, 0, 0); // June 15 2pm local
    expect(isSameDay(d1.toISOString(), d2.toISOString())).toBe(true);
  });

  it('should return false for different days', () => {
    expect(isSameDay('2024-01-15T10:00:00Z', '2024-01-16T10:00:00Z')).toBe(false);
  });
});
