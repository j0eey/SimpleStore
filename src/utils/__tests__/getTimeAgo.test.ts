import { getTimeAgo } from '../getTimeAgo';

describe('getTimeAgo', () => {
  beforeEach(() => {
    // Use Jest's fake timers to control time
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Years ago', () => {
    it('should return "1 year ago" for exactly 1 year ago', () => {
      const oneYearAgo = new Date('2023-01-15T12:00:00Z').toISOString();
      expect(getTimeAgo(oneYearAgo)).toBe('1 year ago');
    });

    it('should return "2 years ago" for exactly 2 years ago', () => {
      const twoYearsAgo = new Date('2022-01-15T12:00:00Z').toISOString();
      expect(getTimeAgo(twoYearsAgo)).toBe('2 years ago');
    });

    it('should return "5 years ago" for 5 years ago', () => {
      const fiveYearsAgo = new Date('2019-01-15T12:00:00Z').toISOString();
      expect(getTimeAgo(fiveYearsAgo)).toBe('5 years ago');
    });

    it('should handle singular vs plural years correctly', () => {
      const testCases = [
        { date: '2023-01-15T12:00:00Z', expected: '1 year ago' },
        { date: '2022-01-15T12:00:00Z', expected: '2 years ago' },
        { date: '2020-01-15T12:00:00Z', expected: '4 years ago' },
      ];

      testCases.forEach(({ date, expected }) => {
        expect(getTimeAgo(date)).toBe(expected);
      });
    });
  });

  describe('Months ago', () => {
    it('should return "1 month ago" for exactly 1 month ago', () => {
      const oneMonthAgo = new Date('2023-12-15T12:00:00Z').toISOString();
      expect(getTimeAgo(oneMonthAgo)).toBe('1 month ago');
    });

    it('should return "6 months ago" for 6 months ago', () => {
      const sixMonthsAgo = new Date('2023-07-15T12:00:00Z').toISOString();
      expect(getTimeAgo(sixMonthsAgo)).toBe('6 months ago');
    });

    it('should return "11 months ago" for 11 months ago', () => {
      const elevenMonthsAgo = new Date('2023-02-15T12:00:00Z').toISOString();
      expect(getTimeAgo(elevenMonthsAgo)).toBe('11 months ago');
    });

    it('should handle singular vs plural months correctly', () => {
      const testCases = [
        { date: '2023-12-15T12:00:00Z', expected: '1 month ago' },
        { date: '2023-11-15T12:00:00Z', expected: '2 months ago' },
        { date: '2023-10-15T12:00:00Z', expected: '3 months ago' },
      ];

      testCases.forEach(({ date, expected }) => {
        expect(getTimeAgo(date)).toBe(expected);
      });
    });
  });

  describe('Days ago', () => {
    it('should return "1 day ago" for exactly 1 day ago', () => {
      const oneDayAgo = new Date('2024-01-14T12:00:00Z').toISOString();
      expect(getTimeAgo(oneDayAgo)).toBe('1 day ago');
    });

    it('should return "7 days ago" for 1 week ago', () => {
      const oneWeekAgo = new Date('2024-01-08T12:00:00Z').toISOString();
      expect(getTimeAgo(oneWeekAgo)).toBe('7 days ago');
    });

    it('should return "15 days ago" for 15 days ago', () => {
      const fifteenDaysAgo = new Date('2023-12-31T12:00:00Z').toISOString();
      expect(getTimeAgo(fifteenDaysAgo)).toBe('15 days ago');
    });

    it('should handle singular vs plural days correctly', () => {
      const testCases = [
        { date: '2024-01-14T12:00:00Z', expected: '1 day ago' },
        { date: '2024-01-13T12:00:00Z', expected: '2 days ago' },
        { date: '2024-01-10T12:00:00Z', expected: '5 days ago' },
      ];

      testCases.forEach(({ date, expected }) => {
        expect(getTimeAgo(date)).toBe(expected);
      });
    });
  });

  describe('Hours ago', () => {
    it('should return "1 hour ago" for exactly 1 hour ago', () => {
      const oneHourAgo = new Date('2024-01-15T11:00:00Z').toISOString();
      expect(getTimeAgo(oneHourAgo)).toBe('1 hour ago');
    });

    it('should return "12 hours ago" for 12 hours ago', () => {
      const twelveHoursAgo = new Date('2024-01-15T00:00:00Z').toISOString();
      expect(getTimeAgo(twelveHoursAgo)).toBe('12 hours ago');
    });

    it('should return "23 hours ago" for 23 hours ago', () => {
      const twentyThreeHoursAgo = new Date('2024-01-14T13:00:00Z').toISOString();
      expect(getTimeAgo(twentyThreeHoursAgo)).toBe('23 hours ago');
    });

    it('should handle singular vs plural hours correctly', () => {
      const testCases = [
        { date: '2024-01-15T11:00:00Z', expected: '1 hour ago' },
        { date: '2024-01-15T10:00:00Z', expected: '2 hours ago' },
        { date: '2024-01-15T06:00:00Z', expected: '6 hours ago' },
      ];

      testCases.forEach(({ date, expected }) => {
        expect(getTimeAgo(date)).toBe(expected);
      });
    });
  });

  describe('Minutes ago', () => {
    it('should return "1 minute ago" for exactly 1 minute ago', () => {
      const oneMinuteAgo = new Date('2024-01-15T11:59:00Z').toISOString();
      expect(getTimeAgo(oneMinuteAgo)).toBe('1 minute ago');
    });

    it('should return "30 minutes ago" for 30 minutes ago', () => {
      const thirtyMinutesAgo = new Date('2024-01-15T11:30:00Z').toISOString();
      expect(getTimeAgo(thirtyMinutesAgo)).toBe('30 minutes ago');
    });

    it('should return "59 minutes ago" for 59 minutes ago', () => {
      const fiftyNineMinutesAgo = new Date('2024-01-15T11:01:00Z').toISOString();
      expect(getTimeAgo(fiftyNineMinutesAgo)).toBe('59 minutes ago');
    });

    it('should handle singular vs plural minutes correctly', () => {
      const testCases = [
        { date: '2024-01-15T11:59:00Z', expected: '1 minute ago' },
        { date: '2024-01-15T11:58:00Z', expected: '2 minutes ago' },
        { date: '2024-01-15T11:45:00Z', expected: '15 minutes ago' },
      ];

      testCases.forEach(({ date, expected }) => {
        expect(getTimeAgo(date)).toBe(expected);
      });
    });
  });

  describe('Just now', () => {
    it('should return "just now" for current time', () => {
      const now = new Date('2024-01-15T12:00:00Z').toISOString();
      expect(getTimeAgo(now)).toBe('just now');
    });

    it('should return "just now" for 30 seconds ago', () => {
      const thirtySecondsAgo = new Date('2024-01-15T11:59:30Z').toISOString();
      expect(getTimeAgo(thirtySecondsAgo)).toBe('just now');
    });

    it('should return "just now" for 59 seconds ago', () => {
      const fiftyNineSecondsAgo = new Date('2024-01-15T11:59:01Z').toISOString();
      expect(getTimeAgo(fiftyNineSecondsAgo)).toBe('just now');
    });

    it('should return "just now" for any time less than 1 minute', () => {
      const testCases = [
        '2024-01-15T11:59:59Z', // 1 second ago
        '2024-01-15T11:59:45Z', // 15 seconds ago
        '2024-01-15T11:59:30Z', // 30 seconds ago
        '2024-01-15T11:59:01Z', // 59 seconds ago
      ];

      testCases.forEach(date => {
        expect(getTimeAgo(date)).toBe('just now');
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle future dates by returning "just now"', () => {
      const futureDate = new Date('2024-01-16T12:00:00Z').toISOString();
      expect(getTimeAgo(futureDate)).toBe('just now');
    });

    it('should handle very old dates correctly', () => {
      const veryOldDate = new Date('1990-01-15T12:00:00Z').toISOString();
      expect(getTimeAgo(veryOldDate)).toBe('34 years ago');
    });

    it('should handle leap years correctly', () => {
      // Test date from leap year
      const leapYearDate = new Date('2020-02-29T12:00:00Z').toISOString();
      expect(getTimeAgo(leapYearDate)).toBe('3 years ago');
    });

    it('should handle different date string formats', () => {
      // Test various ISO string formats
      const testCases = [
        '2024-01-14T12:00:00Z',
        '2024-01-14T12:00:00.000Z',
        '2024-01-14T12:00:00+00:00',
      ];

      testCases.forEach(date => {
        expect(getTimeAgo(date)).toBe('1 day ago');
      });
    });

    it('should handle invalid date strings gracefully', () => {
      const invalidDates = [
        'invalid-date',
        '',
        '2024-13-01', // Invalid month
        '2024-01-32', // Invalid day
      ];

      invalidDates.forEach(date => {
        expect(() => getTimeAgo(date)).not.toThrow();
        // Invalid dates will result in NaN calculations, which should be handled
        const result = getTimeAgo(date);
        expect(typeof result).toBe('string');
      });
    });
  });

  describe('Boundary testing', () => {
    it('should correctly handle boundary between time units', () => {
      const testCases = [
        // Just under 1 minute (59 seconds)
        { date: '2024-01-15T11:59:01Z', expected: 'just now' },
        // Exactly 1 minute
        { date: '2024-01-15T11:59:00Z', expected: '1 minute ago' },
        // Just under 1 hour (59 minutes 59 seconds)
        { date: '2024-01-15T11:00:01Z', expected: '59 minutes ago' },
        // Exactly 1 hour
        { date: '2024-01-15T11:00:00Z', expected: '1 hour ago' },
        // Just under 1 day (23 hours 59 minutes)
        { date: '2024-01-14T12:01:00Z', expected: '23 hours ago' },
        // Exactly 1 day
        { date: '2024-01-14T12:00:00Z', expected: '1 day ago' },
      ];

      testCases.forEach(({ date, expected }) => {
        expect(getTimeAgo(date)).toBe(expected);
      });
    });

    it('should handle exact year boundaries', () => {
      // The function uses simplified calculations: 30 days = 1 month, 365 days = 1 year
      // So 364 days = 12 months (364 / 30 = 12.13, floor = 12)
      const almostOneYear = new Date('2023-01-16T12:00:00Z').toISOString(); // 364 days
      expect(getTimeAgo(almostOneYear)).toBe('12 months ago');

      // Exactly 1 year should be years
      const exactlyOneYear = new Date('2023-01-15T12:00:00Z').toISOString(); // 365 days
      expect(getTimeAgo(exactlyOneYear)).toBe('1 year ago');
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle typical social media timestamps', () => {
      const scenarios = [
        { desc: 'Just posted', date: '2024-01-15T11:59:45Z', expected: 'just now' },
        { desc: 'Recent comment', date: '2024-01-15T11:45:00Z', expected: '15 minutes ago' },
        { desc: 'This morning', date: '2024-01-15T08:00:00Z', expected: '4 hours ago' },
        { desc: 'Yesterday', date: '2024-01-14T12:00:00Z', expected: '1 day ago' },
        { desc: 'Last week', date: '2024-01-08T12:00:00Z', expected: '7 days ago' },
        { desc: 'Last month', date: '2023-12-15T12:00:00Z', expected: '1 month ago' },
        { desc: 'Last year', date: '2023-01-15T12:00:00Z', expected: '1 year ago' },
      ];

      scenarios.forEach(({ desc, date, expected }) => {
        expect(getTimeAgo(date)).toBe(expected);
      });
    });

    it('should work with different timezones in ISO strings', () => {
      // All these represent the same moment in time
      const sameMoment = [
        '2024-01-15T11:00:00Z',           // UTC
        '2024-01-15T12:00:00+01:00',      // UTC+1
        '2024-01-15T06:00:00-05:00',      // UTC-5
      ];

      sameMoment.forEach(date => {
        expect(getTimeAgo(date)).toBe('1 hour ago');
      });
    });
  });
});