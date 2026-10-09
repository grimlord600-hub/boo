import {
  FIREBASE_HEADERS,
  FIREBASE_IDENTITY_BASE,
  FIREBASE_SECURE_TOKEN_BASE,
} from "../constants.js";
import type { Logger } from "../logger.js";
import { sessionFromFirebaseSignIn } from "./session.js";
import type { TokenSession } from "../types.js";

export interface FirebaseAuthConfig {
  firebaseApiKey: string;
  firebaseApiKeyCapture?: string;
  logger: Logger;
}

export async function emailLinkSignin(
  config: FirebaseAuthConfig,
  email: string,
  oobCode: string,
  preferredKey?: string,
): Promise<TokenSession> {
  const keys = [
    preferredKey ?? config.firebaseApiKey,
    config.firebaseApiKeyCapture,
    config.firebaseApiKey,
  ].filter((k, i, a) => k && a.indexOf(k) === i) as string[];

  let lastError: unknown;
  for (const key of keys) {
    const url = `${FIREBASE_IDENTITY_BASE}/emailLinkSignin?key=${key}`;
    const res = await fetch(url, {
      method: "POST",
      headers: FIREBASE_HEADERS,
      body: JSON.stringify({ email, oobCode }),
    });
    const text = await res.text();
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text) as Record<string, unknown>;
    } catch {
      data = { raw: text };
    }
    config.logger.debug("Firebase emailLinkSignin", res.status, { email, key });
    if (res.ok) {
      const idToken = data.idToken as string;
      const refreshToken = data.refreshToken as string;
      if (!idToken || !refreshToken) {
        throw new Error("emailLinkSignin missing tokens");
      }
      return sessionFromFirebaseSignIn(
        idToken,
        refreshToken,
        data.expiresIn as string | number | undefined,
        (data.email as string) ?? email,
        data.localId as string | undefined,
      );
    }
    lastError = data;
  }
  config.logger.error("Firebase emailLinkSignin failed", lastError);
  throw new Error(
    `emailLinkSignin failed: ${JSON.stringify(lastError).slice(0, 200)}`,
  );
}

export async function getOobConfirmationCode(
  config: FirebaseAuthConfig,
  email: string,
  continueUrl: string,
): Promise<void> {
  const url = `${FIREBASE_IDENTITY_BASE}/getOobConfirmationCode?key=${config.firebaseApiKey}`;
  const body = {
    requestType: "EMAIL_SIGNIN",
    email,
    continueUrl,
    canHandleCodeInApp: true,
    androidPackageName: "enterprises.dating.boo",
    androidInstallApp: true,
  };
  const res = await fetch(url, {
    method: "POST",
    headers: FIREBASE_HEADERS,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  config.logger.debug("Firebase getOobConfirmationCode", res.status, { email });
  if (!res.ok) {
    config.logger.error("getOobConfirmationCode failed", text);
    throw new Error(`getOobConfirmationCode failed: ${res.status} ${text}`);
  }
}

export async function getAccountInfo(
  config: FirebaseAuthConfig,
  idToken: string,
  apiKey: string,
): Promise<unknown> {
  const url = `${FIREBASE_IDENTITY_BASE}/getAccountInfo?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: FIREBASE_HEADERS,
    body: JSON.stringify({ idToken }),
  });
  const data = await res.json();
  if (!res.ok) {
    config.logger.error("getAccountInfo failed", data);
    throw new Error(`getAccountInfo failed: ${res.status}`);
  }
  return data;
}

export interface RefreshTokenResponse {
  id_token: string;
  refresh_token: string;
  expires_in: string;
  token_type: string;
  user_id: string;
}

export async function refreshIdToken(
  config: FirebaseAuthConfig,
  refreshToken: string,
): Promise<TokenSession> {
  const url = `${FIREBASE_SECURE_TOKEN_BASE}?key=${config.firebaseApiKey}`;
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const text = await res.text();
  let data: RefreshTokenResponse & { error?: { message: string } };
  try {
    data = JSON.parse(text) as RefreshTokenResponse & {
      error?: { message: string };
    };
  } catch {
    config.logger.error("refresh token parse error", text);
    throw new Error("Invalid refresh token response");
  }
  config.logger.debug("Firebase refresh token", res.status);
  if (!res.ok) {
    config.logger.error("refresh token failed", data);
    throw new Error(
      data.error?.message ?? `refresh failed: ${res.status} ${text}`,
    );
  }
  return sessionFromFirebaseSignIn(
    data.id_token,
    data.refresh_token,
    data.expires_in,
    undefined,
    data.user_id,
  );
}
