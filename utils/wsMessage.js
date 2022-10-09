export const parseWsMessage = (rawData) => {
	try {
		const { event, data } = JSON.parse(rawData.toString());
		if (!event || !data) {
			throw new Error('unknown event');
		}
		return {
			event,
			data,
		};
	} catch (_e) {
		return {
			event: 'unknown',
		};
	}
};

export const createWsMessage = (event, data = undefined) => JSON.stringify({
	event,
	data,
});
