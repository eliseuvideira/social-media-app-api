import * as paths from './paths';
import { existsSync } from 'fs';

export const checkFiles = (): void => {
  const items = Object.entries(paths);
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
