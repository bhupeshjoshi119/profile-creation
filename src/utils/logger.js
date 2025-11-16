const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

const colors = {
  error: '\x1b[31m',
  warn: '\x1b[33m',
  info: '\x1b[36m',
  debug: '\x1b[90m',
  reset: '\x1b[0m'
};

function formatTimestamp() {
  return new Date().toISOString();
}

function log(level, message, meta = {}) {
  const timestamp = formatTimestamp();
  const color = colors[level] || colors.reset;
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  
  console.log(`${color}[${timestamp}] [${level.toUpperCase()}]${colors.reset} ${message}${metaStr}`);
}

const logger = {
  error: (message, meta) => log(LOG_LEVELS.ERROR, message, meta),
  warn: (message, meta) => log(LOG_LEVELS.WARN, message, meta),
  info: (message, meta) => log(LOG_LEVELS.INFO, message, meta),
  debug: (message, meta) => log(LOG_LEVELS.DEBUG, message, meta)
};

module.exports = logger;
