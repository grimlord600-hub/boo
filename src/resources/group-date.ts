import type { BooHttp } from "../http/boo-http.js";
import type {
  CreateGroupPayload,
  DeleteGroupPayload,
  GroupResponse,
} from "../models.js";

export class GroupDateResource {
  constructor(private readonly http: BooHttp) {}

  getGroup(groupId: string): Promise<GroupResponse> {
    return this.http.request("GET", "/v1/group-date/group", {
      query: { groupId },
    });
  }

  createGroup(body: CreateGroupPayload): Promise<GroupResponse> {
    return this.http.request("POST", "/v1/group-date/groups", { body });
  }

  deleteGroup(body: DeleteGroupPayload): Promise<Record<string, never>> {
    return this.http.request("DELETE", "/v1/group-date/group", { body });
  }
}
