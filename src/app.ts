import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { readdirSync } from 'fs';
import { join } from 'path';
import { notFound, exception } from './middlewares/errors';
import morgan from 'morgan';
import helmet from 'helmet';

const app = express();

app.use(cors());
app.use(json());
app.use(morgan('combined'));
app.use(helmet());

app.use('/robots.txt', (req, res) =>
  res.status(200).send('User-agent: *\nDisallow: /'),
);
app.use('/favicon.ico', (req, res) => res.status(404).end());

const routes = readdirSync(join(__dirname, 'routes'));
for (const route of routes) {
  app.use(require(join(__dirname, 'routes', route)).default);
}

app.use(notFound);
app.use(exception);

export default app;
