import {
  API_BASE,
  DEFAULT_APPSFLYER_ID,
  DEFAULT_APP_VERSION,
  DEFAULT_CONTINUE_URL,
  DEFAULT_DEVICE_ID,
  FIREBASE_KEY_CAPTURE,
  FIREBASE_KEY_EMAIL,
  TOKEN_REFRESH_BUFFER_MS,
} from "./constants.js";
import {
  emailLinkSignin,
  getAccountInfo,
  getOobConfirmationCode,
  refreshIdToken,
  type FirebaseAuthConfig,
} from "./auth/firebase.js";
import { parseMagicLink } from "./auth/magic-link.js";
import { isSessionExpiringSoon, RefreshMutex } from "./auth/session.js";
import { MemoryTokenStore } from "./auth/token-store.js";
import { BooHttp } from "./http/boo-http.js";
import { createLogger } from "./logger.js";
import { AiResource } from "./resources/ai.js";
import { ChatResource } from "./resources/chat.js";
import { CommentResource } from "./resources/comment.js";
import { GroupDateResource } from "./resources/group-date.js";
import { InterestResource } from "./resources/interest.js";
import { MessageResource } from "./resources/message.js";
import { ProfileViewResource } from "./resources/profile-view.js";
import { PusherResource } from "./resources/pusher.js";
import { QuestionResource } from "./resources/question.js";
import { UserResource } from "./resources/user.js";
import { WebResource } from "./resources/web.js";
import type {
  BooClientOptions,
  RequestOptions,
  SignInInput,
  TokenSession,
} from "./types.js";

export class BooClient {
  readonly web: WebResource;
  readonly user: UserResource;
  readonly chat: ChatResource;
  readonly message: MessageResource;
  readonly question: QuestionResource;
  readonly comment: CommentResource;
  readonly interest: InterestResource;
  readonly groupDate: GroupDateResource;
  readonly profileView: ProfileViewResource;
  readonly ai: AiResource;
  readonly pusher: PusherResource;

  private session: TokenSession | null = null;
  private readonly refreshMutex = new RefreshMutex();
  private readonly logger;
  private readonly http: BooHttp;
  private readonly firebaseConfig: FirebaseAuthConfig;
  private readonly tokenStore;

  readonly deviceId: string;
  readonly appsflyerId: string;
  readonly appVersion: string;
  readonly continueUrl: string;
  email?: string;

  constructor(options: BooClientOptions = {}) {
    this.deviceId = options.deviceId ?? DEFAULT_DEVICE_ID;
    this.appsflyerId = options.appsflyerId ?? DEFAULT_APPSFLYER_ID;
    this.appVersion = options.appVersion ?? DEFAULT_APP_VERSION;
    this.continueUrl = options.continueUrl ?? DEFAULT_CONTINUE_URL;
    this.email = options.email;
    this.tokenStore = options.tokenStore ?? new MemoryTokenStore();
    this.logger = createLogger(
      options.debugLogs ?? false,
      options.logErrors ?? true,
    );
    this.firebaseConfig = {
      firebaseApiKey: options.firebaseApiKey ?? FIREBASE_KEY_EMAIL,
      firebaseApiKeyCapture: options.firebaseApiKeyCapture ?? FIREBASE_KEY_CAPTURE,
      logger: this.logger,
    };

    this.http = new BooHttp({
      apiBase: API_BASE,
      logger: this.logger,
      getSession: () => this.session,
      ensureFreshToken: () => this.ensureFreshToken(),
    });

    const deviceCtx = () => ({
      deviceId: this.deviceId,
      appsflyerId: this.appsflyerId,
      appVersion: this.appVersion,
      continueUrl: this.continueUrl,
      email: this.email,
    });

    this.web = new WebResource(this.http, deviceCtx);
    this.user = new UserResource(this.http);
    this.chat = new ChatResource(this.http);
    this.message = new MessageResource(this.http);
    this.question = new QuestionResource(this.http);
    this.comment = new CommentResource(this.http);
    this.interest = new InterestResource(this.http);
    this.groupDate = new GroupDateResource(this.http);
    this.profileView = new ProfileViewResource(this.http);
    this.ai = new AiResource(this.http);
    this.pusher = new PusherResource(this.http);
  }

  async loadSession(): Promise<boolean> {
    const loaded = await this.tokenStore.load();
    if (loaded) {
      this.session = loaded;
      return true;
    }
    return false;
  }

  getSession(): TokenSession | null {
    return this.session;
  }

  isAuthenticated(): boolean {
    return Boolean(this.session?.idToken);
  }

  async setSession(session: TokenSession): Promise<void> {
    this.session = session;
    await this.tokenStore.save(session);
  }

  async refreshSession(): Promise<TokenSession> {
    if (!this.session?.refreshToken) {
      throw new Error("No refresh token available");
    }
    const next = await refreshIdToken(
      this.firebaseConfig,
      this.session.refreshToken,
    );
    this.session = {
      ...next,
      email: next.email ?? this.session.email,
      localId: next.localId ?? this.session.localId,
    };
    await this.tokenStore.save(this.session);
    return this.session;
  }

  async ensureFreshToken(): Promise<void> {
    if (!this.session) return;
    if (!isSessionExpiringSoon(this.session, TOKEN_REFRESH_BUFFER_MS)) {
      return;
    }
    await this.refreshMutex.runExclusive(async () => {
      if (
        !this.session ||
        !isSessionExpiringSoon(this.session, TOKEN_REFRESH_BUFFER_MS)
      ) {
        return;
      }
      await this.refreshSession();
    });
  }

  async requestMagicLink(email: string): Promise<void> {
    this.email = email;
    await this.web.appVisitor(true);
    const allowed = await this.web.isAuthAllowed(email);
    if (!allowed.allowed) {
      throw new Error("isAuthAllowed returned false");
    }
    const login = await this.web.emailLogin(email);
    if (!login.allowed) {
      throw new Error("emailLogin returned false");
    }
    if (login.useLegacy) {
      await getOobConfirmationCode(
        this.firebaseConfig,
        email,
        this.continueUrl,
      );
    }
  }

  async signInWithMagicLink(
    input: SignInInput,
    options: { initApp?: boolean; skipPreAuth?: boolean } = {},
  ): Promise<TokenSession> {
    let email = this.email;
    let oobCode: string;
    let apiKey: string | undefined;

    if (typeof input === "string") {
      const parsed = parseMagicLink(input);
      oobCode = parsed.oobCode;
      apiKey = parsed.apiKey;
      email = this.email;
      if (!email) {
        throw new Error(
          "Pass BooClient({ email }) or signInWithMagicLink({ email, oobCode })",
        );
      }
    } else {
      email = input.email;
      oobCode = input.oobCode;
      apiKey = input.apiKey;
    }
    this.email = email;

    if (!options.skipPreAuth) {
      await this.web.appVisitor(true);
    }

    const session = await emailLinkSignin(
      this.firebaseConfig,
      email,
      oobCode,
      apiKey,
    );
    await this.setSession(session);

    await getAccountInfo(
      this.firebaseConfig,
      session.idToken,
      apiKey ?? this.firebaseConfig.firebaseApiKey,
    );

    if (options.initApp !== false) {
      await this.initAppFromVisitor();
    }

    return session;
  }

  private async initAppFromVisitor() {
    return this.user.initApp({
      appVersion: this.appVersion,
      timezone: "Asia/Calcutta",
      locale: "en",
      countryLocale: "en_GB",
      deviceSize: "l",
      os: "android",
      osVersion: "13",
      phoneModel: "Subsystem for Android(TM)",
      deviceId: this.deviceId,
      isPhysicalDevice: true,
      deviceLanguage: "en",
      jailbroken: false,
      advertisingId: "00000000-0000-0000-0000-000000000000",
      androidVersion: 13,
      appsflyer_id: this.appsflyerId,
      isAppStart: false,
    });
  }

  request<T>(
    method: string,
    path: string,
    options?: RequestOptions,
  ): Promise<T> {
    return this.http.request<T>(method, path, options);
  }
}
