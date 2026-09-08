"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Stack,
  Avatar,
  Chip,
  Divider,
  Button,
  TextField,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Checkbox,
  InputAdornment,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Menu,
  MenuItem,
  Radio,
  RadioGroup,
  Badge,
} from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import PollOutlinedIcon from "@mui/icons-material/PollOutlined";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import ShortcutRoundedIcon from "@mui/icons-material/ShortcutRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ReplyRoundedIcon from "@mui/icons-material/ReplyRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import {
  CommunityPostRecord,
  CommunityFriendRequest,
  Comm360Meeting,
  CommunityMemberRecord,
  CommunityPersonSearchResult,
  CommunityRecord,
  CommunityVisibility,
  addCommunityMember,
  acceptCommunityInvite,
  createComment,
  createCommunity,
  createInviteLink,
  createPost,
  deleteCommunity,
  deleteComment,
  deletePost,
  updateComment,
  voteComment,
  getCurrentCommunityProfile,
  joinCommunity,
  listCommunityMembers,
  listComments,
  listCommunities,
  listCommunityFeed,
  listFriendRequests,
  listSentFriendRequests,
  listFriends,
  listGlobalPosts,
  getComm360Meeting,
  removeFriend,
  removeCommunityMember,
  sendFriendRequest,
  searchPeople,
  resolveFriendRequest,
  votePoll,
  votePost,
  updatePost,
  updateCommunity,
  updateCommunityMemberRole,
  uploadCommunityMedia,
} from "@/lib/community-api";
import { OPEN_POST_EVENT, useAppChrome, type OpenPostDetail } from "@/lib/app-chrome";

// ── Anchor palette tokens ────────────────────────────────────────────────────
const C = {
  accent: "var(--anchor-header-accent)",
  accentDark: "var(--anchor-header-accent)",
  accentBg: "color-mix(in srgb, var(--anchor-header-accent) 12%, transparent)",
  accentBorder: "color-mix(in srgb, var(--anchor-header-accent) 20%, transparent)",
  accentFaint: "color-mix(in srgb, var(--anchor-header-accent) 12%, transparent)",
  accentHover: "color-mix(in srgb, var(--anchor-header-accent) 8%, transparent)",
  accentGrad: "linear-gradient(to right, var(--anchor-header-accent), var(--anchor-header-accent))",
  cardBg: "var(--anchor-surface)",
  surface: "var(--anchor-surface-muted)",
  divider: "var(--anchor-divider)",
  textPrimary: "var(--foreground)",
  textSub: "var(--anchor-text-sub)",
  textMuted: "var(--anchor-muted)",
  green: "#3f7d4f",
  red: "#b9573f",
} as const;

const COMMUNITY_GUTTER = { xs: 2, sm: 3, md: 4, lg: 5 } as const;
const communityColumnSx = {
  width: "100%",
  maxWidth: "none",
  alignSelf: "stretch",
} as const;

// ── Types ────────────────────────────────────────────────────────────────────
export type ForumComment = {
  id: string;
  authorName: string;
  authorAvatar?: string;
  body: string;
  timeAgo: string;
  canDelete?: boolean;
  canEdit?: boolean;
  likeCount: number;
  viewerLiked: boolean;
};

export type ForumPost = {
  id: string;
  communityId: string | null;
  status: "processing" | "published" | "removed" | "deleted";
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
  replyTo?: {
    id: string;
    authorName: string;
    authorAvatar?: string;
    body: string;
    kind: "text" | "media" | "poll";
  } | null;
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

// ── Sentinel id for the "all communities" view ──────────────────────────────
const ALL_ID = "all";

export type ScheduledMeeting = {
  id: string;
  communityId: string;
  withName: string;
  withAvatar?: string;
  topic: string;
  description?: string;
  date: string;
  time: string;
  via: string;
  startAt?: string;
  joinUrl?: string;
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
  canManage: boolean;
};

type CommunityPageTab = "posts" | "communities" | "friends";
type CommunitySectionTab = "current" | "join" | "create";
type CommunityLayout = "grid" | "list";
type ComposerMode = "text" | "emoji" | "image" | "video" | "poll";

function CommunityLayoutToggle({
  layout,
  onChange,
}: {
  layout: CommunityLayout;
  onChange: (next: CommunityLayout) => void;
}) {
  return (
    <Box
      role="group"
      aria-label="Community layout"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        flexShrink: 0,
        border: `1px solid ${C.divider}`,
        borderRadius: 1.5,
        overflow: "hidden",
        bgcolor: C.surface,
      }}
    >
      <Tooltip title="Grid view">
        <IconButton
          aria-label="Grid view"
          aria-pressed={layout === "grid"}
          onClick={() => onChange("grid")}
          size="small"
          sx={{
            width: 36,
            height: 36,
            color: layout === "grid" ? C.textPrimary : C.textMuted,
            bgcolor: layout === "grid" ? C.accentFaint : "transparent",
            borderRadius: 0,
          }}
        >
          <GridViewRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="List view">
        <IconButton
          aria-label="List view"
          aria-pressed={layout === "list"}
          onClick={() => onChange("list")}
          size="small"
          sx={{
            width: 36,
            height: 36,
            color: layout === "list" ? C.textPrimary : C.textMuted,
            bgcolor: layout === "list" ? C.accentFaint : "transparent",
            borderRadius: 0,
          }}
        >
          <ViewListRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
const COMMUNITY_LAYOUT_STORAGE_KEY = "anchor.community.layout";
const COMMUNITY_SECTION_STORAGE_KEY = "anchor.community.section";
const COMMUNITY_PAGE_TAB_STORAGE_KEY = "anchor.community.pageTab";
const COMMUNITY_CONVERSATION_STORAGE_KEY =
  "anchor.community.conversationId";
const COMMUNITY_READ_POSITION_PREFIX = "anchor.community.readPosition";
const FRIEND_REQUEST_SEEN_STORAGE_KEY =
  "anchor.community.seenFriendRequestIds";
const COMM360_URL =
  process.env.NEXT_PUBLIC_COMM360_URL || "https://comm360.feeltiptop.com/";
const MESSAGE_URL_PATTERN = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;
const COMM360_MEETING_URL_PATTERN =
  /https?:\/\/comm360\.feeltiptop\.com\/meeting\/([A-Za-z0-9_-]+)/i;

const readSeenFriendRequestIds = (): Set<string> => {
  if (typeof window === "undefined") return new Set<string>();
  try {
    const stored = JSON.parse(
      window.localStorage.getItem(FRIEND_REQUEST_SEEN_STORAGE_KEY) ?? "[]",
    );
    return new Set(
      Array.isArray(stored)
        ? stored.filter((value): value is string => typeof value === "string")
        : [],
    );
  } catch {
    return new Set<string>();
  }
};

const saveSeenFriendRequestIds = (requestIds: Set<string>): void => {
  try {
    window.localStorage.setItem(
      FRIEND_REQUEST_SEEN_STORAGE_KEY,
      JSON.stringify([...requestIds].slice(-250)),
    );
  } catch {
    // The in-memory acknowledgement still clears the badge for this session.
  }
};

const getComm360RoomId = (message: string) =>
  message.match(COMM360_MEETING_URL_PATTERN)?.[1] ?? null;

const renderMessageWithLinks = (message: string) =>
  message.split(MESSAGE_URL_PATTERN).map((part, index) => {
    if (!/^(https?:\/\/|www\.)/i.test(part)) {
      return <React.Fragment key={`${index}-${part}`}>{part}</React.Fragment>;
    }

    const [, url = part, trailingPunctuation = ""] =
      part.match(/^(.*?)([),.!;:]*)$/) ?? [];
    const href = url.startsWith("www.") ? `https://${url}` : url;

    return (
      <React.Fragment key={`${index}-${part}`}>
        <Box
          component="a"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: C.accentDark,
            fontWeight: 600,
            textDecoration: "underline",
            textUnderlineOffset: "2px",
            overflowWrap: "anywhere",
            "&:hover": { color: C.accent },
          }}
        >
          {url}
        </Box>
        {trailingPunctuation}
      </React.Fragment>
    );
  });

const COMPOSER_EMOJIS = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😊",
  "😍",
  "🤩",
  "😂",
  "🤔",
  "😎",
  "😢",
  "😭",
  "😡",
  "👍",
  "👎",
  "👏",
  "🙌",
  "💪",
  "🙏",
  "🎉",
  "✨",
  "💡",
  "❤️",
  "🧡",
  "💛",
  "💚",
  "💙",
  "💜",
  "🔥",
  "🚀",
  "✅",
  "💯",
  "🎯",
  "📚",
  "💻",
  "🛠️",
];

type CreateCommunityFormInput = {
  name: string;
  description: string;
  visibility: CommunityVisibility;
  friendIds: string[];
  firstPost: string;
  createShareLink: boolean;
};

type Friend = {
  id: string;
  name: string;
  handle: string;
  role: string;
  avatarUrl?: string | null;
  mutualFriends: number;
  isFriend: boolean;
  friendshipStatus?: "none" | "pending" | "accepted";
};

const formatTimeAgo = (createdAt: string) => {
  const elapsedMinutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 60_000),
  );
  if (elapsedMinutes < 1) return "now";
  if (elapsedMinutes < 60) return `${elapsedMinutes}m`;
  if (elapsedMinutes < 1_440) return `${Math.floor(elapsedMinutes / 60)}h`;
  return `${Math.floor(elapsedMinutes / 1_440)}d`;
};

const formatMessageDate = (createdAt: string) =>
  new Date(createdAt).toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
// T: O(1) and S: O(1)

const mapCommunity = (
  community: CommunityRecord,
  joined: boolean,
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
  canManage: community.canManage === true,
});
// T: O(1) and S: O(1)

const mapPost = (post: CommunityPostRecord): ForumPost => ({
  id: post.id,
  communityId: post.communityId,
  status: post.status,
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
  replyTo: post.replyTo
    ? {
        id: post.replyTo.id,
        authorName: post.replyTo.author?.name ?? "Anchor member",
        authorAvatar: post.replyTo.author?.avatarUrl ?? undefined,
        body:
          post.replyTo.body?.trim() ||
          (post.replyTo.kind === "media"
            ? "Shared a photo or video"
            : post.replyTo.kind === "poll"
              ? "Shared a poll"
              : "Message"),
        kind: post.replyTo.kind,
      }
    : null,
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

const delay = (milliseconds: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));
// T: O(1) scheduled work and S: O(1)

const formatUploadBytes = (bytes: number): string => {
  if (bytes < 1_000_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
};
// T: O(1) and S: O(1)

// ── Composer ─────────────────────────────────────────────────────────────────
const Composer = ({
  scope,
  communityId,
  onCreated,
  replyTo,
  onCancelReply,
}: {
  scope: "global" | "community";
  communityId?: string;
  onCreated: (post: CommunityPostRecord) => Promise<void>;
  replyTo?: ForumPost | null;
  onCancelReply?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ComposerMode>("text");
  const [content, setContent] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollDurationDays, setPollDurationDays] = useState(7);
  const [pollAllowsMultiple, setPollAllowsMultiple] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState("");
  const [uploadedAssetId, setUploadedAssetId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [totalUploadBytes, setTotalUploadBytes] = useState(0);
  const [uploadStage, setUploadStage] = useState<
    "idle" | "uploading" | "uploaded" | "publishing"
  >("idle");
  const [error, setError] = useState("");
  const [mentionMembers, setMentionMembers] = useState<CommunityMemberRecord[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const composerInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const mediaUploadAbortRef = useRef<AbortController | null>(null);
  const mediaUploadPromiseRef = useRef<Promise<string> | null>(null);
  const mediaUploadRequestRef = useRef(0);
  const validPollOptions = pollOptions.filter((option) => option.trim());
  const mentionQuery =
    scope === "community" ? content.match(/(?:^|\s)@([^\s@]*)$/)?.[1] : undefined;
  const mentionSuggestions =
    mentionQuery === undefined
      ? []
      : mentionMembers
          .filter((member) =>
            member.name.toLowerCase().includes(mentionQuery.toLowerCase()),
          )
          .slice(0, 6);
  const canSubmit =
    (scope === "global" || Boolean(communityId)) &&
    (mode === "image" || mode === "video"
      ? Boolean(file)
      : Boolean(content.trim())) &&
    (mode !== "poll" || validPollOptions.length >= 2) &&
    (mode === "poll" ? Boolean(content.trim()) : true);

  useEffect(() => {
    if (!file) {
      setMediaPreviewUrl("");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setMediaPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  useEffect(() => {
    if (scope !== "community" || !communityId) {
      setMentionMembers([]);
      return;
    }
    void listCommunityMembers(communityId)
      .then(setMentionMembers)
      .catch(() => setMentionMembers([]));
  }, [communityId, scope]);

  useEffect(() => {
    if (!replyTo) return;
    setOpen(true);
    window.requestAnimationFrame(() => composerInputRef.current?.focus());
  }, [replyTo]);

  const insertMention = (member: CommunityMemberRecord) => {
    setContent((current) =>
      `${current.replace(/@[^\s@]*$/, "")}@${member.name} `,
    );
  };

  const cancelMediaUpload = () => {
    mediaUploadRequestRef.current += 1;
    mediaUploadAbortRef.current?.abort();
    mediaUploadAbortRef.current = null;
    mediaUploadPromiseRef.current = null;
    setUploadedAssetId(null);
  };
  // T: O(1) and S: O(1)

  const handleModeChange = (nextMode: ComposerMode) => {
    if (nextMode !== mode) {
      cancelMediaUpload();
      setFile(null);
      setUploadStage("idle");
      setUploadProgress(0);
    }
    setMode(nextMode);
  };
  // T: O(1) and S: O(1)

  const handleMediaPicker = (resourceType: "image" | "video") => {
    handleModeChange(resourceType);
    setOpen(true);
    setError("");
    window.requestAnimationFrame(() => {
      const input =
        resourceType === "image"
          ? imageInputRef.current
          : videoInputRef.current;
      if (input) {
        input.value = "";
        input.click();
      }
    });
  };
  // T: O(1) and S: O(1)

  const handleMediaSelected = (
    resourceType: "image" | "video",
    selectedFile: File | null,
  ) => {
    cancelMediaUpload();
    const maxBytes = resourceType === "video" ? 50_000_000 : 10_000_000;
    if (selectedFile && selectedFile.size > maxBytes) {
      setError(
        `${resourceType === "video" ? "Video" : "Image"} must be smaller than ${
          maxBytes / 1_000_000
        } MB`,
      );
      setFile(null);
      setUploadStage("idle");
      return;
    }
    setError("");
    setMode(resourceType);
    setFile(selectedFile);
    setUploadProgress(0);
    setUploadedBytes(0);
    setTotalUploadBytes(selectedFile?.size ?? 0);
    if (!selectedFile) {
      setUploadStage("idle");
      return;
    }

    const requestId = mediaUploadRequestRef.current;
    const abortController = new AbortController();
    mediaUploadAbortRef.current = abortController;
    setUploadStage("uploading");
    const uploadPromise = uploadCommunityMedia(
      selectedFile,
      resourceType,
      (percentage, loadedBytes, totalBytes) => {
        if (mediaUploadRequestRef.current !== requestId) return;
        setUploadProgress(percentage);
        setUploadedBytes(loadedBytes);
        setTotalUploadBytes(totalBytes);
      },
      abortController.signal,
    );
    mediaUploadPromiseRef.current = uploadPromise;
    void uploadPromise
      .then((assetId) => {
        if (mediaUploadRequestRef.current !== requestId) return;
        setUploadedAssetId(assetId);
        setUploadProgress(100);
        setUploadStage("uploaded");
      })
      .catch((caught) => {
        if (
          mediaUploadRequestRef.current !== requestId ||
          (caught instanceof DOMException && caught.name === "AbortError")
        ) {
          return;
        }
        setUploadStage("idle");
        setError(
          caught instanceof Error ? caught.message : "Could not upload media",
        );
      });
  };
  // T: O(1) and S: O(1)

  const handleEmojiSelect = (emoji: string) => {
    setContent((current) => `${current}${current ? " " : ""}${emoji}`);
  };
  // T: O(c) and S: O(c), where c is the current post length

  const handleEmojiPickerToggle = () => {
    handleModeChange(mode === "emoji" ? "text" : "emoji");
  };
  // T: O(1) and S: O(1)

  const handleOpen = () => {
    setError("");
    setOpen(true);
    window.requestAnimationFrame(() => composerInputRef.current?.focus());
  };
  // T: O(1) and S: O(1)

  const resetComposer = () => {
    cancelMediaUpload();
    setContent("");
    setPollOptions(["", ""]);
    setPollDurationDays(7);
    setPollAllowsMultiple(false);
    setFile(null);
    setMode("text");
    setUploadProgress(0);
    setUploadedBytes(0);
    setTotalUploadBytes(0);
    setUploadStage("idle");
    setError("");
  };
  // T: O(1) and S: O(1)

  const handleCancel = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    if (submitting) return;
    resetComposer();
    setOpen(false);
  };
  // T: O(1) and S: O(1)

  useEffect(() => {
    if (!open) return;
    const handleDocumentPointerDown = (event: PointerEvent) => {
      if (submitting) return;
      if (
        composerRef.current &&
        !composerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    // T: O(1) and S: O(1)
    document.addEventListener("pointerdown", handleDocumentPointerDown);
    return () =>
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
  }, [open, submitting]);

  const handlePollOptionChange = (index: number, value: string) => {
    setPollOptions((current) =>
      current.map((option, optionIndex) =>
        optionIndex === index ? value : option,
      ),
    );
  };
  // T: O(p) and S: O(p), where p is the number of poll options

  const handleAddPollOption = () => {
    setPollOptions((current) =>
      current.length < 10 ? [...current, ""] : current,
    );
  };
  // T: O(p) and S: O(p), where p is the number of poll options

  const handleRemovePollOption = (index: number) => {
    if (index < 2) return;
    setPollOptions((current) =>
      current.filter((_, optionIndex) => optionIndex !== index),
    );
  };
  // T: O(p) and S: O(p), where p is the number of poll options

  const handleShare = async () => {
    if (!canSubmit) {
      setError(
        scope === "community" && !communityId
          ? "Choose a community before posting."
          : mode === "poll" && validPollOptions.length < 2
            ? "A poll needs at least two options."
            : (mode === "image" || mode === "video") && !file
              ? `Choose a ${mode} to upload.`
              : "Write something before posting.",
      );
      return;
    }
    setSubmitting(true);
    setUploadProgress(0);
    setUploadedBytes(uploadedAssetId ? file?.size ?? 0 : 0);
    setTotalUploadBytes(file?.size ?? 0);
    setError("");
    try {
      let providerAssetId = uploadedAssetId;
      if ((mode === "image" || mode === "video") && !providerAssetId) {
        const pendingUpload = mediaUploadPromiseRef.current;
        if (!pendingUpload) {
          throw new Error(`Choose a ${mode} to upload.`);
        }
        setUploadStage("uploading");
        providerAssetId = await pendingUpload;
      }
      if (mode === "image" || mode === "video") {
        setUploadStage("publishing");
      }
      const post = await createPost({
        communityId: scope === "community" ? communityId : null,
        replyToPostId: replyTo?.id,
        body: content,
        mode: mode === "emoji" ? "text" : mode,
        providerAssetId,
        pollOptions,
        pollAllowsMultiple,
        pollEndsAt: new Date(
          Date.now() + pollDurationDays * 24 * 60 * 60 * 1_000,
        ).toISOString(),
      });
      resetComposer();
      setOpen(false);
      onCancelReply?.();
      void onCreated(post);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not create post",
      );
    } finally {
      setSubmitting(false);
    }
  };
  // T: O(b + p) and S: O(b + p), where b is media bytes and p is poll options

  const handleCompactShare = (event: React.MouseEvent) => {
    event.stopPropagation();
    void handleShare();
  };
  // T: O(b + p) and S: O(b + p), where b is media bytes and p is poll options

  return (
    <Card
      ref={composerRef}
      onClick={handleOpen}
      elevation={0}
      sx={{
        position: "relative",
        width: "100%",
        maxHeight: open
          ? "min(52dvh, 520px)"
          : { xs: 52, sm: 48, md: 58 },
        minHeight: open ? 0 : { xs: 52, sm: 48, md: 58 },
        p: open ? { xs: 1.5, sm: 1.75 } : 0,
        borderRadius: open ? 4 : 999,
        bgcolor: C.cardBg,
        touchAction: "manipulation",
        border: `1px solid ${open ? C.accentBorder : C.divider}`,
        boxShadow: open
          ? "0 10px 30px rgba(44,26,10,0.12)"
          : "0 3px 14px rgba(44,26,10,0.06)",
        overflow: open ? "auto" : "hidden",
        transition:
          "max-height 320ms cubic-bezier(0.4, 0, 0.2, 1), border-color 200ms ease, box-shadow 200ms ease",
      }}
    >
      {open && replyTo && (
        <Box
          onClick={(event) => event.stopPropagation()}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1,
            px: 1.1,
            py: 0.8,
            borderRadius: 2,
            bgcolor: C.surface,
            borderLeft: `3px solid ${C.accent}`,
          }}
        >
          <Avatar
            src={replyTo.authorAvatar}
            sx={{ width: 28, height: 28, fontSize: "0.72rem" }}
          >
            {replyTo.authorName.charAt(0)}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: "0.76rem", fontWeight: 700 }}>
              Replying to {replyTo.authorName}
            </Typography>
            <Typography
              noWrap
              sx={{ color: C.textMuted, fontSize: "0.72rem" }}
            >
              {replyTo.body || "Shared a message"}
            </Typography>
          </Box>
          <IconButton
            aria-label="Cancel reply"
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              onCancelReply?.();
            }}
          >
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      )}
      <Box
        sx={{
          display: "flex",
          alignItems: open ? "flex-start" : "center",
          gap: open ? 1.2 : 0.5,
          minHeight: open ? 0 : { xs: 50, sm: 46, md: 56 },
          pr: open ? 4.5 : 0,
        }}
      >
        <TextField
          inputRef={composerInputRef}
          fullWidth
          multiline
          minRows={open ? 4 : 1}
          maxRows={open ? 8 : 1}
          value={content}
          disabled={submitting}
          onFocus={handleOpen}
          onChange={(event) => setContent(event.target.value)}
          inputProps={{ maxLength: mode === "poll" ? 150 : 10_000 }}
          helperText={open && mode === "poll" ? `${content.length}/150` : ""}
          FormHelperTextProps={{
            sx: {
              m: 0,
              mt: 0.25,
              textAlign: "right",
              color: C.textMuted,
              fontSize: "0.7rem",
            },
          }}
          placeholder={
            open
              ? mode === "poll"
                ? "What is the question?"
                : "What do you want to share?"
              : "Start a message or post"
          }
          variant="standard"
          InputProps={{ disableUnderline: true }}
          sx={{
            minWidth: 0,
            py: open ? 0.3 : 0.25,
            "& .MuiInputBase-root": {
              alignItems: open ? "flex-start" : "center",
              color: C.textPrimary,
              fontSize: "16px",
              lineHeight: 1.55,
              border: open ? `1px solid ${C.divider}` : "1px solid transparent",
              borderRadius: open ? 2 : 0,
              bgcolor: "transparent",
              px: open ? 1.5 : { xs: 1.25, sm: 1.5, md: 2 },
              py: open ? 1.1 : 0,
              transition: "font-size 200ms ease",
            },
            "& .MuiInputBase-root.Mui-focused": {
              borderColor: C.textPrimary,
            },
            "& textarea::placeholder": {
              color: C.textMuted,
              opacity: 1,
            },
            "& input::placeholder": {
              color: C.textMuted,
              opacity: 1,
            },
          }}
        />

        {open && mentionSuggestions.length > 0 && (
          <Box
            role="listbox"
            aria-label="Mention a community member"
            sx={{
              position: "absolute",
              top: 62,
              left: { xs: 12, sm: 16 },
              width: { xs: "calc(100% - 56px)", sm: 320 },
              zIndex: 5,
              bgcolor: C.cardBg,
              border: `1px solid ${C.divider}`,
              borderRadius: 2,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              overflow: "hidden",
            }}
          >
            {mentionSuggestions.map((member) => (
              <Box
                component="button"
                type="button"
                key={member.userId}
                onClick={(event: React.MouseEvent) => {
                  event.stopPropagation();
                  insertMention(member);
                }}
                sx={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 1,
                  border: 0,
                  bgcolor: C.cardBg,
                  color: C.textPrimary,
                  cursor: "pointer",
                  textAlign: "left",
                  "&:hover": { bgcolor: C.surface },
                }}
              >
                <Avatar sx={{ width: 28, height: 28, fontSize: "0.72rem" }}>
                  {member.name.charAt(0)}
                </Avatar>
                <span>{member.name}</span>
              </Box>
            ))}
          </Box>
        )}

        {!open && (
          <IconButton
            aria-label="Send message or post"
            onClick={handleCompactShare}
            disabled={!canSubmit || submitting}
            size="small"
            sx={{
              width: { xs: 30, sm: 34, md: 40 },
              height: { xs: 30, sm: 34, md: 40 },
              minWidth: { xs: 30, sm: 34, md: 40 },
              mr: { xs: 0.55, sm: 0.7, md: 0.75 },
              flexShrink: 0,
              color: "#fff",
              bgcolor: canSubmit ? C.accent : "#e7e4e1",
              "&:hover": { bgcolor: canSubmit ? C.accentDark : "#e7e4e1" },
              "&.Mui-disabled": { color: "#aaa", bgcolor: "#e7e4e1" },
            }}
          >
            <SendRoundedIcon sx={{ fontSize: { xs: 15, sm: 17, md: 18 } }} />
          </IconButton>
        )}

        {open && (
          <IconButton
            aria-label="Cancel post"
            onClick={handleCancel}
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: C.textMuted,
              flexShrink: 0,
              zIndex: 2,
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Box
        aria-hidden={!open}
        sx={{
          pl: 0,
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(10px)",
          pointerEvents: open ? "auto" : "none",
          transition:
            "opacity 180ms ease 80ms, transform 240ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {mode === "poll" && (
          <Stack spacing={1.15} sx={{ mt: 1, maxWidth: 680 }}>
            {pollOptions.map((option, index) => (
              <TextField
                key={`poll-option-${index}`}
                size="small"
                value={option}
                onChange={(event) =>
                  handlePollOptionChange(index, event.target.value)
                }
                placeholder={`Option ${index + 1}`}
                inputProps={{ maxLength: 30 }}
                helperText={`${option.length}/30`}
                FormHelperTextProps={{
                  sx: {
                    m: 0,
                    mt: 0.2,
                    mr: 0.5,
                    textAlign: "right",
                    color: C.textMuted,
                    fontSize: "0.68rem",
                  },
                }}
                InputProps={{
                  endAdornment:
                    index >= 2 ? (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={`Remove option ${index + 1}`}
                          size="small"
                          onClick={() => handleRemovePollOption(index)}
                          sx={{ color: C.textMuted }}
                        >
                          <CloseRoundedIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : undefined,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: C.surface,
                    "& fieldset": { borderColor: C.divider },
                  },
                }}
              />
            ))}
            {pollOptions.length < 10 && (
              <Button
                startIcon={<AddRoundedIcon />}
                onClick={handleAddPollOption}
                sx={{
                  alignSelf: "flex-start",
                  color: C.accentDark,
                  textTransform: "none",
                  fontWeight: 700,
                  px: 0.5,
                }}
              >
                Add option
              </Button>
            )}
            <TextField
              select
              size="small"
              label="Poll duration"
              value={pollDurationDays}
              onChange={(event) =>
                setPollDurationDays(Number(event.target.value))
              }
              SelectProps={{ native: true }}
              InputLabelProps={{ shrink: true }}
              sx={{
                maxWidth: 240,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "& fieldset": { borderColor: C.divider },
                },
              }}
            >
              <option value={1}>1 day</option>
              <option value={3}>3 days</option>
              <option value={7}>1 week</option>
              <option value={14}>2 weeks</option>
            </TextField>
            <FormControlLabel
              control={
                <Switch
                  checked={pollAllowsMultiple}
                  onChange={(event) =>
                    setPollAllowsMultiple(event.target.checked)
                  }
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: C.accent },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      bgcolor: C.accent,
                    },
                  }}
                />
              }
              label="Allow people to select multiple options in this poll"
              sx={{
                mt: 0.25,
                "& .MuiFormControlLabel-label": {
                  color: C.textSub,
                  fontSize: "0.78rem",
                },
              }}
            />
          </Stack>
        )}

        {(mode === "image" || mode === "video") && (
          <Box
            sx={{
              mt: 1.5,
              px: 1.5,
              py: 1.25,
              borderRadius: 2,
              bgcolor: C.surface,
              border: `1px solid ${C.divider}`,
            }}
          >
            {mediaPreviewUrl && (
              <Box
                component={mode === "image" ? "img" : "video"}
                src={mediaPreviewUrl}
                controls={mode === "video"}
                muted={mode === "video"}
                playsInline={mode === "video"}
                sx={{
                  display: "block",
                  width: "100%",
                  maxHeight: 360,
                  objectFit: "contain",
                  borderRadius: 1.5,
                  bgcolor: mode === "video" ? "#111" : C.surface,
                  mb: 1,
                }}
              />
            )}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Typography sx={{ color: C.textSub, fontSize: "0.8rem" }}>
                {file
                  ? file.name
                  : `Choose ${mode === "image" ? "an image" : "a video"} from your device${
                      mode === "video" ? " · max 50 MB" : ""
                    }`}
              </Typography>
              <Button
                size="small"
                variant="text"
                disabled={submitting}
                onClick={() =>
                  file && uploadStage === "idle"
                    ? handleMediaSelected(mode, file)
                    : handleMediaPicker(mode)
                }
                sx={{
                  color: C.accentDark,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                {file && uploadStage === "idle"
                  ? "Retry"
                  : file
                    ? "Change"
                    : "Browse"}
              </Button>
            </Box>

            {file && uploadStage !== "idle" && (
              <Box role="status" aria-live="polite" sx={{ mt: 0.75 }}>
                <LinearProgress
                  variant={
                    uploadStage === "publishing" ? "indeterminate" : "determinate"
                  }
                  value={uploadProgress}
                  sx={{
                    height: 5,
                    borderRadius: 999,
                    bgcolor: C.accentFaint,
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 999,
                      bgcolor: uploadStage === "uploaded" ? C.green : C.accent,
                    },
                  }}
                />
                <Typography sx={{ mt: 0.5, color: C.textSub, fontSize: "0.75rem" }}>
                  {uploadStage === "uploaded"
                    ? "Ready to post"
                    : uploadStage === "publishing"
                      ? "Publishing your post…"
                      : `Uploading · ${uploadProgress}%${
                          totalUploadBytes > 0
                            ? ` (${formatUploadBytes(uploadedBytes)} of ${formatUploadBytes(totalUploadBytes)})`
                            : ""
                        }`}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {mode === "emoji" && (
          <Box
            sx={{
              mt: 1,
              p: 0.6,
              display: "flex",
              flexWrap: "wrap",
              gap: 0.25,
              width: "min(100%, 460px)",
              maxHeight: 142,
              overflowY: "auto",
              border: `1px solid ${C.divider}`,
              borderRadius: 2,
              bgcolor: C.surface,
            }}
          >
            {COMPOSER_EMOJIS.map((emoji) => (
              <IconButton
                key={emoji}
                aria-label={`Add ${emoji}`}
                onClick={() => handleEmojiSelect(emoji)}
                size="small"
                sx={{
                  fontSize: "1.2rem",
                  opacity: 1,
                  filter: "none",
                  color: "initial",
                  fontFamily:
                    '"Apple Color Emoji", "Segoe UI Emoji", sans-serif',
                }}
              >
                {emoji}
              </IconButton>
            ))}
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 1.25, py: 0 }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mt: 1.4,
            pt: 1.1,
            borderTop: `1px solid ${C.divider}`,
          }}
        >
          <Stack direction="row" spacing={0.35}>
            <Tooltip title="Add emoji">
              <IconButton
                aria-label="Add emoji"
                onClick={handleEmojiPickerToggle}
                sx={{
                  color: mode === "emoji" ? C.accentDark : C.textSub,
                  bgcolor: mode === "emoji" ? C.accentFaint : "transparent",
                }}
              >
                <EmojiEmotionsOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Add image">
              <IconButton
                aria-label="Add image"
                onClick={() => handleMediaPicker("image")}
                sx={{
                  color: mode === "image" ? C.accentDark : C.textSub,
                  bgcolor: mode === "image" ? C.accentFaint : "transparent",
                }}
              >
                <ImageOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Add video">
              <IconButton
                aria-label="Add video"
                onClick={() => handleMediaPicker("video")}
                sx={{
                  color: mode === "video" ? C.accentDark : C.textSub,
                  bgcolor: mode === "video" ? C.accentFaint : "transparent",
                }}
              >
                <VideocamOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Create poll">
              <IconButton
                aria-label="Create poll"
                onClick={() => handleModeChange("poll")}
                sx={{
                  color: mode === "poll" ? C.accentDark : C.textSub,
                  bgcolor: mode === "poll" ? C.accentFaint : "transparent",
                }}
              >
                <PollOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          <Button
            variant="contained"
            endIcon={!submitting ? <SendRoundedIcon /> : undefined}
            onClick={handleShare}
            disabled={!canSubmit || submitting}
            sx={{
              minWidth: 104,
              px: 2.4,
              borderRadius: 5,
              bgcolor: C.accent,
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
              "&:hover": { bgcolor: C.accentDark, boxShadow: "none" },
            }}
          >
            {submitting ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : (
              "Send"
            )}
          </Button>
        </Box>
      </Box>
      <input
        ref={imageInputRef}
        hidden
        type="file"
        accept="image/*"
        onChange={(event) =>
          handleMediaSelected("image", event.target.files?.[0] ?? null)
        }
      />
      <input
        ref={videoInputRef}
        hidden
        type="file"
        accept="video/mp4,video/quicktime,video/x-m4v,video/webm,.mp4,.mov,.m4v,.webm"
        onChange={(event) =>
          handleMediaSelected("video", event.target.files?.[0] ?? null)
        }
      />
    </Card>
  );
};
// T: O(p) and S: O(p), where p is the number of poll options

// ── Post card ────────────────────────────────────────────────────────────────
const PostCard = ({
  post,
  communityName,
  conversationStyle = false,
  dateLabel,
  viewerName,
  onUpdated,
  onDeleted,
  onReply,
  onMeetingDiscovered,
}: {
  post: ForumPost;
  communityName?: string;
  conversationStyle?: boolean;
  dateLabel?: string;
  viewerName: string;
  onUpdated: (postId: string, body: string) => void;
  onDeleted: (postId: string) => void;
  onReply: (post: ForumPost) => void;
  onMeetingDiscovered?: (
    meeting: Comm360Meeting,
    communityId: string,
  ) => void;
}) => {
  const [comments, setComments] = useState<ForumComment[]>(
    post.initialComments ?? [],
  );
  const [showComments, setShowComments] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [commentCount, setCommentCount] = useState(post.replyCount ?? 0);
  const [deletingComment, setDeletingComment] =
    useState<ForumComment | null>(null);
  const [commentDeletePending, setCommentDeletePending] = useState(false);
  const [commentDeleteError, setCommentDeleteError] = useState("");
  const [commentMenu, setCommentMenu] = useState<{
    anchor: HTMLElement;
    comment: ForumComment;
  } | null>(null);
  const [editingComment, setEditingComment] = useState<ForumComment | null>(null);
  const [commentEditBody, setCommentEditBody] = useState("");
  const [commentEditPending, setCommentEditPending] = useState(false);
  const [poll, setPoll] = useState(post.poll);
  const [votingOptionId, setVotingOptionId] = useState("");
  const [selectedPollOptionIds, setSelectedPollOptionIds] = useState<string[]>(
    post.poll?.viewerOptionIds ?? [],
  );
  const pollRef = useRef(post.poll);
  const confirmedPollRef = useRef(post.poll);
  const queuedPollOptionIdsRef = useRef<string[] | null>(null);
  const pollVoteInFlightRef = useRef(false);
  const [pollError, setPollError] = useState("");
  const [commentsLoaded, setCommentsLoaded] = useState(
    Boolean(post.initialComments?.length),
  );
  const [friendshipStatus, setFriendshipStatus] = useState(
    post.friendshipStatus,
  );
  const [friendActionPending, setFriendActionPending] = useState(false);
  const [liked, setLiked] = useState(post.viewerVote === 1);
  const [likeCount, setLikeCount] = useState(Number(post.upvotes) || 0);
  const [likePending, setLikePending] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [displayBody, setDisplayBody] = useState(post.body);
  const [ownerMenuAnchor, setOwnerMenuAnchor] = useState<HTMLElement | null>(
    null,
  );
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editBody, setEditBody] = useState(post.body);
  const [postActionPending, setPostActionPending] = useState(false);
  const [postActionError, setPostActionError] = useState("");
  const [mobileMoreVisible, setMobileMoreVisible] = useState(false);
  const [mobileSwipeOffset, setMobileSwipeOffset] = useState(0);
  const [imageViewerUrl, setImageViewerUrl] = useState<string | null>(null);
  const [imageZoomed, setImageZoomed] = useState(false);
  const mobileLongPressTimerRef = useRef<number | null>(null);
  const mobileLongPressTriggeredRef = useRef(false);
  const mobileTouchMovedRef = useRef(false);
  const mobileTouchStartXRef = useRef(0);
  const mobileTouchStartYRef = useRef(0);
  const mobileSwipeOffsetRef = useRef(0);
  const lastMobileTapAtRef = useRef(0);
  const [editWindowOpen, setEditWindowOpen] = useState(
    Date.now() - new Date(post.createdAt).getTime() < 5 * 60 * 1000,
  );
  const pollClosed = Boolean(
    poll &&
      (poll.status === "closed" ||
        (poll.endsAt && new Date(poll.endsAt).getTime() <= Date.now())),
  );

  useEffect(() => {
    const roomId = getComm360RoomId(displayBody);
    if (!roomId || !post.communityId) return;
    let cancelled = false;
    void getComm360Meeting(roomId)
      .then((meeting) => {
        if (cancelled) return;
        onMeetingDiscovered?.(meeting, post.communityId!);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [displayBody, onMeetingDiscovered, post.communityId]);
  // T: O(b) and S: O(1), where b is the post body length

  useEffect(() => {
    if (pollVoteInFlightRef.current) return;
    pollRef.current = post.poll;
    confirmedPollRef.current = post.poll;
    setPoll(post.poll);
    setSelectedPollOptionIds(post.poll?.viewerOptionIds ?? []);
    setPollError("");
  }, [post.poll]);
  // T: O(1) and S: O(1)

  useEffect(() => {
    setFriendshipStatus(post.friendshipStatus);
  }, [post.friendshipStatus]);
  // T: O(1) and S: O(1)

  useEffect(() => {
    const remaining =
      new Date(post.createdAt).getTime() + 5 * 60 * 1000 - Date.now();
    if (remaining <= 0) {
      setEditWindowOpen(false);
      return;
    }
    const timer = window.setTimeout(() => setEditWindowOpen(false), remaining);
    return () => window.clearTimeout(timer);
  }, [post.createdAt]);
  // T: O(1) and S: O(1)

  const handleReply = async () => {
    const trimmed = replyText.trim();
    if (!trimmed || replying) return;
    setReplying(true);
    setReplyError("");
    try {
      const created = await createComment(post.id, trimmed);
      setComments((prev) => [
        ...prev,
        {
          id: created.id,
          authorName: "You",
          body: trimmed,
          timeAgo: "Just now",
          canDelete: true,
          canEdit: true,
          likeCount: 0,
          viewerLiked: false,
        },
      ]);
      setCommentCount((current) => current + 1);
      setReplyText("");
    } catch (caught) {
      setReplyError(
        caught instanceof Error ? caught.message : "Could not add reply",
      );
    } finally {
      setReplying(false);
    }
  };
  // T: O(c) and S: O(c), where c is the number of displayed comments

  const handleDeleteComment = async () => {
    if (!deletingComment || commentDeletePending) return;
    setCommentDeletePending(true);
    setCommentDeleteError("");
    try {
      await deleteComment(post.id, deletingComment.id);
      setComments((current) =>
        current.filter((comment) => comment.id !== deletingComment.id),
      );
      setCommentCount((current) => Math.max(0, current - 1));
      setDeletingComment(null);
    } catch (caught) {
      setCommentDeleteError(
        caught instanceof Error ? caught.message : "Could not delete comment",
      );
    } finally {
      setCommentDeletePending(false);
    }
  };
  // T: O(c) and S: O(c), where c is the number of displayed comments

  const handleEditComment = async () => {
    const body = commentEditBody.trim();
    if (!editingComment || !body || commentEditPending) return;
    setCommentEditPending(true);
    setCommentDeleteError("");
    try {
      await updateComment(post.id, editingComment.id, body);
      setComments((current) =>
        current.map((comment) =>
          comment.id === editingComment.id ? { ...comment, body } : comment,
        ),
      );
      setEditingComment(null);
    } catch (caught) {
      setCommentDeleteError(
        caught instanceof Error ? caught.message : "Could not edit comment",
      );
    } finally {
      setCommentEditPending(false);
    }
  };

  const handleCommentLike = async (comment: ForumComment) => {
    const liked = !comment.viewerLiked;
    setComments((current) =>
      current.map((item) =>
        item.id === comment.id
          ? {
              ...item,
              viewerLiked: liked,
              likeCount: Math.max(0, item.likeCount + (liked ? 1 : -1)),
            }
          : item,
      ),
    );
    try {
      const result = await voteComment(post.id, comment.id, liked);
      setComments((current) =>
        current.map((item) =>
          item.id === comment.id ? { ...item, ...result } : item,
        ),
      );
    } catch {
      setComments((current) =>
        current.map((item) =>
          item.id === comment.id ? { ...item, viewerLiked: comment.viewerLiked, likeCount: comment.likeCount } : item,
        ),
      );
    }
  };

  const updatePollSelectionOptimistically = (optionIds: string[]): void => {
    const currentPoll = pollRef.current;
    if (!currentPoll) return;
    const previousOptionIdSet = new Set(currentPoll.viewerOptionIds);
    const nextOptionIdSet = new Set(optionIds);
    const optimisticOptions = currentPoll.options.map((option) => ({
      ...option,
      voteCount: Math.max(
        0,
        option.voteCount +
          (nextOptionIdSet.has(option.id) ? 1 : 0) -
          (previousOptionIdSet.has(option.id) ? 1 : 0),
      ),
    }));
    const optimisticPoll = {
      ...currentPoll,
      options: optimisticOptions,
      viewerOptionIds: [...optionIds],
    };
    pollRef.current = optimisticPoll;
    setPoll(optimisticPoll);
    setSelectedPollOptionIds(optionIds);
  };
  // T: O(o) and S: O(o), where o is the number of poll options

  const flushQueuedPollVote = async (): Promise<void> => {
    if (pollVoteInFlightRef.current || !pollRef.current) return;
    pollVoteInFlightRef.current = true;
    setVotingOptionId("saving");

    try {
      while (queuedPollOptionIdsRef.current !== null) {
        const requestedOptionIds = queuedPollOptionIdsRef.current;
        queuedPollOptionIdsRef.current = null;
        const activePoll: NonNullable<ForumPost["poll"]> | null =
          pollRef.current ?? null;
        if (!activePoll) return;

        try {
          const options = await votePoll(activePoll.id, requestedOptionIds);
          const confirmedPoll: NonNullable<ForumPost["poll"]> = {
            ...(confirmedPollRef.current ?? activePoll),
            options,
            viewerOptionIds: [...requestedOptionIds],
          };
          confirmedPollRef.current = confirmedPoll;

          if (queuedPollOptionIdsRef.current === null) {
            pollRef.current = confirmedPoll;
            setPoll(confirmedPoll);
            setSelectedPollOptionIds(requestedOptionIds);
          }
        } catch (caught) {
          if (queuedPollOptionIdsRef.current !== null) continue;
          const confirmedPoll = confirmedPollRef.current;
          pollRef.current = confirmedPoll;
          setPoll(confirmedPoll);
          setSelectedPollOptionIds(confirmedPoll?.viewerOptionIds ?? []);
          setPollError(
            caught instanceof Error ? caught.message : "Could not submit vote",
          );
        }
      }
    } finally {
      pollVoteInFlightRef.current = false;
      setVotingOptionId("");
      if (queuedPollOptionIdsRef.current !== null) {
        void flushQueuedPollVote();
      }
    }
  };
  // T: O(q * o) and S: O(o), where q is coalesced requests and o is poll options

  const queuePollVote = (
    optionIds: string[],
    loadingOptionId: string,
  ): void => {
    queuedPollOptionIdsRef.current = [...optionIds];
    setVotingOptionId(loadingOptionId);
    setPollError("");
    updatePollSelectionOptimistically(optionIds);
    void flushQueuedPollVote();
  };
  // T: O(o) and S: O(o), where o is the number of poll options

  const handlePollOptionClick = (optionId: string) => {
    const currentPoll = pollRef.current;
    if (!currentPoll || pollClosed) return;
    if (!currentPoll.allowsMultiple) {
      queuePollVote(
        currentPoll.viewerOptionIds.includes(optionId) ? [] : [optionId],
        optionId,
      );
      return;
    }
    setSelectedPollOptionIds((current) =>
      current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId],
    );
  };
  // T: O(o) and S: O(o), where o is the number of selected poll options

  const handleMultiplePollVote = () => {
    queuePollVote(selectedPollOptionIds, "multiple");
  };
  // T: O(o) and S: O(o), where o is the number of selected poll options

  const handleToggleComments = async () => {
    const nextVisible = !showComments;
    setShowComments(nextVisible);
    if (!nextVisible || commentsLoaded) return;
    setReplyError("");
    try {
      const records = await listComments(post.id);
      setComments(
        records.map((comment) => ({
          id: comment.id,
          authorName: comment.author?.name ?? "Anchor member",
          body: comment.body,
          timeAgo: formatTimeAgo(comment.createdAt),
          canDelete: comment.canDelete,
          canEdit: comment.canEdit,
          likeCount: comment.likeCount,
          viewerLiked: comment.viewerLiked,
        })),
      );
      setCommentCount(Math.max(post.replyCount ?? 0, records.length));
      setCommentsLoaded(true);
    } catch (caught) {
      setReplyError(
        caught instanceof Error ? caught.message : "Could not load replies",
      );
    }
  };
  // T: O(c) and S: O(c), where c is returned comments

  const handleAddFriend = async () => {
    if (friendshipStatus !== "none" || friendActionPending) return;
    setFriendActionPending(true);
    setActionMessage("");
    try {
      await sendFriendRequest(post.authorId);
      setFriendshipStatus("pending");
    } catch (caught) {
      setActionMessage(
        caught instanceof Error ? caught.message : "Could not add friend",
      );
    } finally {
      setFriendActionPending(false);
    }
  };
  // T: O(1) and S: O(1)

  const handleLike = async () => {
    if (likePending) return;
    const nextLiked = !liked;
    setLikePending(true);
    setActionMessage("");
    try {
      const result = await votePost(post.id, nextLiked ? 1 : 0);
      setLiked(nextLiked);
      setLikeCount(result.upvotes);
    } catch (caught) {
      setActionMessage(
        caught instanceof Error ? caught.message : "Could not update like",
      );
    } finally {
      setLikePending(false);
    }
  };
  // T: O(1) and S: O(1)

  const clearMobileLongPressTimer = () => {
    if (mobileLongPressTimerRef.current !== null) {
      window.clearTimeout(mobileLongPressTimerRef.current);
      mobileLongPressTimerRef.current = null;
    }
  };

  const isInteractiveTouchTarget = (target: EventTarget | null) =>
    target instanceof Element &&
    Boolean(target.closest("button, a, input, textarea, select, [role='button']"));

  const isMobileTouchLayout = () =>
    window.matchMedia("(max-width: 599.95px)").matches;

  const handleMobileTouchStart = (event: React.TouchEvent) => {
    if (!isMobileTouchLayout() || isInteractiveTouchTarget(event.target)) return;
    const touch = event.touches[0];
    if (!touch) return;
    clearMobileLongPressTimer();
    mobileTouchStartXRef.current = touch.clientX;
    mobileTouchStartYRef.current = touch.clientY;
    mobileSwipeOffsetRef.current = 0;
    setMobileSwipeOffset(0);
    mobileTouchMovedRef.current = false;
    mobileLongPressTriggeredRef.current = false;
    mobileLongPressTimerRef.current = window.setTimeout(() => {
      mobileLongPressTriggeredRef.current = true;
      setMobileMoreVisible(true);
      navigator.vibrate?.(10);
    }, 520);
  };

  const handleMobileTouchMove = (event: React.TouchEvent) => {
    if (!isMobileTouchLayout()) return;
    const touch = event.touches[0];
    if (!touch) return;
    const deltaX = touch.clientX - mobileTouchStartXRef.current;
    const deltaY = touch.clientY - mobileTouchStartYRef.current;
    if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
      mobileTouchMovedRef.current = true;
      clearMobileLongPressTimer();
    }
    if (deltaX < 0 && Math.abs(deltaX) > Math.abs(deltaY)) {
      const nextOffset = Math.max(-68, deltaX);
      mobileSwipeOffsetRef.current = nextOffset;
      setMobileSwipeOffset(nextOffset);
    }
  };

  const handleMobileTouchEnd = (event: React.TouchEvent) => {
    if (!isMobileTouchLayout()) return;
    clearMobileLongPressTimer();
    if (mobileSwipeOffsetRef.current <= -46) {
      mobileSwipeOffsetRef.current = 0;
      setMobileSwipeOffset(0);
      mobileLongPressTriggeredRef.current = false;
      onReply(post);
      return;
    }
    mobileSwipeOffsetRef.current = 0;
    setMobileSwipeOffset(0);
    if (
      mobileLongPressTriggeredRef.current ||
      mobileTouchMovedRef.current ||
      isInteractiveTouchTarget(event.target)
    ) {
      mobileLongPressTriggeredRef.current = false;
      return;
    }
    const tappedAt = Date.now();
    if (tappedAt - lastMobileTapAtRef.current <= 320) {
      lastMobileTapAtRef.current = 0;
      if (!liked) void handleLike();
      return;
    }
    lastMobileTapAtRef.current = tappedAt;
  };

  useEffect(
    () => () => {
      if (mobileLongPressTimerRef.current !== null) {
        window.clearTimeout(mobileLongPressTimerRef.current);
      }
    },
    [],
  );

  const handleSharePost = async () => {
    const url = `${window.location.origin}/community?post=${encodeURIComponent(
      post.id,
    )}`;
    setActionMessage("");
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${post.authorName} on Anchor`,
          text: post.body,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setActionMessage("Post link copied.");
      }
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError")
        return;
      setActionMessage("Could not share this post.");
    }
  };
  // T: O(b) and S: O(b), where b is the post text length

  const handleMenuShare = async () => {
    setOwnerMenuAnchor(null);
    await handleSharePost();
  };
  // T: O(b) and S: O(b), where b is the post text length

  const handleCopyPostText = async () => {
    setOwnerMenuAnchor(null);
    const text = [post.title, post.body].filter(Boolean).join("\n\n").trim();
    try {
      await navigator.clipboard.writeText(text);
      setActionMessage("Message copied.");
    } catch {
      setActionMessage("Could not copy the message.");
    }
  };
  // T: O(b) and S: O(b), where b is the post text length

  const handleCopyPostLink = async () => {
    setOwnerMenuAnchor(null);
    const url = `${window.location.origin}/community?post=${encodeURIComponent(
      post.id,
    )}`;
    try {
      await navigator.clipboard.writeText(url);
      setActionMessage("Post link copied.");
    } catch {
      setActionMessage("Could not copy the post link.");
    }
  };
  // T: O(p) and S: O(p), where p is the post identifier length

  const handleUnfollow = async () => {
    if (friendActionPending) return;
    setOwnerMenuAnchor(null);
    setFriendActionPending(true);
    setActionMessage("");
    try {
      await removeFriend(post.authorId);
      setFriendshipStatus("none");
      setActionMessage(`You are no longer following ${post.authorName}.`);
    } catch (caught) {
      setActionMessage(
        caught instanceof Error
          ? caught.message
          : `Could not unfollow ${post.authorName}`,
      );
    } finally {
      setFriendActionPending(false);
    }
  };
  // T: O(1) and S: O(1)

  const handleOpenEdit = () => {
    if (!editWindowOpen) return;
    setOwnerMenuAnchor(null);
    setEditBody(displayBody);
    setPostActionError("");
    setEditOpen(true);
  };
  // T: O(b) and S: O(b), where b is the post body length

  const handleEditPost = async () => {
    const body = editBody.trim();
    if (!body || postActionPending) return;
    setPostActionPending(true);
    setPostActionError("");
    try {
      const updated = await updatePost(post.id, body);
      const nextBody = updated.body ?? body;
      setDisplayBody(nextBody);
      onUpdated(post.id, nextBody);
      setEditOpen(false);
    } catch (caught) {
      setPostActionError(
        caught instanceof Error ? caught.message : "Could not edit post",
      );
    } finally {
      setPostActionPending(false);
    }
  };
  // T: O(b) and S: O(b), where b is the post body length

  const handleOpenDelete = () => {
    setOwnerMenuAnchor(null);
    setPostActionError("");
    setDeleteOpen(true);
  };
  // T: O(1) and S: O(1)

  const handleDeletePost = async () => {
    if (postActionPending) return;
    setPostActionPending(true);
    setPostActionError("");
    try {
      await deletePost(post.id);
      setDeleteOpen(false);
      onDeleted(post.id);
    } catch (caught) {
      setPostActionError(
        caught instanceof Error ? caught.message : "Could not delete post",
      );
    } finally {
      setPostActionPending(false);
    }
  };
  // T: O(1) and S: O(1)

  return (
    <>
    {dateLabel && (
      <Divider
        textAlign="center"
        sx={{ color: C.textMuted, fontSize: { xs: "0.7rem", sm: "0.75rem" }, my: 1 }}
      >
        {dateLabel}
      </Divider>
    )}
    <Card
      onTouchStart={handleMobileTouchStart}
      onTouchMove={handleMobileTouchMove}
      onTouchEnd={handleMobileTouchEnd}
      onTouchCancel={() => {
        clearMobileLongPressTimer();
        mobileSwipeOffsetRef.current = 0;
        setMobileSwipeOffset(0);
      }}
      onContextMenu={(event) => {
        if (isMobileTouchLayout()) event.preventDefault();
      }}
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: "none",
        mx: "auto",
        boxSizing: "border-box",
        py: { xs: 1.2, sm: 2 },
        bgcolor: C.cardBg,
        border: showComments ? `1px solid ${C.accentBorder}` : 0,
        borderBottom: showComments
          ? `1px solid ${C.accentBorder}`
          : `1px solid ${C.divider}`,
        borderRadius: showComments ? 2 : 0,
        px: showComments ? { xs: 1, sm: 1.5 } : 0,
        boxShadow: "none",
        overflow: "hidden",
        transition: "background-color 140ms ease",
        transform: { xs: `translateX(${mobileSwipeOffset}px)`, md: "none" },
        touchAction: "pan-y",
        transitionProperty: "background-color, transform",
        "&:hover": {
          bgcolor: C.surface,
        },
        "&::after": {
          content: '"↩"',
          display: { xs: "grid", md: "none" },
          placeItems: "center",
          position: "absolute",
          top: "50%",
          right: -44,
          width: 36,
          height: 36,
          mt: -2.25,
          borderRadius: "50%",
          color: C.accentDark,
          bgcolor: C.accentFaint,
          fontSize: "1.15rem",
          opacity: mobileSwipeOffset < -12 ? 1 : 0,
          transition: "opacity 120ms ease",
        },
        "& .message-actions": {
          opacity: { md: 0 },
          transform: { md: "translateY(4px)" },
          pointerEvents: { md: "none" },
        },
        "&:hover .message-actions, &:focus-within .message-actions": {
          opacity: 1,
          transform: "translateY(0)",
          pointerEvents: "auto",
        },
      }}
    >
      <Stack
        className="message-actions"
        direction="row"
        alignItems="center"
        spacing={0.25}
        sx={{
          display: { xs: "none", md: "flex" },
          position: "absolute",
          top: { md: 8 },
          right: { md: 8 },
          width: "fit-content",
          ml: "auto",
          mb: 0,
          p: 0.35,
          border: `1px solid ${C.divider}`,
          borderRadius: 2,
          bgcolor: C.cardBg,
          boxShadow: "0 4px 14px rgba(0,0,0,0.10)",
          transition: "opacity 140ms ease, transform 140ms ease",
          zIndex: 2,
          "& .MuiIconButton-root": {
            width: { xs: 25, sm: 34 },
            height: { xs: 25, sm: 34 },
          },
          "& .MuiSvgIcon-root": {
            fontSize: { xs: 16, sm: 24 },
          },
        }}
      >
        <Tooltip title={liked ? "Unlike" : "Like"}>
          <IconButton
            size="small"
            aria-label={liked ? "Unlike message" : "Like message"}
            onClick={() => void handleLike()}
            disabled={likePending}
            sx={{ color: liked ? C.accentDark : C.textMuted }}
          >
            {liked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Comments">
          <IconButton
            size="small"
            aria-label="Reply to message"
            onClick={() => void handleToggleComments()}
            sx={{ color: showComments ? C.accentDark : C.textMuted }}
          >
            <ChatBubbleOutlineRoundedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Reply">
          <IconButton
            size="small"
            aria-label="Reply to message"
            onClick={() => onReply(post)}
            sx={{ color: C.textMuted }}
          >
            <ReplyRoundedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Forward">
          <IconButton
            size="small"
            aria-label="Forward message"
            onClick={() => void handleSharePost()}
            sx={{ color: C.textMuted }}
          >
            <ShortcutRoundedIcon />
          </IconButton>
        </Tooltip>
        {friendshipStatus === "none" && (
          <Tooltip title={`Add ${post.authorName} as a friend`}>
            <IconButton
              size="small"
              aria-label={`Add ${post.authorName} as a friend`}
              onClick={() => void handleAddFriend()}
              disabled={friendActionPending}
              sx={{ color: C.textMuted }}
            >
              <PersonAddAltRoundedIcon />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="More actions">
          <IconButton
            size="small"
            aria-label="More message actions"
            onClick={(event) => setOwnerMenuAnchor(event.currentTarget)}
            sx={{ color: C.textMuted }}
          >
            <MoreHorizRoundedIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      <IconButton
        size="small"
        aria-label="More message actions"
        onClick={(event) => {
          setMobileMoreVisible(false);
          setOwnerMenuAnchor(event.currentTarget);
        }}
        sx={{
          display: {
            xs: mobileMoreVisible ? "inline-flex" : "none",
            md: "none",
          },
          position: "absolute",
          top: 6,
          right: 0,
          width: 32,
          height: 32,
          color: C.textMuted,
          bgcolor: C.cardBg,
          zIndex: 3,
          "&:hover": { bgcolor: C.surface },
        }}
      >
        <MoreHorizRoundedIcon sx={{ fontSize: 22 }} />
      </IconButton>
      {/* Author row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: { xs: 0.55, sm: 0.8 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.8, sm: 1 } }}>
          <Avatar
            src={post.authorAvatar}
            sx={{
              width: { xs: 22, sm: 24 },
              height: { xs: 22, sm: 24 },
              bgcolor: C.accentFaint,
              color: C.accentDark,
              fontSize: "0.95rem",
            }}
          >
            {post.authorName.charAt(0)}
          </Avatar>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
              <Typography
                sx={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  lineHeight: 1.5,
                  color: C.textPrimary,
                }}
              >
                {post.authorName}
              </Typography>
              {post.verified && (
                <VerifiedRoundedIcon sx={{ fontSize: 16, color: C.accent }} />
              )}
            </Box>
            <Typography
              sx={{
                fontSize: "0.95rem",
                fontWeight: 600,
                lineHeight: 1.5,
                color: C.textMuted,
              }}
            >
              {post.authorProfession} · {post.timeAgo}
            </Typography>
          </Box>
        </Box>
        <Menu
          id={`post-menu-${post.id}`}
          anchorEl={ownerMenuAnchor}
          open={Boolean(ownerMenuAnchor)}
          onClose={() => {
            setOwnerMenuAnchor(null);
            setMobileMoreVisible(false);
          }}
          MenuListProps={{ "aria-label": "Message options" }}
        >
              {friendshipStatus === "self" && (
                <MenuItem
                  disabled={!editWindowOpen}
                  onClick={handleOpenEdit}
                  sx={{ gap: 1 }}
                >
                  <EditOutlinedIcon fontSize="small" />
                  {editWindowOpen ? "Edit post" : "Edit window ended"}
                </MenuItem>
              )}
              {friendshipStatus === "self" && (
                <MenuItem
                  onClick={handleOpenDelete}
                  sx={{ gap: 1, color: C.red }}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                  Delete post
                </MenuItem>
              )}
              <MenuItem onClick={handleMenuShare} sx={{ gap: 1 }}>
                <ShareOutlinedIcon fontSize="small" />
                Share this message
              </MenuItem>
              <MenuItem onClick={handleCopyPostLink} sx={{ gap: 1 }}>
                <LinkRoundedIcon fontSize="small" />
                Copy message link
              </MenuItem>
              <MenuItem onClick={handleCopyPostText} sx={{ gap: 1 }}>
                <ContentCopyRoundedIcon fontSize="small" />
                Copy text
              </MenuItem>
              {friendshipStatus === "accepted" && (
                <MenuItem
                  disabled={friendActionPending}
                  onClick={handleUnfollow}
                  sx={{ gap: 1, color: C.red }}
                >
                  <PersonRemoveOutlinedIcon fontSize="small" />
                  Unfollow {post.authorName}
                </MenuItem>
              )}
        </Menu>
      </Box>

      {communityName && !conversationStyle && (
        <Chip
          label={communityName}
          size="small"
          sx={{
            mb: 1.5,
            height: 22,
            fontSize: "0.72rem",
            fontWeight: 700,
            bgcolor: C.accentFaint,
            color: C.accentDark,
          }}
        />
      )}

      {post.replyTo && (
        <Box
          sx={{
            mb: 1,
            ml: { xs: 0.5, sm: 1 },
            pl: { xs: 1.15, sm: 1.4 },
            py: 0.35,
            minWidth: 0,
            display: "flex",
            alignItems: "flex-start",
            gap: 1,
            borderLeft: `3px solid ${C.divider}`,
          }}
        >
            <Avatar
              src={post.replyTo.authorAvatar}
              alt={post.replyTo.authorName}
              sx={{ width: 26, height: 26, fontSize: "0.7rem", mt: 0.15 }}
            >
              {post.replyTo.authorName.charAt(0)}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontSize: "0.74rem", fontWeight: 700 }}>
                {post.replyTo.authorName}
              </Typography>
              <Typography
                sx={{
                  color: C.textMuted,
                  fontSize: { xs: "0.72rem", sm: "0.76rem" },
                  lineHeight: 1.35,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  overflowWrap: "anywhere",
                }}
              >
                {post.replyTo.body}
              </Typography>
            </Box>
        </Box>
      )}

      {/* Title + body */}
      {post.title && (
        <Typography
          sx={{
            fontSize: { xs: "0.92rem", sm: "1.15rem" },
            fontWeight: 700,
            color: C.textPrimary,
            mb: 1,
            fontFamily: "'Playfair Display', serif",
          }}
        >
          {post.title}
        </Typography>
      )}
      <Typography
        sx={{
          fontSize: "0.95rem",
          color: C.textPrimary,
          lineHeight: 1.5,
          mb: post.media?.length || poll ? 1.5 : 0.5,
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
        }}
      >
        {renderMessageWithLinks(displayBody)}
      </Typography>

      {post.status === "processing" && (
        <Box
          role="status"
          aria-live="polite"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
            px: 1.5,
            py: 1.25,
            border: `1px solid ${C.divider}`,
            borderRadius: 2,
            bgcolor: C.surface,
          }}
        >
          <CircularProgress size={17} sx={{ color: C.accent }} />
          <Typography sx={{ color: C.textSub, fontSize: "0.82rem" }}>
            Upload complete. Preparing your media for playback…
          </Typography>
        </Box>
      )}

      {post.status === "published" &&
        post.media?.map((item) =>
        item.type === "image" ? (
          <Box
            key={item.id}
            component="button"
            type="button"
            aria-label="Open image in full screen"
            onClick={() => {
              setImageZoomed(false);
              setImageViewerUrl(item.url);
            }}
            sx={{
              display: "block",
              width: "100%",
              maxWidth: { xs: "100%", sm: 640 },
              mr: "auto",
              p: 0,
              border: 0,
              borderRadius: 2,
              bgcolor: C.surface,
              mb: 2,
              overflow: "hidden",
              cursor: "zoom-in",
            }}
          >
            <Box
              component="img"
              src={item.url}
              alt="Community post upload"
              sx={{
                display: "block",
                width: "100%",
                maxHeight: { xs: 260, sm: 380 },
                objectFit: "contain",
              }}
            />
          </Box>
        ) : (
          <Box
            key={item.id}
            component="video"
            src={item.url}
            controls
            sx={{
              display: "block",
              width: "100%",
              maxWidth: { xs: "100%", sm: 640 },
              maxHeight: { xs: 260, sm: 380 },
              mr: "auto",
              borderRadius: 2,
              bgcolor: "#111",
              mb: 2,
            }}
          />
        ),
        )}

      {poll && (
        <Stack spacing={1} sx={{ width: "100%", maxWidth: 480, mb: 2.5 }}>
          {poll.allowsMultiple && (
            <Typography sx={{ color: C.textMuted, fontSize: "0.75rem" }}>
              Select one or more options, then submit your vote.
            </Typography>
          )}
          {poll.options.map((option) => (
            <Button
              key={option.id}
              variant="outlined"
              disabled={pollClosed}
              onClick={() => handlePollOptionClick(option.id)}
              sx={{
                justifyContent: "space-between",
                borderColor: C.divider,
                color: C.textPrimary,
                bgcolor: C.surface,
                textTransform: "none",
                borderRadius: 2,
                py: 1,
                "&:hover": {
                  borderColor: C.divider,
                  bgcolor: C.cardBg,
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                {poll.allowsMultiple ? (
                  <Checkbox
                    checked={selectedPollOptionIds.includes(option.id)}
                    tabIndex={-1}
                    disableRipple
                    sx={{
                      p: 0,
                      color: C.textMuted,
                      pointerEvents: "none",
                      "&.Mui-checked": { color: C.accent },
                      "& .MuiSvgIcon-root": {
                        fontSize: 18,
                        transition: "color 180ms ease",
                      },
                    }}
                  />
                ) : (
                  <Radio
                    checked={selectedPollOptionIds.includes(option.id)}
                    tabIndex={-1}
                    disableRipple
                    sx={{
                      p: 0,
                      color: C.textMuted,
                      pointerEvents: "none",
                      "&.Mui-checked": { color: C.accent },
                      "& .MuiSvgIcon-root": {
                        fontSize: 18,
                        transition: "color 180ms ease",
                      },
                    }}
                  />
                )}
                <span>{option.text}</span>
              </Box>
              <Box
                component="span"
                sx={{ transition: "color 180ms ease", whiteSpace: "nowrap" }}
              >
                {option.voteCount}{" "}
                {option.voteCount === 1 ? "vote" : "votes"}
              </Box>
            </Button>
          ))}
          {poll.allowsMultiple && (
            <Button
              variant="contained"
              disabled={
                pollClosed ||
                (selectedPollOptionIds.length === 0 &&
                  poll.viewerOptionIds.length === 0) ||
                Boolean(votingOptionId)
              }
              onClick={handleMultiplePollVote}
              sx={{
                alignSelf: "flex-start",
                bgcolor: C.accent,
                color: "#fff",
                textTransform: "none",
                borderRadius: 5,
                boxShadow: "none",
                "&:hover": { bgcolor: C.accentDark, boxShadow: "none" },
              }}
            >
              {votingOptionId === "multiple" ? "Submitting…" : "Submit vote"}
            </Button>
          )}
          {pollError && (
            <Typography sx={{ color: C.red, fontSize: "0.76rem" }}>
              {pollError}
            </Typography>
          )}
        </Stack>
      )}

      <Stack
        direction="row"
        alignItems="center"
        spacing={{ xs: 1, sm: 1.5 }}
        sx={{ mt: 0.9, minHeight: 32 }}
      >
        <Button
          size="small"
          onClick={() => void handleLike()}
          disabled={likePending}
          startIcon={
            liked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />
          }
          sx={{
            minWidth: 0,
            px: 0.25,
            color: liked ? C.accentDark : C.textMuted,
            fontSize: "0.95rem",
            fontWeight: 600,
            textTransform: "none",
            "& .MuiButton-startIcon": { mr: 0.5 },
            "& .MuiSvgIcon-root": { fontSize: 24 },
          }}
        >
          {likeCount}
        </Button>
        <Button
          size="small"
          onClick={() => void handleToggleComments()}
          startIcon={<ChatBubbleOutlineRoundedIcon />}
          sx={{
            minWidth: 0,
            px: 0.25,
            color: showComments ? C.accentDark : C.textMuted,
            fontSize: "0.95rem",
            fontWeight: 600,
            textTransform: "none",
            "& .MuiButton-startIcon": { mr: 0.5 },
            "& .MuiSvgIcon-root": { fontSize: 24 },
          }}
        >
          {commentCount}
        </Button>
      </Stack>

      {actionMessage && (
        <Typography sx={{ mt: 1, color: C.textMuted, fontSize: "0.75rem" }}>
          {actionMessage}
        </Typography>
      )}

      {/* Comments + reply box */}
      {showComments && (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ borderColor: C.divider, mb: 1.5 }} />

          {comments.length === 0 ? (
            <Typography sx={{ fontSize: "0.85rem", color: C.textMuted, mb: 2 }}>
              No replies yet — be the first to help.
            </Typography>
          ) : (
            <Stack spacing={1.1} sx={{ mb: 2 }}>
              {comments.map((comment) => (
                <Box
                  key={comment.id}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.2,
                    position: "relative",
                    pr: { xs: 0, md: 16 },
                    "& .comment-actions": {
                      opacity: { xs: 1, md: 0 },
                      pointerEvents: { xs: "auto", md: "none" },
                    },
                    "&:hover .comment-actions, &:focus-within .comment-actions": {
                      opacity: 1,
                      pointerEvents: "auto",
                    },
                  }}
                >
                  <Avatar
                    src={comment.authorAvatar}
                    sx={{
                      width: 26,
                      height: 26,
                      bgcolor: C.accentFaint,
                      color: C.accentDark,
                      fontSize: "0.66rem",
                    }}
                  >
                    {comment.authorName.charAt(0)}
                  </Avatar>
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        gap: 0.75,
                        mb: 0.3,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: C.textPrimary,
                        }}
                      >
                        {comment.authorName}
                      </Typography>
                      <Typography sx={{ fontSize: "0.64rem", color: C.textMuted }}>
                        {comment.timeAgo}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                      <Typography
                        sx={{
                          fontSize: "0.78rem",
                          color: C.textPrimary,
                          lineHeight: 1.4,
                          flex: "0 1 auto",
                        }}
                      >
                        {comment.body}
                      </Typography>
                    </Box>
                  </Box>
                  <Stack
                    className="comment-actions"
                    direction="row"
                    alignItems="center"
                    spacing={0.25}
                    sx={{
                      position: { xs: "static", md: "absolute" },
                      top: 0,
                      right: 0,
                      ml: "auto",
                      flexShrink: 0,
                      bgcolor: C.cardBg,
                      border: `1px solid ${C.divider}`,
                      borderRadius: 2,
                      px: 0.25,
                      transition: "opacity 140ms ease",
                    }}
                  >
                    <Button
                      size="small"
                      onClick={() => void handleCommentLike(comment)}
                      startIcon={
                        comment.viewerLiked ? (
                          <FavoriteRoundedIcon />
                        ) : (
                          <FavoriteBorderRoundedIcon />
                        )
                      }
                      sx={{
                        minWidth: 0,
                        px: 0.5,
                        color: comment.viewerLiked ? C.accentDark : C.textMuted,
                        fontSize: "0.68rem",
                        textTransform: "none",
                      }}
                    >
                      {comment.likeCount}
                    </Button>
                    {(comment.canEdit || comment.canDelete) && (
                      <IconButton
                        size="small"
                        aria-label={`Comment options for ${comment.authorName}`}
                        onClick={(event) =>
                          setCommentMenu({
                            anchor: event.currentTarget,
                            comment,
                          })
                        }
                        sx={{ color: C.textMuted }}
                      >
                        <MoreHorizRoundedIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    )}
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}

          {/* Reply input */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              sx={{
                width: 26,
                height: 26,
                bgcolor: C.accentFaint,
                color: C.accentDark,
                fontSize: "0.66rem",
              }}
            >
              {(viewerName || "You").trim().charAt(0).toUpperCase()}
            </Avatar>
            <Box
              component="input"
              value={replyText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setReplyText(e.target.value)
              }
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") handleReply();
              }}
              placeholder="Write a reply..."
              sx={{
                flex: 1,
                px: 0.25,
                py: 0.9,
                bgcolor: "transparent",
                border: 0,
                borderBottom: `1px solid ${C.divider}`,
                fontSize: "0.8rem",
                color: C.textPrimary,
                fontFamily: "inherit",
                outline: "none",
                transition: "border-color 160ms ease",
                "&:focus": { borderBottomColor: C.accent },
              }}
            />
            <Box
              onClick={handleReply}
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: C.accentGrad,
                color: "#fff",
                flexShrink: 0,
                cursor: "pointer",
                opacity: replying ? 0.6 : 1,
              }}
            >
              <SendRoundedIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
          {replyError && (
            <Typography sx={{ mt: 1, color: C.red, fontSize: "0.76rem" }}>
              {replyError}
            </Typography>
          )}
        </Box>
      )}

      <Menu
        anchorEl={commentMenu?.anchor ?? null}
        open={Boolean(commentMenu)}
        onClose={() => setCommentMenu(null)}
      >
        {commentMenu?.comment.canEdit && (
          <MenuItem
            onClick={() => {
              setEditingComment(commentMenu.comment);
              setCommentEditBody(commentMenu.comment.body);
              setCommentMenu(null);
            }}
            sx={{ gap: 1 }}
          >
            <EditOutlinedIcon fontSize="small" /> Edit comment
          </MenuItem>
        )}
        {commentMenu?.comment.canDelete && (
          <MenuItem
            onClick={() => {
              setDeletingComment(commentMenu.comment);
              setCommentMenu(null);
            }}
            sx={{ gap: 1, color: C.red }}
          >
            <DeleteOutlineRoundedIcon fontSize="small" /> Delete comment
          </MenuItem>
        )}
      </Menu>

      <Dialog
        open={Boolean(imageViewerUrl)}
        onClose={() => setImageViewerUrl(null)}
        fullScreen
        PaperProps={{ sx: { bgcolor: "#111" } }}
      >
        <Box
          sx={{
            position: "fixed",
            top: 12,
            right: 12,
            zIndex: 2,
            display: "flex",
            gap: 0.5,
          }}
        >
          <IconButton
            component="a"
            href={imageViewerUrl ?? undefined}
            download
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download image"
            sx={{ color: "#fff", bgcolor: "rgba(0,0,0,0.48)" }}
          >
            <DownloadRoundedIcon />
          </IconButton>
          <IconButton
            aria-label="Close image viewer"
            onClick={() => setImageViewerUrl(null)}
            sx={{ color: "#fff", bgcolor: "rgba(0,0,0,0.48)" }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Box>
        <DialogContent
          onClick={() => setImageZoomed((current) => !current)}
          sx={{
            display: "flex",
            alignItems: imageZoomed ? "flex-start" : "center",
            justifyContent: imageZoomed ? "flex-start" : "center",
            p: 2,
            overflow: "auto",
            cursor: imageZoomed ? "zoom-out" : "zoom-in",
          }}
        >
          {imageViewerUrl && (
            <Box
              component="img"
              src={imageViewerUrl}
              alt="Full-size community upload"
              sx={{
                display: "block",
                maxWidth: imageZoomed ? "none" : "100%",
                maxHeight: imageZoomed ? "none" : "calc(100vh - 32px)",
                width: imageZoomed ? "auto" : "auto",
                height: "auto",
                mx: imageZoomed ? 0 : "auto",
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editingComment)}
        onClose={() => !commentEditPending && setEditingComment(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ color: C.textPrimary, fontWeight: 700 }}>
          Edit comment
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            value={commentEditBody}
            onChange={(event) => setCommentEditBody(event.target.value)}
            inputProps={{ maxLength: 4000 }}
          />
          {commentDeleteError && <Alert severity="error" sx={{ mt: 2 }}>{commentDeleteError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingComment(null)} disabled={commentEditPending}>Cancel</Button>
          <Button onClick={() => void handleEditComment()} disabled={!commentEditBody.trim() || commentEditPending}>
            {commentEditPending ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editOpen}
        onClose={() => !postActionPending && setEditOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ color: C.textPrimary, fontWeight: 700 }}>
          Edit post
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: C.textMuted, fontSize: "0.78rem", mb: 1.5 }}>
            Posts can be edited for five minutes after publishing.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={4}
            value={editBody}
            onChange={(event) => setEditBody(event.target.value)}
            inputProps={{ maxLength: post.poll ? 150 : 10_000 }}
            error={Boolean(postActionError)}
            helperText={
              postActionError ||
              `${editBody.length}/${post.poll ? 150 : 10_000}`
            }
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setEditOpen(false)}
            disabled={postActionPending}
            sx={{ color: C.textSub, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEditPost}
            disabled={!editBody.trim() || postActionPending}
            sx={{
              bgcolor: C.accent,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": { bgcolor: C.accentDark, boxShadow: "none" },
            }}
          >
            {postActionPending ? "Saving…" : "Save changes"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onClose={() => !postActionPending && setDeleteOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ color: C.textPrimary, fontWeight: 700 }}>
          Delete this post?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: C.textSub, fontSize: "0.9rem" }}>
            This removes the post and its conversation from the feed. This
            action cannot be undone.
          </Typography>
          {postActionError && (
            <Typography sx={{ color: C.red, fontSize: "0.78rem", mt: 1.5 }}>
              {postActionError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setDeleteOpen(false)}
            disabled={postActionPending}
            sx={{ color: C.textSub, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeletePost}
            disabled={postActionPending}
            sx={{ textTransform: "none", boxShadow: "none" }}
          >
            {postActionPending ? "Deleting…" : "Delete post"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(deletingComment)}
        onClose={() => !commentDeletePending && setDeletingComment(null)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ color: C.textPrimary, fontWeight: 700 }}>
          Delete comment?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: C.textSub, fontSize: "0.9rem" }}>
            This comment will be permanently removed.
          </Typography>
          {commentDeleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {commentDeleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setDeletingComment(null)}
            disabled={commentDeletePending}
            sx={{ color: C.textSub, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => void handleDeleteComment()}
            disabled={commentDeletePending}
            sx={{ textTransform: "none", boxShadow: "none" }}
          >
            {commentDeletePending ? "Deleting…" : "Delete comment"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
    </>
  );
};
// T: O(c + m + o) and S: O(c + o), where c is comments, m is media, and o is poll options

// ── Schedule meeting panel ──────────────────────────────────────────────────
const ScheduleMeetings = ({
  meetings,
  activeCommunityId,
  activeCommunityName,
  compact = false,
}: {
  meetings: ScheduledMeeting[];
  activeCommunityId: string;
  activeCommunityName?: string;
  compact?: boolean;
}) => {
  const isAllView = activeCommunityId === ALL_ID;
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  const scopedMeetings = meetings
    .filter((meeting) => meeting.communityId === activeCommunityId)
    .sort((left, right) => {
      const leftStart = left.startAt
        ? new Date(left.startAt).getTime()
        : Number.POSITIVE_INFINITY;
      const rightStart = right.startAt
        ? new Date(right.startAt).getTime()
        : Number.POSITIVE_INFINITY;
      return leftStart - rightStart;
    });

  return (
    <Card
      sx={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        p: compact ? { xs: 1.25, sm: 2 } : { xs: 1.75, sm: 3 },
        borderRadius: 3,
        bgcolor: C.cardBg,
        border: `1px solid ${C.divider}`,
        borderTop: `4px solid ${C.accent}`,
        boxShadow: "0 4px 20px rgba(44,26,10,0.07)",
        overflow: "hidden",
        overflowWrap: "anywhere",
      }}
    >
      <Typography
        sx={{
          fontSize: compact
            ? { xs: "18px", lg: "0.9rem" }
            : { xs: "18px", lg: "1.05rem" },
          fontWeight: 700,
          color: C.accent,
          mb: 0.5,
          fontFamily: "'Playfair Display', serif",
        }}
      >
        {isAllView ? "Schedule a Discussion" : "Scheduled Discussions"}
      </Typography>

      {isAllView ? (
        <>
          <Typography sx={{ fontSize: { xs: "16px", lg: "0.82rem" }, lineHeight: 1.5, color: C.textSub, mb: 2 }}>
            Schedule the meeting in Comm360, then{" "}
            <Box component="span" sx={{ color: C.textPrimary, fontWeight: 700 }}>
              paste the meeting link into the appropriate community group.
            </Box>{" "}
            Anchor will add the details and show the Join option at the
            scheduled time.
          </Typography>
          <Box
            component="a"
            href={COMM360_URL}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: "flex",
              width: "100%",
              maxWidth: "100%",
              minWidth: 0,
              boxSizing: "border-box",
              mx: "auto",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              px: { xs: 1, sm: 2 },
              py: 1.2,
              borderRadius: 2,
              background: C.accentGrad,
              color: "#fff",
              fontSize: { xs: "16px", lg: "0.85rem" },
              fontWeight: 600,
              textAlign: "center",
              whiteSpace: "normal",
              overflowWrap: "anywhere",
              textDecoration: "none",
              cursor: "pointer",
              "&:hover": { opacity: 0.92 },
            }}
          >
            <CalendarMonthRoundedIcon sx={{ fontSize: 18 }} />
            Open Comm360 to schedule
          </Box>
        </>
      ) : (
        <>
          <Stack spacing={compact ? 0.75 : 1.25} sx={{ mt: compact ? 0.75 : 1.75 }}>
            {scopedMeetings.length === 0 ? (
              <Typography
                sx={{
                  color: C.textMuted,
                  fontSize: compact
                    ? { xs: "0.66rem", sm: "0.76rem" }
                    : { xs: "0.74rem", sm: "0.85rem" },
                  textAlign: "center",
                  py: compact ? 0.75 : 2,
                }}
              >
                No meetings scheduled for {activeCommunityName ?? "this community"}
              </Typography>
            ) : (
              scopedMeetings.map((meeting) => {
                const startsAt = meeting.startAt
                  ? new Date(meeting.startAt).getTime()
                  : Number.NaN;
                const canJoin =
                  Boolean(meeting.joinUrl) &&
                  Number.isFinite(startsAt) &&
                  currentTime >= startsAt &&
                  currentTime <= startsAt + 2 * 60 * 60_000;
                const hasEnded =
                  Number.isFinite(startsAt) &&
                  currentTime > startsAt + 2 * 60 * 60_000;
                return (
                  <Box
                    key={meeting.id}
                    sx={{
                      p: 1.5,
                      border: `1px solid ${C.divider}`,
                      borderRadius: 2.25,
                      bgcolor: C.accentFaint,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
                          bgcolor: C.cardBg,
                          color: C.accentDark,
                        }}
                      >
                        <CalendarMonthRoundedIcon sx={{ fontSize: 17 }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: "0.88rem",
                            fontWeight: 700,
                            color: C.textPrimary,
                            lineHeight: 1.3,
                          }}
                        >
                          {meeting.topic}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.35,
                            fontSize: "0.74rem",
                            color: C.textSub,
                          }}
                        >
                          Hosted by {meeting.withName}
                        </Typography>
                      </Box>
                    </Stack>

                    {meeting.description && (
                      <Typography
                        sx={{
                          mt: 1.1,
                          fontSize: "0.76rem",
                          color: C.textSub,
                          lineHeight: 1.45,
                        }}
                      >
                        {meeting.description}
                      </Typography>
                    )}

                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={1}
                      sx={{ mt: 1.25 }}
                    >
                      <Box>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <AccessTimeRoundedIcon
                            sx={{ fontSize: 14, color: C.accentDark }}
                          />
                          <Typography
                            sx={{ fontSize: "0.75rem", color: C.textPrimary }}
                          >
                            {meeting.date}
                          </Typography>
                        </Stack>
                        <Typography
                          sx={{
                            ml: 2.25,
                            mt: 0.15,
                            fontSize: "0.74rem",
                            color: C.textSub,
                          }}
                        >
                          {meeting.time} · {meeting.via}
                        </Typography>
                      </Box>

                      {canJoin && meeting.joinUrl ? (
                        <Button
                          component="a"
                          href={meeting.joinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          startIcon={<VideocamRoundedIcon />}
                          sx={{
                            minWidth: 0,
                            px: 1.15,
                            py: 0.5,
                            flexShrink: 0,
                            bgcolor: C.accent,
                            color: "#fff",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            textTransform: "none",
                            "&:hover": { bgcolor: C.accentDark },
                          }}
                        >
                          Join
                        </Button>
                      ) : (
                        <Typography
                          sx={{
                            maxWidth: 88,
                            flexShrink: 0,
                            textAlign: "right",
                            fontSize: "0.66rem",
                            lineHeight: 1.3,
                            color: C.textMuted,
                          }}
                        >
                          {hasEnded
                            ? "Discussion ended"
                            : "Join opens at the scheduled time"}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                );
              })
            )}
          </Stack>
        </>
      )}
    </Card>
  );
};

// ── Top-level navigation ─────────────────────────────────────────────────────
const CommunityNavigation = ({
  value,
  onChange,
  friendRequestBadge = 0,
}: {
  value: CommunityPageTab;
  onChange: (value: CommunityPageTab) => void;
  friendRequestBadge?: number;
}) => {
  const handleChange = (
    _event: React.SyntheticEvent,
    nextValue: CommunityPageTab,
  ) => {
    onChange(nextValue);
  };
  // T: O(1) and S: O(1)

  return (
    <Box
      component="nav"
      aria-label="Community sections"
      sx={{
        bgcolor: "transparent",
        borderBottom: 0,
      }}
    >
      <Tabs
        value={value}
        onChange={handleChange}
        variant="fullWidth"
        sx={{
          minHeight: 54,
          "& .MuiTabs-indicator": {
            height: 2,
            bgcolor: C.accent,
          },
          "& .MuiTab-root": {
            minHeight: 54,
            color: C.textPrimary,
            textTransform: "none",
            fontSize: { xs: "0.85rem", sm: "0.95rem" },
            fontWeight: 500,
          },
          "& .Mui-selected": {
            color: `${C.textPrimary} !important`,
            fontWeight: 700,
          },
        }}
      >
        <Tab value="posts" label="Feed" />
        <Tab value="communities" label="Communities" />
        <Tab
          value="friends"
          aria-label={
            friendRequestBadge > 0
              ? `Friends, ${friendRequestBadge} new request${friendRequestBadge === 1 ? "" : "s"}`
              : "Friends"
          }
          label={
            <Badge
              badgeContent={friendRequestBadge}
              color="error"
              max={99}
              invisible={friendRequestBadge === 0}
              sx={{
                "& .MuiBadge-badge": {
                  minWidth: 18,
                  height: 18,
                  px: 0.5,
                  right: -14,
                  top: 1,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                },
              }}
            >
              <Box component="span">Friends</Box>
            </Badge>
          }
        />
      </Tabs>
    </Box>
  );
};
// T: O(1) and S: O(1)

// ── Communities workspace ────────────────────────────────────────────────────
const CommunitiesView = ({
  communities,
  friends,
  meetings,
  pendingEditCommunityId = null,
  onJoin,
  onCreate,
  onOpen,
  onSchedule,
  onUpdate,
  onDelete,
  onMembersChanged,
  onPendingEditConsumed,
}: {
  communities: Community[];
  friends: Friend[];
  meetings: ScheduledMeeting[];
  pendingEditCommunityId?: string | null;
  onJoin: (communityId: string) => Promise<void>;
  onCreate: (
    input: CreateCommunityFormInput,
  ) => Promise<{ community: Community; inviteLink: string | null }>;
  onOpen: (communityId: string) => void;
  onSchedule: (community: Community) => void;
  onPendingEditConsumed?: () => void;
  onUpdate: (
    communityId: string,
    input: Partial<{
      name: string;
      description: string;
      visibility: CommunityVisibility;
      joinPolicy: "open" | "invite_only";
    }>,
  ) => Promise<void>;
  onDelete: (communityId: string) => Promise<void>;
  onMembersChanged: () => Promise<void>;
}) => {
  const [section, setSection] = useState<CommunitySectionTab>("current");
  const [layout, setLayout] = useState<CommunityLayout>("grid");
  useEffect(() => {
    try {
      const savedLayout = window.localStorage.getItem(
        COMMUNITY_LAYOUT_STORAGE_KEY,
      );
      if (savedLayout === "list" || savedLayout === "grid") {
        setLayout(savedLayout);
      }
      const savedSection = window.localStorage.getItem(
        COMMUNITY_SECTION_STORAGE_KEY,
      );
      if (
        savedSection === "current" ||
        savedSection === "join" ||
        savedSection === "create"
      ) {
        setSection(savedSection);
      }
    } catch {
      // Use the default layout when storage is blocked.
    }
  }, []);
  const [scheduleCommunityId, setScheduleCommunityId] =
    useState<string>(ALL_ID);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [communityPost, setCommunityPost] = useState("");
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [shareLink, setShareLink] = useState(true);
  const [visibility, setVisibility] = useState<CommunityVisibility>("public");
  const [createdMessage, setCreatedMessage] = useState("");
  const [createdInviteLink, setCreatedInviteLink] = useState("");
  const [createdLinkFeedback, setCreatedLinkFeedback] = useState("");
  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);
  const [joiningId, setJoiningId] = useState("");
  const [showAllCommunities, setShowAllCommunities] = useState(false);
  const [manageAnchor, setManageAnchor] = useState<HTMLElement | null>(null);
  const [managedCommunity, setManagedCommunity] = useState<Community | null>(
    null,
  );
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(
    null,
  );
  const [updateConfirmationOpen, setUpdateConfirmationOpen] = useState(false);
  const [deletingCommunity, setDeletingCommunity] = useState<Community | null>(
    null,
  );
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editVisibility, setEditVisibility] =
    useState<CommunityVisibility>("public");
  const [managementPending, setManagementPending] = useState(false);
  const [managementError, setManagementError] = useState("");
  const [membersCommunity, setMembersCommunity] = useState<Community | null>(
    null,
  );
  const [communityMembers, setCommunityMembers] = useState<
    CommunityMemberRecord[]
  >([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberActionUserId, setMemberActionUserId] = useState("");
  const [membersError, setMembersError] = useState("");
  const [selectedMemberFriendId, setSelectedMemberFriendId] = useState("");
  const [removingMember, setRemovingMember] =
    useState<CommunityMemberRecord | null>(null);
  const [memberRemovalError, setMemberRemovalError] = useState("");

  useEffect(() => {
    if (!pendingEditCommunityId) return;
    const community = communities.find(
      (item) => item.id === pendingEditCommunityId && item.joined,
    );
    if (!community) return;
    setEditingCommunity(community);
    setEditName(community.name);
    setEditDescription(community.description);
    setEditVisibility(community.visibility);
    setManagementError("");
    setUpdateConfirmationOpen(false);
    onPendingEditConsumed?.();
  }, [communities, onPendingEditConsumed, pendingEditCommunityId]);

  const joinedCommunities = communities.filter((community) => community.joined);
  const visibleJoinedCommunities = showAllCommunities
    ? joinedCommunities
    : joinedCommunities.slice(0, 5);
  const scheduleCommunity = joinedCommunities.find(
    (community) => community.id === scheduleCommunityId,
  );
  const normalizedSearch = search.trim().toLowerCase();
  const discoverableCommunities = communities.filter((community) => {
    if (!normalizedSearch) return true;
    return `${community.name} ${community.description}`
      .toLowerCase()
      .includes(normalizedSearch);
  });
  const communityEditChanges: Partial<{
    name: string;
    description: string;
    visibility: CommunityVisibility;
    joinPolicy: "open" | "invite_only";
  }> = {};
  if (editingCommunity) {
    const normalizedEditName = editName.trim();
    const normalizedEditDescription = editDescription.trim();
    if (normalizedEditName !== editingCommunity.name) {
      communityEditChanges.name = normalizedEditName;
    }
    if (normalizedEditDescription !== editingCommunity.description) {
      communityEditChanges.description = normalizedEditDescription;
    }
    if (editVisibility !== editingCommunity.visibility) {
      communityEditChanges.visibility = editVisibility;
      communityEditChanges.joinPolicy =
        editVisibility === "private" ? "invite_only" : "open";
    }
  }
  const hasCommunityEditChanges =
    Object.keys(communityEditChanges).length > 0;
  const hasValidEditedName =
    communityEditChanges.name === undefined ||
    communityEditChanges.name.length >= 3;
  const communityMemberIds = new Set(
    communityMembers.map((member) => member.userId),
  );
  const addableFriends = friends.filter(
    (friend) => friend.isFriend && !communityMemberIds.has(friend.id),
  );

  const handleSectionChange = (
    _event: React.SyntheticEvent,
    value: CommunitySectionTab,
  ) => {
    setSection(value);
    try {
      window.localStorage.setItem(COMMUNITY_SECTION_STORAGE_KEY, value);
    } catch {
      // The selected section remains active for this visit.
    }
    setCreatedMessage("");
    setCreatedInviteLink("");
    setCreatedLinkFeedback("");
  };
  // T: O(1) and S: O(1)

  const handleLayoutChange = (nextLayout: CommunityLayout) => {
    setLayout(nextLayout);
    try {
      window.localStorage.setItem(COMMUNITY_LAYOUT_STORAGE_KEY, nextLayout);
    } catch {
      // The preference remains active for this visit when storage is blocked.
    }
  };
  // T: O(1) and S: O(1)

  const handleFriendToggle = (friendId: string) => {
    setSelectedFriendIds((current) =>
      current.includes(friendId)
        ? current.filter((id) => id !== friendId)
        : [...current, friendId],
    );
  };
  // T: O(f) and S: O(f), where f is the number of selected friends

  const handleCreate = async () => {
    const normalizedTitle = title.trim();
    if (!normalizedTitle || creating) return;
    setCreating(true);
    setFormError("");
    setCreatedMessage("");
    setCreatedInviteLink("");
    setCreatedLinkFeedback("");
    try {
      const result = await onCreate({
        name: normalizedTitle,
        description: description.trim() || "A new Anchor community",
        visibility,
        friendIds: selectedFriendIds,
        firstPost: communityPost.trim(),
        createShareLink: shareLink,
      });
      setCreatedMessage(`${normalizedTitle} was created.`);
      setCreatedInviteLink(result.inviteLink ?? "");
      setTitle("");
      setDescription("");
      setCommunityPost("");
      setSelectedFriendIds([]);
      setVisibility("public");
    } catch (caught) {
      setFormError(
        caught instanceof Error ? caught.message : "Could not create community",
      );
    } finally {
      setCreating(false);
    }
  };
  // T: O(t + f) and S: O(t + f), where t is text length and f is selected friends

  const handleCopyCreatedInvite = async () => {
    if (!createdInviteLink) return;
    try {
      await navigator.clipboard.writeText(createdInviteLink);
      setCreatedLinkFeedback("Invite link copied.");
    } catch {
      setCreatedLinkFeedback("Could not copy the invite link.");
    }
  };
  // T: O(l) and S: O(l), where l is the invite-link length

  const handleShareCreatedInvite = async () => {
    if (!createdInviteLink) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join my Anchor community",
          text: "Join my community on Anchor.",
          url: createdInviteLink,
        });
        setCreatedLinkFeedback("Invite shared.");
      } else {
        await navigator.clipboard.writeText(createdInviteLink);
        setCreatedLinkFeedback("Invite link copied for sharing.");
      }
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setCreatedLinkFeedback("Could not share the invite link.");
    }
  };
  // T: O(l) and S: O(l), where l is the invite-link length

  const handleJoin = async (communityId: string) => {
    if (joiningId) return;
    setJoiningId(communityId);
    setFormError("");
    try {
      await onJoin(communityId);
    } catch (caught) {
      setFormError(
        caught instanceof Error ? caught.message : "Could not join community",
      );
    } finally {
      setJoiningId("");
    }
  };
  // T: O(1) and S: O(1)

  const handleManageMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    community: Community,
  ) => {
    event.stopPropagation();
    setManageAnchor(event.currentTarget);
    setManagedCommunity(community);
  };
  // T: O(1) and S: O(1)

  const handleManageMenuClose = () => {
    setManageAnchor(null);
    setManagedCommunity(null);
  };
  // T: O(1) and S: O(1)

  const handleStartEdit = () => {
    if (!managedCommunity) return;
    setEditingCommunity(managedCommunity);
    setEditName(managedCommunity.name);
    setEditDescription(managedCommunity.description);
    setEditVisibility(managedCommunity.visibility);
    setManagementError("");
    setUpdateConfirmationOpen(false);
    handleManageMenuClose();
  };
  // T: O(1) and S: O(1)

  const handleScheduleDiscussion = () => {
    if (!managedCommunity) return;
    const community = managedCommunity;
    handleManageMenuClose();
    onSchedule(community);
  };
  // T: O(1) and S: O(1)

  const handleRequestCommunityUpdate = () => {
    if (!hasCommunityEditChanges || !hasValidEditedName) return;
    setManagementError("");
    setUpdateConfirmationOpen(true);
  };
  // T: O(1) and S: O(1)

  const handleSaveCommunity = async () => {
    if (!editingCommunity || managementPending) return;
    if (!hasCommunityEditChanges) {
      setManagementError("Make at least one change before saving");
      return;
    }
    if (!hasValidEditedName) {
      setManagementError("Community name must be at least 3 characters");
      return;
    }
    setManagementPending(true);
    setManagementError("");
    try {
      await onUpdate(editingCommunity.id, communityEditChanges);
      setUpdateConfirmationOpen(false);
      setEditingCommunity(null);
    } catch (caught) {
      setManagementError(
        caught instanceof Error ? caught.message : "Could not update community",
      );
    } finally {
      setManagementPending(false);
    }
  };
  // T: O(n + d) and S: O(n + d), where n and d are form lengths

  const handleStartDelete = () => {
    if (!managedCommunity) return;
    setDeletingCommunity(managedCommunity);
    setManagementError("");
    handleManageMenuClose();
  };
  // T: O(1) and S: O(1)

  const loadManagedMembers = async (communityId: string) => {
    setMembersLoading(true);
    setMembersError("");
    try {
      setCommunityMembers(await listCommunityMembers(communityId));
    } catch (caught) {
      setMembersError(
        caught instanceof Error ? caught.message : "Could not load members",
      );
    } finally {
      setMembersLoading(false);
    }
  };
  // T: O(m) and S: O(m), where m is returned members

  const handleOpenMemberManagement = () => {
    if (!managedCommunity) return;
    const community = managedCommunity;
    setMembersCommunity(community);
    setCommunityMembers([]);
    setSelectedMemberFriendId("");
    setMembersError("");
    handleManageMenuClose();
    void loadManagedMembers(community.id);
  };
  // T: O(1) and S: O(1)

  const handleAddManagedMember = async () => {
    if (!membersCommunity || !selectedMemberFriendId || memberActionUserId)
      return;
    setMemberActionUserId(selectedMemberFriendId);
    setMembersError("");
    try {
      await addCommunityMember(
        membersCommunity.id,
        selectedMemberFriendId,
      );
      setSelectedMemberFriendId("");
      await Promise.all([
        loadManagedMembers(membersCommunity.id),
        onMembersChanged(),
      ]);
    } catch (caught) {
      setMembersError(
        caught instanceof Error ? caught.message : "Could not add member",
      );
    } finally {
      setMemberActionUserId("");
    }
  };
  // T: O(m) and S: O(m), where m is returned members

  const handleMemberRoleChange = async (member: CommunityMemberRecord) => {
    if (!membersCommunity || member.isCurrentUser || memberActionUserId) return;
    setMemberActionUserId(member.userId);
    setMembersError("");
    try {
      await updateCommunityMemberRole(
        membersCommunity.id,
        member.userId,
        member.role === "owner" ? "member" : "owner",
      );
      await Promise.all([
        loadManagedMembers(membersCommunity.id),
        onMembersChanged(),
      ]);
    } catch (caught) {
      setMembersError(
        caught instanceof Error
          ? caught.message
          : "Could not update member role",
      );
    } finally {
      setMemberActionUserId("");
    }
  };
  // T: O(m) and S: O(m), where m is returned members

  const handleConfirmRemoveMember = async () => {
    if (!membersCommunity || !removingMember || memberActionUserId) return;
    const member = removingMember;
    setMemberActionUserId(member.userId);
    setMembersError("");
    setMemberRemovalError("");
    try {
      await removeCommunityMember(membersCommunity.id, member.userId);
      setRemovingMember(null);
      await Promise.all([
        loadManagedMembers(membersCommunity.id),
        onMembersChanged(),
      ]);
    } catch (caught) {
      setMemberRemovalError(
        caught instanceof Error ? caught.message : "Could not remove member",
      );
    } finally {
      setMemberActionUserId("");
    }
  };
  // T: O(m) and S: O(m), where m is returned members

  const handleConfirmDelete = async () => {
    if (!deletingCommunity || managementPending) return;
    setManagementPending(true);
    setManagementError("");
    try {
      await onDelete(deletingCommunity.id);
      if (scheduleCommunityId === deletingCommunity.id) {
        setScheduleCommunityId(ALL_ID);
      }
      setDeletingCommunity(null);
    } catch (caught) {
      setManagementError(
        caught instanceof Error ? caught.message : "Could not delete community",
      );
    } finally {
      setManagementPending(false);
    }
  };
  // T: O(1) and S: O(1)

  return (
    <Stack spacing={{ xs: 1.5, sm: 2 }} sx={{ width: "100%", minWidth: 0 }}>
      <Box>
        <Typography
          sx={{
            color: C.textPrimary,
            fontFamily: "'Playfair Display', serif",
            fontSize: { xs: "1.55rem", md: "1.35rem" },
            fontWeight: 700,
          }}
        >
          Communities
        </Typography>
        <Typography sx={{ color: C.textSub, fontSize: "0.9rem", mt: 0.5 }}>
          Keep up with your groups, discover new people, or start a space of
          your own.
        </Typography>
      </Box>

      <Card
        sx={{
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          boxSizing: "border-box",
          overflow: "hidden",
          bgcolor: C.cardBg,
          height: "fit-content",
          borderRadius: { xs: 0, sm: 3 },
          border: { xs: 0, sm: `1px solid ${C.divider}` },
          boxShadow: {
            xs: "none",
            sm: "0 4px 18px rgba(44,26,10,0.05)",
          },
        }}
      >
        <Tabs
          value={section}
          onChange={handleSectionChange}
          variant="scrollable"
          scrollButtons={false}
          sx={{
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            boxSizing: "border-box",
            px: { xs: 0, sm: 1 },
            overflow: "hidden",
            borderBottom: `1px solid ${C.divider}`,
            "& .MuiTabs-scroller": { overflow: "hidden !important" },
            "& .MuiTabs-indicator": { bgcolor: C.accent },
            "& .MuiTabs-flexContainer": { width: "100%", maxWidth: "100%" },
            "& .MuiTab-root": {
              flex: { xs: "1 1 0", sm: "0 0 auto" },
              minWidth: { xs: 0, sm: 90 },
              maxWidth: { xs: "none", sm: 360 },
              px: { xs: 0.45, sm: 2 },
              color: C.textMuted,
              textTransform: "none",
              fontWeight: 600,
              fontSize: { xs: "0.7rem", sm: "0.875rem" },
              lineHeight: 1.2,
            },
            "& .Mui-selected": { color: `${C.accentDark} !important` },
          }}
        >
          <Tab
            value="current"
            label={`Current (${joinedCommunities.length})`}
          />
          <Tab value="join" label="Join a community" />
          <Tab value="create" label="Create a community" />
        </Tabs>

        <Box sx={{ width: "100%", maxWidth: "100%", minWidth: 0, boxSizing: "border-box", p: { xs: 1.5, sm: 2, md: 2.5 }, pt: { xs: 2, sm: 2 }, overflow: "hidden" }}>
          {section === "current" && (
            <Box
              sx={{
                minWidth: 0,
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
                overflow: "hidden",
              }}
            >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    mb: 1.5,
                    minWidth: 0,
                  }}
                >
                  <Box sx={{ minWidth: 0, pr: 1 }}>
                    <Typography
                      sx={{
                        color: C.textPrimary,
                        fontSize: "1rem",
                        fontWeight: 700,
                      }}
                    >
                      Your communities
                    </Typography>
                    <Typography
                      sx={{ color: C.textMuted, fontSize: "0.76rem", mt: 0.2 }}
                    >
                      Select one to schedule a discussion.
                    </Typography>
                  </Box>
                  <CommunityLayoutToggle
                    layout={layout}
                    onChange={handleLayoutChange}
                  />
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns:
                      layout === "grid"
                        ? {
                            xs: "1fr",
                            sm: "repeat(auto-fill, minmax(220px, 260px))",
                          }
                        : "1fr",
                    justifyContent: "start",
                    gap:
                      layout === "grid" ? { xs: 1, sm: 1.5 } : 0,
                  }}
                >
                  {visibleJoinedCommunities.map((community) => {
                    const isSelected = community.id === scheduleCommunityId;
                    return (
                      <Box
                        key={community.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`Open ${community.name}`}
                        onClick={() => {
                          setScheduleCommunityId(community.id);
                          onOpen(community.id);
                        }}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter" && event.key !== " ") return;
                          event.preventDefault();
                          setScheduleCommunityId(community.id);
                          onOpen(community.id);
                        }}
                        sx={{
                          width: "100%",
                          maxWidth: "100%",
                          minWidth: 0,
                          boxSizing: "border-box",
                          display: "flex",
                          position: "relative",
                          flexDirection: layout === "grid" ? "column" : "row",
                          alignItems: layout === "grid" ? "flex-start" : "center",
                          gap: { xs: 1, sm: 1.3 },
                          p:
                            layout === "grid"
                              ? { xs: 1.25, sm: 2 }
                              : { xs: 1.1, sm: 1.5 },
                          border: 0,
                          borderBottom:
                            layout === "list"
                              ? `1px solid ${C.divider}`
                              : "none",
                          borderRadius: layout === "grid" ? 2 : 0,
                          bgcolor: isSelected ? C.accentFaint : C.cardBg,
                          boxShadow:
                            layout === "grid"
                              ? `inset 0 0 0 1px ${
                                  isSelected ? C.accent : C.divider
                                }`
                              : "none",
                          color: C.textPrimary,
                          overflow: "hidden",
                          font: "inherit",
                          textAlign: "left",
                          cursor: "pointer",
                          transition:
                            "background 0.15s ease, box-shadow 0.15s ease",
                          "&:hover": {
                            bgcolor: C.accentHover,
                            boxShadow:
                              layout === "grid"
                                ? `inset 0 0 0 1px ${C.accent}`
                                : "none",
                          },
                          "&:focus-visible": {
                            outline: `2px solid ${C.accent}`,
                            outlineOffset: 2,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: { xs: 36, sm: 40 },
                            height: { xs: 36, sm: 40 },
                            borderRadius: "50%",
                            display: "grid",
                            placeItems: "center",
                            bgcolor: isSelected ? C.surface : C.accentFaint,
                            color: C.accentDark,
                            flexShrink: 0,
                          }}
                        >
                          <GroupsRoundedIcon fontSize="small" />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0, width: "100%", maxWidth: "100%" }}>
                          <Typography
                            sx={{
                              color: C.textPrimary,
                              fontSize: "0.88rem",
                              fontWeight: 700,
                              overflowWrap: "anywhere",
                            }}
                          >
                            {community.name}
                          </Typography>
                          <Typography
                            sx={{
                              color: C.textMuted,
                              fontSize: "0.74rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: {
                                xs: layout === "grid" ? "normal" : "nowrap",
                                sm: "nowrap",
                              },
                              overflowWrap: "anywhere",
                              display: {
                                xs: layout === "grid" ? "-webkit-box" : "block",
                                sm: "block",
                              },
                              WebkitLineClamp: { xs: 2, sm: "unset" },
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {community.description} · {community.memberCount}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              mt: 0.5,
                            }}
                          >
                            {community.visibility === "private" ? (
                              <LockOutlinedIcon
                                sx={{ fontSize: 13, color: C.textMuted }}
                              />
                            ) : (
                              <PublicRoundedIcon
                                sx={{ fontSize: 13, color: C.textMuted }}
                              />
                            )}
                            <Typography
                              sx={{ color: C.textMuted, fontSize: "0.68rem" }}
                            >
                              {community.visibility === "private"
                                ? "Private"
                                : "Public"}
                            </Typography>
                          </Box>
                        </Box>
                        {community.canManage && (
                          <Tooltip title="Community options">
                            <IconButton
                              size="small"
                              aria-label={`Manage ${community.name}`}
                              onKeyDown={(event) => event.stopPropagation()}
                              onClick={(event) =>
                                handleManageMenuOpen(event, community)
                              }
                            sx={{
                              color: C.textSub,
                              flexShrink: 0,
                              alignSelf: layout === "grid" ? "flex-end" : "center",
                              ml: layout === "grid" ? "auto" : 0,
                            }}
                            >
                              <MoreHorizRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    );
                  })}
                </Box>

                {joinedCommunities.length > 5 && (
                  <Box
                    component="button"
                    type="button"
                    onClick={() => setShowAllCommunities((current) => !current)}
                    aria-expanded={showAllCommunities}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.5,
                      mx: "auto",
                      mt: 1.5,
                      p: 0.5,
                      border: 0,
                      bgcolor: "transparent",
                      color: C.accentDark,
                      cursor: "pointer",
                      font: "inherit",
                      "&:hover": { color: C.textPrimary },
                    }}
                  >
                    <KeyboardArrowDownRoundedIcon
                      sx={{
                        fontSize: 20,
                        transform: showAllCommunities
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 160ms ease",
                      }}
                    />
                    <Typography sx={{ fontSize: "0.78rem", fontWeight: 700 }}>
                      {showAllCommunities
                        ? "Show fewer community groups"
                        : "Open all community groups"}
                    </Typography>
                  </Box>
                )}
            </Box>
          )}

          {section === "join" && (
            <Box
              sx={{
                minWidth: 0,
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                  minWidth: 0,
                }}
              >
                <TextField
                  fullWidth
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search communities by name or topic"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon sx={{ color: C.textMuted }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2.5,
                      bgcolor: C.surface,
                      "& fieldset": { borderColor: C.divider },
                    },
                  }}
                />
                <CommunityLayoutToggle
                  layout={layout}
                  onChange={handleLayoutChange}
                />
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns:
                    layout === "grid"
                      ? {
                          xs: "1fr",
                          sm: "repeat(auto-fill, minmax(220px, 260px))",
                        }
                      : "1fr",
                  justifyContent: "start",
                  gap: layout === "grid" ? { xs: 1, sm: 1.5 } : 0,
                  width: "100%",
                  maxWidth: "100%",
                  minWidth: 0,
                }}
              >
                {discoverableCommunities.map((community) => (
                  <Box
                    key={community.id}
                    sx={{
                      display: "flex",
                      flexDirection: layout === "grid" ? "column" : "row",
                      alignItems: layout === "grid" ? "flex-start" : "center",
                      gap: { xs: 0.8, sm: 1.5 },
                      p: layout === "grid" ? { xs: 1.25, sm: 1.5 } : { xs: 1.1, sm: 1.5 },
                      py: layout === "list" ? 1.6 : undefined,
                      minWidth: 0,
                      maxWidth: "100%",
                      boxSizing: "border-box",
                      overflow: "hidden",
                      borderRadius: layout === "grid" ? 2 : 0,
                      borderBottom:
                        layout === "list" ? `1px solid ${C.divider}` : "none",
                      boxShadow:
                        layout === "grid"
                          ? `inset 0 0 0 1px ${C.divider}`
                          : "none",
                      bgcolor: C.cardBg,
                    }}
                  >
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: C.accentFaint,
                        color: C.accentDark,
                        flexShrink: 0,
                      }}
                    >
                      <GroupsRoundedIcon />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
                      <Typography
                        sx={{
                          color: C.textPrimary,
                          fontWeight: 700,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {community.name}
                      </Typography>
                      <Typography
                        sx={{
                          color: C.textMuted,
                          fontSize: "0.78rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: layout === "grid" ? "normal" : "nowrap",
                          display: layout === "grid" ? "-webkit-box" : "block",
                          WebkitLineClamp: layout === "grid" ? 2 : undefined,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {community.description} · {community.memberCount}
                      </Typography>
                      <Typography
                        sx={{
                          color: C.textMuted,
                          fontSize: "0.7rem",
                          mt: 0.25,
                        }}
                      >
                        {community.visibility === "private"
                          ? "Private · invitation required"
                          : "Public"}
                      </Typography>
                    </Box>
                    <Button
                      onClick={() => handleJoin(community.id)}
                      disabled={community.joined || Boolean(joiningId)}
                      variant={community.joined ? "text" : "contained"}
                      sx={{
                        minWidth: { xs: 62, sm: 82 },
                        px: { xs: 1, sm: 2 },
                        flexShrink: 0,
                        alignSelf: layout === "grid" ? "stretch" : "center",
                        borderRadius: 2,
                        bgcolor: community.joined ? "transparent" : C.accent,
                        color: community.joined ? C.green : "#fff",
                        textTransform: "none",
                        boxShadow: "none",
                      }}
                    >
                      {community.joined
                        ? "Joined"
                        : joiningId === community.id
                          ? "Joining…"
                          : "Join"}
                    </Button>
                  </Box>
                ))}
              </Box>
              {discoverableCommunities.length === 0 && (
                <Typography
                  sx={{ color: C.textMuted, textAlign: "center", py: 4 }}
                >
                  No communities match “{search}”.
                </Typography>
              )}
              {formError && <Alert severity="error">{formError}</Alert>}
            </Box>
          )}

          {section === "create" && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.25fr) minmax(0, 0.75fr)" },
                gap: 3,
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,
                boxSizing: "border-box",
                overflow: "hidden",
              }}
            >
              <Stack spacing={2}>
                <TextField
                  label="Title"
                  required
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Frontend Interview Prep"
                />
                <TextField
                  label="Description"
                  multiline
                  minRows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Tell people what this community is about"
                />
                <Box>
                  <Typography
                    sx={{
                      color: C.textPrimary,
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      mb: 0.5,
                    }}
                  >
                    Who can join?
                  </Typography>
                  <RadioGroup
                    row
                    value={visibility}
                    onChange={(event) =>
                      setVisibility(event.target.value as CommunityVisibility)
                    }
                  >
                    <FormControlLabel
                      value="public"
                      control={
                        <Radio
                          sx={{
                            color: C.accent,
                            "&.Mui-checked": { color: C.accent },
                          }}
                        />
                      }
                      label="Public"
                    />
                    <FormControlLabel
                      value="private"
                      control={
                        <Radio
                          sx={{
                            color: C.accent,
                            "&.Mui-checked": { color: C.accent },
                          }}
                        />
                      }
                      label="Private"
                    />
                  </RadioGroup>
                  <Typography sx={{ color: C.textMuted, fontSize: "0.74rem" }}>
                    {visibility === "public"
                      ? "Anyone can find and join this community."
                      : "Only people with an invitation can join."}
                  </Typography>
                </Box>
                <TextField
                  label="Post about the community"
                  multiline
                  minRows={3}
                  value={communityPost}
                  onChange={(event) => setCommunityPost(event.target.value)}
                  placeholder="Write the first welcome post or announcement"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={shareLink}
                      onChange={(event) => setShareLink(event.target.checked)}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: C.accent,
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                          { bgcolor: C.accent },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography
                        sx={{ color: C.textPrimary, fontSize: "0.88rem" }}
                      >
                        Create a shareable invite link
                      </Typography>
                      <Typography
                        sx={{ color: C.textMuted, fontSize: "0.74rem" }}
                      >
                        You can copy and share it after creating the community.
                      </Typography>
                    </Box>
                  }
                />
                <Button
                  variant="contained"
                  startIcon={<AddRoundedIcon />}
                  disabled={!title.trim() || creating}
                  onClick={handleCreate}
                  sx={{
                    alignSelf: "flex-start",
                    px: 2.5,
                    borderRadius: 2,
                    bgcolor: C.accent,
                    textTransform: "none",
                    boxShadow: "none",
                  }}
                >
                  {creating ? "Creating…" : "Create community"}
                </Button>
                {formError && <Alert severity="error">{formError}</Alert>}
                {createdMessage && (
                  <Alert severity="success" role="status">
                    <Typography sx={{ fontWeight: 700, fontSize: "0.84rem" }}>
                      {createdMessage}
                    </Typography>
                    {createdInviteLink && (
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Button
                          size="small"
                          startIcon={<ContentCopyRoundedIcon />}
                          onClick={handleCopyCreatedInvite}
                          sx={{ color: C.green, textTransform: "none" }}
                        >
                          Copy invite link
                        </Button>
                        <Button
                          size="small"
                          startIcon={<ShareOutlinedIcon />}
                          onClick={handleShareCreatedInvite}
                          sx={{ color: C.green, textTransform: "none" }}
                        >
                          Share
                        </Button>
                      </Stack>
                    )}
                    {createdLinkFeedback && (
                      <Typography sx={{ mt: 0.5, fontSize: "0.74rem" }}>
                        {createdLinkFeedback}
                      </Typography>
                    )}
                  </Alert>
                )}
              </Stack>

              <Card
                variant="outlined"
                sx={{
                  p: 2,
                  minWidth: 0,
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  overflow: "hidden",
                  bgcolor: C.cardBg,
                  borderColor: C.divider,
                  borderRadius: 2.5,
                  boxShadow: "none",
                  alignSelf: "start",
                }}
              >
                <Typography
                  sx={{
                    color: C.textPrimary,
                    fontWeight: 700,
                    mb: 0.4,
                  }}
                >
                  Add your friends
                </Typography>
                <Typography
                  sx={{ color: C.textMuted, fontSize: "0.76rem", mb: 1.5 }}
                >
                  Selected friends will receive an invitation.
                </Typography>
                <Stack spacing={0.5}>
                  {friends
                    .filter((friend) => friend.isFriend)
                    .map((friend) => (
                      <Box
                        key={friend.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          py: 0.6,
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={selectedFriendIds.includes(friend.id)}
                          onChange={() => handleFriendToggle(friend.id)}
                          sx={{
                            color: C.divider,
                            "&.Mui-checked": { color: C.accent },
                          }}
                        />
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            mr: 1,
                            bgcolor: C.accentFaint,
                            color: C.accentDark,
                            fontSize: "0.75rem",
                          }}
                        >
                          {friend.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography
                            sx={{
                              color: C.textPrimary,
                              fontSize: "0.82rem",
                              fontWeight: 600,
                            }}
                          >
                            {friend.name}
                          </Typography>
                          <Typography
                            sx={{ color: C.textMuted, fontSize: "0.7rem" }}
                          >
                            {friend.handle}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                </Stack>
                {shareLink && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.8,
                      mt: 1.5,
                      p: 1.2,
                      borderRadius: 2,
                      bgcolor: C.accentFaint,
                      color: C.accentDark,
                    }}
                  >
                    <LinkRoundedIcon sx={{ fontSize: 18 }} />
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                      Invite link will be generated
                    </Typography>
                  </Box>
                )}
              </Card>
            </Box>
          )}
        </Box>
      </Card>

      {section === "current" && (
        <ScheduleMeetings
          meetings={meetings}
          activeCommunityId={ALL_ID}
          activeCommunityName={scheduleCommunity?.name}
        />
      )}

      <Menu
        anchorEl={manageAnchor}
        open={Boolean(manageAnchor)}
        onClose={handleManageMenuClose}
      >
        <MenuItem onClick={handleScheduleDiscussion} sx={{ gap: 1 }}>
          <CalendarMonthRoundedIcon fontSize="small" />
          Schedule a discussion
        </MenuItem>
        <MenuItem onClick={handleOpenMemberManagement} sx={{ gap: 1 }}>
          <GroupsRoundedIcon fontSize="small" />
          Manage members
        </MenuItem>
        <MenuItem onClick={handleStartEdit} sx={{ gap: 1 }}>
          <EditOutlinedIcon fontSize="small" />
          Edit community
        </MenuItem>
        <MenuItem onClick={handleStartDelete} sx={{ gap: 1, color: C.red }}>
          <DeleteOutlineRoundedIcon fontSize="small" />
          Delete community
        </MenuItem>
      </Menu>

      <Dialog
        open={Boolean(editingCommunity)}
        onClose={() => {
          if (!managementPending && !updateConfirmationOpen) {
            setEditingCommunity(null);
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit community</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Community name"
              value={editName}
              onChange={(event) => setEditName(event.target.value)}
              inputProps={{ maxLength: 120 }}
              fullWidth
            />
            <TextField
              label="Description"
              value={editDescription}
              onChange={(event) => setEditDescription(event.target.value)}
              inputProps={{ maxLength: 600 }}
              multiline
              minRows={3}
              fullWidth
            />
            <Box>
              <Typography sx={{ color: C.textSub, fontSize: "0.8rem" }}>
                Visibility
              </Typography>
              <RadioGroup
                row
                value={editVisibility}
                onChange={(event) =>
                  setEditVisibility(event.target.value as CommunityVisibility)
                }
              >
                <FormControlLabel
                  value="public"
                  control={<Radio size="small" />}
                  label="Public"
                />
                <FormControlLabel
                  value="private"
                  control={<Radio size="small" />}
                  label="Private"
                />
              </RadioGroup>
            </Box>
            {managementError && (
              <Alert severity="error">{managementError}</Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setUpdateConfirmationOpen(false);
              setEditingCommunity(null);
            }}
            disabled={managementPending}
            sx={{ color: C.textSub, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleRequestCommunityUpdate}
            disabled={
              managementPending ||
              !hasCommunityEditChanges ||
              !hasValidEditedName
            }
            sx={{
              bgcolor: C.accent,
              textTransform: "none",
              "&:hover": { bgcolor: C.accentDark },
            }}
          >
            {managementPending ? "Saving…" : "Save changes"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={updateConfirmationOpen}
        onClose={() => !managementPending && setUpdateConfirmationOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Update community?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: C.textSub }}>
            Are you sure you want to apply these changes to
            {editingCommunity ? ` “${editingCommunity.name}”?` : " this community?"}
          </Typography>
          {managementError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {managementError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setUpdateConfirmationOpen(false)}
            disabled={managementPending}
            sx={{ color: C.textSub, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleSaveCommunity()}
            disabled={managementPending}
            sx={{
              bgcolor: C.accent,
              textTransform: "none",
              "&:hover": { bgcolor: C.accentDark },
            }}
          >
            {managementPending ? "Updating…" : "Yes, update"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(membersCommunity)}
        onClose={() => {
          if (!memberActionUserId) setMembersCommunity(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Manage members{membersCommunity ? ` · ${membersCommunity.name}` : ""}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: C.textSub, mb: 2 }}>
            {membersCommunity?.visibility === "private"
              ? "Private communities are available only through an invite link or when an owner adds a member."
              : "Anyone can join this public community. Owners can still manage its members."}
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
            <TextField
              select
              size="small"
              label="Add a friend"
              value={selectedMemberFriendId}
              onChange={(event) => setSelectedMemberFriendId(event.target.value)}
              fullWidth
              disabled={Boolean(memberActionUserId) || addableFriends.length === 0}
            >
              {addableFriends.map((friend) => (
                <MenuItem key={friend.id} value={friend.id}>
                  {friend.name}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="outlined"
              onClick={() => void handleAddManagedMember()}
              disabled={!selectedMemberFriendId || Boolean(memberActionUserId)}
              sx={{ textTransform: "none", whiteSpace: "nowrap" }}
            >
              Add member
            </Button>
          </Stack>

          {membersError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {membersError}
            </Alert>
          )}
          {membersLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <Stack divider={<Divider flexItem />}>
              {communityMembers.map((member) => (
                <Stack
                  key={member.userId}
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={1.5}
                  sx={{ py: 1.5 }}
                >
                  <Avatar sx={{ width: 36, height: 36 }}>
                    {member.name.slice(0, 1).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700 }}>
                      {member.name}{member.isCurrentUser ? " (you)" : ""}
                    </Typography>
                    <Typography sx={{ color: C.textSub, fontSize: "0.8rem" }}>
                      {member.email}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={member.role === "owner" ? "Owner" : "Member"}
                    color={member.role === "owner" ? "primary" : "default"}
                    variant="outlined"
                  />
                  {!member.isCurrentUser && (
                    <>
                      <Button
                        size="small"
                        onClick={() => void handleMemberRoleChange(member)}
                        disabled={Boolean(memberActionUserId)}
                        sx={{ textTransform: "none", whiteSpace: "nowrap" }}
                      >
                        {memberActionUserId === member.userId
                          ? "Updating…"
                          : member.role === "owner"
                            ? "Remove owner"
                            : "Make owner"}
                      </Button>
                      <Tooltip title="Remove member">
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setMemberRemovalError("");
                              setRemovingMember(member);
                            }}
                            disabled={Boolean(memberActionUserId)}
                            aria-label={`Remove ${member.name}`}
                          >
                            <PersonRemoveOutlinedIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </>
                  )}
                </Stack>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setMembersCommunity(null)}
            disabled={Boolean(memberActionUserId)}
            sx={{ color: C.textSub, textTransform: "none" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(removingMember)}
        onClose={() => !memberActionUserId && setRemovingMember(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Remove member?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: C.textSub }}>
            {removingMember
              ? `Remove ${removingMember.name} from this community?`
              : "Remove this member from the community?"}
          </Typography>
          {memberRemovalError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {memberRemovalError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setRemovingMember(null)}
            disabled={Boolean(memberActionUserId)}
            sx={{ color: C.textSub, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => void handleConfirmRemoveMember()}
            disabled={Boolean(memberActionUserId)}
            sx={{ textTransform: "none" }}
          >
            {memberActionUserId ? "Removing…" : "Remove"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(deletingCommunity)}
        onClose={() => !managementPending && setDeletingCommunity(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete community?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: C.textSub }}>
            {deletingCommunity
              ? `“${deletingCommunity.name}” will be removed for every member. This cannot be undone.`
              : "This community will be removed."}
          </Typography>
          {managementError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {managementError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeletingCommunity(null)}
            disabled={managementPending}
            sx={{ color: C.textSub, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => void handleConfirmDelete()}
            disabled={managementPending}
            sx={{ textTransform: "none" }}
          >
            {managementPending ? "Deleting…" : "Delete community"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
// T: O(c + f) and S: O(c + f), where c is communities and f is friends

// ── Friends workspace ────────────────────────────────────────────────────────
const FriendsView = ({
  friends,
  friendRequests,
  sentFriendRequests,
  onAddFriend,
  onResolveRequest,
}: {
  friends: Friend[];
  friendRequests: CommunityFriendRequest[];
  sentFriendRequests: CommunityFriendRequest[];
  onAddFriend: (friendId: string) => Promise<void>;
  onResolveRequest: (
    requestId: string,
    status: "accepted" | "declined",
  ) => Promise<void>;
}) => {
  const [section, setSection] = useState<
    "friends" | "requests" | "sent"
  >("friends");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [requestActionId, setRequestActionId] = useState("");
  const [requestError, setRequestError] = useState("");
  const normalizedSearch = search.trim().toLowerCase();
  const currentFriends = friends.filter((friend) => friend.isFriend);

  useEffect(() => {
    if (normalizedSearch.length < 2) {
      setSearchResults([]);
      setSearching(false);
      setSearchError("");
      return;
    }
    let cancelled = false;
    setSearchResults([]);
    setSearching(true);
    setSearchError("");
    const timer = window.setTimeout(() => {
      const runSearch = async () => {
        try {
          const results = await searchPeople(normalizedSearch);
          if (cancelled) return;
          const uniqueResults = [
            ...new Map(results.map((person) => [person.id, person])).values(),
          ];
          setSearchResults(
            uniqueResults.map((person: CommunityPersonSearchResult) => ({
              id: person.id,
              name: person.name,
              handle: person.handle,
              role: person.role,
              avatarUrl: person.avatarUrl,
              mutualFriends: 0,
              isFriend: person.friendshipStatus === "accepted",
              friendshipStatus: person.friendshipStatus,
            })),
          );
        } catch (caught) {
          if (!cancelled) {
            setSearchError(
              caught instanceof Error
                ? caught.message
                : "Could not search for people",
            );
          }
        } finally {
          if (!cancelled) setSearching(false);
        }
      };
      // T: O(r) and S: O(r), where r is the returned search results
      void runSearch();
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [normalizedSearch]);

  const handleSearchResultAdd = async (friendId: string) => {
    setSearchError("");
    try {
      await onAddFriend(friendId);
      setSearchResults((current) =>
        current.map((friend) =>
          friend.id === friendId
            ? { ...friend, friendshipStatus: "pending" }
            : friend,
        ),
      );
    } catch (caught) {
      setSearchError(
        caught instanceof Error
          ? caught.message
          : "Could not send friend request",
      );
    }
  };
  // T: O(r) and S: O(r), where r is the current search results

  const handleResolveRequest = async (
    requestId: string,
    status: "accepted" | "declined",
  ) => {
    if (requestActionId) return;
    setRequestActionId(requestId);
    setRequestError("");
    try {
      await onResolveRequest(requestId, status);
    } catch (caught) {
      setRequestError(
        caught instanceof Error
          ? caught.message
          : "Could not update friend request",
      );
    } finally {
      setRequestActionId("");
    }
  };
  // T: O(1) and S: O(1)

  return (
    <Stack spacing={3} sx={{ width: "100%", minWidth: 0 }}>
      <Box>
        <Typography
          sx={{
            color: C.textPrimary,
            fontFamily: "'Playfair Display', serif",
            fontSize: { xs: "1.55rem", md: "1.35rem" },
            fontWeight: 700,
          }}
        >
          Friends
        </Typography>
        <Typography sx={{ color: C.textSub, fontSize: "0.9rem", mt: 0.5 }}>
          Find people by name and keep your learning circle close.
        </Typography>
      </Box>

      <Box
        sx={{
          width: "100%",
          minWidth: 0,
          maxWidth: { xs: "100%", md: 720 },
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search friends"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ color: C.textMuted }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: "100%",
            minWidth: 0,
            mb: searchResults.length > 0 ? 1.5 : 0,
            "& .MuiOutlinedInput-root": {
              width: "100%",
              boxSizing: "border-box",
              borderRadius: 2.5,
              bgcolor: C.surface,
              "& fieldset": { borderColor: C.divider },
              "&:hover fieldset": { borderColor: C.textMuted },
              "&.Mui-focused fieldset": { borderColor: C.accent },
            },
            "& input::placeholder": {
              color: C.textMuted,
              opacity: 1,
            },
            "& input": {
              minWidth: 0,
              fontSize: { xs: "0.82rem", sm: "1rem" },
            },
          }}
        />

        {normalizedSearch && (
          <Stack divider={<Divider sx={{ borderColor: C.divider }} />}>
            {searchResults.map((friend) => (
              <FriendRow
                key={friend.id}
                friend={friend}
                onAddFriend={handleSearchResultAdd}
              />
            ))}
            {searching && (
              <Box sx={{ display: "grid", placeItems: "center", py: 2.5 }}>
                <CircularProgress size={22} sx={{ color: C.accent }} />
              </Box>
            )}
            {!searching && searchError && (
              <Typography
                role="alert"
                sx={{ color: "#b3261e", textAlign: "center", py: 2.5 }}
              >
                {searchError}
              </Typography>
            )}
            {!searching &&
              !searchError &&
              normalizedSearch.length >= 2 &&
              searchResults.length === 0 && (
                <Typography
                  sx={{ color: C.textMuted, textAlign: "center", py: 3 }}
                >
                  No people match “{search}”.
                </Typography>
              )}
            {normalizedSearch.length === 1 && (
              <Typography
                sx={{ color: C.textMuted, textAlign: "center", py: 2.5 }}
              >
                Type at least two characters to search.
              </Typography>
            )}
          </Stack>
        )}
      </Box>

      <Box>
        <Tabs
          value={section}
          onChange={(_, value: "friends" | "requests" | "sent") =>
            setSection(value)
          }
          variant="fullWidth"
          sx={{
            mb: 2,
            maxWidth: "100%",
            minWidth: 0,
            overflow: "hidden",
            borderBottom: `1px solid ${C.divider}`,
            "& .MuiTabs-scroller": { overflow: "hidden !important" },
            "& .MuiTab-root": {
              minWidth: 0,
              px: { xs: 0.25, sm: 1.5 },
              color: C.textSub,
              textTransform: "none",
              fontWeight: 700,
              fontSize: { xs: "0.68rem", sm: "0.875rem" },
              whiteSpace: "nowrap",
            },
            "& .Mui-selected": { color: `${C.textPrimary} !important` },
            "& .MuiTabs-indicator": { bgcolor: C.accent },
          }}
        >
          <Tab
            value="friends"
            label={`Your friends (${currentFriends.length})`}
          />
          <Tab
            value="requests"
            label={`Received (${friendRequests.length})`}
          />
          <Tab
            value="sent"
            label={`Sent (${sentFriendRequests.length})`}
          />
        </Tabs>

        {section === "friends" ? (
          currentFriends.length === 0 ? (
            <Typography sx={{ color: C.textMuted, textAlign: "center", py: 4 }}>
              Your accepted friends will appear here.
            </Typography>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(3, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              {currentFriends.map((friend) => (
                <Card
                  key={friend.id}
                  sx={{
                    p: { xs: 1.25, sm: 2 },
                    borderRadius: 2.5,
                    border: `1px solid ${C.divider}`,
                    boxShadow: "0 4px 16px rgba(44,26,10,0.04)",
                    bgcolor: C.cardBg,
                    overflow: "hidden",
                  }}
                >
                  <FriendRow
                    friend={friend}
                    onAddFriend={onAddFriend}
                    compact
                  />
                </Card>
              ))}
            </Box>
          )
        ) : section === "requests" ? friendRequests.length === 0 ? (
          <Typography sx={{ color: C.textMuted, textAlign: "center", py: 4 }}>
            You have no received friend requests.
          </Typography>
        ) : (
          <Stack divider={<Divider sx={{ borderColor: C.divider }} />}>
            {friendRequests.map((request) => (
              <Box
                key={request.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.3,
                  py: 1.5,
                }}
              >
                <Avatar
                  src={request.avatarUrl ?? undefined}
                  alt={request.name}
                  sx={{
                    width: 44,
                    height: 44,
                    bgcolor: C.accentFaint,
                    color: C.accentDark,
                  }}
                >
                  {request.name.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ color: C.textPrimary, fontWeight: 700 }}>
                    {request.name}
                  </Typography>
                  <Typography sx={{ color: C.textMuted, fontSize: "0.75rem" }}>
                    {request.handle} · {request.role}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    disabled={Boolean(requestActionId)}
                    onClick={() =>
                      handleResolveRequest(request.id, "accepted")
                    }
                    sx={{
                      bgcolor: C.accent,
                      textTransform: "none",
                      boxShadow: "none",
                      "&:hover": { bgcolor: C.accentDark, boxShadow: "none" },
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outlined"
                    disabled={Boolean(requestActionId)}
                    onClick={() =>
                      handleResolveRequest(request.id, "declined")
                    }
                    sx={{
                      color: C.textSub,
                      borderColor: C.divider,
                      textTransform: "none",
                    }}
                  >
                    Decline
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        ) : sentFriendRequests.length === 0 ? (
          <Typography sx={{ color: C.textMuted, textAlign: "center", py: 4 }}>
            You have not sent any pending friend requests.
          </Typography>
        ) : (
          <Stack divider={<Divider sx={{ borderColor: C.divider }} />}>
            {sentFriendRequests.map((request) => (
              <Box
                key={request.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.3,
                  py: 1.5,
                }}
              >
                <Avatar
                  src={request.avatarUrl ?? undefined}
                  alt={request.name}
                  sx={{
                    width: 44,
                    height: 44,
                    bgcolor: C.accentFaint,
                    color: C.accentDark,
                  }}
                >
                  {request.name.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ color: C.textPrimary, fontWeight: 700 }}>
                    {request.name}
                  </Typography>
                  <Typography sx={{ color: C.textMuted, fontSize: "0.75rem" }}>
                    {request.handle} · {request.role}
                  </Typography>
                </Box>
                <Chip
                  label="Request sent"
                  size="small"
                  sx={{
                    bgcolor: C.accentFaint,
                    color: C.accentDark,
                    fontWeight: 700,
                  }}
                />
              </Box>
            ))}
          </Stack>
        )}
        {requestError && (
          <Typography
            role="alert"
            sx={{ color: C.red, textAlign: "center", mt: 2 }}
          >
            {requestError}
          </Typography>
        )}
      </Box>
    </Stack>
  );
};
// T: O(f) and S: O(f), where f is the number of friends

const FriendRow = ({
  friend,
  onAddFriend,
  compact = false,
}: {
  friend: Friend;
  onAddFriend: (friendId: string) => void | Promise<void>;
  compact?: boolean;
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.3,
        py: compact ? 0 : 1.4,
      }}
    >
      <Avatar
        src={friend.avatarUrl ?? undefined}
        alt={friend.name}
        sx={{
          width: 42,
          height: 42,
          bgcolor: C.accentFaint,
          color: C.accentDark,
          fontSize: "0.85rem",
        }}
      >
        {friend.name.charAt(0)}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ color: C.textPrimary, fontWeight: 700 }}>
          {friend.name}
        </Typography>
        <Typography
          sx={{
            color: C.textMuted,
            fontSize: "0.74rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {friend.handle} · {friend.role}
        </Typography>
        <Typography sx={{ color: C.textSub, fontSize: "0.7rem", mt: 0.3 }}>
          {friend.mutualFriends} mutual friends
        </Typography>
      </Box>
      {friend.isFriend || friend.friendshipStatus === "accepted" ? (
        <Chip
          icon={<CheckRoundedIcon />}
          label="Friend"
          size="small"
          sx={{
            bgcolor: "rgba(63,125,79,0.10)",
            color: C.green,
            fontWeight: 600,
          }}
        />
      ) : friend.friendshipStatus === "pending" ? (
        <Chip
          label="Pending"
          size="small"
          sx={{
            bgcolor: C.accentFaint,
            color: C.accentDark,
            fontWeight: 600,
          }}
        />
      ) : (
        <Button
          size="small"
          startIcon={<PersonAddAltRoundedIcon />}
          onClick={() => onAddFriend(friend.id)}
          sx={{
            color: C.accentDark,
            bgcolor: C.accentFaint,
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          Add
        </Button>
      )}
    </Box>
  );
};
// T: O(1) and S: O(1)

// ── Page-level layout ────────────────────────────────────────────────────────
type Props = {
  meetings?: ScheduledMeeting[];
};

const CommunityFeed = ({ meetings = [] }: Props) => {
  const { setMessages } = useAppChrome();
  const [pageTab, setPageTab] = useState<CommunityPageTab>("posts");
  const [activeCommunityId, setActiveCommunityId] = useState<string>(ALL_ID);
  const [communityConversationId, setCommunityConversationId] = useState<
    string | null
  >(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [replyingToPost, setReplyingToPost] = useState<ForumPost | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<
    CommunityFriendRequest[]
  >([]);
  const [sentFriendRequests, setSentFriendRequests] = useState<
    CommunityFriendRequest[]
  >([]);
  const [unreadFriendRequestCount, setUnreadFriendRequestCount] = useState(0);
  const [pendingEditCommunityId, setPendingEditCommunityId] = useState<
    string | null
  >(null);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const [notificationNotice, setNotificationNotice] = useState("");
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const [missedBehindCount, setMissedBehindCount] = useState(0);
  const [readTrackingReady, setReadTrackingReady] = useState(false);
  const [currentProfileName, setCurrentProfileName] = useState("");
  const [showCommunityChrome, setShowCommunityChrome] = useState(true);
  const [communityHeaderHeight, setCommunityHeaderHeight] = useState(62);
  const [communityMenuAnchor, setCommunityMenuAnchor] =
    useState<HTMLElement | null>(null);
  const [communitySharePending, setCommunitySharePending] = useState(false);
  const [discoveredMeetings, setDiscoveredMeetings] = useState<
    ScheduledMeeting[]
  >([]);
  const inviteHandled = useRef(false);
  const communityInviteLinksRef = useRef<Record<string, string>>({});
  const activePostScopeRef = useRef<string>(ALL_ID);
  const conversationRequestRef = useRef(0);
  const seenPostIdsRef = useRef<Set<string> | null>(null);
  const knownFriendRequestIdsRef = useRef<Set<string> | null>(null);
  const acknowledgedFriendRequestIdsRef = useRef<Set<string> | null>(null);
  const pageRootRef = useRef<HTMLDivElement | null>(null);
  const communityHeaderRef = useRef<HTMLDivElement | null>(null);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const restoredReadScopeRef = useRef("");
  const jumpingToLatestRef = useRef(false);
  const caughtUpThisVisitRef = useRef(false);
  const lastWindowScrollYRef = useRef(0);
  const lastMainScrollYRef = useRef(0);
  const chromeVisibleRef = useRef(true);
  const allMeetings = [...meetings, ...discoveredMeetings].filter(
    (meeting, index, items) =>
      items.findIndex((candidate) => candidate.id === meeting.id) === index,
  );

  useEffect(() => {
    setReplyingToPost(null);
  }, [pageTab, communityConversationId]);

  const handleMeetingDiscovered = useCallback(
    (meeting: Comm360Meeting, communityId: string) => {
      const start = new Date(meeting.startTime);
      setDiscoveredMeetings((current) => {
        const mapped: ScheduledMeeting = {
          id: meeting.id,
          communityId,
          withName: meeting.organizerName,
          topic: meeting.title,
          description: meeting.description,
          date: start.toLocaleDateString([], {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
          time: start.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          }),
          via: "Comm360",
          startAt: meeting.startTime,
          joinUrl: meeting.joinUrl,
        };
        const existingIndex = current.findIndex(
          (candidate) => candidate.id === meeting.id,
        );
        if (existingIndex < 0) return [...current, mapped];
        const next = [...current];
        next[existingIndex] = mapped;
        return next;
      });
    },
    [],
  );
  // T: O(m) and S: O(m), where m is discovered meetings

  const refreshPosts = useCallback(async (communityId: string) => {
    activePostScopeRef.current = communityId;
    const records =
      communityId === ALL_ID
        ? await listGlobalPosts()
        : await listCommunityFeed(communityId);
    const mapped = records.map(mapPost);
    if (activePostScopeRef.current === communityId) {
      setPosts(mapped);
      seenPostIdsRef.current = new Set(records.map((record) => record.id));
    }
    return mapped;
  }, []);
  // T: O(p) and S: O(p), where p is returned posts

  const refreshCommunities = useCallback(async () => {
    const [joinedRecords, discoverRecords] = await Promise.all([
      listCommunities("joined"),
      listCommunities("discover"),
    ]);
    const joinedIds = new Set(joinedRecords.map((community) => community.id));
    const combined = new Map<string, CommunityRecord>();
    for (const community of [...joinedRecords, ...discoverRecords]) {
      combined.set(community.id, community);
    }
    const mapped = [...combined.values()].map((community) =>
      mapCommunity(community, joinedIds.has(community.id)),
    );
    setCommunities(mapped);
    return mapped;
  }, []);
  // T: O(c) and S: O(c), where c is returned communities

  const refreshFriendWorkspace = useCallback(async () => {
    const [friendRecords, requestRecords, sentRequestRecords] =
      await Promise.all([
        listFriends(),
        listFriendRequests(),
        listSentFriendRequests(),
      ]);
    setFriends(
      friendRecords.map((friend) => ({
        id: friend.id,
        name: friend.name,
        handle: friend.email,
        role: "Anchor member",
        mutualFriends: Number(friend.mutualFriends) || 0,
        isFriend: true,
      })),
    );
    const receivedRecords = requestRecords.filter(
      (request) => request.direction !== "sent",
    );
    const outgoingRecords = sentRequestRecords.filter(
      (request) => request.direction !== "received",
    );
    setFriendRequests(receivedRecords);
    setSentFriendRequests(outgoingRecords);
    return {
      friendRecords,
      requestRecords: receivedRecords,
      sentRequestRecords: outgoingRecords,
    };
  }, []);
  // T: O(f + r) and S: O(f + r), where f is friends and r is requests

  const acknowledgeFriendRequests = useCallback(
    (requests: CommunityFriendRequest[]) => {
      const acknowledged =
        acknowledgedFriendRequestIdsRef.current ??
        readSeenFriendRequestIds();
      for (const request of requests) acknowledged.add(request.id);
      acknowledgedFriendRequestIdsRef.current = acknowledged;
      saveSeenFriendRequestIds(acknowledged);
      setUnreadFriendRequestCount(0);
    },
    [],
  );
  // T: O(r) and S: O(r), where r is received friend requests

  const loadCommunityPage = useCallback(async () => {
    setLoading(true);
    setPageError("");
    try {
      let inviteError = "";
      let inviteAccepted = false;
      const inviteToken = new URLSearchParams(window.location.search).get(
        "invite",
      );
      if (inviteToken && !inviteHandled.current) {
        inviteHandled.current = true;
        try {
          await acceptCommunityInvite(inviteToken);
          window.history.replaceState({}, "", window.location.pathname);
          inviteAccepted = true;
        } catch (caught) {
          inviteError =
            caught instanceof Error
              ? caught.message
              : "Could not accept community invitation";
        }
      }
      const saved =
        window.localStorage.getItem("anchor:activeCommunityId") ?? ALL_ID;
      const savedPageTab = window.localStorage.getItem(
        COMMUNITY_PAGE_TAB_STORAGE_KEY,
      );
      const pageSearchParams = new URLSearchParams(window.location.search);
      const requestedPageTab = pageSearchParams.get("tab");
      const restoredPageTab: CommunityPageTab = inviteAccepted
        ? "communities"
        : requestedPageTab === "feed" || requestedPageTab === "posts"
          ? "posts"
          : requestedPageTab === "communities"
            ? "communities"
            : requestedPageTab === "friends"
              ? "friends"
              : savedPageTab === "communities" || savedPageTab === "friends"
                ? savedPageTab
                : "posts";
      const savedConversationId = inviteAccepted
        ? null
        : pageSearchParams.get("community") ??
          window.localStorage.getItem(COMMUNITY_CONVERSATION_STORAGE_KEY);
      // Keep the Community and Feed views independent from the Friends API.
      // A transient friends-query failure must not hide communities or posts
      // behind the page-level error state.
      const mappedCommunities = await refreshCommunities();
      if (restoredPageTab === "friends") {
        await refreshFriendWorkspace();
      }
      const validSaved =
        saved === ALL_ID ||
        mappedCommunities.some(
          (community) => community.id === saved && community.joined,
        );
      const nextCommunityId = validSaved ? saved : ALL_ID;
      const restoredConversation =
        restoredPageTab === "communities" &&
        savedConversationId &&
        mappedCommunities.some(
          (community) =>
            community.id === savedConversationId && community.joined,
        )
          ? savedConversationId
          : null;

      setPageTab(restoredPageTab);
      setCommunityConversationId(restoredConversation);
      setActiveCommunityId(restoredConversation ?? nextCommunityId);
      if (restoredConversation) {
        await refreshPosts(restoredConversation);
      } else if (restoredPageTab === "posts") {
        await refreshPosts(ALL_ID);
      } else {
        activePostScopeRef.current = "community-list";
        setPosts([]);
      }
      setHydrated(true);
      if (inviteError) setPageError(inviteError);
    } catch (caught) {
      setPageError(
        caught instanceof Error
          ? caught.message
          : "Could not load the Community page",
      );
    } finally {
      setLoading(false);
    }
  }, [refreshCommunities, refreshFriendWorkspace, refreshPosts]);
  // T: O(c + f + p) and S: O(c + f + p), where c is communities, f is friends, and p is posts

  useEffect(() => {
    void loadCommunityPage();
  }, [loadCommunityPage]);

  useEffect(() => {
    const setChromeVisible = (visible: boolean) => {
      if (chromeVisibleRef.current === visible) return;
      chromeVisibleRef.current = visible;
      setShowCommunityChrome(visible);
    };

    const handleScrollPosition = (
      nextScrollY: number,
      previousScrollY: number,
    ) => {
      if (nextScrollY < 24) {
        setChromeVisible(true);
        return;
      }
      const movement = nextScrollY - previousScrollY;
      if (movement > 2) {
        setChromeVisible(false);
      } else if (movement < -2) {
        setChromeVisible(true);
      }
    };

    const mainScroller = pageRootRef.current?.closest("main");
    const handleWindowScroll = () => {
      const nextScrollY = window.scrollY;
      handleScrollPosition(nextScrollY, lastWindowScrollYRef.current);
      lastWindowScrollYRef.current = nextScrollY;
    };
    const handleMainScroll = () => {
      const nextScrollY = mainScroller?.scrollTop ?? 0;
      handleScrollPosition(nextScrollY, lastMainScrollYRef.current);
      lastMainScrollYRef.current = nextScrollY;
    };

    lastWindowScrollYRef.current = window.scrollY;
    lastMainScrollYRef.current = mainScroller?.scrollTop ?? 0;
    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    mainScroller?.addEventListener("scroll", handleMainScroll, {
      passive: true,
    });
    return () => {
      window.removeEventListener("scroll", handleWindowScroll);
      mainScroller?.removeEventListener("scroll", handleMainScroll);
    };
  }, []);

  useEffect(() => {
    const mainScroller = pageRootRef.current?.closest("main");
    const currentScrollY = Math.max(
      window.scrollY,
      mainScroller?.scrollTop ?? 0,
    );
    const visible = currentScrollY < 48;
    lastWindowScrollYRef.current = window.scrollY;
    lastMainScrollYRef.current = mainScroller?.scrollTop ?? 0;
    chromeVisibleRef.current = visible;
    setShowCommunityChrome(visible);
  }, [communityConversationId, pageTab]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("anchor:community-chrome", {
        detail: { visible: showCommunityChrome },
      }),
    );
  }, [showCommunityChrome]);

  useEffect(
    () => () => {
      window.dispatchEvent(
        new CustomEvent("anchor:community-chrome", {
          detail: { visible: true },
        }),
      );
    },
    [],
  );

  useEffect(() => {
    if (!("Notification" in window)) return;
    setNotificationPermission(Notification.permission);
    void navigator.serviceWorker?.register("/community-sw.js").catch(() => undefined);
    void getCurrentCommunityProfile()
      .then((profile) => setCurrentProfileName(profile.name))
      .catch(() => undefined);
  }, []);

  const enableNotifications = async () => {
    if (!("Notification" in window)) {
      setNotificationNotice("Notifications are not supported by this browser.");
      return;
    }
    if (Notification.permission === "denied") {
      setNotificationPermission("denied");
      setNotificationNotice(
        "Notifications are off. Allow them in your browser or phone settings.",
      );
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      setNotificationNotice(
        permission === "denied"
          ? "Notifications are off. Allow them in your browser or phone settings."
          : "",
      );
    } catch {
      setNotificationNotice(
        "Notifications could not be enabled in this browser session.",
      );
    }
  };

  useEffect(() => {
    if (!hydrated) return;
    let stopped = false;
    const sync = async () => {
      const target = activePostScopeRef.current;
      if (target === "community-list") return;
      try {
        const records = target === ALL_ID
          ? await listGlobalPosts()
          : await listCommunityFeed(target);
        if (stopped) return;
        const known = seenPostIdsRef.current;
        if (known) {
          const incoming = records.filter((record) => !known.has(record.id));
          if (activePostScopeRef.current === target) {
            setPosts(records.map(mapPost));
          }
          if (Notification.permission === "granted") {
            for (const record of incoming.slice(0, 3)) {
              if (record.author?.friendshipStatus === "self") continue;
              const body = record.body?.trim() || "Shared a new community post";
              const mentioned = currentProfileName &&
                body.toLowerCase().includes(`@${currentProfileName.toLowerCase()}`);
              const registration = await navigator.serviceWorker?.ready;
              await registration?.showNotification(
                mentioned ? `${record.author?.name ?? "A member"} mentioned you` : "New community message",
                {
                  body: `${record.author?.name ?? "Anchor member"}: ${body}`.slice(0, 180),
                  icon: "/assets/logo.png",
                  badge: "/assets/logo.png",
                  tag: `community-post-${record.id}`,
                  data: {
                    url:
                      target === ALL_ID
                        ? "/community?tab=feed"
                        : "/community?tab=communities",
                  },
                },
              );
            }
          }
        }
        seenPostIdsRef.current = new Set(records.map((record) => record.id));
      } catch {
        // Keep the current view intact during temporary background-sync failures.
      }
    };
    void sync();
    const timer = window.setInterval(() => void sync(), 2_000);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") void sync();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [currentProfileName, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    let stopped = false;

    const syncFriendRequests = async () => {
      try {
        const { requestRecords } = await refreshFriendWorkspace();
        if (stopped) return;

        const requestIds = new Set(
          requestRecords.map((request) => request.id),
        );
        const acknowledged =
          acknowledgedFriendRequestIdsRef.current ??
          readSeenFriendRequestIds();
        acknowledgedFriendRequestIdsRef.current = acknowledged;

        if (pageTab === "friends") {
          for (const requestId of requestIds) acknowledged.add(requestId);
          saveSeenFriendRequestIds(acknowledged);
          setUnreadFriendRequestCount(0);
        } else {
          setUnreadFriendRequestCount(
            requestRecords.filter((request) => !acknowledged.has(request.id))
              .length,
          );
        }

        const known = knownFriendRequestIdsRef.current;
        const incoming = known
          ? requestRecords.filter((request) => !known.has(request.id))
          : requestRecords.filter((request) => !acknowledged.has(request.id));
        knownFriendRequestIdsRef.current = requestIds;

        if (
          pageTab !== "friends" &&
          incoming.length > 0 &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          const registration = await navigator.serviceWorker?.ready;
          for (const request of incoming.slice(0, 3)) {
            await registration?.showNotification("New friend request", {
              body: `${request.name} sent you a friend request.`,
              icon: "/assets/logo.png",
              badge: "/assets/logo.png",
              tag: `friend-request-${request.id}`,
              data: { url: "/community?tab=friends" },
            });
          }
        }
      } catch {
        // Keep the current friend lists intact during brief sync failures.
      }
    };

    void syncFriendRequests();
    const timer = window.setInterval(
      () => void syncFriendRequests(),
      2_000,
    );
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void syncFriendRequests();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [hydrated, pageTab, refreshFriendWorkspace]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("anchor:activeCommunityId", activeCommunityId);
  }, [activeCommunityId, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(COMMUNITY_PAGE_TAB_STORAGE_KEY, pageTab);
    if (pageTab === "communities" && communityConversationId) {
      window.localStorage.setItem(
        COMMUNITY_CONVERSATION_STORAGE_KEY,
        communityConversationId,
      );
    } else {
      window.localStorage.removeItem(COMMUNITY_CONVERSATION_STORAGE_KEY);
    }
  }, [communityConversationId, hydrated, pageTab]);

  const handleJoinCommunity = async (communityId: string) => {
    await joinCommunity(communityId);
    await refreshCommunities();
  };
  // T: O(c) and S: O(c), where c is returned communities

  const handleCreateCommunity = async (
    input: CreateCommunityFormInput,
  ): Promise<{ community: Community; inviteLink: string | null }> => {
    const record = await createCommunity({
      name: input.name,
      description: input.description,
      visibility: input.visibility,
      friendIds: input.friendIds,
    });
    if (input.firstPost) {
      await createPost({
        communityId: record.id,
        body: input.firstPost,
        mode: "text",
      });
    }
    const inviteLink = input.createShareLink
      ? await createInviteLink(record.id)
      : null;
    const community = mapCommunity(record, true);
    await refreshCommunities();
    return { community, inviteLink };
  };
  // T: O(f + p) and S: O(f + p), where f is invited friends and p is first-post length

  const handleUpdateCommunity = async (
    communityId: string,
    input: Partial<{
      name: string;
      description: string;
      visibility: CommunityVisibility;
      joinPolicy: "open" | "invite_only";
    }>,
  ) => {
    await updateCommunity(communityId, input);
    await refreshCommunities();
  };
  // T: O(c) and S: O(c), where c is returned communities

  const handleDeleteCommunity = async (communityId: string) => {
    await deleteCommunity(communityId);
    delete communityInviteLinksRef.current[communityId];
    if (activeCommunityId === communityId) {
      setActiveCommunityId(ALL_ID);
    }
    if (communityConversationId === communityId) {
      setCommunityConversationId(null);
      setPosts([]);
    }
    await refreshCommunities();
  };
  // T: O(c) and S: O(c), where c is returned communities

  const replaceCommunityUrl = (
    tab: CommunityPageTab,
    conversationId?: string | null,
  ) => {
    const url = new URL(window.location.href);
    url.searchParams.set(
      "tab",
      tab === "posts" ? "feed" : tab,
    );
    if (tab === "communities" && conversationId) {
      url.searchParams.set("community", conversationId);
    } else {
      url.searchParams.delete("community");
    }
    url.searchParams.delete("invite");
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  };
  // T: O(q) and S: O(q), where q is the number of URL query parameters

  const handleOpenCommunity = async (communityId: string) => {
    const requestId = conversationRequestRef.current + 1;
    conversationRequestRef.current = requestId;
    setConversationLoading(true);
    setPosts([]);
    setActiveCommunityId(communityId);
    setCommunityConversationId(communityId);
    setPageTab("communities");
    window.localStorage.setItem(
      COMMUNITY_CONVERSATION_STORAGE_KEY,
      communityId,
    );
    window.localStorage.setItem(
      COMMUNITY_PAGE_TAB_STORAGE_KEY,
      "communities",
    );
    replaceCommunityUrl("communities", communityId);
    setPageError("");
    try {
      await refreshPosts(communityId);
    } catch (caught) {
      if (conversationRequestRef.current === requestId) {
        setPageError(
          caught instanceof Error ? caught.message : "Could not open community",
        );
      }
    } finally {
      if (conversationRequestRef.current === requestId) {
        setConversationLoading(false);
      }
    }
  };
  // T: O(p) and S: O(p), where p is the returned community posts

  const handlePageTabChange = (nextTab: CommunityPageTab) => {
    if (nextTab === "friends") {
      acknowledgeFriendRequests(friendRequests);
    }
    setPageTab(nextTab);
    window.localStorage.setItem(COMMUNITY_PAGE_TAB_STORAGE_KEY, nextTab);
    replaceCommunityUrl(nextTab);
    setPageError("");
    setConversationLoading(false);
    conversationRequestRef.current += 1;
    if (nextTab === "posts") {
      setCommunityConversationId(null);
      void refreshPosts(ALL_ID).catch((caught) => {
        setPageError(
          caught instanceof Error ? caught.message : "Could not load posts",
        );
      });
    }
    if (nextTab === "communities" || nextTab === "friends") {
      activePostScopeRef.current = "community-list";
      setCommunityConversationId(null);
      setPosts([]);
    }
    if (nextTab === "friends") {
      void refreshFriendWorkspace().catch((caught) => {
        setPageError(
          caught instanceof Error ? caught.message : "Could not load friends",
        );
      });
    }
  };
  // T: O(1) and S: O(1)

  const handleCloseCommunityConversation = () => {
    conversationRequestRef.current += 1;
    activePostScopeRef.current = "community-list";
    setConversationLoading(false);
    setPageError("");
    setCommunityConversationId(null);
    window.localStorage.removeItem(COMMUNITY_CONVERSATION_STORAGE_KEY);
    replaceCommunityUrl("communities");
    void refreshCommunities();
  };
  // T: O(1) and S: O(1)

  const handleScheduleCommunityDiscussion = (community: Community) => {
    const scheduleUrl = new URL("meetings", COMM360_URL);
    scheduleUrl.searchParams.set("source", "anchor");
    scheduleUrl.searchParams.set("communityId", community.id);
    scheduleUrl.searchParams.set("communityName", community.name);
    window.open(scheduleUrl.toString(), "_blank", "noopener,noreferrer");
  };
  // T: O(n) and S: O(n), where n is the community name length

  const getCommunityInviteLink = async (communityId: string) => {
    const existingLink = communityInviteLinksRef.current[communityId];
    if (existingLink) return existingLink;
    const inviteLink = await createInviteLink(communityId);
    if (!inviteLink) throw new Error("Could not create an invite link");
    communityInviteLinksRef.current[communityId] = inviteLink;
    return inviteLink;
  };
  // T: O(1) expected and S: O(c), where c is communities shared this visit

  const handleCopyCommunityInvite = async (communityId: string) => {
    if (communitySharePending) return;
    setCommunitySharePending(true);
    try {
      const inviteLink = await getCommunityInviteLink(communityId);
      await navigator.clipboard.writeText(inviteLink);
    } catch (caught) {
      setPageError(
        caught instanceof Error ? caught.message : "Could not copy invite link",
      );
    } finally {
      setCommunitySharePending(false);
    }
  };
  // T: O(l) and S: O(l), where l is the invite-link length

  const handleShareCommunityInvite = async (community: Community) => {
    if (communitySharePending) return;
    setCommunitySharePending(true);
    try {
      const inviteLink = await getCommunityInviteLink(community.id);
      if (navigator.share) {
        await navigator.share({
          title: `Join ${community.name} on Anchor`,
          text: `Join the ${community.name} community on Anchor.`,
          url: inviteLink,
        });
      } else {
        await navigator.clipboard.writeText(inviteLink);
      }
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setPageError(
        caught instanceof Error ? caught.message : "Could not share invite link",
      );
    } finally {
      setCommunitySharePending(false);
    }
  };
  // T: O(l) and S: O(l), where l is the invite-link length

  const reconcileCreatedPost = useCallback(
    async (postId: string, target: string): Promise<void> => {
      for (let attempt = 0; attempt < 45; attempt += 1) {
        await delay(attempt < 5 ? 1_000 : 2_000);
        try {
          const records =
            target === ALL_ID
              ? await listGlobalPosts()
              : await listCommunityFeed(target);
          const mapped = records.map(mapPost);
          if (!mapped.some((item) => item.id === postId)) continue;
          if (activePostScopeRef.current === target) {
            setPosts(mapped);
          }
          return;
        } catch {
          // A temporary refresh failure must not turn a successful upload red.
        }
      }
    },
    [],
  );
  // T: O(r * p) and S: O(p), where r is bounded retries and p is returned posts

  const handlePostCreated = async (
    post: CommunityPostRecord,
  ): Promise<void> => {
    setPageError("");
    const target = post.communityId ?? ALL_ID;
    const optimisticPost: ForumPost = {
      ...mapPost(post),
      friendshipStatus: "self",
    };
    if (activePostScopeRef.current === target) {
      setPosts((current) =>
        current.some((item) => item.id === optimisticPost.id)
          ? current
          : [...current, optimisticPost],
      );
    }

    if (post.status === "processing") {
      void reconcileCreatedPost(post.id, target);
      return;
    }

    void refreshPosts(target).catch(() => undefined);
  };
  // T: O(p) and S: O(p), where p is the number of displayed posts

  const handlePostUpdated = (postId: string, body: string): void => {
    setPosts((current) =>
      current.map((post) => (post.id === postId ? { ...post, body } : post)),
    );
  };
  // T: O(p) and S: O(p), where p is the number of displayed posts

  const handlePostDeleted = (postId: string): void => {
    setPosts((current) => current.filter((post) => post.id !== postId));
  };
  // T: O(p) and S: O(p), where p is the number of displayed posts

  const handleAddFriend = async (friendId: string): Promise<void> => {
    await sendFriendRequest(friendId);
    await refreshFriendWorkspace();
  };
  // T: O(1) network request and S: O(1)

  const handleResolveFriendRequest = async (
    requestId: string,
    status: "accepted" | "declined",
  ): Promise<void> => {
    await resolveFriendRequest(requestId, status);
    await refreshFriendWorkspace();
  };
  // T: O(f + r) and S: O(f + r), where f is friends and r is requests

  const conversationCommunity = communities.find(
    (community) => community.id === communityConversationId,
  );
  const visiblePosts = [...posts].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
  const currentReadScope =
    pageTab === "posts"
      ? "feed"
      : communityConversationId
        ? `community:${communityConversationId}`
        : "";
  const latestVisiblePostId = visiblePosts.at(-1)?.id;

  useEffect(() => {
    setMessages(
      posts.map((post) => ({
        id: post.id,
        communityId: post.communityId,
        communityName:
          communities.find((community) => community.id === post.communityId)
            ?.name ?? conversationCommunity?.name,
        authorName: post.authorName,
        authorAvatar: post.authorAvatar,
        body: [post.title, post.body].filter(Boolean).join(" "),
      })),
    );
    return () => setMessages([]);
  }, [communities, conversationCommunity?.name, posts, setMessages]);

  useEffect(() => {
    const postId = new URLSearchParams(window.location.search).get("post");
    if (!postId || posts.length === 0) return;
    const timer = window.setTimeout(() => {
      document
        .querySelector(`[data-community-post-id="${postId}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 280);
    return () => window.clearTimeout(timer);
  }, [communityConversationId, pageTab, posts]);

  useEffect(() => {
    const openFromInbox = (event: Event) => {
      const detail = (event as CustomEvent<OpenPostDetail>).detail;
      if (!detail?.postId) return;
      const open = async () => {
        if (detail.communityId) {
          await handleOpenCommunity(detail.communityId);
        } else {
          setPageTab("posts");
          setCommunityConversationId(null);
          replaceCommunityUrl("posts");
          await refreshPosts(ALL_ID);
        }
        window.setTimeout(() => {
          document
            .querySelector(`[data-community-post-id="${detail.postId}"]`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 350);
      };
      void open();
    };
    window.addEventListener(OPEN_POST_EVENT, openFromInbox);
    return () => window.removeEventListener(OPEN_POST_EVENT, openFromInbox);
  }, [handleOpenCommunity, refreshPosts, replaceCommunityUrl]);

  useEffect(() => {
    const header = communityHeaderRef.current;
    if (!communityConversationId || !header) return;
    const updateHeight = () =>
      setCommunityHeaderHeight(Math.ceil(header.getBoundingClientRect().height));
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);
    return () => observer.disconnect();
  }, [communityConversationId, conversationCommunity?.id]);

  const messageItems = () =>
    Array.from(
      messageListRef.current?.querySelectorAll<HTMLElement>(
        "[data-community-post-id]",
      ) ?? [],
    );

  const persistLatestRead = (items: HTMLElement[]) => {
    const latestId = items.at(-1)?.dataset.communityPostId;
    if (!latestId || !currentReadScope) return;
    window.localStorage.setItem(
      `${COMMUNITY_READ_POSITION_PREFIX}.${currentReadScope}`,
      latestId,
    );
  };

  const markVisitCaughtUp = (items: HTMLElement[]) => {
    caughtUpThisVisitRef.current = true;
    setMissedBehindCount(0);
    persistLatestRead(items);
  };

  const syncCaughtUpState = () => {
    if (jumpingToLatestRef.current) return 0;
    const items = messageItems();
    if (items.length === 0) {
      setShowJumpToLatest(false);
      return 0;
    }
    const scroller = pageRootRef.current?.closest("main");
    const viewportBottom = scroller
      ? scroller.getBoundingClientRect().bottom - 88
      : window.innerHeight - 88;
    let lastVisibleIndex = -1;
    items.forEach((item, index) => {
      if (item.getBoundingClientRect().top < viewportBottom - 8) {
        lastVisibleIndex = index;
      }
    });
    const behind = Math.max(0, items.length - 1 - lastVisibleIndex);
    setShowJumpToLatest(behind > 0);
    if (behind === 0) {
      markVisitCaughtUp(items);
    }
    return behind;
  };
  // T: O(p) and S: O(1), where p is the number of rendered posts

  useEffect(() => {
    restoredReadScopeRef.current = "";
    caughtUpThisVisitRef.current = false;
    setReadTrackingReady(false);
    setShowJumpToLatest(false);
    setMissedBehindCount(0);
  }, [currentReadScope]);

  useEffect(() => {
    if (
      !currentReadScope ||
      loading ||
      conversationLoading ||
      visiblePosts.length === 0 ||
      restoredReadScopeRef.current === currentReadScope
    ) {
      return;
    }

    let secondFrame = 0;
    let readyTimer = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        const items = messageItems();
        if (items.length === 0) return;
        const storageKey = `${COMMUNITY_READ_POSITION_PREFIX}.${currentReadScope}`;
        const savedPostId = window.localStorage.getItem(storageKey);
        const savedIndex = items.findIndex(
          (item) => item.dataset.communityPostId === savedPostId,
        );
        const caughtUp = savedIndex < 0 || savedIndex >= items.length - 1;
        if (caughtUp) {
          items.at(-1)?.scrollIntoView({ block: "end" });
          setShowJumpToLatest(false);
          markVisitCaughtUp(items);
        } else {
          const firstMissed = items[savedIndex + 1];
          firstMissed?.scrollIntoView({ block: "center" });
          caughtUpThisVisitRef.current = false;
          const behind = items.length - 1 - savedIndex;
          setMissedBehindCount(behind);
          setShowJumpToLatest(behind > 0);
        }
        restoredReadScopeRef.current = currentReadScope;
        readyTimer = window.setTimeout(() => setReadTrackingReady(true), 350);
      });
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(readyTimer);
    };
  }, [
    conversationLoading,
    currentReadScope,
    loading,
    visiblePosts.length,
  ]);

  useEffect(() => {
    if (!currentReadScope || !readTrackingReady || visiblePosts.length === 0) {
      return;
    }
    const scroller = pageRootRef.current?.closest("main");
    const handleScroll = () => syncCaughtUpState();
    syncCaughtUpState();
    scroller?.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      scroller?.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [
    currentReadScope,
    latestVisiblePostId,
    readTrackingReady,
    visiblePosts.length,
  ]);

  const handleJumpToLatest = () => {
    const items = messageItems();
    const latest = items.at(-1);
    jumpingToLatestRef.current = true;
    setShowJumpToLatest(false);
    markVisitCaughtUp(items);
    latest?.scrollIntoView({ behavior: "smooth", block: "end" });
    window.setTimeout(() => {
      jumpingToLatestRef.current = false;
      syncCaughtUpState();
    }, 700);
  };
  // T: O(p) and S: O(p), where p is the number of rendered posts

  return (
    <Box
      ref={pageRootRef}
      sx={{
        bgcolor: "var(--background)",
        minHeight: 0,
        px: 0,
        pt: 0,
        "& .MuiInputLabel-root.Mui-focused": {
          color: C.accentDark,
        },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
          {
            borderColor: C.accent,
            borderWidth: 2,
          },
        "& .MuiRadio-root.Mui-checked": {
          color: C.accent,
        },
        pb:
          pageTab === "posts" || Boolean(communityConversationId)
            ? { xs: "120px", sm: "116px", md: "120px" }
            : { xs: 2, md: 4 },
      }}
    >
      <Box
        sx={{
          display: {
            xs: communityConversationId ? "none" : "block",
            md: "block",
          },
          position: "fixed",
          top: "var(--anchor-topbar-height, 56px)",
          left: "var(--anchor-sidebar-width, 0px)",
          right: 0,
          zIndex: 1150,
          minHeight: { xs: 70, md: 56 },
          boxSizing: "border-box",
          bgcolor: { xs: "var(--anchor-header-bg)", md: "var(--anchor-header-bg)" },
          pl: COMMUNITY_GUTTER,
          pr: COMMUNITY_GUTTER,
          pt: 0,
          pb: 0,
          borderBottom: `1px solid ${C.divider}`,
          boxShadow: { xs: "0 3px 14px rgba(17,17,17,0.08)", md: "none" },
          transform: showCommunityChrome ? "translateY(0)" : "translateY(-110%)",
          transition: "transform 180ms ease",
        }}
      >
        <Box sx={{ width: "100%" }}>
          <CommunityNavigation
            value={pageTab}
            onChange={handlePageTabChange}
            friendRequestBadge={unreadFriendRequestCount}
          />
        </Box>
      </Box>
      <Box
        sx={{
          height: { xs: communityConversationId ? 0 : 70, md: 56 },
        }}
      />

      {notificationPermission === "default" && (
        <Box
          sx={{
            width: "100%",
            mt: 1,
            display: {
              xs: communityConversationId ? "none" : "flex",
              md: "flex",
            },
            justifyContent: "flex-end",
          }}
        >
          <Button
            size="small"
            startIcon={<NotificationsNoneRoundedIcon />}
            onClick={() => void enableNotifications()}
            sx={{ color: C.textPrimary, textTransform: "none", fontWeight: 600 }}
          >
            Enable notifications
          </Button>
        </Box>
      )}

      {notificationNotice && (
        <Typography
          role="status"
          sx={{
            mt: 1,
            color: C.textMuted,
            fontSize: { xs: "0.7rem", sm: "0.78rem" },
            textAlign: "right",
          }}
        >
          {notificationNotice}
        </Typography>
      )}

      <Stack
        spacing={{ xs: communityConversationId ? 1.25 : 3, sm: 3 }}
        sx={{
          width: "100%",
          mt: { xs: communityConversationId ? 0 : 3, sm: 3 },
          alignItems: "stretch",
        }}
      >
        {pageError && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={loadCommunityPage}>
                Retry
              </Button>
            }
          >
            {pageError}
          </Alert>
        )}
        {loading && (
          <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
            <CircularProgress sx={{ color: C.accent }} />
          </Box>
        )}

        {!loading && pageTab === "posts" && (
          <Box sx={communityColumnSx}>
            <Stack spacing={3}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Typography
                  sx={{
                    color: C.textPrimary,
                    fontSize: { xs: "0.82rem", sm: "0.95rem", md: "1.05rem" },
                    fontWeight: 700,
                    lineHeight: 1.45,
                  }}
                >
                  You are all caught up!
                </Typography>
              </Box>

              {visiblePosts.length === 0 ? (
                <Card
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    border: `1px solid ${C.divider}`,
                    textAlign: "center",
                    bgcolor: C.cardBg,
                  }}
                >
                  <Typography sx={{ color: C.textSub, fontSize: "0.9rem" }}>
                    No member posts yet — be the first to share something.
                  </Typography>
                </Card>
              ) : (
                <Stack ref={messageListRef} spacing={0} sx={{ width: "100%" }}>
                {visiblePosts.map((post) => (
                  <Box key={post.id} data-community-post-id={post.id}>
                    <PostCard
                      post={post}
                      viewerName={currentProfileName}
                      onReply={setReplyingToPost}
                      onUpdated={handlePostUpdated}
                      onDeleted={handlePostDeleted}
                      onMeetingDiscovered={handleMeetingDiscovered}
                    />
                  </Box>
                ))}
                </Stack>
              )}
            </Stack>
          </Box>
        )}

        {!loading &&
          pageTab === "communities" &&
          communityConversationId &&
          conversationCommunity && (
            <Box
              sx={{
                ...communityColumnSx,
                position: "relative",
              }}
            >
              <Stack spacing={{ xs: 1.25, md: 3 }} sx={{ width: "100%" }}>
                <Box
                  ref={communityHeaderRef}
                  sx={{
                    position: "fixed",
                    top: {
                      xs: "var(--anchor-topbar-height, 56px)",
                      md: "calc(var(--anchor-topbar-height, 56px) + 56px)",
                    },
                    left: "var(--anchor-sidebar-width, 0px)",
                    right: 0,
                    zIndex: 1140,
                    minHeight: { xs: 62, md: 72 },
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    bgcolor: "color-mix(in srgb, var(--anchor-header-bg) 97%, transparent)",
                    backdropFilter: "blur(10px)",
                    pl: COMMUNITY_GUTTER,
                    pr: COMMUNITY_GUTTER,
                    pt: { xs: 1, md: 1.5 },
                    pb: { xs: 1.5, md: 1.5 },
                    borderBottom: `1px solid ${C.divider}`,
                    boxShadow: "0 3px 14px rgba(17,17,17,0.08)",
                    opacity: showCommunityChrome ? 1 : 0,
                    visibility: showCommunityChrome ? "visible" : "hidden",
                    transform: showCommunityChrome
                      ? "translateY(0)"
                      : "translateY(-12px)",
                    pointerEvents: showCommunityChrome ? "auto" : "none",
                    transition:
                      "opacity 150ms ease, transform 150ms ease, visibility 150ms ease",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      pr: { xs: 1, sm: 2 },
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <IconButton
                      aria-label="Back to communities"
                      onClick={handleCloseCommunityConversation}
                      sx={{
                        display: "inline-flex",
                        width: 34,
                        height: 34,
                        ml: -0.75,
                        mr: 0.25,
                        mt: 0,
                        color: C.accentDark,
                      }}
                    >
                      <ArrowBackRoundedIcon sx={{ fontSize: 22 }} />
                    </IconButton>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        sx={{
                          color: C.textPrimary,
                          fontFamily: "'Playfair Display', serif",
                          fontSize: { xs: "1.1rem", sm: "1.25rem" },
                          fontWeight: 700,
                          lineHeight: 1.25,
                        }}
                      >
                        {conversationCommunity.name}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: { xs: 0.25, sm: 0.5 },
                      flexShrink: 0,
                    }}
                  >
                    <Tooltip title="Members">
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.4,
                          color: C.textMuted,
                          px: 0.5,
                        }}
                      >
                        <GroupsRoundedIcon sx={{ fontSize: { xs: 20, md: 22 } }} />
                        <Typography sx={{ fontSize: "0.86rem", fontWeight: 700 }}>
                          {Number.parseInt(conversationCommunity.memberCount, 10) ||
                            0}
                        </Typography>
                      </Box>
                    </Tooltip>
                    <Tooltip title="Schedule discussion">
                      <IconButton
                        aria-label="Schedule discussion"
                        onClick={() =>
                          handleScheduleCommunityDiscussion(conversationCommunity)
                        }
                        sx={{ color: C.textMuted }}
                      >
                        <VideocamRoundedIcon sx={{ fontSize: { xs: 20, md: 22 } }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Community settings">
                      <IconButton
                        aria-label="Community settings"
                        onClick={() => {
                          setPendingEditCommunityId(conversationCommunity.id);
                          handleCloseCommunityConversation();
                        }}
                        sx={{ color: C.textMuted }}
                      >
                        <SettingsOutlinedIcon sx={{ fontSize: { xs: 20, md: 22 } }} />
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      aria-label="Community actions"
                      onClick={(event) =>
                        setCommunityMenuAnchor(event.currentTarget)
                      }
                      sx={{
                        color: C.textMuted,
                        bgcolor: "transparent",
                        border: 0,
                        "&:hover": {
                          bgcolor: "transparent",
                          color: C.textPrimary,
                        },
                      }}
                    >
                      <MoreHorizRoundedIcon sx={{ fontSize: { xs: 22, md: 26 } }} />
                    </IconButton>
                  </Box>
                  <Menu
                    anchorEl={communityMenuAnchor}
                    open={Boolean(communityMenuAnchor)}
                    onClose={() => setCommunityMenuAnchor(null)}
                  >
                    <MenuItem
                      disabled={communitySharePending}
                      onClick={() => {
                        setCommunityMenuAnchor(null);
                        void handleCopyCommunityInvite(
                          conversationCommunity.id,
                        );
                      }}
                      sx={{ gap: 1 }}
                    >
                      <ContentCopyRoundedIcon fontSize="small" />
                      Copy invite link
                    </MenuItem>
                    <MenuItem
                      disabled={communitySharePending}
                      onClick={() => {
                        setCommunityMenuAnchor(null);
                        void handleShareCommunityInvite(conversationCommunity);
                      }}
                      sx={{ gap: 1 }}
                    >
                      <ShareOutlinedIcon fontSize="small" />
                      Share invite
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setCommunityMenuAnchor(null);
                        handleScheduleCommunityDiscussion(
                          conversationCommunity,
                        );
                      }}
                      sx={{ gap: 1 }}
                    >
                      <CalendarMonthRoundedIcon fontSize="small" />
                      Schedule discussion
                    </MenuItem>
                  </Menu>
                </Box>
                <Box sx={{ height: `${communityHeaderHeight}px` }} />
                {conversationLoading ? (
                  <Box
                    sx={{
                      minHeight: 180,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <CircularProgress size={28} sx={{ color: C.accent }} />
                  </Box>
                ) : visiblePosts.length === 0 ? (
                  <Card
                    sx={{
                      p: 4,
                      borderRadius: 3,
                      border: `1px solid ${C.divider}`,
                      textAlign: "center",
                      boxShadow: "none",
                      bgcolor: C.cardBg,
                    }}
                  >
                    <Typography sx={{ color: C.textSub, fontSize: "0.9rem" }}>
                      No messages yet — start this community&apos;s
                      conversation.
                    </Typography>
                  </Card>
                ) : (
                  <Stack ref={messageListRef} spacing={0} sx={{ width: "100%" }}>
                  {visiblePosts.map((post, index) => {
                    const currentDate = new Date(post.createdAt).toDateString();
                    const previousDate = index > 0
                      ? new Date(visiblePosts[index - 1].createdAt).toDateString()
                      : null;
                    return (
                    <Box key={post.id} data-community-post-id={post.id}>
                      <PostCard
                        post={post}
                        viewerName={currentProfileName}
                        onReply={setReplyingToPost}
                        communityName={conversationCommunity.name}
                        conversationStyle
                        dateLabel={currentDate !== previousDate ? formatMessageDate(post.createdAt) : undefined}
                        onUpdated={handlePostUpdated}
                        onDeleted={handlePostDeleted}
                        onMeetingDiscovered={handleMeetingDiscovered}
                      />
                    </Box>
                    );
                  })}
                  </Stack>
                )}
              </Stack>
            </Box>
          )}

        {!loading &&
          (pageTab === "posts" ||
            (pageTab === "communities" &&
              Boolean(communityConversationId))) && (
            <Box
              sx={{
                position: "fixed",
                left: "var(--anchor-sidebar-width, 0px)",
                right: 0,
                bottom: { xs: 14, md: 18 },
                zIndex: 1100,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "stretch",
                gap: 1,
                px: COMMUNITY_GUTTER,
                pointerEvents: "none",
                transition: "left 220ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {showJumpToLatest && currentReadScope && (
                <Tooltip title="Go to latest messages">
                  <Badge
                    badgeContent={missedBehindCount}
                    color="error"
                    overlap="circular"
                    invisible={missedBehindCount < 1}
                    sx={{
                      pointerEvents: "auto",
                      alignSelf: "center",
                      "& .MuiBadge-badge": {
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        minWidth: 18,
                        height: 18,
                        top: 4,
                        right: 4,
                      },
                    }}
                  >
                    <IconButton
                      aria-label="Go to latest messages"
                      onClick={handleJumpToLatest}
                      sx={{
                        width: { xs: 36, md: 40 },
                        height: { xs: 36, md: 40 },
                        color: C.textMuted,
                        bgcolor: C.cardBg,
                        border: `1px solid ${C.divider}`,
                        boxShadow: "0 4px 14px rgba(17,17,17,0.12)",
                        "&:hover": {
                          color: C.textPrimary,
                          bgcolor: C.surface,
                        },
                      }}
                    >
                      <KeyboardArrowDownRoundedIcon />
                    </IconButton>
                  </Badge>
                </Tooltip>
              )}
              <Box
                sx={{
                  ...communityColumnSx,
                  width: "100%",
                  pointerEvents: "auto",
                }}
              >
                <Composer
                  scope={pageTab === "posts" ? "global" : "community"}
                  communityId={communityConversationId ?? undefined}
                  replyTo={replyingToPost}
                  onCancelReply={() => setReplyingToPost(null)}
                  onCreated={handlePostCreated}
                />
              </Box>
            </Box>
          )}

        {!loading && pageTab === "communities" && !communityConversationId && (
          <Box sx={{ width: "100%", alignSelf: "stretch" }}>
            <CommunitiesView
              communities={communities}
              friends={friends}
              meetings={allMeetings}
              pendingEditCommunityId={pendingEditCommunityId}
              onJoin={handleJoinCommunity}
              onCreate={handleCreateCommunity}
              onOpen={handleOpenCommunity}
              onSchedule={handleScheduleCommunityDiscussion}
              onUpdate={handleUpdateCommunity}
              onDelete={handleDeleteCommunity}
              onPendingEditConsumed={() => setPendingEditCommunityId(null)}
              onMembersChanged={async () => {
                await refreshCommunities();
              }}
            />
          </Box>
        )}

        {!loading && pageTab === "friends" && (
          <Box sx={{ width: "100%", alignSelf: "stretch" }}>
            <FriendsView
              friends={friends}
              friendRequests={friendRequests}
              sentFriendRequests={sentFriendRequests}
              onAddFriend={handleAddFriend}
              onResolveRequest={handleResolveFriendRequest}
            />
          </Box>
        )}
      </Stack>
    </Box>
  );
};
// T: O(c + p + f) and S: O(c + f), where c is communities, p is posts, and f is friends

export default CommunityFeed;
