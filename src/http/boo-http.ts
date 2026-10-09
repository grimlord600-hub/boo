import { CookieJar } from "tough-cookie";
import { BOO_JSON_HEADERS } from "../constants.js";
import { BooApiError } from "../types.js";
import type { Logger } from "../logger.js";
import type { RequestOptions, TokenSession } from "../types.js";

function buildQuery(
  query?: Record<string, string | number | boolean | undefined | null>,
): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null) {
      params.set(k, String(v));
    }
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

export interface BooHttpDeps {
  apiBase: string;
  logger: Logger;
  getSession: () => TokenSession | null;
  ensureFreshToken: () => Promise<void>;
}

export class BooHttp {
  private readonly jar = new CookieJar();

  constructor(private readonly deps: BooHttpDeps) {}

  async request<T>(
    method: string,
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const auth = options.auth !== false;
    if (auth) {
      await this.deps.ensureFreshToken();
    }

    const url = `${this.deps.apiBase}${path}${buildQuery(options.query)}`;
    return this.execute<T>(method, url, path, options, auth, false);
  }

  private async execute<T>(
    method: string,
    url: string,
    path: string,
    options: RequestOptions,
    auth: boolean,
    isRetry: boolean,
  ): Promise<T> {
    const headers: Record<string, string> = {
      ...BOO_JSON_HEADERS,
      ...options.headers,
    };
    const cookie = await this.jar.getCookieString(url);
    if (cookie) {
      headers.cookie = cookie;
    }
    if (auth) {
      const session = this.deps.getSession();
      if (!session?.idToken) {
        throw new BooApiError("Not authenticated", 401, path, null);
      }
      headers.authorization = session.idToken;
    }

    const init: RequestInit = {
      method,
      headers,
    };
    if (options.body !== undefined && method !== "GET" && method !== "HEAD") {
      init.body =
        typeof options.body === "string"
          ? options.body
          : JSON.stringify(options.body);
    }

    this.deps.logger.debug(method, path, options.body);

    const res = await fetch(url, init);
    await this.storeCookies(url, res.headers);

    const text = await res.text();
    let body: unknown = text;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    } else {
      body = null;
    }

    this.deps.logger.debug(method, path, "->", res.status, body);

    if (res.status === 401 && auth && !isRetry) {
      await this.deps.ensureFreshToken();
      return this.execute<T>(method, url, path, options, auth, true);
    }

    if (!res.ok) {
      this.deps.logger.error(method, path, res.status, body);
      throw new BooApiError(
        `HTTP ${res.status} ${method} ${path}`,
        res.status,
        path,
        body,
      );
    }

    return body as T;
  }

  private async storeCookies(url: string, headers: Headers): Promise<void> {
    const getSetCookie = (
      headers as Headers & { getSetCookie?: () => string[] }
    ).getSetCookie?.bind(headers);
    const cookies = getSetCookie?.() ?? [];
    if (cookies.length === 0) {
      const single = headers.get("set-cookie");
      if (single) cookies.push(single);
    }
    for (const c of cookies) {
      await this.jar.setCookie(c, url);
    }
  }
}
