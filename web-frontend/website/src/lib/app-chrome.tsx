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
  viewingScope: string | null;
  setViewingScope: (scope: string | null) => void;
};

const AppChromeContext = createContext<AppChromeContextValue | null>(null);

export function AppChromeProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessagesState] = useState<SearchableMessage[]>([]);
  const [viewingScope, setViewingScopeState] = useState<string | null>(null);
  const setMessages = useCallback((next: SearchableMessage[]) => {
    setMessagesState((current) => {
      if (
        current.length === next.length &&
        current.every((item, index) => {
          const candidate = next[index];
          return (
            item.id === candidate?.id &&
            item.body === candidate?.body &&
            item.authorName === candidate?.authorName &&
            item.authorAvatar === candidate?.authorAvatar &&
            item.communityId === candidate?.communityId &&
            item.communityName === candidate?.communityName
          );
        })
      ) {
        return current;
      }
      return next;
    });
  }, []);
  const setViewingScope = useCallback((scope: string | null) => {
    setViewingScopeState((current) => (current === scope ? current : scope));
  }, []);
  const value = useMemo(
    () => ({ messages, setMessages, viewingScope, setViewingScope }),
    [messages, setMessages, viewingScope, setViewingScope],
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
const NOTIFIED_POSTS_KEY = "anchor.community.notifiedPostIds";

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

const writeIdSet = (key: string, ids: Set<string>, notifyInbox = true) => {
  try {
    window.localStorage.setItem(key, JSON.stringify([...ids].slice(-500)));
    if (notifyInbox) window.dispatchEvent(new Event(INBOX_CHANGED_EVENT));
  } catch {
    // Keep the in-memory inbox when storage is blocked.
  }
};

export const readDismissedPostIds = () => readIdSet(DISMISSED_POSTS_KEY);
export const readSeenFriendRequestIds = () => readIdSet(SEEN_REQUESTS_KEY);
export const readNotifiedPostIds = () => readIdSet(NOTIFIED_POSTS_KEY);

export const saveNotifiedPostIds = (ids: Set<string>) => {
  writeIdSet(NOTIFIED_POSTS_KEY, ids, false);
};

const RECENTLY_ACTIVE_COMMUNITIES_KEY =
  "anchor.community.recentlyNotifiedOrder";

export const readRecentlyActiveCommunityOrder = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(
      window.localStorage.getItem(RECENTLY_ACTIVE_COMMUNITIES_KEY) ?? "[]",
    );
    if (!Array.isArray(stored)) return [];
    return stored.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
};

/** @deprecated Prefer readRecentlyActiveCommunityOrder */
export const readRecentlyNotifiedCommunityOrder =
  readRecentlyActiveCommunityOrder;

export const touchRecentlyActiveCommunities = (
  communityIds: string[],
): string[] => {
  const uniqueIncoming: string[] = [];
  for (const id of communityIds) {
    if (id && !uniqueIncoming.includes(id)) uniqueIncoming.push(id);
  }
  if (uniqueIncoming.length === 0) {
    return readRecentlyActiveCommunityOrder();
  }
  const next = [
    ...uniqueIncoming,
    ...readRecentlyActiveCommunityOrder().filter(
      (id) => !uniqueIncoming.includes(id),
    ),
  ].slice(0, 100);
  try {
    window.localStorage.setItem(
      RECENTLY_ACTIVE_COMMUNITIES_KEY,
      JSON.stringify(next),
    );
  } catch {
    // Keep the in-memory order when storage is blocked.
  }
  return next;
};

/** @deprecated Prefer touchRecentlyActiveCommunities */
export const touchRecentlyNotifiedCommunities =
  touchRecentlyActiveCommunities;

export type DeviceNotificationMode = "off" | "silent" | "all";
const DEVICE_NOTIFICATION_MODE_KEY = "anchor.community.deviceNotificationMode";
export const DEVICE_NOTIFICATION_MODE_CHANGED_EVENT =
  "anchor:device-notification-mode-changed";

export const readDeviceNotificationMode = (): DeviceNotificationMode => {
  if (typeof window === "undefined") return "all";
  try {
    const stored = window.localStorage.getItem(DEVICE_NOTIFICATION_MODE_KEY);
    if (stored === "off" || stored === "silent" || stored === "all") {
      return stored;
    }
  } catch {
    // Fall through to default.
  }
  return "all";
};

export const writeDeviceNotificationMode = (mode: DeviceNotificationMode) => {
  try {
    window.localStorage.setItem(DEVICE_NOTIFICATION_MODE_KEY, mode);
    window.dispatchEvent(new Event(DEVICE_NOTIFICATION_MODE_CHANGED_EVENT));
  } catch {
    // Preference stays in memory for this session only.
  }
};

export const postMentionsName = (body: string | null | undefined, name: string) => {
  const text = body?.trim() ?? "";
  const userName = name.trim();
  if (!text || !userName) return false;
  const needle = `@${userName}`;
  const lower = text.toLowerCase();
  const target = needle.toLowerCase();
  let from = 0;
  while (from <= lower.length) {
    const index = lower.indexOf(target, from);
    if (index === -1) return false;
    const beforeOk = index === 0 || /\s/.test(text[index - 1] ?? "");
    const afterChar = text[index + needle.length];
    const afterOk =
      afterChar === undefined || /[\s.,!?;:)\]]/.test(afterChar);
    if (beforeOk && afterOk) return true;
    from = index + target.length;
  }
  return false;
};

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

export const seedReadPosition = (
  scope: string,
  postId: string,
  notifyInbox = false,
) => {
  try {
    const key = `anchor.community.readPosition.${scope}`;
    const previous = window.localStorage.getItem(key);
    if (previous === postId) return false;
    window.localStorage.setItem(key, postId);
    if (notifyInbox) {
      window.dispatchEvent(new Event(INBOX_CHANGED_EVENT));
    }
    return true;
  } catch {
    // The current visit still treats this post as the latest read item.
    return false;
  }
};

export const openInboxPost = (detail: OpenPostDetail) => {
  window.dispatchEvent(new CustomEvent(OPEN_POST_EVENT, { detail }));
};

export type CommunityMessageSoundKind = "in-chat" | "outside";

let communitySoundContext: AudioContext | null = null;
let lastCommunitySoundAt = 0;

const getCommunitySoundContext = () => {
  if (typeof window === "undefined") return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return null;
  if (!communitySoundContext || communitySoundContext.state === "closed") {
    communitySoundContext = new AudioCtx();
  }
  return communitySoundContext;
};

/** Soft UI tones: quieter for in-chat, clearer for outside notifications. */
export const playCommunityMessageSound = (
  kind: CommunityMessageSoundKind,
) => {
  if (typeof window === "undefined") return;
  const mode = readDeviceNotificationMode();
  if (mode === "off") return;
  if (mode === "silent" && kind === "outside") return;

  const now = Date.now();
  if (now - lastCommunitySoundAt < 450) return;
  lastCommunitySoundAt = now;

  try {
    const context = getCommunitySoundContext();
    if (!context) return;
    void context.resume();

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = kind === "in-chat" ? 880 : 660;
    const peak = kind === "in-chat" ? 0.045 : 0.08;
    const start = context.currentTime;
    const end = start + (kind === "in-chat" ? 0.12 : 0.18);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(end + 0.02);

    if (kind === "outside") {
      const second = context.createOscillator();
      const secondGain = context.createGain();
      second.type = "sine";
      second.frequency.value = 880;
      const secondStart = start + 0.08;
      const secondEnd = secondStart + 0.12;
      secondGain.gain.setValueAtTime(0.0001, secondStart);
      secondGain.gain.exponentialRampToValueAtTime(0.06, secondStart + 0.012);
      secondGain.gain.exponentialRampToValueAtTime(0.0001, secondEnd);
      second.connect(secondGain);
      secondGain.connect(context.destination);
      second.start(secondStart);
      second.stop(secondEnd + 0.02);
    }
  } catch {
    // Sound is optional when AudioContext is blocked.
  }
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
