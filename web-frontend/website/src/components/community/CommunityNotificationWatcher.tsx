"use client";

import { useEffect, useRef } from "react";
import {
  INBOX_CHANGED_EVENT,
  readNotifiedPostIds,
  saveNotifiedPostIds,
  useAppChrome,
} from "@/lib/app-chrome";
import {
  listCommunities,
  listCommunityFeed,
  type CommunityPostRecord,
  type CommunityRecord,
} from "@/lib/community-api";

const POLL_MS = 5_000;

const previewText = (post: CommunityPostRecord) =>
  post.body?.trim() ||
  post.title?.trim() ||
  (post.kind === "media"
    ? "Shared a photo or video"
    : post.kind === "poll"
      ? "Shared a poll"
      : "New message");

export default function CommunityNotificationWatcher() {
  const { viewingScope } = useAppChrome();
  const viewingScopeRef = useRef(viewingScope);
  viewingScopeRef.current = viewingScope;

  useEffect(() => {
    if (typeof window === "undefined") return;
    void navigator.serviceWorker
      ?.register("/community-sw.js")
      .catch(() => undefined);

    const handleSwMessage = (event: MessageEvent) => {
      const url = event.data?.url;
      if (typeof url === "string" && url.startsWith("/")) {
        window.location.assign(url);
      }
    };
    navigator.serviceWorker?.addEventListener("message", handleSwMessage);

    let stopped = false;
    let seeded = false;

    const sync = async () => {
      try {
        const joined = await listCommunities("joined");
        if (stopped) return;
        const feeds = await Promise.all(
          joined.slice(0, 20).map(async (community) => ({
            community,
            posts: await listCommunityFeed(community.id).catch(
              () => [] as CommunityPostRecord[],
            ),
          })),
        );
        if (stopped) return;

        const notified = readNotifiedPostIds();
        const incoming: Array<{
          community: CommunityRecord;
          post: CommunityPostRecord;
        }> = [];

        for (const { community, posts } of feeds) {
          const published = posts.filter((post) => post.status === "published");
          if (!seeded) {
            published.forEach((post) => notified.add(post.id));
            continue;
          }
          for (const post of published) {
            if (notified.has(post.id)) continue;
            notified.add(post.id);
            if (post.author?.friendshipStatus === "self") continue;
            incoming.push({ community, post });
          }
        }

        saveNotifiedPostIds(notified);
        if (!seeded) {
          seeded = true;
          return;
        }
        if (incoming.length === 0) return;

        window.dispatchEvent(new Event(INBOX_CHANGED_EVENT));

        if (!("Notification" in window) || Notification.permission !== "granted") {
          return;
        }

        const registration = await navigator.serviceWorker?.ready;
        if (!registration || stopped) return;

        const grouped = new Map<
          string,
          { community: CommunityRecord; posts: CommunityPostRecord[] }
        >();
        for (const item of incoming) {
          const current = grouped.get(item.community.id);
          if (current) {
            current.posts.push(item.post);
          } else {
            grouped.set(item.community.id, {
              community: item.community,
              posts: [item.post],
            });
          }
        }

        const viewing = viewingScopeRef.current;
        const pageHidden = document.visibilityState !== "visible";
        for (const { community, posts } of grouped.values()) {
          const inThisChat =
            !pageHidden && viewing === `community:${community.id}`;
          if (inThisChat) continue;
          const latest = posts.at(-1);
          if (!latest) continue;
          const extra =
            posts.length > 1 ? ` (+${posts.length - 1} more)` : "";
          await registration.showNotification(community.name, {
            body: `${latest.author?.name ?? "Anchor member"}: ${previewText(latest)}${extra}`.slice(
              0,
              180,
            ),
            icon: "/assets/logo.png",
            badge: "/assets/logo.png",
            tag: `community-${community.id}`,
            renotify: true,
            vibrate: [120, 70, 120],
            data: {
              url: `/community?tab=communities&community=${community.id}&post=${latest.id}`,
            },
          });
        }
      } catch {
        // Keep the current session quiet during brief sync failures.
      }
    };

    void sync();
    const timer = window.setInterval(() => void sync(), POLL_MS);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") void sync();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
      navigator.serviceWorker?.removeEventListener("message", handleSwMessage);
    };
  }, []);

  return null;
}
