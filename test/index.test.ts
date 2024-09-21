// Generate a full year of makeTodaysMessage to manually verify the output

import { DateTime, Settings } from 'luxon';
import { makeTodaysMessage } from '../src/index';
import { describe, expect, it } from 'vitest';
const start = DateTime.fromObject({ year: 2024, month: 1, day: 1 });

describe('Ølsalg-reminder', () => {
	it('should match snapshot', () => {
		const snapshot = makeSnapshotOfEntireYear(2024);
		expect(snapshot).toMatchSnapshot();
	});
});

function makeSnapshotOfEntireYear(year: number) {
	const start = DateTime.fromObject({ year: year, month: 1, day: 1 });
	const snapshot = [];

	for (let i = 0; i < 365; i++) {
		const mockDate = start.plus({ days: i });
		Settings.now = () => mockDate.toMillis();
		snapshot.push(`---${mockDate.toISODate()}---`);
		snapshot.push(makeTodaysMessage());

		Settings.now = () => Date.now();
	}
	return snapshot;
}
