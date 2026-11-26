type LogLevel = 'info' | 'warn' | 'error';

function formatLog(tag: string, message: string): string {
  return `[${tag}] ${message}`;
}

function log(level: LogLevel, tag: string, message: string): void {
  const formatted = formatLog(tag, message);
  if (level === 'error') {
    console.error(formatted);
  } else if (level === 'warn') {
    console.warn(formatted);
  } else {
    console.log(formatted);
  }
}

export function logStart(tag: string, message: string): void {
  log('info', tag, `Starting ${message}...`);
}

export function logInfo(tag: string, message: string): void {
  log('info', tag, message);
}

export function logSuccess(tag: string, message: string): void {
  log('info', tag, `${message} successful`);
}

export function logComplete(tag: string, message: string): void {
  log('info', tag, `${message} completed`);
}

export function logWarn(tag: string, message: string): void {
  log('warn', tag, message);
}

export function logError(
  tag: string,
  message: string,
  opts?: { functionName?: string; reason?: string; stack?: string | undefined },
): void {
  log('error', tag, `ERROR: ${message}`);
  if (opts?.functionName) {
    log('error', tag, `Function: ${opts.functionName}`);
  }
  if (opts?.reason) {
    log('error', tag, `Reason: ${opts.reason}`);
  }
  if (opts?.stack) {
    log('error', tag, `Stack: ${opts.stack}`);
  }
}

export function logInput(tag: string, label: string, value: unknown): void {
  log('info', tag, `Input ${label}: ${String(value)}`);
}

export function logOutput(tag: string, label: string, value: unknown): void {
  log('info', tag, `Output ${label}: ${String(value)}`);
}
