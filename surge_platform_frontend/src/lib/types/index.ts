export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  path?: string;
  requestId?: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    [key: string]: any;
  };
}

export interface User {
  id: string;
  email: string;
  fullName?: string;
  name?: string;
  role?: string;
  phoneNumber?: string;
  avatarKey?: string;
  isVerified?: boolean;
  isEmailVerified?: boolean;
  companyId?: string;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Backend login response: { accessToken, refreshToken, isVerified, user: { id, email, role } }
export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  isVerified: boolean;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

// Backend verify-email response: { accessToken, refreshToken, user: { id, email, role } }
export interface VerifyEmailResponseData {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

// Kept for backward compat
export interface AuthResponseData {
  user: User;
  company?: Company;
  workspace?: Workspace;
  tokens?: AuthTokens;
  requiresOtp?: boolean;
}

export interface Company {
  id: string;
  name: string;
  subscriptionTier: 'starter' | 'pro' | 'business';
  stripeCustomerId?: string;
}

export interface Workspace {
  id: string;
  name: string;
  companyId: string;
  autoPost?: boolean;
  queue_config?: {
    autoPost?: boolean;
    fetchFrequencyHours?: number;
    postingTimes?: string[];
  };
  createdAt?: string;
}

export interface RssFeed {
  id: string;
  workspaceId: string;
  name: string;
  feedUrl: string;
  status: 'active' | 'inactive';
  lastFetchedAt?: string;
  createdAt?: string;
}

export interface RawPost {
  id: string;
  workspaceId: string;
  rssFeedId?: string;
  title: string;
  url: string;
  sourceName?: string;
  publishedAt?: string;
  status: 'buffered' | 'processed' | 'skipped';
}

export interface GeneratedDraft {
  id: string;
  workspaceId: string;
  topicTitle: string;
  blogPostContent?: string;
  polishedContent?: string;
  imageUrl?: string;
  imageProvider?: string;
  companySocialCopy?: string;
  personalSocialCopy?: string;
  status: 'DRAFT' | 'READY_FOR_REVIEW' | 'APPROVED' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
  scheduledFor?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ToneProfile {
  id: string;
  workspaceId: string;
  name: string;
  isDefault?: boolean;
  targetAudience?: string;
  brandVoice?: string;
  editorialRules?: string[];
  stepOneRawDraftPrompt?: { promptText: string };
  stepTwoPolishingPrompt?: { promptText: string };
  stepThreeImagePrompt?: { promptText: string };
}

// Matches GET /workspaces/:id/analytics response
export interface WorkspaceAnalyticsResponse {
  workspaceId: string;
  companyTier: string;
  overview: {
    totalDrafts: number;
    published: number;
    failed: number;
    review: number;
    pending: number;
    successRatePercent: number;
    activeRssFeeds: number;
    activeChannels: number;
  };
  auditLogs: Array<{
    id: string;
    channelId: string;
    generatedDraftId: string;
    status: string;
    platformPostUrl?: string;
    errorMessage?: string;
    createdAt: string;
    channel?: {
      id: string;
      platform: string;
      channelName: string;
    };
  }>;
}

export interface PublishingChannel {
  id: string;
  workspaceId: string;
  platform: string;
  channelName: string;
  isActive: boolean;
  accessToken?: string;
  refreshToken?: string;
  createdAt?: string;
}
