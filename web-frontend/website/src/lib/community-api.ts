import { apiFetch } from "./auth-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export type CommunityVisibility = "public" | "private";

export type CommunityRecord = {
  id: string;
  slug: string;
  name: string;
  description: string;
  visibility: CommunityVisibility;
  joinPolicy: "open" | "approval" | "invite_only";
  memberCount: number;
  postCount: number;
  status: "active" | "archived" | "deleted";
  createdAt: string;
};

export type CommunityMedia = {
  id: string;
  resourceType: "image" | "video";
  url: string;
};

export type CommunityPoll = {
  id: string;
  allowsMultiple: boolean;
  endsAt: string | null;
  options: Array<{ id: string; text: string; voteCount: number }>;
};

export type CommunityPostRecord = {
  id: string;
  communityId: string | null;
  authorId: string;
  kind: "text" | "media" | "poll";
  title: string | null;
  body: string | null;
  status: "processing" | "published" | "removed" | "deleted";
  upvoteCount: number;
  downvoteCount: number;
  commentCount: number;
  viewCount: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    profession: string;
    friendshipStatus: "self" | "none" | "pending" | "accepted";
  } | null;
  viewerVote: -1 | 0 | 1;
  media: CommunityMedia[];
  poll: CommunityPoll | null;
};

export type CommunityFriend = {
  id: string;
  name: string;
  email: string;
};

export type CommunityPersonSearchResult = {
  id: string;
  name: string;
  handle: string;
  role: string;
  avatarUrl: string | null;
  friendshipStatus: "none" | "pending" | "accepted";
};

export type CommunityFriendRequest = {
  id: string;
  requesterId: string;
  name: string;
  handle: string;
  role: string;
  avatarUrl: string | null;
  createdAt: string;
};

export type CommunityCurrentProfile = {
  name: string;
  avatarUrl: string | null;
};

export type CommunityComment = {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string; email: string } | null;
};

export type CreateCommunityInput = {
  name: string;
  description: string;
  visibility: CommunityVisibility;
  friendIds: string[];
};

export type CreatePostInput = {
  communityId?: string | null;
  body: string;
  mode: "text" | "image" | "video" | "poll";
  file?: File | null;
  pollOptions?: string[];
  pollAllowsMultiple?: boolean;
  pollEndsAt?: string;
};

type Page<T> = { items: T[]; nextCursor: string | null };

async function readError(
  response: Response,
  fallbackMessage: string,
): Promise<Error> {
  const payload = await response
    .clone()
    .json()
    .catch(() => null);
  const message = Array.isArray(payload?.message)
    ? payload.message.join(", ")
    : typeof payload?.message === "string"
      ? payload.message
      : fallbackMessage;
  return new Error(message);
}
// T: O(m) and S: O(m), where m is the error message length

export async function listCommunities(
  scope: "joined" | "discover",
  search = "",
): Promise<CommunityRecord[]> {
  const params = new URLSearchParams({ scope, limit: "50" });
  if (search.trim()) params.set("search", search.trim());
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/communities?${params.toString()}`,
  );
  if (!response.ok) {
    throw await readError(response, "Could not load communities");
  }
  const page = (await response.json()) as Page<CommunityRecord>;
  return page.items;
}
// T: O(c) and S: O(c), where c is the returned communities

export async function listCommunityFeed(
  communityId?: string,
): Promise<CommunityPostRecord[]> {
  const url = communityId
    ? `${API_BASE_URL}/api/v1/communities/${communityId}/posts?limit=50`
    : `${API_BASE_URL}/api/v1/community-feed?limit=50`;
  const response = await apiFetch(url);
  if (!response.ok) {
    throw await readError(response, "Could not load community posts");
  }
  const page = (await response.json()) as Page<CommunityPostRecord>;
  return page.items;
}
// T: O(p) and S: O(p), where p is the returned posts

export async function listGlobalPosts(): Promise<CommunityPostRecord[]> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/posts?limit=50`);
  if (!response.ok) {
    throw await readError(response, "Could not load posts");
  }
  const page = (await response.json()) as Page<CommunityPostRecord>;
  return page.items;
}
// T: O(p) and S: O(p), where p is the returned posts

export async function listFriends(): Promise<CommunityFriend[]> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/friends`);
  if (!response.ok) throw await readError(response, "Could not load friends");
  return response.json() as Promise<CommunityFriend[]>;
}
// T: O(f) and S: O(f), where f is the returned friends

export async function searchPeople(
  search: string,
): Promise<CommunityPersonSearchResult[]> {
  const params = new URLSearchParams({
    search: search.trim(),
    limit: "20",
  });
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/friends/search?${params.toString()}`,
  );
  if (!response.ok) {
    throw await readError(response, "Could not search for people");
  }
  return response.json() as Promise<CommunityPersonSearchResult[]>;
}
// T: O(r) and S: O(r), where r is the returned results

export async function listFriendRequests(): Promise<CommunityFriendRequest[]> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/friends/requests`,
  );
  if (!response.ok) {
    throw await readError(response, "Could not load friend requests");
  }
  return response.json() as Promise<CommunityFriendRequest[]>;
}
// T: O(r) and S: O(r), where r is the returned requests

export async function getCurrentCommunityProfile(): Promise<CommunityCurrentProfile> {
  const response = await apiFetch(`${API_BASE_URL}/momentum/profile`);
  if (!response.ok) {
    throw await readError(response, "Could not load your profile");
  }
  return response.json() as Promise<CommunityCurrentProfile>;
}
// T: O(1) network request and S: O(1)

export async function createCommunity(
  input: CreateCommunityInput,
): Promise<CommunityRecord> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/communities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name,
      description: input.description,
      visibility: input.visibility,
      joinPolicy: input.visibility === "private" ? "invite_only" : "open",
      friendIds: input.friendIds,
    }),
  });
  if (!response.ok)
    throw await readError(response, "Could not create community");
  return response.json() as Promise<CommunityRecord>;
}
// T: O(f) and S: O(f), where f is the invited friends

export async function joinCommunity(communityId: string): Promise<void> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/communities/${communityId}/join`,
    { method: "POST" },
  );
  if (!response.ok) throw await readError(response, "Could not join community");
}
// T: O(1) and S: O(1)

export async function createInviteLink(
  communityId: string,
): Promise<string | null> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/communities/${communityId}/invites`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "link",
        maxUses: 100,
        expiresInMinutes: 10080,
      }),
    },
  );
  if (!response.ok) throw await readError(response, "Could not create invite");
  const payload = (await response.json()) as { secret?: string };
  return payload.secret
    ? `${window.location.origin}/community?invite=${encodeURIComponent(payload.secret)}`
    : null;
}
// T: O(s) and S: O(s), where s is the invite secret length

export async function acceptCommunityInvite(token: string): Promise<void> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/community-invites/accept`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    },
  );
  if (!response.ok) {
    throw await readError(response, "Could not accept community invitation");
  }
}
// T: O(t) and S: O(t), where t is the invite token length

async function uploadMedia(
  file: File,
  resourceType: "image" | "video",
): Promise<string> {
  if (!file.type.startsWith(`${resourceType}/`)) {
    throw new Error(`Choose a valid ${resourceType} file`);
  }
  const maxBytes = resourceType === "video" ? 50_000_000 : 10_000_000;
  if (file.size > maxBytes) {
    throw new Error(
      `${resourceType === "video" ? "Video" : "Image"} must be smaller than ${
        maxBytes / 1_000_000
      } MB`,
    );
  }
  const signatureResponse = await apiFetch(
    `${API_BASE_URL}/api/v1/community-media/upload-signature`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceType }),
    },
  );
  if (!signatureResponse.ok) {
    throw await readError(signatureResponse, "Could not prepare media upload");
  }
  const signature = (await signatureResponse.json()) as {
    timestamp: number;
    folder: string;
    type: string;
    cloudName: string;
    apiKey: string;
    signature: string;
  };
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", signature.apiKey);
  form.append("timestamp", String(signature.timestamp));
  form.append("folder", signature.folder);
  form.append("type", signature.type);
  form.append("signature", signature.signature);
  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(signature.cloudName)}/${resourceType}/upload`,
    { method: "POST", body: form },
  );
  if (!uploadResponse.ok) {
    throw await readError(uploadResponse, "Cloudinary upload failed");
  }
  const uploaded = (await uploadResponse.json()) as { public_id?: string };
  if (!uploaded.public_id) throw new Error("Cloudinary returned no asset ID");
  return uploaded.public_id;
}
// T: O(b) and S: O(b), where b is the uploaded file size

export async function createPost(
  input: CreatePostInput,
): Promise<CommunityPostRecord> {
  let providerAssetId: string | null = null;
  if ((input.mode === "image" || input.mode === "video") && input.file) {
    providerAssetId = await uploadMedia(input.file, input.mode);
  }
  const options = (input.pollOptions ?? [])
    .map((option) => option.trim())
    .filter(Boolean);
  const response = await apiFetch(
    input.communityId
      ? `${API_BASE_URL}/api/v1/communities/${input.communityId}/posts`
      : `${API_BASE_URL}/api/v1/posts`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind:
          input.mode === "poll" ? "poll" : providerAssetId ? "media" : "text",
        body: input.body.trim() || undefined,
        media: providerAssetId
          ? [{ providerAssetId, resourceType: input.mode }]
          : undefined,
        poll:
          input.mode === "poll"
            ? {
                allowsMultiple: input.pollAllowsMultiple ?? false,
                endsAt: input.pollEndsAt,
                options: options.map((text) => ({ text })),
              }
            : undefined,
      }),
    },
  );
  if (!response.ok) throw await readError(response, "Could not create post");
  return response.json() as Promise<CommunityPostRecord>;
}
// T: O(b + o) and S: O(b + o), where b is media bytes and o is poll options

export async function updatePost(
  postId: string,
  body: string,
): Promise<CommunityPostRecord> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/posts/${postId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
  if (!response.ok) throw await readError(response, "Could not edit post");
  return response.json() as Promise<CommunityPostRecord>;
}
// T: O(b) and S: O(b), where b is the post body length

export async function deletePost(postId: string): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/posts/${postId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw await readError(response, "Could not delete post");
}
// T: O(1) and S: O(1)

export async function votePost(
  postId: string,
  value: 0 | 1,
): Promise<{ upvotes: number; downvotes: number }> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/posts/${postId}/vote`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    },
  );
  if (!response.ok) throw await readError(response, "Could not update like");
  return response.json() as Promise<{ upvotes: number; downvotes: number }>;
}
// T: O(1) and S: O(1)

export async function sendFriendRequest(userId: string): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/friends/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) {
    throw await readError(response, "Could not send friend request");
  }
}
// T: O(1) and S: O(1)

export async function resolveFriendRequest(
  requestId: string,
  status: "accepted" | "declined",
): Promise<void> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/friends/requests/${requestId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );
  if (!response.ok) {
    throw await readError(response, "Could not update friend request");
  }
}
// T: O(1) and S: O(1)

export async function removeFriend(friendId: string): Promise<void> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/friends/${friendId}`,
    { method: "DELETE" },
  );
  if (!response.ok) {
    throw await readError(response, "Could not unfollow this friend");
  }
}
// T: O(1) and S: O(1)

export async function createComment(
  postId: string,
  body: string,
): Promise<void> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/posts/${postId}/comments`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    },
  );
  if (!response.ok) throw await readError(response, "Could not add reply");
}
// T: O(c) and S: O(c), where c is the comment length

export async function listComments(
  postId: string,
): Promise<CommunityComment[]> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/posts/${postId}/comments?limit=50`,
  );
  if (!response.ok) throw await readError(response, "Could not load replies");
  const page = (await response.json()) as Page<CommunityComment>;
  return page.items;
}
// T: O(c) and S: O(c), where c is the returned comments

export async function votePoll(
  pollId: string,
  optionIds: string[],
): Promise<Array<{ id: string; text: string; voteCount: number }>> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/polls/${pollId}/vote`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionIds }),
    },
  );
  if (!response.ok) throw await readError(response, "Could not submit vote");
  return response.json() as Promise<
    Array<{ id: string; text: string; voteCount: number }>
  >;
}
// T: O(o) and S: O(o), where o is the returned poll options
