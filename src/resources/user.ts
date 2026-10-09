import type { BooHttp } from "../http/boo-http.js";
import type {
  DailyProfilesResponse,
  DiscoverResponse,
  EventsPayload,
  InitAppPayload,
  InitAppResponse,
  InterestsPayload,
  KarmaResponse,
  PassPayload,
  PreferencesPayload,
  PreferencesResponse,
  ProfileDetailsResponse,
  ProfileResponse,
  SendLikePayload,
  SwipeResponse,
} from "../models.js";

export class UserResource {
  constructor(private readonly http: BooHttp) {}

  initApp(body: InitAppPayload): Promise<InitAppResponse> {
    return this.http.request("PUT", "/v1/user/initApp", { body });
  }

  discover(): Promise<DiscoverResponse> {
    return this.http.request("GET", "/v1/user/discover");
  }

  dailyProfiles(): Promise<DailyProfilesResponse> {
    return this.http.request("GET", "/v1/user/dailyProfiles");
  }

  profile(user: string, from = "none"): Promise<ProfileResponse> {
    return this.http.request("GET", "/v1/user/profile", {
      query: { user, from },
    });
  }

  profileDetails(user: string, from = "universe"): Promise<ProfileDetailsResponse> {
    return this.http.request("GET", "/v1/user/profileDetails", {
      query: { user, from },
    });
  }

  sendLike(body: SendLikePayload): Promise<SwipeResponse> {
    return this.http.request("PATCH", "/v1/user/sendLike", { body });
  }

  pass(body: PassPayload): Promise<SwipeResponse> {
    return this.http.request("PATCH", "/v1/user/pass", { body });
  }

  profileView(user: string, source: string): Promise<Record<string, never>> {
    return this.http.request("PATCH", "/v1/user/profileView", {
      query: { user, source },
    });
  }

  events(body: EventsPayload): Promise<Record<string, never>> {
    return this.http.request("PATCH", "/v1/user/events", { body });
  }

  preferences(body: PreferencesPayload): Promise<PreferencesResponse> {
    return this.http.request("PATCH", "/v1/user/preferences", { body });
  }

  interests(body: InterestsPayload): Promise<Record<string, never>> {
    return this.http.request("PUT", "/v1/user/interests", { body });
  }

  karma(): Promise<KarmaResponse> {
    return this.http.request("GET", "/v1/user/karma");
  }
}
