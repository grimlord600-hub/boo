import type { BooHttp } from "../http/boo-http.js";
import type { AppVisitorResponse } from "../types.js";

export class WebResource {
  constructor(
    private readonly http: BooHttp,
    private readonly getDeviceContext: () => {
      deviceId: string;
      appsflyerId: string;
      appVersion: string;
      continueUrl: string;
      email?: string;
    },
  ) {}

  appVisitor(isFirstLaunch = true): Promise<AppVisitorResponse> {
    const ctx = this.getDeviceContext();
    return this.http.request<AppVisitorResponse>("PUT", "/web/appVisitor", {
      auth: false,
      body: {
        appVersion: ctx.appVersion,
        deviceId: ctx.deviceId,
        locale: "en",
        appsflyer: {
          status: "success",
          payload: {
            install_time: new Date().toISOString().replace("T", " ").slice(0, 23),
            af_message: "organic install",
            af_status: "Organic",
            is_first_launch: isFirstLaunch,
          },
        },
        appsflyer_id: ctx.appsflyerId,
      },
    });
  }

  isAuthAllowed(email: string): Promise<{ allowed: boolean }> {
    const ctx = this.getDeviceContext();
    return this.http.request("PUT", "/web/isAuthAllowed", {
      auth: false,
      body: { email, deviceId: ctx.deviceId },
    });
  }

  emailLogin(email: string): Promise<{ allowed: boolean; useLegacy?: boolean }> {
    const ctx = this.getDeviceContext();
    return this.http.request("PUT", "/web/emailLogin", {
      auth: false,
      body: {
        email,
        deviceId: ctx.deviceId,
        appVersion: ctx.appVersion,
        platform: "android",
        continueUrl: ctx.continueUrl,
      },
    });
  }
}
