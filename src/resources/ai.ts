import type { BooHttp } from "../http/boo-http.js";
import type { AiSocialPayload, AiSocialResponse } from "../models.js";

export class AiResource {
  constructor(private readonly http: BooHttp) {}

  social(body: AiSocialPayload): Promise<AiSocialResponse> {
    return this.http.request("PUT", "/v1/ai/social", { body });
  }
}
