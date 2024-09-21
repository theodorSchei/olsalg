import { describe, it, expect } from 'vitest';
import { DateTime } from 'luxon';
import { getAscensionDay, getClosingTime, getEasterSunday, getPentecostSunday, isHoliday } from '../src/utils/time';

describe('Ølsalg-reminder', () => {
	describe('Ølsalg closing times', () => {
		const testCases = [
			{
				description: 'Weekday (Monday)',
				date: DateTime.fromObject({ year: 2024, month: 4, day: 15 }, { zone: 'Europe/Oslo' }),
				expected: { hour: 20, minute: 0 },
			},
			{
				description: 'Saturday',
				date: DateTime.fromObject({ year: 2024, month: 4, day: 13 }, { zone: 'Europe/Oslo' }),
				expected: { hour: 18, minute: 0 },
			},
			{
				description: 'Sunday',
				date: DateTime.fromObject({ year: 2024, month: 4, day: 14 }, { zone: 'Europe/Oslo' }),
				expected: null,
			},
			{
				description: 'Wednesday before Maundy Thursday',
				date: DateTime.fromObject({ year: 2024, month: 3, day: 27 }, { zone: 'Europe/Oslo' }),
				expected: { hour: 18, minute: 0 },
			},
			{
				description: 'Easter Eve',
				date: DateTime.fromObject({ year: 2024, month: 3, day: 30 }, { zone: 'Europe/Oslo' }),
				expected: { hour: 16, minute: 0 },
			},
			{
				description: 'Day before May 1st',
				date: DateTime.fromObject({ year: 2024, month: 4, day: 30 }, { zone: 'Europe/Oslo' }),
				expected: { hour: 20, minute: 0 },
			},
			{
				description: 'May 1st',
				date: DateTime.fromObject({ year: 2024, month: 5, day: 1 }, { zone: 'Europe/Oslo' }),
				expected: null,
			},
			{
				description: 'Day before May 17th',
				date: DateTime.fromObject({ year: 2024, month: 5, day: 16 }, { zone: 'Europe/Oslo' }),
				expected: { hour: 20, minute: 0 },
			},
			{
				description: 'May 17th',
				date: DateTime.fromObject({ year: 2024, month: 5, day: 17 }, { zone: 'Europe/Oslo' }),
				expected: null,
			},
			{
				description: 'Day before Ascension Day',
				date: DateTime.fromObject({ year: 2024, month: 5, day: 8 }, { zone: 'Europe/Oslo' }),
				expected: { hour: 20, minute: 0 },
			},
			{
				description: 'Whitsun Eve',
				date: DateTime.fromObject({ year: 2024, month: 5, day: 18 }, { zone: 'Europe/Oslo' }),
				expected: { hour: 16, minute: 0 },
			},
			{
				description: 'Christmas Eve',
				date: DateTime.fromObject({ year: 2024, month: 12, day: 24 }, { zone: 'Europe/Oslo' }),
				expected: { hour: 16, minute: 0 },
			},
			{
				description: "New Year's Eve",
				date: DateTime.fromObject({ year: 2024, month: 12, day: 31 }, { zone: 'Europe/Oslo' }),
				expected: { hour: 18, minute: 0 },
			},
			{
				description: 'Election Day (2025)',
				date: DateTime.fromObject({ year: 2025, month: 9, day: 8 }, { zone: 'Europe/Oslo' }),
				expected: { hour: 20, minute: 0 },
			},
			{
				description: 'Christmas Eve on Sunday',
				date: DateTime.fromObject({ year: 2023, month: 12, day: 24 }, { zone: 'Europe/Oslo' }),
				expected: null,
			},
			{
				description: "New Year's Eve on Sunday",
				date: DateTime.fromObject({ year: 2023, month: 12, day: 31 }, { zone: 'Europe/Oslo' }),
				expected: null,
			},
			{
				description: 'Election Day on Sunday (2023)',
				date: DateTime.fromObject({ year: 2023, month: 9, day: 10 }, { zone: 'Europe/Oslo' }),
				expected: null,
			},
		];

		testCases.forEach(({ description, date, expected }) => {
			it(description, () => {
				const closingTime = getClosingTime(date);
				if (expected === null) {
					expect(closingTime).toBeNull();
				} else {
					expect(closingTime?.hour).toBe(expected.hour);
					expect(closingTime?.minute).toBe(expected.minute);
				}
			});
		});
	});

	describe('getEasterSunday', () => {
		it('calculates Easter Sunday correctly for 2023', () => {
			const easterSunday = getEasterSunday(2023);
			expect(easterSunday.toISODate()).toBe('2023-04-09');
		});

		it('calculates Easter Sunday correctly for 2024', () => {
			const easterSunday = getEasterSunday(2024);
			expect(easterSunday.toISODate()).toBe('2024-03-31');
		});

		it('calculates Easter Sunday correctly for 2025', () => {
			const easterSunday = getEasterSunday(2025);
			expect(easterSunday.toISODate()).toBe('2025-04-20');
		});

		it('calculates Easter Sunday correctly for 2026', () => {
			const easterSunday = getEasterSunday(2026);
			expect(easterSunday.toISODate()).toBe('2026-04-05');
		});

		it('calculates Easter Sunday correctly for 2027', () => {
			const easterSunday = getEasterSunday(2027);
			expect(easterSunday.toISODate()).toBe('2027-03-28');
		});
	});
	describe('isHoliday', () => {
		it("returns true for New Year's Day", () => {
			const date = DateTime.fromObject({ year: 2023, month: 1, day: 1 });
			expect(isHoliday(date)).toBe(true);
		});

		it('returns true for Easter Sunday', () => {
			const date = getEasterSunday(2023);
			expect(isHoliday(date)).toBe(true);
		});

		it('returns true for 2nd Easter Day', () => {
			const date = getEasterSunday(2023).plus({ days: 1 });
			expect(isHoliday(date)).toBe(true);
		});

		it('returns true for Labour Day', () => {
			const date = DateTime.fromObject({ year: 2023, month: 5, day: 1 });
			expect(isHoliday(date)).toBe(true);
		});

		it('returns true for Constitution Day', () => {
			const date = DateTime.fromObject({ year: 2023, month: 5, day: 17 });
			expect(isHoliday(date)).toBe(true);
		});

		it('returns true for Ascension Day', () => {
			const date = getAscensionDay(DateTime.fromObject({ year: 2023 }));
			expect(isHoliday(date)).toBe(true);
		});

		it('returns true for Pentecost Sunday', () => {
			const date = getPentecostSunday(2023);
			expect(isHoliday(date)).toBe(true);
		});

		it('returns true for 2nd Pentecost Day', () => {
			const date = getPentecostSunday(2023).plus({ days: 1 });
			expect(isHoliday(date)).toBe(true);
		});

		it('returns false for Christmas Day', () => {
			const date = DateTime.fromObject({ year: 2023, month: 12, day: 23 });
			expect(isHoliday(date)).toBe(false);
		});

		it('returns true for 2nd Christmas Day', () => {
			const date = DateTime.fromObject({ year: 2023, month: 12, day: 26 });
			expect(isHoliday(date)).toBe(true);
		});

		it('returns false for a regular day', () => {
			const date = DateTime.fromObject({ year: 2023, month: 6, day: 15 });
			expect(isHoliday(date)).toBe(false);
		});
	});
});
