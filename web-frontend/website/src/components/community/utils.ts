import { CommunityPostRecord, CommunityRecord } from "@/lib/community-api";
import { Community, ForumPost } from "./Types";

export const formatTimeAgo = (createdAt: string) => {
  const elapsedMinutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 60_000)
  );
  if (elapsedMinutes < 1) return "now";
  if (elapsedMinutes < 60) return `${elapsedMinutes}m`;
  if (elapsedMinutes < 1_440) return `${Math.floor(elapsedMinutes / 60)}h`;
  return `${Math.floor(elapsedMinutes / 1_440)}d`;
};
// T: O(1) and S: O(1)

export const mapCommunity = (
  community: CommunityRecord,
  joined: boolean
): Community => ({
  id: community.id,
  slug: community.slug,
  name: community.name,
  description: community.description,
  memberCount: `${community.memberCount} ${
    community.memberCount === 1 ? "member" : "members"
  }`,
  joined,
  isActive: community.status === "active",
  visibility: community.visibility,
  joinPolicy: community.joinPolicy,
});
// T: O(1) and S: O(1)

export const mapPost = (post: CommunityPostRecord): ForumPost => ({
  id: post.id,
  communityId: post.communityId,
  category: post.kind === "poll" ? "Poll" : "Discussion",
  type: "Discussion",
  createdAt: post.createdAt,
  timeAgo: formatTimeAgo(post.createdAt),
  authorName: post.author?.name ?? "Anchor member",
  authorHandle: post.author?.email ?? "",
  authorId: post.authorId,
  authorAvatar: post.author?.avatarUrl ?? undefined,
  authorProfession: post.author?.profession ?? "Anchor member",
  friendshipStatus: post.author?.friendshipStatus ?? "none",
  viewerVote: post.viewerVote ?? 0,
  verified: false,
  tags: [],
  title: post.title ?? "",
  body: post.body ?? "",
  upvotes: String(post.upvoteCount),
  downvotes: String(post.downvoteCount),
  views: post.viewCount,
  replyCount: post.commentCount,
  initialComments: [],
  media: (post.media ?? []).map((item) => ({
    id: item.id,
    type: item.resourceType,
    url: item.url,
  })),
  poll: post.poll
    ? {
        id: post.poll.id,
        allowsMultiple: post.poll.allowsMultiple,
        endsAt: post.poll.endsAt,
        status: post.poll.status,
        viewerOptionIds: post.poll.viewerOptionIds ?? [],
        options: post.poll.options,
      }
    : null,
});
// T: O(m + o) and S: O(m + o), where m is media and o is poll options

export const delay = (milliseconds: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));
// T: O(1) scheduled work and S: O(1)
