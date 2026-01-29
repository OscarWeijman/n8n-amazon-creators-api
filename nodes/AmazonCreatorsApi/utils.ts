export function normalizeList(value: string | string[]): string[] {
	if (Array.isArray(value)) {
		return value.map((entry) => entry.trim()).filter(Boolean);
	}

	return value
		.split(',')
		.map((entry) => entry.trim())
		.filter(Boolean);
}

export function buildPriceSummary(listings: any[]) {
	const prices = listings
		.map((listing) => listing?.price?.money?.amount)
		.filter((amount) => typeof amount === 'number');
	if (!prices.length) {
		return undefined;
	}

	return {
		offerCount: listings.length,
		lowestPrice: Math.min(...prices),
		highestPrice: Math.max(...prices),
	};
}

export function parseRetryAfter(headerValue: string | string[] | undefined): number | undefined {
	if (!headerValue) return undefined;
	const value = Array.isArray(headerValue) ? headerValue[0] : headerValue;
	const trimmed = value.trim();
	if (!trimmed) return undefined;

	const seconds = Number(trimmed);
	if (!Number.isNaN(seconds)) {
		return Math.max(seconds * 1000, 0);
	}

	const dateMs = Date.parse(trimmed);
	if (Number.isNaN(dateMs)) return undefined;
	const delayMs = dateMs - Date.now();
	return delayMs > 0 ? delayMs : 0;
}

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
