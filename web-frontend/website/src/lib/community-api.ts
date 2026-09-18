import { apiFetch } from "./auth-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const VIDEO_CHUNK_SIZE = 6_000_000;
const VIDEO_CHUNK_RETRY_DELAYS_MS = [500, 1_500, 3_000] as const;

type UploadProgressHandler = (
  percentage: number,
  loadedBytes: number,
  totalBytes: number,
) => void;

type CloudinaryUploadPayload = {
  public_id?: string;
  done?: boolean;
  error?: { message?: string };
};

class RetryableUploadError extends Error {}

const abortError = () =>
  new DOMException("Media upload was cancelled", "AbortError");

const waitForUploadRetry = (delayMs: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }
    const handleAbort = () => {
      window.clearTimeout(timer);
      reject(abortError());
    };
    const timer = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve();
    }, delayMs);
    signal?.addEventListener("abort", handleAbort, { once: true });
  });

const parseCloudinaryResponse = (request: XMLHttpRequest) => {
  try {
    return JSON.parse(request.responseText) as CloudinaryUploadPayload;
  } catch {
    return null;
  }
};

const uploadVideoChunk = (
  uploadUrl: string,
  signature: {
    timestamp: number;
    folder: string;
    type: string;
    apiKey: string;
    signature: string;
  },
  file: File,
  uploadId: string,
  start: number,
  endExclusive: number,
  onProgress?: UploadProgressHandler,
  signal?: AbortSignal,
) =>
  new Promise<CloudinaryUploadPayload>((resolve, reject) => {
    const request = new XMLHttpRequest();
    const handleAbort = () => request.abort();
    const cleanup = () => signal?.removeEventListener("abort", handleAbort);
    const chunk = file.slice(start, endExclusive, file.type);
    const form = new FormData();
    form.append("file", chunk, file.name);
    form.append("api_key", signature.apiKey);
    form.append("timestamp", String(signature.timestamp));
    form.append("folder", signature.folder);
    form.append("type", signature.type);
    form.append("signature", signature.signature);

    request.open("POST", uploadUrl);
    request.timeout = 2 * 60 * 1_000;
    request.setRequestHeader("X-Unique-Upload-Id", uploadId);
    request.setRequestHeader(
      "Content-Range",
      `bytes ${start}-${endExclusive - 1}/${file.size}`,
    );
    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const loadedBytes = Math.min(file.size, start + event.loaded);
      onProgress?.(
        Math.min(100, Math.floor((loadedBytes / file.size) * 100)),
        loadedBytes,
        file.size,
      );
    };
    request.onload = () => {
      cleanup();
      const payload = parseCloudinaryResponse(request);
      if (request.status >= 200 && request.status < 300) {
        resolve(payload ?? {});
        return;
      }
      const message = payload?.error?.message || "Video upload failed";
      if (
        request.status === 408 ||
        request.status === 420 ||
        request.status === 429 ||
        request.status >= 500
      ) {
        reject(new RetryableUploadError(message));
        return;
      }
      reject(new Error(message));
    };
    request.onerror = () => {
      cleanup();
      reject(new RetryableUploadError("Video upload connection was interrupted"));
    };
    request.ontimeout = () => {
      cleanup();
      reject(new RetryableUploadError("Video upload timed out"));
    };
    request.onabort = () => {
      cleanup();
      reject(abortError());
    };
    signal?.addEventListener("abort", handleAbort, { once: true });
    if (signal?.aborted) {
      handleAbort();
      return;
    }
    request.send(form);
  });

const uploadVideoInChunks = async (
  uploadUrl: string,
  signature: {
    timestamp: number;
    folder: string;
    type: string;
    apiKey: string;
    signature: string;
  },
  file: File,
  onProgress?: UploadProgressHandler,
  signal?: AbortSignal,
) => {
  const uploadId =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  let providerAssetId = "";

  for (let start = 0; start < file.size; start += VIDEO_CHUNK_SIZE) {
    const endExclusive = Math.min(file.size, start + VIDEO_CHUNK_SIZE);
    let payload: CloudinaryUploadPayload | null = null;

    for (
      let attempt = 0;
      attempt <= VIDEO_CHUNK_RETRY_DELAYS_MS.length;
      attempt += 1
    ) {
      try {
        payload = await uploadVideoChunk(
          uploadUrl,
          signature,
          file,
          uploadId,
          start,
          endExclusive,
          onProgress,
          signal,
        );
        break;
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === "AbortError") {
          throw caught;
        }
        if (
          !(caught instanceof RetryableUploadError) ||
          attempt === VIDEO_CHUNK_RETRY_DELAYS_MS.length
        ) {
          throw caught;
        }
        onProgress?.(
          Math.floor((start / file.size) * 100),
          start,
          file.size,
        );
        await waitForUploadRetry(
          VIDEO_CHUNK_RETRY_DELAYS_MS[attempt],
          signal,
        );
      }
    }

    if (!payload) throw new Error("Video upload could not complete");
    if (payload.public_id) providerAssetId = payload.public_id;
    onProgress?.(
      Math.min(100, Math.floor((endExclusive / file.size) * 100)),
      endExclusive,
      file.size,
    );
  }

  if (!providerAssetId) {
    throw new Error("Media storage returned no asset ID");
  }
  onProgress?.(100, file.size, file.size);
  return providerAssetId;
};

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
  canManage?: boolean;
};

export type CommunityMemberRecord = {
  userId: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "moderator" | "member";
  joinedAt: string;
  isCurrentUser: boolean;
};

export type CommunityMedia = {
  id: string;
  resourceType: "image" | "video" | "audio" | "file";
  url: string;
  posterUrl?: string | null;
  originalFilename?: string | null;
};

export type CommunityPoll = {
  id: string;
  allowsMultiple: boolean;
  endsAt: string | null;
  status: "open" | "closed";
  viewerOptionIds: string[];
  options: Array<{ id: string; text: string; voteCount: number }>;
};

export type CommunityPostRecord = {
  id: string;
  communityId: string | null;
  authorId: string;
  replyToPostId: string | null;
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
  replyTo: {
    id: string;
    body: string | null;
    kind: "text" | "media" | "poll";
    media: CommunityMedia[];
    author: {
      id: string;
      name: string;
      avatarUrl: string | null;
    };
  } | null;
  media: CommunityMedia[];
  poll: CommunityPoll | null;
};

export type CommunityFriend = {
  id: string;
  name: string;
  email: string;
  mutualFriends: number;
};

export type CommunityPersonSearchResult = {
  id: string;
  name: string;
  handle: string;
  role: string;
  avatarUrl: string | null;
  friendshipStatus: "none" | "pending" | "accepted";
  mutualFriends?: number;
};

export type CommunityFriendRequest = {
  id: string;
  direction?: "received" | "sent";
  requesterId?: string;
  addresseeId?: string;
  name: string;
  handle: string;
  role: string;
  avatarUrl: string | null;
  createdAt: string;
};

export type CommunityCurrentProfile = {
  name: string;
  email?: string;
  avatarUrl: string | null;
};

export type CommunityComment = {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string; email: string } | null;
  canDelete: boolean;
  canEdit: boolean;
  likeCount: number;
  viewerLiked: boolean;
};

export type Comm360Meeting = {
  id: string;
  roomId: string;
  title: string;
  description: string;
  startTime: string;
  organizerName: string;
  joinUrl: string;
};

export type CreateCommunityInput = {
  name: string;
  description: string;
  visibility: CommunityVisibility;
  friendIds: string[];
};

export type CreatePostInput = {
  communityId?: string | null;
  replyToPostId?: string | null;
  body: string;
  mode: "text" | "image" | "video" | "audio" | "file" | "poll";
  file?: File | null;
  providerAssetId?: string | null;
  onUploadProgress?: (
    percentage: number,
    loadedBytes: number,
    totalBytes: number,
  ) => void;
  onUploadComplete?: () => void;
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
  options?: { fresh?: boolean },
): Promise<CommunityPostRecord[]> {
  const url = communityId
    ? `${API_BASE_URL}/api/v1/communities/${communityId}/posts?limit=50`
    : `${API_BASE_URL}/api/v1/community-feed?limit=50`;
  const response = await apiFetch(url, {
    cache: "no-store",
    headers: options?.fresh ? { "X-Anchor-Fresh": "1" } : undefined,
  });
  if (!response.ok) {
    throw await readError(response, "Could not load community posts");
  }
  const page = (await response.json()) as Page<CommunityPostRecord>;
  return page.items;
}
// T: O(p) and S: O(p), where p is the returned posts

export async function getLatestPostMarker(
  communityId?: string | null,
): Promise<{ id: string | null; createdAt: string | null }> {
  const url = communityId
    ? `${API_BASE_URL}/api/v1/communities/${communityId}/posts/latest`
    : `${API_BASE_URL}/api/v1/posts/latest`;
  const response = await apiFetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw await readError(response, "Could not check for new posts");
  }
  return response.json() as Promise<{ id: string | null; createdAt: string | null }>;
}
// T: O(1) and S: O(1)

export async function transcribeSpeech(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const response = await apiFetch(`${API_BASE_URL}/api/v1/speech/transcribe`, {
    method: "POST",
    body,
    cache: "no-store",
  });
  if (!response.ok) {
    throw await readError(response, "Could not convert speech to text");
  }
  const payload = (await response.json()) as { text?: string };
  const text = typeof payload.text === "string" ? payload.text.trim() : "";
  if (!text) {
    throw new Error("No speech detected. Try again and speak clearly.");
  }
  return text;
}
// T: O(a) and S: O(a), where a is the audio payload size

export type CommunityTypingUser = {
  userId: string;
  name: string;
  avatarUrl: string | null;
};

export async function setCommunityTyping(
  communityId: string,
  typing: boolean,
): Promise<void> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/communities/${communityId}/typing`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ typing }),
      cache: "no-store",
    },
  );
  if (!response.ok) {
    throw await readError(response, "Could not update typing status");
  }
}
// T: O(1) and S: O(1)

export async function listCommunityTyping(
  communityId: string,
): Promise<CommunityTypingUser[]> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/communities/${communityId}/typing`,
    { cache: "no-store" },
  );
  if (!response.ok) {
    throw await readError(response, "Could not load typing status");
  }
  return response.json() as Promise<CommunityTypingUser[]>;
}
// T: O(t) and S: O(t), where t is active typers

export async function listGlobalPosts(
  options?: { fresh?: boolean },
): Promise<CommunityPostRecord[]> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/posts?limit=50`, {
    cache: "no-store",
    headers: options?.fresh ? { "X-Anchor-Fresh": "1" } : undefined,
  });
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

export async function listSentFriendRequests(): Promise<
  CommunityFriendRequest[]
> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/friends/requests/sent`,
  );
  if (!response.ok) {
    throw await readError(response, "Could not load sent friend requests");
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

export async function updateCommunity(
  communityId: string,
  input: Partial<{
    name: string;
    description: string;
    visibility: CommunityVisibility;
    joinPolicy: "open" | "invite_only";
  }>,
): Promise<CommunityRecord> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/communities/${communityId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  if (!response.ok) {
    throw await readError(response, "Could not update community");
  }
  return response.json() as Promise<CommunityRecord>;
}
// T: O(1) network request and S: O(1)

export async function listCommunityMembers(
  communityId: string,
): Promise<CommunityMemberRecord[]> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/communities/${communityId}/members`,
  );
  if (!response.ok) {
    throw await readError(response, "Could not load community members");
  }
  return response.json() as Promise<CommunityMemberRecord[]>;
}
// T: O(m) and S: O(m), where m is returned members

export async function addCommunityMember(
  communityId: string,
  userId: string,
): Promise<void> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/communities/${communityId}/members`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    },
  );
  if (!response.ok) {
    throw await readError(response, "Could not add community member");
  }
}
// T: O(1) network request and S: O(1)

export async function updateCommunityMemberRole(
  communityId: string,
  memberUserId: string,
  role: "owner" | "member",
): Promise<void> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/communities/${communityId}/members/${memberUserId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    },
  );
  if (!response.ok) {
    throw await readError(response, "Could not update member role");
  }
}
// T: O(1) network request and S: O(1)

export async function removeCommunityMember(
  communityId: string,
  memberUserId: string,
): Promise<void> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/communities/${communityId}/members/${memberUserId}`,
    { method: "DELETE" },
  );
  if (!response.ok) {
    throw await readError(response, "Could not remove community member");
  }
}
// T: O(1) network request and S: O(1)

export async function deleteCommunity(communityId: string): Promise<void> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/communities/${communityId}`,
    { method: "DELETE" },
  );
  if (!response.ok) {
    throw await readError(response, "Could not delete community");
  }
}
// T: O(1) network request and S: O(1)

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

export async function uploadCommunityMedia(
  file: File,
  resourceType: "image" | "video" | "audio" | "file",
  onProgress?: (
    percentage: number,
    loadedBytes: number,
    totalBytes: number,
  ) => void,
  signal?: AbortSignal,
): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const acceptedExtensions =
    resourceType === "video"
      ? new Set(["mp4", "mov", "m4v", "webm"])
      : resourceType === "audio"
        ? new Set(["mp3", "m4a", "aac", "wav", "ogg", "webm"])
        : resourceType === "file"
          ? new Set([
              "pdf",
              "doc",
              "docx",
              "xls",
              "xlsx",
              "ppt",
              "pptx",
              "txt",
              "csv",
              "rtf",
              "zip",
            ])
          : new Set(["jpg", "jpeg", "png", "gif", "webp", "heic", "heif"]);
  const hasAcceptedMimeType =
    resourceType === "file"
      ? acceptedExtensions.has(extension)
      : file.type.startsWith(`${resourceType}/`) ||
        (resourceType === "audio" &&
          (file.type.startsWith("audio/") ||
            file.type === "video/webm" ||
            acceptedExtensions.has(extension)));
  if (!hasAcceptedMimeType && !acceptedExtensions.has(extension)) {
    throw new Error(
      resourceType === "video"
        ? "Choose a valid MP4, MOV, M4V, or WebM video"
        : resourceType === "audio"
          ? "Choose a valid MP3, M4A, AAC, WAV, OGG, or WebM audio file"
          : resourceType === "file"
            ? "Choose a PDF, Office document, text, CSV, RTF, or ZIP file"
            : "Choose a valid image file",
    );
  }
  const maxBytes =
    resourceType === "video"
      ? 50_000_000
      : resourceType === "audio"
        ? 20_000_000
        : resourceType === "file"
          ? 25_000_000
          : 10_000_000;
  if (file.size > maxBytes) {
    throw new Error(
      `${resourceType === "video" ? "Video" : resourceType === "audio" ? "Audio" : resourceType === "file" ? "File" : "Image"} must be smaller than ${
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
  const providerResourceType =
    resourceType === "audio"
      ? "video"
      : resourceType === "file"
        ? "raw"
        : resourceType;
  const uploadUrl = `https://api.cloudinary.com/v1_1/${encodeURIComponent(signature.cloudName)}/${providerResourceType}/upload`;

  if (resourceType === "video") {
    return uploadVideoInChunks(
      uploadUrl,
      signature,
      file,
      onProgress,
      signal,
    );
  }

  return new Promise<string>((resolve, reject) => {
    const request = new XMLHttpRequest();
    const cleanup = () => signal?.removeEventListener("abort", handleAbort);
    const handleAbort = () => request.abort();
    request.open("POST", uploadUrl);
    request.timeout = 5 * 60 * 1_000;
    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress?.(
        Math.min(100, Math.floor((event.loaded / event.total) * 100)),
        event.loaded,
        event.total,
      );
    };
    request.onload = () => {
      cleanup();
      const payload = (() => {
        try {
          return JSON.parse(request.responseText) as {
            public_id?: string;
            error?: { message?: string };
          };
        } catch {
          return null;
        }
      })();
      if (request.status < 200 || request.status >= 300) {
        reject(
          new Error(
            payload?.error?.message ||
              `${resourceType === "file" ? "File" : resourceType === "audio" ? "Audio" : "Image"} upload failed`,
          ),
        );
        return;
      }
      if (!payload?.public_id) {
        reject(new Error("Media storage returned no asset ID"));
        return;
      }
      onProgress?.(100, file.size, file.size);
      resolve(payload.public_id);
    };
    request.onerror = () => {
      cleanup();
      reject(
        new Error(
          "Image upload could not complete. Check your connection and try again.",
        ),
      );
    };
    request.ontimeout = () => {
      cleanup();
      reject(
        new Error("Image upload timed out. Please try again."),
      );
    };
    request.onabort = () => {
      cleanup();
      reject(new DOMException("Media upload was cancelled", "AbortError"));
    };
    signal?.addEventListener("abort", handleAbort, { once: true });
    if (signal?.aborted) {
      handleAbort();
      return;
    }
    request.send(form);
  });
}
// T: O(b) and S: O(b), where b is the uploaded file size

export async function createPost(
  input: CreatePostInput,
): Promise<CommunityPostRecord> {
  let providerAssetId = input.providerAssetId ?? null;
  if (
    !providerAssetId &&
    (input.mode === "image" ||
      input.mode === "video" ||
      input.mode === "audio" ||
      input.mode === "file") &&
    input.file
  ) {
    providerAssetId = await uploadCommunityMedia(
      input.file,
      input.mode,
      input.onUploadProgress,
    );
    input.onUploadComplete?.();
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
        replyToPostId: input.replyToPostId ?? undefined,
        body: input.body.trim() || undefined,
        media: providerAssetId
          ? [
              {
                providerAssetId,
                resourceType: input.mode,
                originalFilename: input.file?.name || undefined,
              },
            ]
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
): Promise<{ id: string; createdAt: string }> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/posts/${postId}/comments`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    },
  );
  if (!response.ok) throw await readError(response, "Could not add reply");
  return response.json() as Promise<{ id: string; createdAt: string }>;
}
// T: O(c) and S: O(c), where c is the comment length

export async function listComments(
  postId: string,
  options?: { limit?: number; cursor?: string | null },
): Promise<Page<CommunityComment>> {
  const params = new URLSearchParams();
  params.set("limit", String(options?.limit ?? 10));
  if (options?.cursor) params.set("cursor", options.cursor);
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/posts/${postId}/comments?${params.toString()}`,
  );
  if (!response.ok) throw await readError(response, "Could not load replies");
  return (await response.json()) as Page<CommunityComment>;
}
// T: O(c) and S: O(c), where c is the returned comments

export async function deleteComment(
  postId: string,
  commentId: string,
): Promise<void> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/posts/${postId}/comments/${commentId}`,
    { method: "DELETE" },
  );
  if (!response.ok) throw await readError(response, "Could not delete comment");
}
// T: O(1) network request and S: O(1)

export async function updateComment(
  postId: string,
  commentId: string,
  body: string,
): Promise<void> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/posts/${postId}/comments/${commentId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    },
  );
  if (!response.ok) throw await readError(response, "Could not edit comment");
}

export async function voteComment(
  postId: string,
  commentId: string,
  liked: boolean,
): Promise<{ likeCount: number; viewerLiked: boolean }> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/posts/${postId}/comments/${commentId}/like`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ liked }),
    },
  );
  if (!response.ok) throw await readError(response, "Could not update comment like");
  return response.json() as Promise<{ likeCount: number; viewerLiked: boolean }>;
}

export async function getComm360Meeting(
  roomId: string,
): Promise<Comm360Meeting> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/comm360/meetings/${encodeURIComponent(roomId)}`,
  );
  if (!response.ok) {
    throw await readError(response, "Could not load Comm360 meeting");
  }
  return response.json() as Promise<Comm360Meeting>;
}
// T: O(1) network request and S: O(1)

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
