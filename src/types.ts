import type { Logger } from "./logger.js";

export interface TokenSession {
  idToken: string;
  refreshToken: string;
  expiresAt: number;
  email?: string;
  localId?: string;
}

export interface TokenStore {
  load(): Promise<TokenSession | null>;
  save(session: TokenSession): Promise<void>;
  clear?(): Promise<void>;
}

export interface BooClientOptions {
  deviceId?: string;
  appsflyerId?: string;
  appVersion?: string;
  continueUrl?: string;
  firebaseApiKey?: string;
  firebaseApiKeyCapture?: string;
  /** Emit `[logs]` lines for requests/responses */
  debugLogs?: boolean;
  /** Emit `[error]` lines on failures (default true) */
  logErrors?: boolean;
  tokenStore?: TokenStore;
  email?: string;
}

export interface RequestOptions {
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
}

export class BooApiError extends Error {
  readonly status: number;
  readonly path: string;
  readonly body: unknown;

  constructor(message: string, status: number, path: string, body: unknown) {
    super(message);
    this.name = "BooApiError";
    this.status = status;
    this.path = path;
    this.body = body;
  }
}

export interface BooHttpContext {
  logger: Logger;
  getSession: () => TokenSession | null;
  ensureFreshToken: () => Promise<void>;
  getApiBase: () => string;
}

export interface AppVisitorResponse {
  config: Record<string, boolean>;
  countryCode: string;
}

export type SignInInput =
  | string
  | { email: string; oobCode: string; apiKey?: string };
