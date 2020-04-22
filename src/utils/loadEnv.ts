import { config, parse } from 'dotenv';
import { readFileSync } from 'fs';

const findMissingKeys = (sample: object, variables: object): string[] => {
  const keys = Object.keys(variables);
  return Object.keys(sample).filter((key) => !keys.includes(key));
};

export const loadEnv = (): void => {
  const buffer = readFileSync('.env.example');
  const sample = parse(buffer);
  config();
  const missingKeys = findMissingKeys(sample, process.env);
  if (missingKeys.length > 0) {
    console.error(
      `Failed to load API, environment variables not set: ${missingKeys.join(
        ', ',
      )}`,
    );
    process.exit(1);
  }
};
