/**
 * Structured logging system for production
 * Provides consistent log format and levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  requestId?: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getMinLogLevel(): number {
  const level = process.env.LOG_LEVEL?.toLowerCase() as LogLevel | undefined;
  if (level && LOG_LEVELS[level] !== undefined) {
    return LOG_LEVELS[level];
  }
  return process.env.NODE_ENV === 'production' ? LOG_LEVELS.info : LOG_LEVELS.debug;
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= getMinLogLevel();
}

function formatError(error: unknown): LogEntry['error'] | undefined {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    };
  }
  if (typeof error === 'string') {
    return { name: 'Error', message: error };
  }
  return undefined;
}

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: string,
  data?: Record<string, unknown>,
  error?: unknown
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (context) entry.context = context;
  if (data && Object.keys(data).length > 0) entry.data = data;
  if (error) entry.error = formatError(error);

  // Get request ID from async context if available
  const requestId = getRequestId();
  if (requestId) entry.requestId = requestId;

  return entry;
}

function output(entry: LogEntry): void {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // JSON format for production (easy to parse by log aggregators)
    const logFn = entry.level === 'error' ? console.error : console.log;
    logFn(JSON.stringify(entry));
  } else {
    // Pretty format for development
    const colors: Record<LogLevel, string> = {
      debug: '\x1b[36m', // cyan
      info: '\x1b[32m',  // green
      warn: '\x1b[33m',  // yellow
      error: '\x1b[31m', // red
    };
    const reset = '\x1b[0m';
    const color = colors[entry.level];

    let output = `${color}[${entry.level.toUpperCase()}]${reset} ${entry.timestamp}`;
    if (entry.context) output += ` [${entry.context}]`;
    output += ` ${entry.message}`;

    if (entry.data) {
      output += `\n  Data: ${JSON.stringify(entry.data, null, 2)}`;
    }

    if (entry.error) {
      output += `\n  Error: ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.stack) {
        output += `\n  Stack: ${entry.error.stack}`;
      }
    }

    const logFn = entry.level === 'error' ? console.error : console.log;
    logFn(output);
  }
}

// Request ID tracking (using AsyncLocalStorage would be better but keeping it simple)
let currentRequestId: string | undefined;

export function setRequestId(id: string): void {
  currentRequestId = id;
}

export function getRequestId(): string | undefined {
  return currentRequestId;
}

export function clearRequestId(): void {
  currentRequestId = undefined;
}

/**
 * Create a logger instance with optional context
 */
export function createLogger(context?: string) {
  return {
    debug(message: string, data?: Record<string, unknown>) {
      if (shouldLog('debug')) {
        output(createLogEntry('debug', message, context, data));
      }
    },

    info(message: string, data?: Record<string, unknown>) {
      if (shouldLog('info')) {
        output(createLogEntry('info', message, context, data));
      }
    },

    warn(message: string, data?: Record<string, unknown>, error?: unknown) {
      if (shouldLog('warn')) {
        output(createLogEntry('warn', message, context, data, error));
      }
    },

    error(message: string, error?: unknown, data?: Record<string, unknown>) {
      if (shouldLog('error')) {
        output(createLogEntry('error', message, context, data, error));
      }
    },

    /**
     * Log HTTP request
     */
    request(method: string, path: string, status: number, duration: number, data?: Record<string, unknown>) {
      const level: LogLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
      if (shouldLog(level)) {
        output(createLogEntry(level, `${method} ${path} ${status} ${duration}ms`, context, data));
      }
    },

    /**
     * Log database query
     */
    query(operation: string, table: string, duration: number, data?: Record<string, unknown>) {
      if (shouldLog('debug')) {
        output(createLogEntry('debug', `DB ${operation} on ${table} (${duration}ms)`, context, data));
      }
    },

    /**
     * Create a child logger with additional context
     */
    child(childContext: string) {
      const newContext = context ? `${context}:${childContext}` : childContext;
      return createLogger(newContext);
    },
  };
}

// Default logger instance
export const logger = createLogger();

// Export convenience methods
export const { debug, info, warn, error } = logger;
