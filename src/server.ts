import { loadEnv } from './utils/loadEnv';
import { connect, connection } from 'mongoose';

loadEnv();

console.info(`NODE_ENV is set to ${process.env.NODE_ENV}`);

import { checkFiles } from './utils/checkFiles';

checkFiles();

import http from 'http';
import app from './app';

const port = process.env.PORT;
app.set('port', port);

const server = http.createServer(app);

const onError = <T extends { syscall: string; code: string }>(err: T): void => {
  if (err.syscall !== 'listen') {
    throw err;
  }
  switch (err.code) {
    case 'EACCES':
      console.error(`Port ${port} requires elevated privileges`);
      break;
    case 'EADDRINUSE':
      console.error(`Port ${port} is already in use`);
      break;
    default:
      console.error(err);
  }
  process.exit(1);
};

const onListening = (): void => {
  const addr = server.address();
  if (addr && typeof addr !== 'string') {
    console.log(`Listening on port ${addr.port}`);
  }
};

const onConnectionError = (): void => {
  console.error(`Unable to connect to database: ${process.env.MONGODB_URI}`);
  process.exit(1);
};

(async (): Promise<void> => {
  if (!process.env.MONGODB_URI) {
    console.error(`environment variable MONGODB_URI is not set`);
    process.exit(1);
  }
  await connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
  connection.on('error', onConnectionError);
  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
