/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { DateTime } from 'luxon';
import { convertToDiscordTimestamp, DiscordTimestampStyle, getClosingTime, getHolidayName, isHoliday, ordinaryClosingTime } from './utils/time';

export interface Env {
	DISCORD_WEBHOOK_URL: string;
}

export default {
	async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
		const todayMessage = makeTodaysMessage();
		if (todayMessage) {
			await sendDiscordMessage(env.DISCORD_WEBHOOK_URL, todayMessage);
		}
	},
} satisfies ExportedHandler<Env>;

const isRegularØlsalgDay = (date: DateTime): boolean => {
	const closingTime = getClosingTime(date);
	const ordinaryClosingHour = ordinaryClosingTime(date)?.hour;

	if (closingTime && ordinaryClosingHour) {
		return closingTime.hour === ordinaryClosingHour;
	}
	return false;
};

export function makeTodaysMessage(): string {
	const now = DateTime.now().setZone('Europe/Oslo');
	let message = '';

	const closingTime = getClosingTime(now);

	if (!closingTime) {
		message += `Det er ikke ølsalg i dag (${getHolidayName(now) ?? 'Søndag'})`;
	} else {
		message += `Ølsalget stenger kl. ${convertToDiscordTimestamp(
			closingTime,
			DiscordTimestampStyle.ShortTime
		)}! (${convertToDiscordTimestamp(closingTime, DiscordTimestampStyle.RelativeTime)})`;
	}

	const tomorrow = now.plus({ days: 1 });
	const tomorrowClosingTime = getClosingTime(tomorrow);
	const tomorrowHolidayName = getHolidayName(tomorrow);

	if (!isRegularØlsalgDay(tomorrow)) {
		// Irregular closing time
		if (tomorrowClosingTime) {
			message += `\n@everyone **NB!⚠️** I morgen stenger ølsalget kl. ${convertToDiscordTimestamp(
				tomorrowClosingTime,
				DiscordTimestampStyle.ShortTime
			)} (${tomorrowHolidayName ?? 'Søndag'})`;
		} else {
			// No ølsalg for some other reason than sunday
			if (tomorrowHolidayName) {
				message += `\n**NB!⚠️** Det er ikke ølsalg i morgen (${tomorrowHolidayName})`;
			}
		}
	}

	return message;
}

async function sendDiscordMessage(webhookUrl: string, content: string): Promise<void> {
	const response = await fetch(webhookUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ content }),
	});

	if (!response.ok) {
		throw new Error(`Failed to send Discord message: ${response.statusText}`);
	}
}

export function getMessageForDate(date: DateTime): string | null {
	if (isHoliday(date) || date.weekday === 7) {
		return `Det er ikke ølsalg ${date.toFormat('dd.MM')} (${getHolidayName(date) || 'Søndag'})`;
	}

	const closingTime = getClosingTime(date);
	if (!closingTime) return null;

	const warningTime = closingTime.minus({ hours: 1 });
	if (date.hour !== warningTime.hour) return null;

	return `Ølsalget stenger om en time! (kl. ${closingTime.toFormat('HH:mm')})`;
}
