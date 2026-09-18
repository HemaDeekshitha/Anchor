"use client";

import { useEffect, useRef } from "react";
import {
  DEVICE_NOTIFICATION_MODE_CHANGED_EVENT,
  INBOX_CHANGED_EVENT,
  playCommunityMessageSound,
  postMentionsName,
  readDeviceNotificationMode,
  readNotifiedPostIds,
  saveNotifiedPostIds,
  seedReadPosition,
  touchRecentlyActiveCommunities,
  useAppChrome,
  type DeviceNotificationMode,
} from "@/lib/app-chrome";
import {
  getCurrentCommunityProfile,
  getLatestPostMarker,
  listCommunities,
  listCommunityFeed,
  type CommunityPostRecord,
  type CommunityRecord,
} from "@/lib/community-api";

const POLL_MS = 3_500;

const previewText = (post: CommunityPostRecord) =>
  post.body?.trim() ||
  post.title?.trim() ||
  (post.kind === "media"
    ? "Shared a photo or video"
    : post.kind === "poll"
      ? "Shared a poll"
      : "New message");

/** Fields browsers accept that some TypeScript DOM libs omit from NotificationOptions. */
type CommunityNotificationOptions = NotificationOptions & {
  renotify?: boolean;
  vibrate?: number[];
  silent?: boolean;
};

const showCommunityNotification = (
  registration: ServiceWorkerRegistration,
  title: string,
  options: CommunityNotificationOptions,
) => registration.showNotification(title, options);

export default function CommunityNotificationWatcher() {
  const { viewingScope } = useAppChrome();
  const viewingScopeRef = useRef(viewingScope);
  viewingScopeRef.current = viewingScope;
  const modeRef = useRef<DeviceNotificationMode>("all");
  const profileNameRef = useRef("");
  const markerByCommunityRef = useRef<Record<string, string | null>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    modeRef.current = readDeviceNotificationMode();
    const syncMode = () => {
      modeRef.current = readDeviceNotificationMode();
    };
    window.addEventListener(DEVICE_NOTIFICATION_MODE_CHANGED_EVENT, syncMode);
    void getCurrentCommunityProfile()
      .then((profile) => {
        profileNameRef.current = profile.name ?? "";
      })
      .catch(() => undefined);

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
        const viewing = viewingScopeRef.current;
        const pageHidden = document.visibilityState !== "visible";

        const feeds: Array<{
          community: CommunityRecord;
          posts: CommunityPostRecord[];
        }> = [];

        for (const community of joined.slice(0, 8)) {
          const inThisChat =
            !pageHidden && viewing === `community:${community.id}`;
          // Members already inside this group get live posts from CommunityFeed.
          // Skip heavy feed fetches here to avoid rate-limit starvation.
          if (inThisChat) {
            const marker = await getLatestPostMarker(community.id).catch(
              () => null,
            );
            if (marker?.id) {
              seedReadPosition(`community:${community.id}`, marker.id, false);
              markerByCommunityRef.current[community.id] = marker.id;
            }
            continue;
          }

          const previousMarker = markerByCommunityRef.current[community.id];
          const marker = await getLatestPostMarker(community.id).catch(
            () => null,
          );
          if (
            previousMarker !== undefined &&
            marker?.id === previousMarker
          ) {
            continue;
          }

          const posts = await listCommunityFeed(community.id, {
            fresh: true,
          }).catch(() => [] as CommunityPostRecord[]);
          feeds.push({ community, posts });
          const latest = [...posts].sort(
            (left, right) =>
              new Date(left.createdAt).getTime() -
              new Date(right.createdAt).getTime(),
          ).at(-1);
          markerByCommunityRef.current[community.id] =
            latest?.id ?? marker?.id ?? null;
        }
        if (stopped) return;

        const notified = readNotifiedPostIds();
        const incoming: Array<{
          community: CommunityRecord;
          post: CommunityPostRecord;
          mentioned: boolean;
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
            incoming.push({
              community,
              post,
              mentioned: postMentionsName(post.body, profileNameRef.current),
            });
          }
        }

        saveNotifiedPostIds(notified);
        if (!seeded) {
          seeded = true;
          return;
        }
        if (incoming.length === 0) return;

        const notifiedCommunityIds = [...incoming]
          .sort(
            (left, right) =>
              new Date(right.post.createdAt).getTime() -
              new Date(left.post.createdAt).getTime(),
          )
          .map((item) => item.community.id);
        touchRecentlyActiveCommunities(notifiedCommunityIds);
        window.dispatchEvent(new Event(INBOX_CHANGED_EVENT));

        const mode = modeRef.current;
        const grouped = new Map<
          string,
          {
            community: CommunityRecord;
            posts: CommunityPostRecord[];
            mentioned: boolean;
          }
        >();
        for (const item of incoming) {
          const current = grouped.get(item.community.id);
          if (current) {
            current.posts.push(item.post);
            current.mentioned = current.mentioned || item.mentioned;
          } else {
            grouped.set(item.community.id, {
              community: item.community,
              posts: [item.post],
              mentioned: item.mentioned,
            });
          }
        }

        let playedOutsideSound = false;
        for (const { community } of grouped.values()) {
          if (!playedOutsideSound) {
            playCommunityMessageSound("outside");
            playedOutsideSound = true;
          }
          void community;
        }

        if (
          mode === "off" ||
          !("Notification" in window) ||
          Notification.permission !== "granted"
        ) {
          return;
        }

        const registration = await navigator.serviceWorker?.ready;
        if (!registration || stopped) return;

        for (const { community, posts, mentioned } of grouped.values()) {
          const latest = posts.at(-1);
          if (!latest) continue;
          const mentionPost =
            posts.find((post) =>
              postMentionsName(post.body, profileNameRef.current),
            ) ?? latest;
          const title = mentioned
            ? `${community.name} · Mentioned you`
            : community.name;
          const body = mentioned
            ? posts.length > 1
              ? `${posts.length} new messages · ${mentionPost.author?.name ?? "Someone"} mentioned you`
              : `${mentionPost.author?.name ?? "Someone"} mentioned you: ${previewText(mentionPost)}`
            : posts.length > 1
              ? `${posts.length} new messages`
              : `${latest.author?.name ?? "Anchor member"}: ${previewText(latest)}`;
          await showCommunityNotification(registration, title, {
            body: body.slice(0, 180),
            icon: "/assets/Anchor_logo.png",
            badge: "/assets/Anchor_logo.png",
            tag: mentioned
              ? `community-mention-${community.id}`
              : `community-${community.id}`,
            renotify: true,
            silent: true,
            vibrate: mode === "silent" ? [] : mentioned ? [160, 80, 160] : [120, 70, 120],
            data: {
              url: `/community?tab=communities&community=${community.id}&post=${(mentioned ? mentionPost : latest).id}`,
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
      window.removeEventListener(DEVICE_NOTIFICATION_MODE_CHANGED_EVENT, syncMode);
      navigator.serviceWorker?.removeEventListener("message", handleSwMessage);
    };
  }, []);

  return null;
}
