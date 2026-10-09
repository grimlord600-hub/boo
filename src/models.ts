/** Request and response shapes from Ghost Collector body audit (2026-10-09). Large list items are typed from the first captured object. */

export interface Personality {
  mbti?: string;
  avatar?: string;
  EI?: number;
  NS?: number;
  FT?: number;
  JP?: number;
}

export interface Prompt {
  id: string;
  answer: string;
}

export interface InterestSummary {
  _id: string;
  name: string;
  interest: string;
  numFollowers?: number;
  category?: string;
  allowImages?: boolean;
  numQuestions?: number;
  numQuestionsPerLanguage?: Record<string, number>;
  similar?: string[];
}

export interface ProfilePreview {
  _id: string;
  firstName?: string;
  picture?: string;
  pictures?: string[];
  profilePicture?: string;
  personality?: Personality;
  gender?: string;
  age?: number;
  horoscope?: string | null;
  handle?: string;
  verified?: boolean;
  karma?: number;
  enneagram?: string;
  description?: string;
  education?: string;
  crown?: boolean;
  interests?: InterestSummary[];
  verificationStatus?: string;
}

export interface ProfileCard extends ProfilePreview {
  ethnicities?: string[];
  moreAboutUser?: Record<string, string> | null;
  prompts?: Prompt[];
  location?: string;
  teleport?: boolean;
  preferences?: { purpose?: string[] };
  hideQuestions?: boolean;
  hideComments?: boolean;
  work?: string;
}

export interface ChatMessage {
  _id: string;
  createdAt: string;
  chat?: string;
  sender: string;
  text?: string;
  image?: string;
  reactions: unknown[];
  __v?: number;
  aspectRatio?: number;
}

export interface ChatSummary {
  _id: string;
  createdAt: string;
  users: ProfilePreview[];
  user?: ProfilePreview;
  lastMessage?: ChatMessage;
  lastMessageTime?: string;
  numMessages?: number;
  numUnreadMessages?: number;
  pendingUser?: string | null;
  muted?: boolean;
  dndMessage?: boolean;
  dndPost?: boolean;
  noreply?: boolean;
  yourTurn?: boolean;
}

export interface ChatListResponse {
  chats: ChatSummary[];
  paginationToken?: string | null;
}

export interface DiscoverResponse {
  topPicksDating: ProfileCard[];
}

export interface DailyProfilesResponse {
  profiles: ProfileCard[];
}

export interface ProfileResponse {
  user: ProfileCard;
}

export interface ProfileDetails {
  hideFollowButton: boolean;
  allowIncomingRequests: boolean;
  followRequestApproved: boolean | null;
  isMatched: boolean;
  isChatExpired: boolean;
  dndPost: boolean;
  dndMessage: boolean;
  stories: unknown[];
  allPictures: string[];
}

export interface ProfileDetailsResponse {
  user: ProfileDetails;
}

export interface InitAppPayload {
  appVersion: string;
  timezone: string;
  locale: string;
  countryLocale: string;
  deviceSize: string;
  os: string;
  osVersion: string;
  phoneModel: string;
  deviceId: string;
  isPhysicalDevice: boolean;
  deviceLanguage: string;
  jailbroken: boolean;
  advertisingId: string;
  androidVersion: number;
  appsflyer_id: string;
  isAppStart: boolean;
}

export interface InitAppResponse {
  user: Record<string, unknown> & {
    _id: string;
    email?: string;
    firstName?: string;
    preferences?: PreferencesResponse;
  };
}

export interface PassPayload {
  user: string;
}

export interface SendLikePayload {
  user: string;
  source: string;
}

export interface SwipeResponse {
  numSwipesRemaining: number;
}

export interface EventsPayload {
  [eventName: string]: boolean;
}

export interface PreferencesPayload {
  personality: string[];
  gender: string[];
  distance: number;
  minAge: number;
  maxAge: number;
  purpose: string[];
  dating: string[];
  friends: string[];
  local: boolean;
  global: boolean;
  countries: string[];
  interests: unknown;
  enneagrams: string[];
  horoscopes: string[];
  interestNames: string[];
  languages: string[];
  keywords: string[];
  exercise: string[];
  educationLevel: string[];
  drinking: string[];
  smoking: string[];
  kids: string[];
  religion: string[];
  distance2: number;
  bioLength: number;
  sameCountryOnly: boolean;
  ethnicities: string[];
  minHeight: number;
  maxHeight: number;
  relationshipStatus: string[];
  datingSubPreferences: string[];
  showUsersOutsideMyRange: boolean;
  sexuality: string[];
  relationshipType: string[];
  showUnspecified: unknown;
  excludedInterestNames: string[];
  showSingpassVerifiedOnly: boolean;
}

export interface PreferencesResponse {
  showUnspecified?: Record<string, unknown>;
  minAge?: number;
  maxAge?: number;
  personality?: string[];
  dating?: string[];
  friends?: string[];
  showVerifiedOnly?: boolean;
  showUsersOutsideMyRange?: boolean;
  distance?: number | null;
  keywords?: string[];
  global?: boolean;
  local?: boolean;
  bioLength?: number;
  distance2?: number;
  drinking?: string[];
  educationLevel?: string[];
  enneagrams?: string[];
  excludedInterestNames?: string[];
  exercise?: string[];
  horoscopes?: string[];
  interestNames?: string[];
  kids?: string[];
  languages?: string[];
  maxHeight?: number;
  minHeight?: number;
  religion?: string[];
  sameCountryOnly?: boolean;
  smoking?: string[];
  showSingpassVerifiedOnly?: boolean;
}

export interface InterestsPayload {
  interestNames: string[];
}

export interface KarmaResponse {
  karma: number;
}

export interface SendMessagePayload {
  user: string;
  text: string;
  createdAt: string;
}

export interface SeenMessagePayload {
  user: string;
}

export interface QuestionImage {
  image: string;
  altText: string | null;
}

export interface QuestionImagesResponse {
  images: QuestionImage[];
}

export interface CreateQuestionPayload {
  interestName: string;
  title: string;
  text: string;
  gif: unknown;
  poll: unknown;
  checkLanguage: boolean;
  mentionedUsersTitle: string[];
  mentionedUsersText: string[];
  mediaUploadPending?: boolean;
  hashtags: string[];
  visibility: string;
  aspectRatio: number;
}

export interface EditQuestionPayload {
  questionId: string;
  title: string;
  text: string;
  gif: unknown;
  mentionedUsersTitle: string[];
  mentionedUsersText: string[];
  hashtags: string[];
  visibility: string;
  aspectRatio: number;
}

export interface LikeQuestionPayload {
  questionId: string;
}

export interface AwardQuestionPayload {
  postId: string;
  awardId: string;
  price: number;
  anonymous: boolean;
}

export interface QuestionViewIncrement {
  questionId: string;
  fieldsToIncrement: { numSecondsReadingOnFeed?: number };
}

export interface QuestionViewDataPayload {
  questions: QuestionViewIncrement[];
}

export interface Question {
  _id: string;
  webId?: string;
  createdAt?: string;
  title?: string;
  text?: string;
  interestName?: string;
  numComments?: number;
  numLikes?: number;
  images?: QuestionImage[];
  profilePreview?: ProfilePreview;
}

export interface QuestionsResponse {
  questions: Question[];
}

export interface CreateCommentPayload {
  createdAt: string;
  questionId: string;
  text: string;
  parentId: string;
  gif: unknown;
  mentionedUsersText: string[];
  checkLanguage: boolean;
}

export interface Comment {
  _id: string;
  createdAt: string;
  text: string;
  question?: string;
  parent?: string;
  numLikes?: number;
  numComments?: number;
  profilePreview?: ProfilePreview;
  language?: string;
}

export interface CommentsResponse {
  comments: Comment[];
  hasMore: boolean;
}

export interface AiSocialPayload {
  questionId: string;
  commentId: string;
  outputType: string;
  userInput: string;
  previousResponses: string[];
}

export interface AiSocialResponse {
  output: string[];
  numBooAINeurons: number;
}

export interface PopularInterestsResponse {
  interests: InterestSummary[];
}

export interface InterestResponse {
  noIndex: boolean;
  interest: InterestSummary;
  primaryInterest: string;
}

export interface ActiveUsersResponse {
  users: ProfilePreview[];
}

export interface RankedUser {
  rank: number;
  points: number;
  user: ProfilePreview;
}

export interface TopRankedUsersResponse {
  topRankedUsers: RankedUser[];
}

export interface GroupMember extends ProfileCard {}

export interface Group {
  _id: string;
  name: string;
  goal: string;
  lookingFor: string[];
  active: boolean;
  isCurrentGroup?: boolean;
  isAdmin?: boolean;
  inviteLinkToken?: string;
  numJoinedMembers?: number;
  numInvitedMembers?: number;
  invites?: unknown[];
  members?: GroupMember[];
}

export interface GroupResponse {
  group: Group;
}

export interface CreateGroupPayload {
  goal: string;
  lookingFor: string[];
}

export interface DeleteGroupPayload {
  groupId: string;
}

export interface ProfileViewEntry {
  createdAt: string;
  source?: string;
  user: ProfilePreview & {
    scores?: { likeRatio?: number };
    metrics?: { numActionsReceived?: number; lastSeen?: string };
    interestNames?: string[];
    tags?: string[];
  };
}

export interface ProfileViewsResponse {
  numProfileViews: number;
  views: ProfileViewEntry[];
}

export interface ProfilesIViewedResponse {
  views: ProfileViewEntry[];
}

export interface PusherAuthPayload {
  socket_id: string;
  channel_name: string;
}

export interface PusherAuthResponse {
  auth: string;
}

export type EmptyResponse = Record<string, never>;
