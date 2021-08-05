import request from 'supertest';
import fetch from 'node-fetch';
import { getServer } from '../app';

jest.mock('node-fetch');
const expectedResponse = {
  flights: [
    {
      slices: [
        {
          origin_name: 'Schonefeld',
          destination_name: 'Stansted',
          departure_date_time_utc: '2019-08-08T20:25:00.000Z',
          arrival_date_time_utc: '2019-08-08T22:25:00.000Z',
          flight_number: '8545',
          duration: 120,
        },
        {
          origin_name: 'Stansted',
          destination_name: 'Schonefeld',
          departure_date_time_utc: '2019-08-10T18:00:00.000Z',
          arrival_date_time_utc: '2019-08-10T20:00:00.000Z',
          flight_number: '8544',
          duration: 120,
        },
      ],
      price: 117.01,
    },
    {
      slices: [
        {
          origin_name: 'Schonefeld',
          destination_name: 'Stansted',
          departure_date_time_utc: '2019-08-08T04:30:00.000Z',
          arrival_date_time_utc: '2019-08-08T06:25:00.000Z',
          flight_number: '144',
          duration: 115,
        },
        {
          origin_name: 'Stansted',
          destination_name: 'Schonefeld',
          departure_date_time_utc: '2019-08-10T05:35:00.000Z',
          arrival_date_time_utc: '2019-08-10T07:35:00.000Z',
          flight_number: '8542',
          duration: 120,
        },
      ],
      price: 129,
    },
  ],
};

const mockFetchResponse = { flights: [...expectedResponse.flights, ...expectedResponse.flights] };
let app;
let server;

describe('[GET] /', () => {
  beforeAll(async () => {
    const AppAndServer = await getServer();
    app = AppAndServer.app;
    server = AppAndServer.server;
  });

  afterAll(() => {
    server.close();
  });

  it('response statusCode 200 and flights array', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockFetchResponse),
    });
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockFetchResponse),
    });

    const res = await request(app).get('/').expect(200);

    expect(res.body).toEqual({ ...expectedResponse, message: 'ok' });
  });

  it('response timeout statusCode 408', async () => {
    fetch.mockReturnValueOnce(
      new Promise(resolve => {
        setTimeout(
          () =>
            resolve({
              json: () => Promise.resolve(mockFetchResponse),
            }),
          1500,
        );
      }),
    );
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockFetchResponse),
    });

    const res = await request(app).get('/').expect(408);

    expect(res.body).toEqual({ code: 408, message: 'request timed out' });
  });

  it('response error should log the errors', async () => {
    fetch.mockResolvedValueOnce(undefined);
    fetch.mockResolvedValueOnce({
      json: () => {
        throw new Error('fake error');
      },
    });

    const originalConsoleError = console.error;
    console.error = jest.fn();
    const res = await request(app).get('/').expect(200);

    expect(console.error).toHaveBeenCalledTimes(2);
    expect(res.body).toEqual({
      flights: [],
      message: 'ok',
    });

    console.error = originalConsoleError;
  });
});
