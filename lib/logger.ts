// Centralized logging utility with trace IDs and debug levels
import { useCallback, useMemo } from 'react';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  traceId: string;
  component: string;
  level: LogLevel;
  message: string;
  timestamp: number;
  data?: any;
}

class Logger {
  private traceId: string;
  private component: string;
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  constructor(component: string, traceId?: string) {
    this.component = component;
    this.traceId = traceId || this.generateTraceId();
  }

  private generateTraceId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private log(level: LogLevel, message: string, data?: any): void {
    const entry: LogEntry = {
      traceId: this.traceId,
      component: this.component,
      level,
      message,
      timestamp: Date.now(),
      data,
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Console output with formatting
    const formattedMessage = `[${entry.traceId}][${entry.component}][${level}] ${message}`;
    
    switch (level) {
      case 'DEBUG':
        console.debug(formattedMessage, data || '');
        break;
      case 'INFO':
        console.info(formattedMessage, data || '');
        break;
      case 'WARN':
        console.warn(formattedMessage, data || '');
        break;
      case 'ERROR':
        console.error(formattedMessage, data || '');
        break;
    }
  }

  debug(message: string, data?: any): void {
    this.log('DEBUG', message, data);
  }

  info(message: string, data?: any): void {
    this.log('INFO', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('WARN', message, data);
  }

  error(message: string, data?: any): void {
    this.log('ERROR', message, data);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getTraceId(): string {
    return this.traceId;
  }

  clearLogs(): void {
    this.logs = [];
  }
}

// Global logger instance for server-side use
let globalLogger: Logger | null = null;

export function createLogger(component: string, traceId?: string): Logger {
  return new Logger(component, traceId);
}

export function getGlobalLogger(): Logger {
  if (!globalLogger) {
    globalLogger = new Logger('GLOBAL');
  }
  return globalLogger;
}

export function setGlobalLogger(logger: Logger): void {
  globalLogger = logger;
}

// React hook for client-side logging
export function useLogger(component: string, traceId?: string) {
  const logger = useMemo(() => createLogger(component, traceId), [component, traceId]);
  
  const logDebug = useCallback((message: string, data?: any) => {
    logger.debug(message, data);
  }, [logger]);

  const logInfo = useCallback((message: string, data?: any) => {
    logger.info(message, data);
  }, [logger]);

  const logWarn = useCallback((message: string, data?: any) => {
    logger.warn(message, data);
  }, [logger]);

  const logError = useCallback((message: string, data?: any) => {
    logger.error(message, data);
  }, [logger]);

  return {
    debug: logDebug,
    info: logInfo,
    warn: logWarn,
    error: logError,
    getLogs: logger.getLogs.bind(logger),
    getTraceId: logger.getTraceId.bind(logger),
    clearLogs: logger.clearLogs.bind(logger),
  };
}

// Utility to extract trace ID from request headers
export function getTraceIdFromHeaders(headers: Headers): string | undefined {
  return headers.get('x-trace-id') || undefined;
}

// Utility to create trace ID for new requests
export function createTraceId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
