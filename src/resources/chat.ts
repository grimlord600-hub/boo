import type { BooHttp } from "../http/boo-http.js";
import type { ChatListResponse } from "../models.js";

export class ChatResource {
  constructor(private readonly http: BooHttp) {}

  notMessaged(): Promise<ChatListResponse> {
    return this.http.request("GET", "/v1/chat/notMessaged");
  }

  pending(): Promise<ChatListResponse> {
    return this.http.request("GET", "/v1/chat/pending");
  }

  sortMessages(sort = "recent"): Promise<ChatListResponse> {
    return this.http.request("GET", "/v1/chat/sortMessages", {
      query: { sort },
    });
  }
}
