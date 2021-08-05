import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Response, NextFunction, Express } from 'express';
import flightsRoute from './flightsRoute';

const port = process.env.PORT || 3000;
const app = express();

function timeout(_req, res: Response & { timedout?: boolean }, next: NextFunction) {
  res.setTimeout(1000, () => {
    res.statusCode = 408;
    res.json({ message: 'request timed out', code: 408 });
    res.timedout = true;
  });
  next();
}

app.use(timeout);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', flightsRoute);

let isAppReady = false;
let appListeningCallbacks: () => void;

const server = app.listen(port, () => {
  isAppReady = true;
  if (typeof appListeningCallbacks === 'function') {
    appListeningCallbacks();
  }
  console.log(`=================================`);
  console.log(`🚀 App listening on  http://localhost:${port}`);
  console.log(`=================================`);
});

export const getServer = (): Promise<{ app: Express; server: typeof server }> =>
  new Promise(resolve => {
    if (isAppReady) {
      return resolve({ app, server });
    }
    appListeningCallbacks = () => {
      resolve({ app, server });
    };
  });
