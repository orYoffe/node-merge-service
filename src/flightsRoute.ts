import { Response, Request } from 'express';
import fetch from 'node-fetch';
import { Flight } from './types';

const username = 'ct_interviewee';
const password = 'supersecret';
const headers = { Authorization: 'Basic ' + Buffer.from(`${username}:${password}`, 'binary').toString('base64') };

const getSourceData = async (url: string): Promise<Flight[]> => {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers,
    }).then(res => res.json());

    return res && res.flights ? res.flights : [];
  } catch (error) {
    console.log('-----------Failed to fetch resource------------url: ', url);
    console.error(error);
    return [];
  }
};

const getUniqueFlightId = (flight: Flight) => {
  return `${flight.price}${flight.slices.map(slice => `${slice.flight_number}${slice.departure_date_time_utc}`).join('')}`;
};

const flightsEndpoint = async (_req: Request, res: Response & { timedout?: boolean }) => {
  try {
    const [source1, source2] = await Promise.all([
      getSourceData('https://discovery-stub.comtravo.com/source1'),
      getSourceData('https://discovery-stub.comtravo.com/source2'),
    ]);
    const uniqueFlights: { [key: string]: Flight } = {};
    const allFlights = [...source1, ...source2];

    allFlights.forEach(flight => {
      const id = getUniqueFlightId(flight);
      if (!uniqueFlights[id]) {
        uniqueFlights[id] = flight;
      }
    });

    const flights = Object.keys(uniqueFlights).map(key => uniqueFlights[key]);
    if (res.timedout) {
      return;
    }
    res.json({ message: 'ok', flights });
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.json({ error: error.message, message: 'Failed to fetch resources' });
  }
};

export default flightsEndpoint;
