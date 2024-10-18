export function createLogger(level = 'info') {
  const levels = ['debug', 'info', 'warn', 'error'];

  // Get the index of the current log level to compare
  const currentLevelIndex = levels.indexOf(level);

  return {
    debug: (message) => {
      if (currentLevelIndex <= levels.indexOf('debug')) {
        console.debug(`[DEBUG] ${message}`);
      }
    },
    info: (message) => {
      if (currentLevelIndex <= levels.indexOf('info')) {
        console.info(`[INFO] ${message}`);
      }
    },
    warn: (message) => {
      if (currentLevelIndex <= levels.indexOf('warn')) {
        console.warn(`[WARN] ${message}`);
      }
    },
    error: (message) => {
      if (currentLevelIndex <= levels.indexOf('error')) {
        console.error(`[ERROR] ${message}`);
      }
    }
  };
}