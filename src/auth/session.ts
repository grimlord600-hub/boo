import type { TokenSession } from "../types.js";

export function jwtExpiresAtMs(idToken: string): number | null {
  const parts = idToken.split(".");
  if (parts.length < 2) return null;
  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(
      Buffer.from(b64, "base64").toString("utf8"),
    ) as { exp?: number };
    if (typeof payload.exp === "number") {
      return payload.exp * 1000;
    }
  } catch {
    return null;
  }
  return null;
}

export function sessionFromFirebaseSignIn(
  idToken: string,
  refreshToken: string,
  expiresInSeconds?: number | string,
  email?: string,
  localId?: string,
): TokenSession {
  let expiresAt =
    jwtExpiresAtMs(idToken) ??
    Date.now() + Number(expiresInSeconds ?? 3600) * 1000;
  const parsedExp = jwtExpiresAtMs(idToken);
  if (parsedExp) {
    expiresAt = parsedExp;
  }
  return {
    idToken,
    refreshToken,
    expiresAt,
    email,
    localId,
  };
}

export function isSessionExpiringSoon(
  session: TokenSession,
  bufferMs: number,
): boolean {
  return Date.now() >= session.expiresAt - bufferMs;
}

/** Single-flight refresh lock */
export class RefreshMutex {
  private inFlight: Promise<void> | null = null;

  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.inFlight) {
      await this.inFlight;
      return fn();
    }
    const promise = fn().finally(() => {
      this.inFlight = null;
    });
    this.inFlight = promise.then(
      () => undefined,
      () => undefined,
    );
    return promise;
  }

  async runExclusive(fn: () => Promise<void>): Promise<void> {
    while (this.inFlight) {
      await this.inFlight;
    }
    const job = fn().finally(() => {
      this.inFlight = null;
    });
    this.inFlight = job.then(
      () => undefined,
      () => undefined,
    );
    await job;
  }
}
