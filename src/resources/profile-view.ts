import type { BooHttp } from "../http/boo-http.js";
import type {
  ProfilesIViewedResponse,
  ProfileViewsResponse,
} from "../models.js";

export class ProfileViewResource {
  constructor(private readonly http: BooHttp) {}

  list(beforeDate?: string): Promise<ProfileViewsResponse> {
    return this.http.request("GET", "/v1/profile-view", {
      query: beforeDate ? { beforeDate } : undefined,
    });
  }

  profilesIViewed(): Promise<ProfilesIViewedResponse> {
    return this.http.request("GET", "/v1/profile-view/profiles-i-viewed");
  }
}
