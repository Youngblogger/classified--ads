type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
  source: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || 'info';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function buildEntry(level: LogLevel, source: string, message: string, context?: Record<string, any>): LogEntry {
  return {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
    source,
  };
}

function formatEntry(entry: LogEntry): string {
  const ctx = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
  return `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.source}] ${entry.message}${ctx}`;
}

// ── Centralized loggers ─────────────────────────────────

export function logDebug(source: string, message: string, context?: Record<string, any>): void {
  if (!shouldLog('debug')) return;
  const entry = buildEntry('debug', source, message, context);
  console.debug(formatEntry(entry));
}

export function logInfo(source: string, message: string, context?: Record<string, any>): void {
  if (!shouldLog('info')) return;
  const entry = buildEntry('info', source, message, context);
  console.info(formatEntry(entry));
}

export function logWarn(source: string, message: string, context?: Record<string, any>): void {
  if (!shouldLog('warn')) return;
  const entry = buildEntry('warn', source, message, context);
  console.warn(formatEntry(entry));
}

export function logError(source: string, message: string, context?: Record<string, any>): void {
  if (!shouldLog('error')) return;
  const entry = buildEntry('error', source, message, context);
  console.error(formatEntry(entry));
}

// ── Domain-specific loggers ────────────────────────────

export const listingLogger = {
  debug: (msg: string, ctx?: Record<string, any>) => logDebug('listing', msg, ctx),
  info: (msg: string, ctx?: Record<string, any>) => logInfo('listing', msg, ctx),
  warn: (msg: string, ctx?: Record<string, any>) => logWarn('listing', msg, ctx),
  error: (msg: string, ctx?: Record<string, any>) => logError('listing', msg, ctx),
};

export const syncLogger = {
  debug: (msg: string, ctx?: Record<string, any>) => logDebug('sync', msg, ctx),
  info: (msg: string, ctx?: Record<string, any>) => logInfo('sync', msg, ctx),
  warn: (msg: string, ctx?: Record<string, any>) => logWarn('sync', msg, ctx),
  error: (msg: string, ctx?: Record<string, any>) => logError('sync', msg, ctx),
};

export const realtimeLogger = {
  debug: (msg: string, ctx?: Record<string, any>) => logDebug('realtime', msg, ctx),
  info: (msg: string, ctx?: Record<string, any>) => logInfo('realtime', msg, ctx),
  warn: (msg: string, ctx?: Record<string, any>) => logWarn('realtime', msg, ctx),
  error: (msg: string, ctx?: Record<string, any>) => logError('realtime', msg, ctx),
};

export const cacheLogger = {
  debug: (msg: string, ctx?: Record<string, any>) => logDebug('cache', msg, ctx),
  info: (msg: string, ctx?: Record<string, any>) => logInfo('cache', msg, ctx),
  warn: (msg: string, ctx?: Record<string, any>) => logWarn('cache', msg, ctx),
  error: (msg: string, ctx?: Record<string, any>) => logError('cache', msg, ctx),
};

export const adminLogger = {
  debug: (msg: string, ctx?: Record<string, any>) => logDebug('admin', msg, ctx),
  info: (msg: string, ctx?: Record<string, any>) => logInfo('admin', msg, ctx),
  warn: (msg: string, ctx?: Record<string, any>) => logWarn('admin', msg, ctx),
  error: (msg: string, ctx?: Record<string, any>) => logError('admin', msg, ctx),
};
