import type { BooHttp } from "../http/boo-http.js";
import type { PusherAuthPayload, PusherAuthResponse } from "../models.js";

export class PusherResource {
  constructor(private readonly http: BooHttp) {}

  channelAuth(body: PusherAuthPayload): Promise<PusherAuthResponse> {
    const form = new URLSearchParams({
      socket_id: body.socket_id,
      channel_name: body.channel_name,
    });
    return this.http.request("POST", "/pusher/channel-auth", {
      body: form.toString(),
      headers: { "content-type": "application/x-www-form-urlencoded" },
    });
  }
}
