import { join } from 'path';

// Regexes
export const REGEX_EMAIL = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
export const REGEX_OBJECT_ID = /^[a-fA-F0-9]{24}$/;

// Paths
export const PRIVATE_KEY_PATH = join(
  __dirname,
  '..',
  '..',
  'keys',
  'private.key',
);
