"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type SearchableMessage = {
  id: string;
  communityId: string | null;
  communityName?: string;
  authorName: string;
  authorAvatar?: string;
  body: string;
};

type AppChromeContextValue = {
  messages: SearchableMessage[];
  setMessages: (messages: SearchableMessage[]) => void;
};

const AppChromeContext = createContext<AppChromeContextValue | null>(null);

export function AppChromeProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessagesState] = useState<SearchableMessage[]>([]);
  const setMessages = useCallback((next: SearchableMessage[]) => {
    setMessagesState(next);
  }, []);
  const value = useMemo(
    () => ({ messages, setMessages }),
    [messages, setMessages],
  );
  return (
    <AppChromeContext.Provider value={value}>
      {children}
    </AppChromeContext.Provider>
  );
}

export function useAppChrome() {
  const context = useContext(AppChromeContext);
  if (!context) {
    throw new Error("useAppChrome must be used within AppChromeProvider");
  }
  return context;
}

export const OPEN_POST_EVENT = "anchor:open-post";
export const INBOX_CHANGED_EVENT = "anchor:inbox-changed";
const DISMISSED_POSTS_KEY = "anchor.inbox.dismissedPostIds";
const SEEN_REQUESTS_KEY = "anchor.community.seenFriendRequestIds";

export type OpenPostDetail = {
  postId: string;
  communityId: string | null;
};

const readIdSet = (key: string) => {
  if (typeof window === "undefined") return new Set<string>();
  try {
    const stored = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return new Set(
      Array.isArray(stored)
        ? stored.filter((value): value is string => typeof value === "string")
        : [],
    );
  } catch {
    return new Set<string>();
  }
};

const writeIdSet = (key: string, ids: Set<string>) => {
  try {
    window.localStorage.setItem(key, JSON.stringify([...ids].slice(-400)));
    window.dispatchEvent(new Event(INBOX_CHANGED_EVENT));
  } catch {
    // Keep the in-memory inbox when storage is blocked.
  }
};

export const readDismissedPostIds = () => readIdSet(DISMISSED_POSTS_KEY);
export const readSeenFriendRequestIds = () => readIdSet(SEEN_REQUESTS_KEY);

export const dismissInboxPosts = (postIds: string[]) => {
  const next = readDismissedPostIds();
  postIds.forEach((id) => next.add(id));
  writeIdSet(DISMISSED_POSTS_KEY, next);
};

export const markFriendRequestsSeen = (requestIds: string[]) => {
  const next = readSeenFriendRequestIds();
  requestIds.forEach((id) => next.add(id));
  writeIdSet(SEEN_REQUESTS_KEY, next);
};

export const seedReadPosition = (scope: string, postId: string) => {
  try {
    window.localStorage.setItem(`anchor.community.readPosition.${scope}`, postId);
  } catch {
    // The current visit still treats this post as the latest read item.
  }
};

export const openInboxPost = (detail: OpenPostDetail) => {
  window.dispatchEvent(new CustomEvent(OPEN_POST_EVENT, { detail }));
};

export function escapeSearchRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function textMatchesQuery(text: string, query: string) {
  const haystack = text.trim();
  const needle = query.trim();
  if (!haystack || !needle) return false;
  if (needle.length <= 2) {
    return new RegExp(
      `(^|[^\\p{L}\\p{N}])${escapeSearchRegex(needle)}([^\\p{L}\\p{N}]|$)`,
      "iu",
    ).test(haystack);
  }
  return haystack.toLowerCase().includes(needle.toLowerCase());
}
