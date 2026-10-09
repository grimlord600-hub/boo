import type { BooHttp } from "../http/boo-http.js";
import type {
  ChatMessage,
  SeenMessagePayload,
  SendMessagePayload,
} from "../models.js";

export class MessageResource {
  constructor(private readonly http: BooHttp) {}

  getMessages(params: {
    user?: string;
    chatId: string;
    quotedMessageId?: string;
  }): Promise<ChatMessage[]> {
    return this.http.request("GET", "/v1/message", { query: params });
  }

  sendMessage(body: SendMessagePayload): Promise<ChatMessage> {
    return this.http.request("POST", "/v1/message", { body });
  }

  seen(body: SeenMessagePayload): Promise<Record<string, never>> {
    return this.http.request("PUT", "/v1/message/seen", { body });
  }

  unsend(messageId: string): Promise<Record<string, never>> {
    return this.http.request("PATCH", "/v1/message/unsend", {
      query: { messageId },
    });
  }

  sendImage(params: {
    chatId: string;
    recipient: string;
    createdAt: string;
  }): Promise<ChatMessage> {
    return this.http.request("POST", "/v1/message/image", { query: params });
  }
}
