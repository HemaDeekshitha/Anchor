import { CommunityVisibility } from "@/lib/community-api";

export type ForumComment = {
  id: string;
  authorName: string;
  authorAvatar?: string;
  body: string;
  timeAgo: string;
};

export type ForumPost = {
  id: string;
  communityId: string | null;
  category: string;
  type: "Discussion" | "Doubt" | "Achievement";
  createdAt: string;
  timeAgo: string;
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
  authorId: string;
  authorProfession: string;
  friendshipStatus: "self" | "none" | "pending" | "accepted";
  viewerVote: -1 | 0 | 1;
  verified?: boolean;
  tags: string[];
  title: string;
  body: string;
  upvotes: string;
  downvotes: string;
  views: string;
  replyCount?: number;
  initialComments?: ForumComment[];
  media?: Array<{ id: string; type: "image" | "video"; url: string }>;
  poll?: {
    id: string;
    allowsMultiple: boolean;
    endsAt: string | null;
    status: "open" | "closed";
    viewerOptionIds: string[];
    options: Array<{ id: string; text: string; voteCount: number }>;
  } | null;
};

export type ScheduledMeeting = {
  id: string;
  communityId: string;
  withName: string;
  withAvatar?: string;
  topic: string;
  date: string;
  time: string;
  via: string;
};

export type Community = {
  id: string;
  slug: string;
  name: string;
  description: string;
  memberCount: string;
  joined: boolean;
  isActive: boolean;
  visibility: CommunityVisibility;
  joinPolicy: "open" | "approval" | "invite_only";
  isOwner: boolean;
  isAdmin: boolean;
};

export type CommunityPageTab = "posts" | "communities" | "friends";
export type CommunitySectionTab = "current" | "join" | "create";
export type CommunityLayout = "grid" | "list";
export type ComposerMode = "text" | "emoji" | "image" | "video" | "poll";

export type CreateCommunityFormInput = {
  name: string;
  description: string;
  visibility: CommunityVisibility;
  friendIds: string[];
  adminFriendIds: string[];
  firstPost: string;
  createShareLink: boolean;
};

export type Friend = {
  id: string;
  name: string;
  handle: string;
  role: string;
  avatarUrl?: string | null;
  mutualFriends: number;
  isFriend: boolean;
  friendshipStatus?: "none" | "pending" | "accepted";
  createdAt?: string;
};
