import { loadEnv } from './utils/loadEnv';

loadEnv();

console.info(`NODE_ENV is set to ${process.env.NODE_ENV}`)

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

(async (): Promise<void> => {
  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);
})().catch((err) => {
  console.error(err);
});
