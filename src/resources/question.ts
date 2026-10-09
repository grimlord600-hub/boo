import type { BooHttp } from "../http/boo-http.js";
import type {
  AwardQuestionPayload,
  CreateQuestionPayload,
  EditQuestionPayload,
  LikeQuestionPayload,
  Question,
  QuestionImagesResponse,
  QuestionsResponse,
  QuestionViewDataPayload,
} from "../models.js";

export class QuestionResource {
  constructor(private readonly http: BooHttp) {}

  allQuestions(params: {
    interestName: string;
    sort?: string;
    language?: string;
  }): Promise<QuestionsResponse> {
    return this.http.request("GET", "/v1/question/allQuestions", {
      query: params,
    });
  }

  create(body: CreateQuestionPayload): Promise<Question> {
    return this.http.request("POST", "/v1/question", { body });
  }

  like(body: LikeQuestionPayload): Promise<Record<string, never>> {
    return this.http.request("PATCH", "/v1/question/like", { body });
  }

  edit(body: EditQuestionPayload): Promise<Record<string, never>> {
    return this.http.request("PATCH", "/v1/question/edit", { body });
  }

  award(body: AwardQuestionPayload): Promise<Record<string, never>> {
    return this.http.request("POST", "/v1/question/award", { body });
  }

  uploadImages(questionId: string, body?: unknown): Promise<QuestionImagesResponse> {
    return this.http.request("POST", "/v1/question/images", {
      query: { questionId },
      body,
    });
  }

  putViewData(body: QuestionViewDataPayload): Promise<Record<string, never>> {
    return this.http.request("PUT", "/v1/question-view-data", { body });
  }
}
