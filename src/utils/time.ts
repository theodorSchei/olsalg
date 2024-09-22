import { DateTime } from 'luxon';

/**
 * From: https://www.oslo.kommune.no/skatt-og-naring/salg-servering-og-skjenking/salgstider-for-ol/
 *  Hverdager kl. 09:00–20:00
 *  Lørdager kl. 09:00–18:00
 *  Søndager og helligdager - ikke ølsalg
 *  Onsdag før skjærtorsdag kl. 09:00–18:00
 *  Påskeaften kl 09:00–16:00
 *  Dagen før 1. mai - ordinære salgstider
 *  1. mai - ikke ølsalg
 *  Dagen før 17. mai - ordinære salgstider
 *  17. mai - ikke ølsalg
 *  Dagen før Kristi Himmelfartsdag - ordinære salgstider
 *  Pinseaften kl. 09:00–16:00
 *  Julaften kl. 09:00–16:00 (ikke på søndager)
 *  Nyttårsaften kl. 09:00–18:00 (ikke på søndager)
 *  Valgdagen kl. 09:00–20:00 (ikke på søndager)
 */
export function getClosingTime(date: DateTime): DateTime | null {
	// Spesialdager
	// Onsdag før skjærtorsdag kl. 09:00–18:00
	if (isWednesdayBeforeMaundyThursday(date)) return date.set({ hour: 18, minute: 0 });

	// Påskeaften kl 09:00–16:00
	if (isEasterEve(date)) return date.set({ hour: 16, minute: 0 });

	// Dagen før 1. mai - ordinære salgstider
	if (date.month === 4 && date.day === 30) return ordinaryClosingTime(date);

	// 1. mai - ikke ølsalg
	if (date.month === 5 && date.day === 1) return null;

	// Dagen før 17. mai - ordinære salgstider
	if (date.month === 5 && date.day === 16) return ordinaryClosingTime(date);

	// 17. mai - ikke ølsalg
	if (date.month === 5 && date.day === 17) return null;

	// Dagen før Kristi Himmelfartsdag - ordinære salgstider
	if (date.equals(getAscensionDay(date).minus({ days: 1 }))) return ordinaryClosingTime(date);

	// Pinseaften kl. 09:00–16:00
	if (isPentecostEve(date)) return date.set({ hour: 16, minute: 0 });

	// Julaften kl. 09:00–16:00 (ikke på søndager)
	if (date.month === 12 && date.day === 24 && date.weekday !== 7) return date.set({ hour: 16, minute: 0 });

	// Nyttårsaften kl. 09:00–18:00 (ikke på søndager)
	if (date.month === 12 && date.day === 31 && date.weekday !== 7) return date.set({ hour: 18, minute: 0 });

	// Valgdagen kl. 09:00–20:00 (ikke på søndager)
	// TODO: Add election day

	// Vanlige dager
	// Hverdager kl. 09:00–20:00
	if (date.weekday >= 1 && date.weekday <= 5) return date.set({ hour: 20, minute: 0 });

	// Lørdager kl. 09:00–18:00
	if (date.weekday === 6) return date.set({ hour: 18, minute: 0 });

	// Søndager og helligdager - ikke ølsalg
	if (date.weekday === 7 || isHoliday(date)) return null;
	return null; // No ølsalg
}

export function ordinaryClosingTime(date: DateTime): DateTime | null {
	if (date.weekday >= 1 && date.weekday <= 5) return date.set({ hour: 20, minute: 0 });
	if (date.weekday === 6) return date.set({ hour: 18, minute: 0 });
	return null;
}

export function isHoliday(date: DateTime): boolean {
	const easterSunday = getEasterSunday(date.year);
	return (
		(date.month === 1 && date.day === 1) || // Nyttårsdag
		date.equals(easterSunday.minus({ days: 3 })) || // Skjærtorsdag
		date.equals(easterSunday.minus({ days: 2 })) || // Langfredag
		date.equals(easterSunday) || // 1. påskedag
		date.equals(easterSunday.plus({ days: 1 })) || // 2. påskedag
		(date.month === 5 && date.day === 1) || // Arbeidernes dag
		(date.month === 5 && date.day === 17) || // Grunnlovsdag
		date.equals(easterSunday.plus({ days: 39 })) || // Kristi himmelfartsdag
		date.equals(easterSunday.plus({ days: 49 })) || // 1. pinsedag
		date.equals(easterSunday.plus({ days: 50 })) || // 2. pinsedag
		(date.month === 12 && date.day === 25) || // 1. juledag
		(date.month === 12 && date.day === 26) || // 2. juledag
		date.weekday === 7 // Søndag
	);
}

export function getHolidayName(date: DateTime): string | null {
	const easterSunday = getEasterSunday(date.year);
	if (date.month === 1 && date.day === 1) return '1. Nyttårsdag';
	if (date.equals(easterSunday.minus({ days: 4 }))) return 'Onsdag før skjærtorsdag';
	if (date.equals(easterSunday.minus({ days: 3 }))) return 'Skjærtorsdag';
	if (date.equals(easterSunday.minus({ days: 2 }))) return 'Langfredag';
	if (date.equals(easterSunday.minus({ days: 1 }))) return 'Påskeaften';
	if (date.equals(easterSunday)) return '1. påskedag';
	if (date.equals(easterSunday.plus({ days: 1 }))) return '2. påskedag';
	if (date.month === 5 && date.day === 1) return 'Arbeidernes dag';
	if (date.month === 5 && date.day === 17) return 'Grunnlovsdag';
	if (date.equals(easterSunday.plus({ days: 39 }))) return 'Kristi himmelfartsdag';
	if (date.equals(easterSunday.plus({ days: 48 }))) return 'Pinseaften';
	if (date.equals(easterSunday.plus({ days: 49 }))) return '1. pinsedag';
	if (date.equals(easterSunday.plus({ days: 50 }))) return '2. pinsedag';
	if (date.month === 12 && date.day === 24) return 'Julaften';
	if (date.month === 12 && date.day === 25) return '1. juledag';
	if (date.month === 12 && date.day === 26) return '2. juledag';
	if (date.month === 12 && date.day === 31) return 'Nyttårsaften';
	return null;
}

// Beregning av påske etter Gauss' påskeformel
// https://no.wikipedia.org/wiki/P%C3%A5skeformelen
export function getEasterSunday(year: number): DateTime {
	const a = year % 19;
	const b = Math.floor(year / 100);
	const c = year % 100;
	const d = Math.floor(b / 4);
	const e = b % 4;
	const f = Math.floor((b + 8) / 25);
	const g = Math.floor((b - f + 1) / 3);
	const h = (19 * a + b - d - g + 15) % 30;
	const i = Math.floor(c / 4);
	const k = c % 4;
	const l = (32 + 2 * e + 2 * i - h - k) % 7;
	const m = Math.floor((a + 11 * h + 22 * l) / 451);
	const month = Math.floor((h + l - 7 * m + 114) / 31);
	const day = ((h + l - 7 * m + 114) % 31) + 1;

	return DateTime.fromObject({ year, month, day }, { zone: 'Europe/Oslo' });
}

// Kristi Himmelfartsdag er 39 dager etter 1. påskedag
export function getAscensionDay(date: DateTime): DateTime {
	return getEasterSunday(date.year).plus({ days: 39 });
}

// Pinsedag er 49 dager (syvende søndag) etter 1. påskedag
export function getPentecostSunday(year: number): DateTime {
	return getEasterSunday(year).plus({ days: 49 });
}

// Påskeaften er dagen før 1. påskedag
export function isEasterEve(date: DateTime): boolean {
	return date.equals(getEasterSunday(date.year).minus({ days: 1 }));
}

// Pinseaften er dagen før 1. pinsedag
function isPentecostEve(date: DateTime): boolean {
	return date.equals(getPentecostSunday(date.year).minus({ days: 1 }));
}

// Onsdag før skjærtorsdag er fire dager før 1. påskedag
function isWednesdayBeforeMaundyThursday(date: DateTime): boolean {
	return date.equals(getEasterSunday(date.year).minus({ days: 4 }));
}

export enum DiscordTimestampStyle {
	Default = '', // 28 November 2018 09:01 or November 28, 2018 9:01 AM
	ShortTime = 't', // 09:01 or 9:01 AM
	LongTime = 'T', // 09:01:00 or 9:01:00 AM
	ShortDate = 'd', // 28/11/2018 or 11/28/2018
	LongDate = 'D', // 28 November 2018 or November 28, 2018
	ShortDateTime = 'f', // 28 November 2018 09:01 or November 28, 2018 9:01 AM
	LongDateTime = 'F', // Wednesday, 28 November 2018 09:01 or Wednesday, November 28, 2018 9:01 AM
	RelativeTime = 'R', // 3 years ago
}

export function convertToDiscordTimestamp(dateTime: DateTime, style: DiscordTimestampStyle): string {
	const secondsSinceEpoch = Math.floor(dateTime.toSeconds());
	return `<t:${secondsSinceEpoch}${style != DiscordTimestampStyle.Default ? `:${style}` : ''}>`;
}
