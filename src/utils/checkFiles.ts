import * as constants from './constants';
import { existsSync } from 'fs';

export const checkFiles = (): void => {
  const items = Object.entries(constants).filter(([key]) =>
    /_PATH$/.test(key),
  ) as [string, string][];
  const notFound = [];
  for (const [, path] of items) {
    const exists = existsSync(path);
    if (!exists) {
      notFound.push(path);
    }
  }
  if (notFound.length > 0) {
    throw new Error(
      `Failed to load API, files not found: ${notFound
        .map((path) => `"${path}"`)
        .join(', ')}`,
    );
  }
};
