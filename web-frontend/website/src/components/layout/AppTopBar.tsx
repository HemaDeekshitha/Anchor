"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Badge,
  Box,
  CircularProgress,
  ClickAwayListener,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import { logoutSession } from "@/lib/auth-client";
import {
  dismissInboxPosts,
  INBOX_CHANGED_EVENT,
  markFriendRequestsSeen,
  openInboxPost,
  readDismissedPostIds,
  readSeenFriendRequestIds,
  seedReadPosition,
  textMatchesQuery,
  useAppChrome,
} from "@/lib/app-chrome";
import {
  getCurrentCommunityProfile,
  listCommunities,
  listCommunityFeed,
  listFriendRequests,
  listGlobalPosts,
  searchPeople,
  type CommunityFriendRequest,
  type CommunityPersonSearchResult,
  type CommunityPostRecord,
  type CommunityRecord,
} from "@/lib/community-api";
import { useThemeMode } from "@/lib/theme-mode";

type AppTopBarProps = {
  onOpenNavigation: () => void;
};

type SearchHit =
  | { kind: "message"; post: CommunityPostRecord; communityName?: string }
  | { kind: "community"; community: CommunityRecord }
  | { kind: "person"; person: CommunityPersonSearchResult };

type MissedMessage = {
  id: string;
  communityId: string | null;
  communityName?: string;
  authorName: string;
  authorAvatar?: string | null;
  body: string;
};

const SEARCH_DEBOUNCE_MS = 220;
const READ_POSITION_PREFIX = "anchor.community.readPosition";

const previewText = (post: CommunityPostRecord) =>
  post.body?.trim() ||
  post.title?.trim() ||
  (post.kind === "media"
    ? "Shared a photo or video"
    : post.kind === "poll"
      ? "Shared a poll"
      : "New message");

const unreadAfter = (
  posts: CommunityPostRecord[],
  scope: string,
  lastReadId: string | null,
) => {
  const sorted = [...posts]
    .filter((post) => post.status === "published")
    .sort(
      (left, right) =>
        new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
    );
  if (sorted.length === 0) return [];
  const latestId = sorted.at(-1)?.id;
  if (!lastReadId) {
    if (latestId) seedReadPosition(scope, latestId);
    return [];
  }
  const index = sorted.findIndex((post) => post.id === lastReadId);
  if (index === -1) {
    if (latestId) seedReadPosition(scope, latestId);
    return [];
  }
  return sorted.slice(index + 1);
};

export default function AppTopBar({ onOpenNavigation }: AppTopBarProps) {
  const router = useRouter();
  const { mode, toggleMode } = useThemeMode();
  const { messages } = useAppChrome();
  const searchFieldRef = useRef<HTMLInputElement | null>(null);
  const searchRequestIdRef = useRef(0);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [remoteSearch, setRemoteSearch] = useState<{
    query: string;
    hits: SearchHit[];
  }>({ query: "", hits: [] });
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    avatarUrl: string | null;
  } | null>(null);
  const [requests, setRequests] = useState<CommunityFriendRequest[]>([]);
  const [missedMessages, setMissedMessages] = useState<MissedMessage[]>([]);
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);
  const [noticeAnchor, setNoticeAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getCurrentCommunityProfile()
      .then((next) => {
        if (cancelled) return;
        setProfile({
          name: next.name || "Account",
          email: next.email || "",
          avatarUrl: next.avatarUrl,
        });
      })
      .catch(() => undefined);

    const loadInbox = async () => {
      try {
        const [nextRequests, joined, feedPosts] = await Promise.all([
          listFriendRequests(),
          listCommunities("joined"),
          listGlobalPosts().catch(() => [] as CommunityPostRecord[]),
        ]);
        if (cancelled) return;
        const seenRequests = readSeenFriendRequestIds();
        setRequests(nextRequests.filter((request) => !seenRequests.has(request.id)));

        const communityFeeds = await Promise.all(
          joined.slice(0, 12).map(async (community) => {
            const posts = await listCommunityFeed(community.id).catch(
              () => [] as CommunityPostRecord[],
            );
            return { community, posts };
          }),
        );
        if (cancelled) return;

        const dismissed = readDismissedPostIds();
        const nextMissed: MissedMessage[] = [];
        const seen = new Set<string>();
        const pushUnread = (
          posts: CommunityPostRecord[],
          scope: string,
          lastReadId: string | null,
          communityName?: string,
        ) => {
          unreadAfter(posts, scope, lastReadId).forEach((post) => {
            if (seen.has(post.id) || dismissed.has(post.id)) return;
            seen.add(post.id);
            nextMissed.push({
              id: post.id,
              communityId: post.communityId,
              communityName,
              authorName: post.author?.name ?? "Anchor member",
              authorAvatar: post.author?.avatarUrl,
              body: previewText(post),
            });
          });
        };

        communityFeeds.forEach(({ community, posts }) => {
          const scope = `community:${community.id}`;
          pushUnread(
            posts,
            scope,
            window.localStorage.getItem(`${READ_POSITION_PREFIX}.${scope}`),
            community.name,
          );
        });
        pushUnread(
          feedPosts,
          "feed",
          window.localStorage.getItem(`${READ_POSITION_PREFIX}.feed`),
          "Feed",
        );
        setMissedMessages(nextMissed.slice(-8).reverse());
      } catch {
        if (!cancelled) {
          setRequests([]);
          setMissedMessages([]);
        }
      }
    };

    const handleInboxChanged = () => {
      void loadInbox();
    };
    void loadInbox();
    window.addEventListener(INBOX_CHANGED_EVENT, handleInboxChanged);
    return () => {
      cancelled = true;
      window.removeEventListener(INBOX_CHANGED_EVENT, handleInboxChanged);
    };
  }, []);

  const trimmedQuery = query.trim();

  const messageHits = useMemo<SearchHit[]>(() => {
    if (trimmedQuery.length < 2) return [];
    return messages
      .filter(
        (message) =>
          textMatchesQuery(message.body, trimmedQuery) ||
          textMatchesQuery(message.authorName, trimmedQuery),
      )
      .slice(0, 8)
      .map((message) => ({
        kind: "message" as const,
        communityName: message.communityName,
        post: {
          id: message.id,
          communityId: message.communityId,
          authorId: "",
          replyToPostId: null,
          kind: "text",
          title: null,
          body: message.body,
          status: "published",
          upvoteCount: 0,
          downvoteCount: 0,
          commentCount: 0,
          viewCount: "0",
          createdAt: "",
          author: {
            id: "",
            name: message.authorName,
            email: "",
            avatarUrl: message.authorAvatar ?? null,
            profession: "",
            friendshipStatus: "none",
          },
          viewerVote: 0,
          replyTo: null,
          media: [],
          poll: null,
        },
      }));
  }, [messages, trimmedQuery]);

  useEffect(() => {
    if (trimmedQuery.length < 2) {
      searchRequestIdRef.current += 1;
      setRemoteSearch({ query: "", hits: [] });
      setSearching(false);
      return;
    }

    const requestId = ++searchRequestIdRef.current;
    const timer = window.setTimeout(() => {
      void (async () => {
        setSearching(true);
        try {
          const [people, joined, discover] = await Promise.all([
            searchPeople(trimmedQuery).catch(() => []),
            listCommunities("joined", trimmedQuery).catch(() => []),
            listCommunities("discover", trimmedQuery).catch(() => []),
          ]);
          if (requestId !== searchRequestIdRef.current) return;
          const communities = [...joined, ...discover].filter(
            (community, index, all) =>
              all.findIndex((item) => item.id === community.id) === index,
          );
          setRemoteSearch({
            query: trimmedQuery,
            hits: [
              ...communities.slice(0, 4).map((community) => ({
                kind: "community" as const,
                community,
              })),
              ...people.slice(0, 4).map((person) => ({
                kind: "person" as const,
                person,
              })),
            ],
          });
        } catch {
          if (requestId !== searchRequestIdRef.current) return;
          setRemoteSearch({ query: trimmedQuery, hits: [] });
        } finally {
          if (requestId === searchRequestIdRef.current) {
            setSearching(false);
          }
        }
      })();
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [trimmedQuery]);

  const hits = useMemo(
    () => [
      ...messageHits,
      ...(remoteSearch.query === trimmedQuery ? remoteSearch.hits : []),
    ],
    [messageHits, remoteSearch, trimmedQuery],
  );

  const initials = useMemo(() => {
    const source = profile?.name?.trim() || "A";
    return source
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [profile?.name]);

  const inboxCount = missedMessages.length + requests.length;

  const handleSignOut = async () => {
    setProfileAnchor(null);
    try {
      await logoutSession("manual");
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const closeSearch = () => {
    setSearchOpen(false);
  };

  const openCommunity = (communityId: string, postId?: string) => {
    closeSearch();
    setNoticeAnchor(null);
    setQuery("");
    const params = new URLSearchParams({
      tab: "communities",
      community: communityId,
    });
    if (postId) params.set("post", postId);
    router.push(`/community?${params.toString()}`);
  };

  const openMessage = (post: CommunityPostRecord, communityName?: string) => {
    closeSearch();
    setNoticeAnchor(null);
    setQuery("");
    dismissInboxPosts([post.id]);
    setMissedMessages((current) => current.filter((item) => item.id !== post.id));
    openInboxPost({ postId: post.id, communityId: post.communityId });
    if (post.communityId) {
      openCommunity(post.communityId, post.id);
      return;
    }
    router.push(`/community?tab=feed&post=${post.id}`);
    void communityName;
  };

  const openFriends = (requestId?: string) => {
    closeSearch();
    setNoticeAnchor(null);
    setQuery("");
    if (requestId) {
      markFriendRequestsSeen([requestId]);
      setRequests((current) => current.filter((item) => item.id !== requestId));
    }
    router.push("/community?tab=friends");
  };

  const markAllAsRead = () => {
    dismissInboxPosts(missedMessages.map((message) => message.id));
    markFriendRequestsSeen(requests.map((request) => request.id));
    missedMessages.forEach((message) => {
      const scope = message.communityId
        ? `community:${message.communityId}`
        : "feed";
      seedReadPosition(scope, message.id);
    });
    setMissedMessages([]);
    setRequests([]);
  };

  return (
    <Box
      component="header"
      sx={{
        position: "fixed",
        top: 0,
        left: { xs: 0, md: "var(--anchor-sidebar-width, 0px)" },
        right: 0,
        zIndex: 1300,
        height: "var(--anchor-topbar-height, 56px)",
        display: "flex",
        alignItems: "center",
        gap: { xs: 0.75, sm: 1.25, md: 2 },
        px: { xs: 1.25, sm: 2, md: 3 },
        bgcolor: "var(--anchor-header-bg)",
        borderBottom: "1px solid var(--anchor-header-border)",
        color: "var(--anchor-header-text)",
      }}
    >
      <IconButton
        aria-label="Open navigation"
        onClick={onOpenNavigation}
        sx={{
          display: { xs: "inline-flex", md: "none" },
          color: "var(--anchor-header-text)",
          border: "1px solid var(--anchor-header-border)",
          borderRadius: 2,
          bgcolor: "var(--anchor-header-bg)",
          "&:hover": { bgcolor: "var(--anchor-surface-muted)" },
        }}
      >
        <MenuIcon />
      </IconButton>

      <ClickAwayListener onClickAway={closeSearch}>
        <Box sx={{ position: "relative", flex: 1, minWidth: 0, maxWidth: { md: 640, lg: 720 } }}>
          <TextField
            inputRef={searchFieldRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search..."
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ color: "var(--anchor-header-muted)", fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: { xs: 38, sm: 40 },
                borderRadius: 999,
                bgcolor: "var(--anchor-search-bg)",
                color: "var(--anchor-header-text)",
                fontSize: "16px",
                "& fieldset": { borderColor: "var(--anchor-header-border)" },
                "&:hover fieldset": { borderColor: "var(--anchor-header-border)" },
                "&.Mui-focused fieldset": {
                  borderColor: "var(--anchor-header-border)",
                  borderWidth: 1,
                },
              },
            }}
          />
          {searchOpen && query.trim().length >= 2 && (
            <Paper
              elevation={8}
              sx={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                right: 0,
                zIndex: 1400,
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: "var(--anchor-surface)",
                color: "var(--foreground)",
                border: "1px solid var(--anchor-header-border)",
              }}
            >
              {searching ? (
                <LinearProgress
                  sx={{
                    height: 2,
                    bgcolor: "transparent",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "var(--anchor-header-muted)",
                    },
                  }}
                />
              ) : null}
              {hits.length === 0 && searching ? (
                <Box sx={{ display: "grid", placeItems: "center", py: 2 }}>
                  <CircularProgress size={20} sx={{ color: "var(--foreground)" }} />
                </Box>
              ) : hits.length === 0 ? (
                <Typography sx={{ px: 2, py: 1.5, fontSize: "0.85rem", color: "var(--anchor-header-muted)" }}>
                  No matches for “{query.trim()}”.
                </Typography>
              ) : (
                hits.map((hit) =>
                  hit.kind === "message" ? (
                    <MenuItem
                      key={`message-${hit.post.id}`}
                      onClick={() => openMessage(hit.post, hit.communityName)}
                      sx={{ gap: 1.25, py: 1.1, alignItems: "flex-start" }}
                    >
                      <Avatar
                        src={hit.post.author?.avatarUrl ?? undefined}
                        sx={{ width: 28, height: 28, mt: 0.2 }}
                      >
                        {hit.post.author?.name?.[0] || "M"}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.86rem" }}>
                          {hit.post.author?.name || "Message"}
                        </Typography>
                        <Typography
                          sx={{
                            color: "var(--anchor-header-muted)",
                            fontSize: "0.72rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {previewText(hit.post)}
                          {hit.communityName ? ` · ${hit.communityName}` : ""}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ) : hit.kind === "community" ? (
                    <MenuItem
                      key={`community-${hit.community.id}`}
                      onClick={() => openCommunity(hit.community.id)}
                      sx={{ gap: 1.25, py: 1.1 }}
                    >
                      <GroupsRoundedIcon sx={{ color: "var(--foreground)", fontSize: 20 }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.86rem" }}>
                          {hit.community.name}
                        </Typography>
                        <Typography sx={{ color: "var(--anchor-header-muted)", fontSize: "0.72rem" }}>
                          Community
                        </Typography>
                      </Box>
                    </MenuItem>
                  ) : (
                    <MenuItem
                      key={`person-${hit.person.id}`}
                      onClick={() => openFriends()}
                      sx={{ gap: 1.25, py: 1.1 }}
                    >
                      <Avatar src={hit.person.avatarUrl ?? undefined} sx={{ width: 28, height: 28 }}>
                        {hit.person.name[0]}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.86rem" }}>
                          {hit.person.name}
                        </Typography>
                        <Typography sx={{ color: "var(--anchor-header-muted)", fontSize: "0.72rem" }}>
                          {hit.person.handle || hit.person.role || "Person"}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ),
                )
              )}
            </Paper>
          )}
        </Box>
      </ClickAwayListener>

      <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: { xs: 0.25, sm: 0.5 } }}>
        <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
          <IconButton
            aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            onClick={toggleMode}
            sx={{ color: "var(--anchor-header-text)" }}
          >
            {mode === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Unread messages">
          <IconButton
            aria-label="Unread messages"
            onClick={(event) => setNoticeAnchor(event.currentTarget)}
            sx={{ color: "var(--anchor-header-text)" }}
          >
            <Badge
              badgeContent={inboxCount}
              color="error"
              max={99}
              invisible={inboxCount === 0}
              sx={{ "& .MuiBadge-badge": { fontSize: "0.65rem", fontWeight: 700 } }}
            >
              <NotificationsNoneRoundedIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <Box
          sx={{
            width: "1px",
            height: 28,
            mx: { xs: 0.5, sm: 1 },
            bgcolor: "var(--anchor-header-border)",
          }}
        />

        <Box
          role="button"
          tabIndex={0}
          aria-label="Account menu"
          onClick={(event) => setProfileAnchor(event.currentTarget)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setProfileAnchor(event.currentTarget);
            }
          }}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            cursor: "pointer",
            borderRadius: 999,
            p: 0.25,
            "&:hover": { bgcolor: "#f7f7f7" },
          }}
        >
          <Avatar
            src={profile?.avatarUrl ?? undefined}
            alt={profile?.name || "Profile"}
            sx={{ width: { xs: 32, sm: 36 }, height: { xs: 32, sm: 36 } }}
          >
            {initials}
          </Avatar>
          <KeyboardArrowDownRoundedIcon
            sx={{
              display: { xs: "none", sm: "block" },
              color: "#8a8a8a",
              fontSize: 20,
            }}
          />
        </Box>
      </Box>

      <Menu
        anchorEl={noticeAnchor}
        open={Boolean(noticeAnchor)}
        onClose={() => setNoticeAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 280,
              maxWidth: 360,
              borderRadius: 2,
            },
          },
        }}
      >
        {inboxCount === 0 ? (
          <MenuItem disabled sx={{ opacity: 1, whiteSpace: "normal" }}>
            No notifications.
          </MenuItem>
        ) : null}
        {inboxCount > 0 ? (
          <Typography sx={{ px: 2, pt: 1.2, pb: 0.5, fontSize: "0.72rem", fontWeight: 700, color: "var(--anchor-muted)" }}>
            Missed messages
          </Typography>
        ) : null}
        {inboxCount > 0 && missedMessages.length === 0 ? (
          <MenuItem disabled sx={{ opacity: 1, whiteSpace: "normal" }}>
            No missed messages.
          </MenuItem>
        ) : (
          missedMessages.map((message) => (
            <MenuItem
              key={message.id}
              onClick={() =>
                openMessage(
                  {
                    id: message.id,
                    communityId: message.communityId,
                    authorId: "",
                    replyToPostId: null,
                    kind: "text",
                    title: null,
                    body: message.body,
                    status: "published",
                    upvoteCount: 0,
                    downvoteCount: 0,
                    commentCount: 0,
                    viewCount: "0",
                    createdAt: "",
                    author: {
                      id: "",
                      name: message.authorName,
                      email: "",
                      avatarUrl: message.authorAvatar ?? null,
                      profession: "",
                      friendshipStatus: "none",
                    },
                    viewerVote: 0,
                    replyTo: null,
                    media: [],
                    poll: null,
                  },
                  message.communityName,
                )
              }
              sx={{ gap: 1.25, py: 1.1, alignItems: "flex-start" }}
            >
              <Avatar src={message.authorAvatar ?? undefined} sx={{ width: 32, height: 32 }}>
                {message.authorName[0]}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.86rem" }}>
                  {message.authorName}
                </Typography>
                <Typography
                  sx={{
                    color: "var(--anchor-header-muted)",
                    fontSize: "0.72rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {message.body}
                  {message.communityName ? ` · ${message.communityName}` : ""}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
        {inboxCount > 0 ? <Divider /> : null}
        {inboxCount > 0 ? (
          <Typography sx={{ px: 2, pt: 1.2, pb: 0.5, fontSize: "0.72rem", fontWeight: 700, color: "var(--anchor-muted)" }}>
            Friend requests
          </Typography>
        ) : null}
        {inboxCount > 0 && requests.length === 0 ? (
          <MenuItem disabled sx={{ opacity: 1, whiteSpace: "normal" }}>
            No pending friend requests.
          </MenuItem>
        ) : (
          requests.slice(0, 5).map((request) => (
            <MenuItem key={request.id} onClick={() => openFriends(request.id)} sx={{ gap: 1.25, py: 1.1 }}>
              <Avatar src={request.avatarUrl ?? undefined} sx={{ width: 32, height: 32 }}>
                {request.name[0]}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.86rem" }}>
                  {request.name}
                </Typography>
                <Typography sx={{ color: "var(--anchor-header-muted)", fontSize: "0.72rem" }}>
                  sent you a friend request
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
        {inboxCount > 0 ? <Divider /> : null}
        {inboxCount > 0 ? (
          <MenuItem onClick={markAllAsRead} sx={{ gap: 1.25, fontWeight: 700 }}>
            <DoneAllRoundedIcon fontSize="small" />
            Mark all as read
          </MenuItem>
        ) : null}
      </Menu>

      <Menu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={() => setProfileAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 240,
              borderRadius: 2,
              overflow: "hidden",
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.4 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--foreground)" }}>
            {profile?.name || "Account"}
          </Typography>
          {profile?.email ? (
            <Typography sx={{ color: "var(--anchor-header-muted)", fontSize: "0.78rem" }}>
              {profile.email}
            </Typography>
          ) : null}
        </Box>
        <Divider />
        <MenuItem
          component={Link}
          href="/profile"
          onClick={() => setProfileAnchor(null)}
          sx={{ gap: 1.25, py: 1.15 }}
        >
          <SettingsOutlinedIcon fontSize="small" sx={{ color: "#555" }} />
          Settings
        </MenuItem>
        <MenuItem onClick={() => void handleSignOut()} sx={{ gap: 1.25, py: 1.15, color: "#c45c3a" }}>
          <LogoutRoundedIcon fontSize="small" />
          Sign out
        </MenuItem>
      </Menu>
    </Box>
  );
}
