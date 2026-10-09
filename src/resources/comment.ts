import type { BooHttp } from "../http/boo-http.js";
import type { Comment, CommentsResponse, CreateCommentPayload } from "../models.js";

export class CommentResource {
  constructor(private readonly http: BooHttp) {}

  listV2(params: {
    questionId: string;
    parentId?: string;
    sort?: string;
    beforeId?: string;
  }): Promise<CommentsResponse> {
    return this.http.request("GET", "/v1/comment/v2", {
      query: {
        questionId: params.questionId,
        parentId: params.parentId ?? "",
        sort: params.sort ?? "popular",
        beforeId: params.beforeId ?? "",
      },
    });
  }

  create(body: CreateCommentPayload): Promise<Comment> {
    return this.http.request("POST", "/v1/comment", { body });
  }
}
