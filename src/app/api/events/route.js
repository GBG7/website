import ical from 'ical-generator';

/**
 * Minimum date allowed by JavaScript Date object.
 * @type {Date}
 * @see https://262.ecma-international.org/5.1/#sec-15.9.1.1
 */
export const MIN_DATE = new Date(-8640000000000000);

/**
 * Maximum date allowed by JavaScript Date object.
 * @type {Date}
 * @see https://262.ecma-international.org/5.1/#sec-15.9.1.1
 */
export const MAX_DATE = new Date(8640000000000000);

/**
 * load external json file from api
 * @param {integer} limit the number of events to show
 * @param {Date} from the date to start showing events from (inclusive), based on end_date
 * @param {Date} to the date to stop showing events at (non-inclusive), based on end_date
 * @returns {object} bevy chapter object
 */
const getEvents = async (limit, from, to) => {
	return await fetch(process.env.CHAPTER_API_URL, {
		next: { revalidate: 3600 }, // revalidate once an hour
	})
		.then(response => response.json())
		.then(data => {
			if (data['detail'] && (data['detail'].includes('throttled') || data['detail'].includes('error'))) {
				throw new Error(data['detail']);
			}
			// filter only published events
			let eventData = data['results'].filter(event => event['status'] === 'Published');

			// slice to limit if specified
			if (limit) {
				eventData = eventData.slice(0, limit);
			}

			// filter only upcoming events if specified
			eventData = eventData.filter(event => {
				const endDate = new Date(event['end_date']);
				return endDate >= from && endDate < to;
			});

			return eventData;
		})
		.catch(error => {
			return error;
		});
};

/**
 * load external json file from api
 * @param {id} id id of the event
 * @returns {object} bevy event object
 */
const fetchEventInfo = async id => {
	return await fetch(process.env.EVENT_API_URL + id, {
		next: { revalidate: 604800 }, // revalidate once a week
	})
		.then(response => response.json())
		.then(data => {
			if (!data['description_short']) {
				return data['message'];
			}

			return data;
		})
		.catch(error => {
			return error?.message;
		});
};

const concatStrings = (...strings) => strings.filter(Boolean).join(' ');

/**
 * get descriptions and locations for events from api
 */
export const getEnrichedEvents = async (limit, from, to) => {
	const events = await getEvents(limit, from, to);

	const eventInfo = await Promise.all(
		events.map(async event => {
			return await fetchEventInfo(event['id']);
		})
	);

	const descriptions = eventInfo.map(event => {
		if (event['message']) {
			return event['message'];
		}

		return event['description_short'];
	});

	const locations = eventInfo.map(event => {
		if (event['message']) {
			return '';
		}

		return concatStrings(
			event['venue_name'],
			event['venue_address'],
			event['venue_city'],
			event['venue_zip_code'],
			event['meetup_url'],
			event['eventbrite_url']
		);
	});

	return { events, descriptions, locations };
};

/**
 * Gets a list of years that have events.
 *
 * @returns {Array} array of years
 */
export const getYears = async () => {
	const events = await getEvents(undefined, MIN_DATE, new Date());

	const years = events.reduce((acc, event) => {
		const year = new Date(event['end_date']).getFullYear();
		if (!acc.includes(year)) {
			acc.push(year);
		}
		return acc;
	}, []);

	return years.sort((a, b) => b - a);
};

/**
 * return an ical for the events
 */
export async function GET(req, res) {
	if (req.method !== 'GET') {
		res.status(405).end();
		return;
	}

	const calendar = ical({
		name: 'GDSC UTM Events',
	});

	calendar.prodId({
		company: 'Google Developer Student Clubs - University of Toronto Mississauga',
		product: 'GDSC UTM Events',
		language: 'EN',
	});

	const { events, descriptions, locations } = await getEnrichedEvents(undefined, MIN_DATE, MAX_DATE);

	events.forEach((event, id) => {
		calendar.createEvent({
			start: new Date(event['start_date']),
			end: new Date(event['end_date']),
			summary: event['title'],
			description: descriptions[id],
			url: event['url'],
			location: locations[id] || undefined,
		});
	});

	return new Response(calendar.toString(), {
		status: 200,
		headers: {
			'Content-Type': 'text/calendar',
			'Content-Disposition': 'attachment; filename="gdsc-utm-events.ics"',
		},
	});
}
