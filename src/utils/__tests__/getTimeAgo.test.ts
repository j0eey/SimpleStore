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

  // SNAPSHOT TESTS - for output patterns and comprehensive coverage
  describe('Time Unit Output Snapshots', () => {
    it('should match snapshot for all time unit variations', () => {
      const timeTestCases = [
        // Just now
        { date: '2024-01-15T12:00:00Z', description: 'current time' },
        { date: '2024-01-15T11:59:30Z', description: '30 seconds ago' },
        { date: '2024-01-15T11:59:01Z', description: '59 seconds ago' },
        
        // Minutes
        { date: '2024-01-15T11:59:00Z', description: '1 minute ago' },
        { date: '2024-01-15T11:58:00Z', description: '2 minutes ago' },
        { date: '2024-01-15T11:30:00Z', description: '30 minutes ago' },
        { date: '2024-01-15T11:01:00Z', description: '59 minutes ago' },
        
        // Hours
        { date: '2024-01-15T11:00:00Z', description: '1 hour ago' },
        { date: '2024-01-15T10:00:00Z', description: '2 hours ago' },
        { date: '2024-01-15T00:00:00Z', description: '12 hours ago' },
        { date: '2024-01-14T13:00:00Z', description: '23 hours ago' },
        
        // Days
        { date: '2024-01-14T12:00:00Z', description: '1 day ago' },
        { date: '2024-01-13T12:00:00Z', description: '2 days ago' },
        { date: '2024-01-08T12:00:00Z', description: '7 days ago' },
        { date: '2023-12-31T12:00:00Z', description: '15 days ago' },
        
        // Months
        { date: '2023-12-15T12:00:00Z', description: '1 month ago' },
        { date: '2023-11-15T12:00:00Z', description: '2 months ago' },
        { date: '2023-07-15T12:00:00Z', description: '6 months ago' },
        { date: '2023-02-15T12:00:00Z', description: '11 months ago' },
        
        // Years
        { date: '2023-01-15T12:00:00Z', description: '1 year ago' },
        { date: '2022-01-15T12:00:00Z', description: '2 years ago' },
        { date: '2019-01-15T12:00:00Z', description: '5 years ago' },
      ];

      const results = timeTestCases.map(testCase => ({
        input: testCase.date,
        description: testCase.description,
        output: getTimeAgo(testCase.date),
      }));

      expect(results).toMatchSnapshot('all-time-unit-variations');
    });

    it('should match snapshot for edge cases and boundaries', () => {
      const edgeCases = [
        // Future dates
        { date: '2024-01-16T12:00:00Z', description: 'future date' },
        { date: '2025-01-15T12:00:00Z', description: '1 year in future' },
        
        // Very old dates
        { date: '1990-01-15T12:00:00Z', description: 'very old date' },
        { date: '2000-01-01T00:00:00Z', description: 'millennium start' },
        
        // Leap year scenarios
        { date: '2020-02-29T12:00:00Z', description: 'leap year date' },
        { date: '2021-02-28T12:00:00Z', description: 'non-leap year equivalent' },
        
        // Boundary conditions
        { date: '2024-01-15T11:59:01Z', description: 'just under 1 minute' },
        { date: '2024-01-15T11:00:01Z', description: 'just under 1 hour' },
        { date: '2024-01-14T12:01:00Z', description: 'just under 1 day' },
        { date: '2023-01-16T12:00:00Z', description: 'almost 1 year (364 days)' },
        
        // Different timezone formats
        { date: '2024-01-15T11:00:00Z', description: 'UTC format' },
        { date: '2024-01-15T12:00:00+01:00', description: 'UTC+1 format' },
        { date: '2024-01-15T06:00:00-05:00', description: 'UTC-5 format' },
        { date: '2024-01-14T12:00:00.000Z', description: 'with milliseconds' },
      ];

      const results = edgeCases.map(testCase => ({
        input: testCase.date,
        description: testCase.description,
        output: getTimeAgo(testCase.date),
      }));

      expect(results).toMatchSnapshot('edge-cases-and-boundaries');
    });

    it('should match snapshot for invalid date handling', () => {
      const invalidDates = [
        'invalid-date',
        '',
        '2024-13-01', // Invalid month
        '2024-01-32', // Invalid day
        'not-a-date-at-all',
        '2024/01/15', // Wrong format
        '15-01-2024', // Wrong format
      ];

      const results = invalidDates.map(date => ({
        input: date,
        output: getTimeAgo(date),
        isValidOutput: typeof getTimeAgo(date) === 'string',
      }));

      expect(results).toMatchSnapshot('invalid-date-handling');
    });

    it('should match snapshot for real-world social media scenarios', () => {
      const socialMediaScenarios = [
        { date: '2024-01-15T11:59:45Z', scenario: 'just posted' },
        { date: '2024-01-15T11:45:00Z', scenario: 'recent comment' },
        { date: '2024-01-15T08:00:00Z', scenario: 'this morning' },
        { date: '2024-01-14T20:00:00Z', scenario: 'last evening' },
        { date: '2024-01-14T12:00:00Z', scenario: 'yesterday' },
        { date: '2024-01-13T12:00:00Z', scenario: 'day before yesterday' },
        { date: '2024-01-08T12:00:00Z', scenario: 'last week' },
        { date: '2024-01-01T12:00:00Z', scenario: 'start of month' },
        { date: '2023-12-15T12:00:00Z', scenario: 'last month' },
        { date: '2023-11-15T12:00:00Z', scenario: 'two months ago' },
        { date: '2023-06-15T12:00:00Z', scenario: 'mid year' },
        { date: '2023-01-15T12:00:00Z', scenario: 'last year' },
        { date: '2022-01-15T12:00:00Z', scenario: 'two years ago' },
      ];

      const results = socialMediaScenarios.map(testCase => ({
        scenario: testCase.scenario,
        input: testCase.date,
        output: getTimeAgo(testCase.date),
      }));

      expect(results).toMatchSnapshot('social-media-scenarios');
    });

    it('should match snapshot for singular vs plural patterns', () => {
      const singularPluralTests = [
        // Minutes
        { date: '2024-01-15T11:59:00Z', unit: 'minute', count: 1 },
        { date: '2024-01-15T11:58:00Z', unit: 'minutes', count: 2 },
        { date: '2024-01-15T11:45:00Z', unit: 'minutes', count: 15 },
        
        // Hours
        { date: '2024-01-15T11:00:00Z', unit: 'hour', count: 1 },
        { date: '2024-01-15T10:00:00Z', unit: 'hours', count: 2 },
        { date: '2024-01-15T06:00:00Z', unit: 'hours', count: 6 },
        
        // Days
        { date: '2024-01-14T12:00:00Z', unit: 'day', count: 1 },
        { date: '2024-01-13T12:00:00Z', unit: 'days', count: 2 },
        { date: '2024-01-10T12:00:00Z', unit: 'days', count: 5 },
        
        // Months
        { date: '2023-12-15T12:00:00Z', unit: 'month', count: 1 },
        { date: '2023-11-15T12:00:00Z', unit: 'months', count: 2 },
        { date: '2023-10-15T12:00:00Z', unit: 'months', count: 3 },
        
        // Years
        { date: '2023-01-15T12:00:00Z', unit: 'year', count: 1 },
        { date: '2022-01-15T12:00:00Z', unit: 'years', count: 2 },
        { date: '2020-01-15T12:00:00Z', unit: 'years', count: 4 },
      ];

      const results = singularPluralTests.map(testCase => ({
        expectedUnit: testCase.unit,
        expectedCount: testCase.count,
        input: testCase.date,
        output: getTimeAgo(testCase.date),
      }));

      expect(results).toMatchSnapshot('singular-plural-patterns');
    });
  });

  // UNIT TESTS - for specific behavior validation
  describe('Time Unit Behavior', () => {
    describe('Years ago', () => {
      it('should return "1 year ago" for exactly 1 year ago', () => {
        const oneYearAgo = new Date('2023-01-15T12:00:00Z').toISOString();
        expect(getTimeAgo(oneYearAgo)).toBe('1 year ago');
      });

      it('should return "2 years ago" for exactly 2 years ago', () => {
        const twoYearsAgo = new Date('2022-01-15T12:00:00Z').toISOString();
        expect(getTimeAgo(twoYearsAgo)).toBe('2 years ago');
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
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle future dates by returning "just now"', () => {
      const futureDate = new Date('2024-01-16T12:00:00Z').toISOString();
      expect(getTimeAgo(futureDate)).toBe('just now');
    });

    it('should handle very old dates correctly', () => {
      const veryOldDate = new Date('1990-01-15T12:00:00Z').toISOString();
      expect(getTimeAgo(veryOldDate)).toBe('34 years ago');
    });

    it('should handle invalid date strings gracefully', () => {
      const invalidDates = [
        'invalid-date',
        '',
        '2024-13-01',
        '2024-01-32',
      ];

      invalidDates.forEach(date => {
        expect(() => getTimeAgo(date)).not.toThrow();
        const result = getTimeAgo(date);
        expect(typeof result).toBe('string');
      });
    });

    it('should correctly handle boundary between time units', () => {
      const testCases = [
        { date: '2024-01-15T11:59:01Z', expected: 'just now' },
        { date: '2024-01-15T11:59:00Z', expected: '1 minute ago' },
        { date: '2024-01-15T11:00:01Z', expected: '59 minutes ago' },
        { date: '2024-01-15T11:00:00Z', expected: '1 hour ago' },
        { date: '2024-01-14T12:01:00Z', expected: '23 hours ago' },
        { date: '2024-01-14T12:00:00Z', expected: '1 day ago' },
      ];

      testCases.forEach(({ date, expected }) => {
        expect(getTimeAgo(date)).toBe(expected);
      });
    });

    it('should work with different timezones in ISO strings', () => {
      const sameMoment = [
        '2024-01-15T11:00:00Z',
        '2024-01-15T12:00:00+01:00',
        '2024-01-15T06:00:00-05:00',
      ];

      sameMoment.forEach(date => {
        expect(getTimeAgo(date)).toBe('1 hour ago');
      });
    });
  });
});