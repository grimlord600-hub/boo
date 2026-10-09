import type { BooHttp } from "../http/boo-http.js";
import type {
  ActiveUsersResponse,
  InterestResponse,
  PopularInterestsResponse,
  TopRankedUsersResponse,
} from "../models.js";

export class InterestResource {
  constructor(private readonly http: BooHttp) {}

  popular(before = ""): Promise<PopularInterestsResponse> {
    return this.http.request("GET", "/v1/interest/popular", {
      query: { before },
    });
  }

  byName(name: string): Promise<InterestResponse> {
    return this.http.request("GET", "/v1/interest", { query: { name } });
  }

  activeUsers(
    params: Record<string, string | number | undefined>,
  ): Promise<ActiveUsersResponse> {
    return this.http.request("GET", "/v1/interest/activeUsers", {
      query: params,
    });
  }

  users(interestName: string): Promise<ActiveUsersResponse> {
    return this.http.request("GET", "/v1/interest/users", {
      query: { interestName },
    });
  }

  topRankedUsers(
    interestName: string,
    language = "en",
  ): Promise<TopRankedUsersResponse> {
    return this.http.request("GET", "/v1/interest/topRankedUsers", {
      query: { interestName, language },
    });
  }
}
