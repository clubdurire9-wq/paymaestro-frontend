const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
  error: (...args: unknown[]) => {
    if (!isProduction) console.error(...args);
  },
  warn: (...args: unknown[]) => {
    if (!isProduction) console.warn(...args);
  },
  log: (...args: unknown[]) => {
    if (!isProduction) console.log(...args);
  },
  info: (...args: unknown[]) => {
    if (!isProduction) console.info(...args);
  },
};
