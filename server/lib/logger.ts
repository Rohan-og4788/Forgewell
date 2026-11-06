import { env } from '../config/env.ts';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITIES: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private minLevel: LogLevel = env.NODE_ENV === 'production' ? 'info' : 'debug';

  private formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const timestamp = new Date().toISOString();
    if (env.NODE_ENV === 'production') {
      return JSON.stringify({
        timestamp,
        level: level.toUpperCase(),
        message,
        ...context,
      });
    }

    const contextStr = context && Object.keys(context).length > 0 ? ` ${JSON.stringify(context)}` : '';
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    return `${prefix} ${message}${contextStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return LEVEL_PRIORITIES[level] >= LEVEL_PRIORITIES[this.minLevel];
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: Record<string, unknown>) {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: Record<string, unknown>) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    if (this.shouldLog('error')) {
      const errContext = {
        ...context,
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      };
      console.error(this.formatMessage('error', message, errContext));
    }
  }
}

export const logger = new Logger();
