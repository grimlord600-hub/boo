export interface Logger {
  debug: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

export function createLogger(debugLogs: boolean, logErrors: boolean): Logger {
  return {
    debug(...args: unknown[]) {
      if (debugLogs) {
        console.log("[logs]", ...args.map(sanitizeForLog));
      }
    },
    error(...args: unknown[]) {
      if (logErrors) {
        console.error("[error]", ...args.map(sanitizeForLog));
      }
    },
  };
}

function sanitizeForLog(value: unknown): unknown {
  if (typeof value === "string") {
    if (value.length > 80 && value.includes(".")) {
      return `${value.slice(0, 40)}…${value.slice(-20)}`;
    }
    return value;
  }
  if (value && typeof value === "object") {
    try {
      const s = JSON.stringify(value);
      if (s.length > 500) {
        return `${s.slice(0, 500)}…`;
      }
    } catch {
      return value;
    }
  }
  return value;
}
