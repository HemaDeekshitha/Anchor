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
} from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import PollOutlinedIcon from "@mui/icons-material/PollOutlined";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
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
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
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

// ── Anchor palette tokens ────────────────────────────────────────────────────
const C = {
  accent: "#b87444",
  accentDark: "#a0622e",
  accentBg: "rgba(184,116,68,0.08)",
  accentBorder: "rgba(184,116,68,0.15)",
  accentFaint: "rgba(184,116,68,0.10)",
  accentHover: "rgba(184,116,68,0.06)",
  accentGrad: "linear-gradient(to right, #b87444, #a0622e)",
  cardBg: "#ffffff",
  surface: "#fdfaf7",
  divider: "#e8ddd0",
  textPrimary: "#2c1a0a",
  textSub: "#8c6a50",
  textMuted: "#b8a090",
  green: "#3f7d4f",
  red: "#b9573f",
} as const;

// ── Types ────────────────────────────────────────────────────────────────────
export type ForumComment = {
  id: string;
  authorName: string;
  authorAvatar?: string;
  body: string;
  timeAgo: string;
  canDelete?: boolean;
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
const COMMUNITY_LAYOUT_STORAGE_KEY = "anchor.community.layout";
const COMMUNITY_SECTION_STORAGE_KEY = "anchor.community.section";
const COMMUNITY_PAGE_TAB_STORAGE_KEY = "anchor.community.pageTab";
const COMMUNITY_CONVERSATION_STORAGE_KEY =
  "anchor.community.conversationId";
const COMM360_URL =
  process.env.NEXT_PUBLIC_COMM360_URL || "https://comm360.feeltiptop.com/";
const MESSAGE_URL_PATTERN = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;
const COMM360_MEETING_URL_PATTERN =
  /https?:\/\/comm360\.feeltiptop\.com\/meeting\/([A-Za-z0-9_-]+)/i;

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
}: {
  scope: "global" | "community";
  communityId?: string;
  onCreated: (post: CommunityPostRecord) => Promise<void>;
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
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const mediaUploadAbortRef = useRef<AbortController | null>(null);
  const mediaUploadPromiseRef = useRef<Promise<string> | null>(null);
  const mediaUploadRequestRef = useRef(0);
  const validPollOptions = pollOptions.filter((option) => option.trim());
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
        width: "100%",
        maxHeight: open ? 780 : 58,
        minHeight: open ? 0 : 58,
        p: open ? { xs: 1.5, sm: 1.75 } : 0,
        borderRadius: open ? 4 : 999,
        bgcolor: "#fff",
        border: `1px solid ${open ? C.accentBorder : C.divider}`,
        boxShadow: open
          ? "0 10px 30px rgba(44,26,10,0.12)"
          : "0 3px 14px rgba(44,26,10,0.06)",
        overflow: "hidden",
        transition:
          "max-height 320ms cubic-bezier(0.4, 0, 0.2, 1), border-color 200ms ease, box-shadow 200ms ease",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: open ? "flex-start" : "center",
          gap: open ? 1.2 : 0.5,
          minHeight: open ? 0 : 56,
        }}
      >
        <TextField
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
              : "Start a post"
          }
          variant="standard"
          InputProps={{ disableUnderline: true }}
          sx={{
            minWidth: 0,
            py: open ? 0.3 : 0.25,
            "& .MuiInputBase-root": {
              alignItems: open ? "flex-start" : "center",
              color: "#111",
              fontSize: open ? "1rem" : "0.95rem",
              lineHeight: 1.55,
              border: open ? "1px solid #242424" : "1px solid transparent",
              borderRadius: open ? 2 : 0,
              bgcolor: "#fff",
              px: open ? 1.5 : 2,
              py: open ? 1.1 : 0,
              transition: "font-size 200ms ease",
            },
            "& .MuiInputBase-root.Mui-focused": {
              borderColor: "#111",
            },
            "& textarea::placeholder": {
              color: "rgba(0, 0, 0, 0.62)",
              opacity: 1,
            },
            "& input::placeholder": {
              color: "rgba(0, 0, 0, 0.62)",
              opacity: 1,
            },
          }}
        />

        {!open && (
          <IconButton
            aria-label="Send post"
            onClick={handleCompactShare}
            disabled={!canSubmit || submitting}
            size="small"
            sx={{
              width: 40,
              height: 40,
              minWidth: 40,
              mr: 0.75,
              flexShrink: 0,
              color: "#fff",
              bgcolor: canSubmit ? C.accent : "#e7e4e1",
              "&:hover": { bgcolor: canSubmit ? C.accentDark : "#e7e4e1" },
              "&.Mui-disabled": { color: "#aaa", bgcolor: "#e7e4e1" },
            }}
          >
            <SendRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}

        {open && (
          <IconButton
            aria-label="Cancel post"
            onClick={handleCancel}
            size="small"
            sx={{ color: C.textMuted, flexShrink: 0 }}
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
                    bgcolor: "#fff",
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
              bgcolor: "#fff",
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
              bgcolor: "#fff",
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
              "Post"
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
  onUpdated,
  onDeleted,
  onMeetingDiscovered,
}: {
  post: ForumPost;
  communityName?: string;
  onUpdated: (postId: string, body: string) => void;
  onDeleted: (postId: string) => void;
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
    <Card
      sx={{
        width: "100%",
        maxWidth: 680,
        mx: "auto",
        boxSizing: "border-box",
        p: 3,
        borderRadius: 3,
        background: C.cardBg,
        border: `1px solid ${C.divider}`,
        boxShadow: "0 4px 20px rgba(44,26,10,0.06)",
      }}
    >
      {/* Author row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Avatar
            src={post.authorAvatar}
            sx={{
              width: 38,
              height: 38,
              bgcolor: C.accentFaint,
              color: C.accentDark,
              fontSize: "0.85rem",
            }}
          >
            {post.authorName.charAt(0)}
          </Avatar>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
              <Typography
                sx={{
                  fontSize: "0.92rem",
                  fontWeight: 600,
                  color: C.textPrimary,
                }}
              >
                {post.authorName}
              </Typography>
              {post.verified && (
                <VerifiedRoundedIcon sx={{ fontSize: 15, color: C.accent }} />
              )}
            </Box>
            <Typography sx={{ fontSize: "0.78rem", color: C.textMuted }}>
              {post.authorProfession} · {post.timeAgo}
            </Typography>
          </Box>
        </Box>
        {friendshipStatus === "none" || friendshipStatus === "pending" ? (
          <Button
            size="small"
            onClick={handleAddFriend}
            disabled={friendActionPending || friendshipStatus !== "none"}
            startIcon={
              friendshipStatus === "none" ? <PersonAddAltRoundedIcon /> : null
            }
            sx={{
              color: C.accentDark,
              textTransform: "none",
              fontWeight: 700,
              "&.Mui-disabled": { color: C.textMuted },
            }}
          >
            {friendActionPending
              ? "Adding…"
              : friendshipStatus === "none"
                ? "Add as friend"
                : "Request sent"}
          </Button>
        ) : (
          <>
            <Tooltip title="Post options">
              <IconButton
                aria-label="Post options"
                aria-controls={
                  ownerMenuAnchor ? `post-menu-${post.id}` : undefined
                }
                aria-haspopup="menu"
                aria-expanded={ownerMenuAnchor ? "true" : undefined}
                onClick={(event) => setOwnerMenuAnchor(event.currentTarget)}
                sx={{ color: C.textSub }}
              >
                <MoreHorizRoundedIcon />
              </IconButton>
            </Tooltip>
            <Menu
              id={`post-menu-${post.id}`}
              anchorEl={ownerMenuAnchor}
              open={Boolean(ownerMenuAnchor)}
              onClose={() => setOwnerMenuAnchor(null)}
              MenuListProps={{ "aria-label": "Post options" }}
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
              {friendshipStatus === "accepted" && (
                <MenuItem onClick={handleMenuShare} sx={{ gap: 1 }}>
                  <ShareOutlinedIcon fontSize="small" />
                  Share this post
                </MenuItem>
              )}
              {friendshipStatus === "accepted" && (
                <MenuItem onClick={handleCopyPostLink} sx={{ gap: 1 }}>
                  <LinkRoundedIcon fontSize="small" />
                  Copy post link
                </MenuItem>
              )}
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
          </>
        )}
      </Box>

      {communityName && (
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

      {/* Title + body */}
      {post.title && (
        <Typography
          sx={{
            fontSize: "1.15rem",
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
          fontSize: "0.9rem",
          color: C.textSub,
          lineHeight: 1.6,
          mb: 2.5,
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
            bgcolor: "#fff",
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
            component="img"
            src={item.url}
            alt="Community post upload"
            sx={{
              display: "block",
              width: "100%",
              maxWidth: 560,
              maxHeight: 380,
              mx: "auto",
              objectFit: "contain",
              borderRadius: 2,
              bgcolor: C.surface,
              mb: 2,
            }}
          />
        ) : (
          <Box
            key={item.id}
            component="video"
            src={item.url}
            controls
            sx={{
              display: "block",
              width: "100%",
              maxWidth: 560,
              maxHeight: 380,
              mx: "auto",
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
                bgcolor: "#fff",
                textTransform: "none",
                borderRadius: 2,
                py: 1,
                "&:hover": {
                  borderColor: C.divider,
                  bgcolor: "#fff",
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

      <Divider sx={{ borderColor: C.divider, mb: 1.5 }} />

      {/* Footer stats */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <Stack direction="row" spacing={2.5} alignItems="center">
          <Box
            component="button"
            type="button"
            onClick={handleLike}
            disabled={likePending}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.4,
              color: liked ? C.accentDark : C.textMuted,
              border: 0,
              bgcolor: "transparent",
              cursor: "pointer",
              font: "inherit",
              p: 0,
              "&:hover": { color: C.accentDark },
            }}
          >
            {liked ? (
              <FavoriteRoundedIcon sx={{ fontSize: 17 }} />
            ) : (
              <FavoriteBorderRoundedIcon sx={{ fontSize: 17 }} />
            )}
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 600 }}>
              {likeCount} {likeCount === 1 ? "like" : "likes"}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={2.5} alignItems="center">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.4,
              color: C.textMuted,
            }}
          >
            <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography sx={{ fontSize: "0.82rem" }}>{post.views}</Typography>
          </Box>
          <Box
            onClick={handleToggleComments}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.4,
              color: showComments ? C.accentDark : C.textMuted,
              cursor: "pointer",
              "&:hover": { color: C.accentDark },
            }}
          >
            <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 16 }} />
            <Typography
              sx={{ fontSize: "0.82rem", fontWeight: showComments ? 600 : 400 }}
            >
              {commentCount} {commentCount === 1 ? "comment" : "comments"}
            </Typography>
          </Box>
          <Tooltip title="Share with a friend">
            <IconButton
              aria-label="Share post"
              onClick={handleSharePost}
              size="small"
              sx={{ color: C.textMuted, "&:hover": { color: C.accentDark } }}
            >
              <ShareOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
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
            <Stack spacing={1.5} sx={{ mb: 2 }}>
              {comments.map((comment) => (
                <Box
                  key={comment.id}
                  sx={{ display: "flex", alignItems: "flex-start", gap: 1.2 }}
                >
                  <Avatar
                    src={comment.authorAvatar}
                    sx={{
                      width: 30,
                      height: 30,
                      bgcolor: C.accentFaint,
                      color: C.accentDark,
                      fontSize: "0.72rem",
                    }}
                  >
                    {comment.authorName.charAt(0)}
                  </Avatar>
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      pb: 1.25,
                      borderBottom: `1px solid ${C.divider}`,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 0.3,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          color: C.textPrimary,
                        }}
                      >
                        {comment.authorName}
                      </Typography>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.25}
                      >
                        <Typography
                          sx={{ fontSize: "0.7rem", color: C.textMuted }}
                        >
                          {comment.timeAgo}
                        </Typography>
                        {comment.canDelete && (
                          <Tooltip title="Delete comment">
                            <IconButton
                              size="small"
                              aria-label={`Delete comment by ${comment.authorName}`}
                              onClick={() => {
                                setCommentDeleteError("");
                                setDeletingComment(comment);
                              }}
                              sx={{
                                p: 0.35,
                                color: C.textMuted,
                                "&:hover": { color: C.red },
                              }}
                            >
                              <DeleteOutlineRoundedIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "0.85rem",
                        color: C.textSub,
                        lineHeight: 1.5,
                      }}
                    >
                      {comment.body}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}

          {/* Reply input */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              sx={{
                width: 30,
                height: 30,
                bgcolor: C.accentFaint,
                color: C.accentDark,
                fontSize: "0.72rem",
              }}
            >
              M
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
                fontSize: "0.85rem",
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
  );
};
// T: O(c + m + o) and S: O(c + o), where c is comments, m is media, and o is poll options

// ── Schedule meeting panel ──────────────────────────────────────────────────
const ScheduleMeetings = ({
  meetings,
  activeCommunityId,
  activeCommunityName,
}: {
  meetings: ScheduledMeeting[];
  activeCommunityId: string;
  activeCommunityName?: string;
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
        boxSizing: "border-box",
        p: 3,
        borderRadius: 3,
        background: C.cardBg,
        border: `1px solid ${C.divider}`,
        borderTop: `4px solid ${C.accent}`,
        boxShadow: "0 4px 20px rgba(44,26,10,0.07)",
      }}
    >
      <Typography
        sx={{
          fontSize: "1.05rem",
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
          <Typography sx={{ fontSize: "0.82rem", color: C.textSub, mb: 2 }}>
            Schedule the meeting in Comm360, then{" "}
            <Box component="span" sx={{ color: "#111", fontWeight: 700 }}>
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
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              py: 1.2,
              borderRadius: 2,
              background: C.accentGrad,
              color: "#fff",
              fontSize: "0.85rem",
              fontWeight: 600,
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
          <Stack spacing={1.25} sx={{ mt: 1.75 }}>
            {scopedMeetings.length === 0 ? (
              <Typography
                sx={{
                  color: C.textMuted,
                  fontSize: "0.85rem",
                  textAlign: "center",
                  py: 2,
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
                          bgcolor: "#fff",
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
}: {
  value: CommunityPageTab;
  onChange: (value: CommunityPageTab) => void;
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
        bgcolor: "#fff",
        borderBottom: `1px solid ${C.divider}`,
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
            color: "#111",
            textTransform: "none",
            fontSize: { xs: "0.85rem", sm: "0.95rem" },
            fontWeight: 500,
          },
          "& .Mui-selected": {
            color: "#111 !important",
            fontWeight: 700,
          },
        }}
      >
        <Tab value="posts" label="Posts" />
        <Tab value="communities" label="Communities" />
        <Tab value="friends" label="Friends" />
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
  onJoin,
  onCreate,
  onOpen,
  onSchedule,
  onUpdate,
  onDelete,
  onMembersChanged,
}: {
  communities: Community[];
  friends: Friend[];
  meetings: ScheduledMeeting[];
  onJoin: (communityId: string) => Promise<void>;
  onCreate: (
    input: CreateCommunityFormInput,
  ) => Promise<{ community: Community; inviteLink: string | null }>;
  onOpen: (communityId: string) => void;
  onSchedule: (community: Community) => void;
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
    <Stack spacing={3}>
      <Box>
        <Typography
          sx={{
            color: C.textPrimary,
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.55rem",
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
          borderRadius: 3,
          border: `1px solid ${C.divider}`,
          boxShadow: "0 4px 18px rgba(44,26,10,0.05)",
        }}
      >
        <Tabs
          value={section}
          onChange={handleSectionChange}
          variant="scrollable"
          scrollButtons={false}
          sx={{
            px: 1,
            borderBottom: `1px solid ${C.divider}`,
            "& .MuiTabs-indicator": { bgcolor: C.accent },
            "& .MuiTab-root": {
              color: C.textMuted,
              textTransform: "none",
              fontWeight: 600,
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

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {section === "current" && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "minmax(0, 1fr) 320px",
                  xl: "minmax(0, 1fr) 360px",
                },
                columnGap: { xs: 3, md: 4 },
                rowGap: 3,
                alignItems: "start",
              }}
            >
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    mb: 1.5,
                  }}
                >
                  <Box>
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
                  <Box
                    role="group"
                    aria-label="Community layout"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      borderBottom: `1px solid ${C.divider}`,
                    }}
                  >
                    <Tooltip title="Grid view">
                      <IconButton
                        aria-label="Grid view"
                        onClick={() => handleLayoutChange("grid")}
                        size="small"
                        sx={{
                          color:
                            layout === "grid" ? C.textPrimary : C.textMuted,
                          borderRadius: 0,
                          borderBottom:
                            layout === "grid"
                              ? `2px solid ${C.accent}`
                              : "2px solid transparent",
                        }}
                      >
                        <GridViewRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="List view">
                      <IconButton
                        aria-label="List view"
                        onClick={() => handleLayoutChange("list")}
                        size="small"
                        sx={{
                          color:
                            layout === "list" ? C.textPrimary : C.textMuted,
                          borderRadius: 0,
                          borderBottom:
                            layout === "list"
                              ? `2px solid ${C.accent}`
                              : "2px solid transparent",
                        }}
                      >
                        <ViewListRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns:
                      layout === "grid"
                        ? { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" }
                        : "1fr",
                    gap: layout === "grid" ? 2 : 0,
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
                          boxSizing: "border-box",
                          display: "flex",
                          alignItems: "center",
                          gap: 1.3,
                          p: layout === "grid" ? 2 : 1.5,
                          border: 0,
                          borderBottom:
                            layout === "list"
                              ? `1px solid ${C.divider}`
                              : "none",
                          borderRadius: layout === "grid" ? 2 : 0,
                          bgcolor: isSelected ? C.accentFaint : "#fff",
                          boxShadow:
                            layout === "grid"
                              ? `inset 0 0 0 1px ${
                                  isSelected ? C.accent : C.divider
                                }`
                              : "none",
                          color: C.textPrimary,
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
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            display: "grid",
                            placeItems: "center",
                            bgcolor: isSelected ? "#fff" : C.accentFaint,
                            color: C.accentDark,
                            flexShrink: 0,
                          }}
                        >
                          <GroupsRoundedIcon fontSize="small" />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            sx={{
                              color: C.textPrimary,
                              fontSize: "0.88rem",
                              fontWeight: 700,
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
                              whiteSpace: "nowrap",
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

              <ScheduleMeetings
                meetings={meetings}
                activeCommunityId={scheduleCommunityId}
                activeCommunityName={scheduleCommunity?.name}
              />
            </Box>
          )}

          {section === "join" && (
            <Stack spacing={2.5}>
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
                  maxWidth: { xs: "100%", md: 720 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    bgcolor: C.surface,
                    "& fieldset": { borderColor: C.divider },
                  },
                }}
              />

              <Stack divider={<Divider sx={{ borderColor: C.divider }} />}>
                {discoverableCommunities.map((community) => (
                  <Box
                    key={community.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      py: 1.6,
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
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{ color: C.textPrimary, fontWeight: 700 }}
                      >
                        {community.name}
                      </Typography>
                      <Typography
                        sx={{
                          color: C.textMuted,
                          fontSize: "0.78rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
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
                        minWidth: 82,
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
                {discoverableCommunities.length === 0 && (
                  <Typography
                    sx={{ color: C.textMuted, textAlign: "center", py: 4 }}
                  >
                    No communities match “{search}”.
                  </Typography>
                )}
              </Stack>
              {formError && <Alert severity="error">{formError}</Alert>}
            </Stack>
          )}

          {section === "create" && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1.25fr 0.75fr" },
                gap: 3,
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
    <Stack spacing={3}>
      <Box>
        <Typography
          sx={{
            color: C.textPrimary,
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.55rem",
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
          maxWidth: { xs: "100%", md: 720 },
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search for friends by name, handle, or role"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ color: C.textMuted }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: searchResults.length > 0 ? 1.5 : 0,
            "& .MuiOutlinedInput-root": {
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
            borderBottom: `1px solid ${C.divider}`,
            "& .MuiTab-root": {
              color: C.textSub,
              textTransform: "none",
              fontWeight: 700,
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
                    p: 2,
                    borderRadius: 2.5,
                    border: `1px solid ${C.divider}`,
                    boxShadow: "0 4px 16px rgba(44,26,10,0.04)",
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
  const [pageTab, setPageTab] = useState<CommunityPageTab>("posts");
  const [activeCommunityId, setActiveCommunityId] = useState<string>(ALL_ID);
  const [communityConversationId, setCommunityConversationId] = useState<
    string | null
  >(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<
    CommunityFriendRequest[]
  >([]);
  const [sentFriendRequests, setSentFriendRequests] = useState<
    CommunityFriendRequest[]
  >([]);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [communitySharePending, setCommunitySharePending] = useState(false);
  const [discoveredMeetings, setDiscoveredMeetings] = useState<
    ScheduledMeeting[]
  >([]);
  const [communityCopyTooltip, setCommunityCopyTooltip] =
    useState("Copy invite link");
  const [communityShareTooltip, setCommunityShareTooltip] =
    useState("Share invite link");
  const inviteHandled = useRef(false);
  const communityInviteLinksRef = useRef<Record<string, string>>({});
  const activePostScopeRef = useRef<string>(ALL_ID);
  const conversationRequestRef = useRef(0);
  const allMeetings = [...meetings, ...discoveredMeetings].filter(
    (meeting, index, items) =>
      items.findIndex((candidate) => candidate.id === meeting.id) === index,
  );

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
        mutualFriends: 0,
        isFriend: true,
      })),
    );
    setFriendRequests(requestRecords);
    setSentFriendRequests(sentRequestRecords);
    return { friendRecords, requestRecords, sentRequestRecords };
  }, []);
  // T: O(f + r) and S: O(f + r), where f is friends and r is requests

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
      const restoredPageTab: CommunityPageTab = inviteAccepted
        ? "communities"
        : savedPageTab === "communities" || savedPageTab === "friends"
          ? savedPageTab
          : "posts";
      const savedConversationId = inviteAccepted
        ? null
        : window.localStorage.getItem(COMMUNITY_CONVERSATION_STORAGE_KEY);
      const [mappedCommunities] = await Promise.all([
        refreshCommunities(),
        refreshFriendWorkspace(),
      ]);
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

  const handleOpenCommunity = async (communityId: string) => {
    const requestId = conversationRequestRef.current + 1;
    conversationRequestRef.current = requestId;
    setConversationLoading(true);
    setPosts([]);
    setActiveCommunityId(communityId);
    setCommunityConversationId(communityId);
    setPageTab("communities");
    setPageError("");
    setCommunityCopyTooltip("Copy invite link");
    setCommunityShareTooltip("Share invite link");
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
    setPageTab(nextTab);
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
    if (nextTab === "communities") {
      activePostScopeRef.current = "community-list";
      setCommunityConversationId(null);
    }
  };
  // T: O(1) and S: O(1)

  const handleCloseCommunityConversation = () => {
    conversationRequestRef.current += 1;
    activePostScopeRef.current = "community-list";
    setConversationLoading(false);
    setCommunityConversationId(null);
    setCommunityCopyTooltip("Copy invite link");
    setCommunityShareTooltip("Share invite link");
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
    setCommunityCopyTooltip("Copying invite link…");
    try {
      const inviteLink = await getCommunityInviteLink(communityId);
      await navigator.clipboard.writeText(inviteLink);
      setCommunityCopyTooltip("Invite link copied");
    } catch (caught) {
      setCommunityCopyTooltip(
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
    setCommunityShareTooltip("Preparing invite…");
    try {
      const inviteLink = await getCommunityInviteLink(community.id);
      if (navigator.share) {
        await navigator.share({
          title: `Join ${community.name} on Anchor`,
          text: `Join the ${community.name} community on Anchor.`,
          url: inviteLink,
        });
        setCommunityShareTooltip("Invite shared");
      } else {
        await navigator.clipboard.writeText(inviteLink);
        setCommunityShareTooltip("Invite link copied for sharing");
      }
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setCommunityShareTooltip(
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
          : [optimisticPost, ...current],
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
  const visiblePosts = posts;

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        minHeight: "100vh",
        p: { xs: 2, md: 4 },
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
          bgcolor: "#fff",
          mx: { xs: -2, md: -4 },
          mt: { xs: -2, md: -4 },
          px: { xs: 2, md: 4 },
          pt: { xs: 2, md: 4 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto" }}>
          <CommunityNavigation value={pageTab} onChange={handlePageTabChange} />
        </Box>
      </Box>

      <Stack spacing={3} sx={{ maxWidth: 1200, mx: "auto", mt: 3 }}>
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
          <Box
            sx={{
              width: "100%",
              maxWidth: 860,
              mx: "auto",
            }}
          >
            <Stack spacing={3}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Typography sx={{ color: C.textSub, fontSize: "0.84rem" }}>
                  Share what you&apos;re learning, building, or curious about.
                  Ask a question or join the conversation.
                </Typography>
              </Box>

              {visiblePosts.length === 0 ? (
                <Card
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    border: `1px solid ${C.divider}`,
                    textAlign: "center",
                    background: C.cardBg,
                  }}
                >
                  <Typography sx={{ color: C.textSub, fontSize: "0.9rem" }}>
                    No member posts yet — be the first to share something.
                  </Typography>
                </Card>
              ) : (
                visiblePosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onUpdated={handlePostUpdated}
                    onDeleted={handlePostDeleted}
                    onMeetingDiscovered={handleMeetingDiscovered}
                  />
                ))
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
                width: "100%",
                display: "grid",
                gridTemplateColumns: {
                  xs: "minmax(0, 1fr)",
                  lg: "minmax(0, 1fr) minmax(280px, 320px)",
                },
                gap: 3,
                alignItems: "start",
              }}
            >
              <Stack spacing={3}>
                <Box sx={{ position: "relative" }}>
                  <Button
                    onClick={handleCloseCommunityConversation}
                    sx={{
                      color: C.accentDark,
                      textTransform: "none",
                      px: 0,
                      mb: 1,
                    }}
                  >
                    ← Back to communities
                  </Button>
                  <Box sx={{ pr: { xs: 0, sm: 24 } }}>
                    <Typography
                      sx={{
                        color: C.textPrimary,
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "1.45rem",
                        fontWeight: 700,
                      }}
                    >
                      {conversationCommunity.name}
                    </Typography>
                    <Typography
                      sx={{ color: C.textSub, fontSize: "0.84rem" }}
                    >
                      Conversation shared only with this community&apos;s
                      members.
                    </Typography>
                  </Box>
                  <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{
                      position: { xs: "static", sm: "absolute" },
                      top: { sm: 0 },
                      right: { sm: 0 },
                      mt: { xs: 1.5, sm: 0 },
                      justifyContent: { xs: "flex-end", sm: "initial" },
                    }}
                  >
                    <Tooltip
                      title={communityCopyTooltip}
                      placement="top"
                      arrow
                    >
                      <span>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ContentCopyRoundedIcon />}
                          disabled={communitySharePending}
                          onClick={() =>
                            void handleCopyCommunityInvite(
                              conversationCommunity.id,
                            )
                          }
                          sx={{
                            bgcolor: C.accentFaint,
                            borderColor: C.accentBorder,
                            color: C.accentDark,
                            fontWeight: 700,
                            textTransform: "none",
                            "&:hover": {
                              bgcolor: "rgba(184,116,68,0.16)",
                              borderColor: C.accent,
                            },
                          }}
                        >
                          Copy link
                        </Button>
                      </span>
                    </Tooltip>
                    <Tooltip
                      title={communityShareTooltip}
                      placement="top"
                      arrow
                    >
                      <span>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ShareOutlinedIcon />}
                          disabled={communitySharePending}
                          onClick={() =>
                            void handleShareCommunityInvite(
                              conversationCommunity,
                            )
                          }
                          sx={{
                            bgcolor: C.accentFaint,
                            borderColor: C.accentBorder,
                            color: C.accentDark,
                            fontWeight: 700,
                            textTransform: "none",
                            "&:hover": {
                              bgcolor: "rgba(184,116,68,0.16)",
                              borderColor: C.accent,
                            },
                          }}
                        >
                          Share
                        </Button>
                      </span>
                    </Tooltip>
                  </Stack>
                </Box>
                <Box sx={{ display: { xs: "block", lg: "none" } }}>
                  <ScheduleMeetings
                    meetings={allMeetings}
                    activeCommunityId={conversationCommunity.id}
                    activeCommunityName={conversationCommunity.name}
                  />
                </Box>
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
                    }}
                  >
                    <Typography sx={{ color: C.textSub, fontSize: "0.9rem" }}>
                      No messages yet — start this community&apos;s
                      conversation.
                    </Typography>
                  </Card>
                ) : (
                  visiblePosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      communityName={conversationCommunity.name}
                      onUpdated={handlePostUpdated}
                      onDeleted={handlePostDeleted}
                      onMeetingDiscovered={handleMeetingDiscovered}
                    />
                  ))
                )}
              </Stack>
              <Box
                sx={{
                  display: { xs: "none", lg: "block" },
                  position: "sticky",
                  top: 24,
                  maxHeight: "calc(100vh - 48px)",
                  overflowY: "auto",
                  overscrollBehavior: "contain",
                  pr: 0.5,
                  scrollbarWidth: "thin",
                }}
              >
                <ScheduleMeetings
                  meetings={allMeetings}
                  activeCommunityId={conversationCommunity.id}
                  activeCommunityName={conversationCommunity.name}
                />
              </Box>
            </Box>
          )}

        {!loading &&
          (pageTab === "posts" ||
            (pageTab === "communities" &&
              Boolean(communityConversationId))) && (
            <Box
              sx={{
                position: "fixed",
                left: { xs: 0, md: "var(--anchor-sidebar-width, 84px)" },
                right: 0,
                bottom: { xs: 14, md: 18 },
                zIndex: 1100,
                px: { xs: 2, sm: 3, md: 4, lg: 5 },
                py: { xs: 0.5, md: 0.55 },
                bgcolor: "transparent",
                borderTop: "none",
                boxShadow: "none",
                pointerEvents: "none",
                transition: "left 220ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 860,
                  mx: "auto",
                  pointerEvents: "auto",
                }}
              >
                <Composer
                  scope={pageTab === "posts" ? "global" : "community"}
                  communityId={communityConversationId ?? undefined}
                  onCreated={handlePostCreated}
                />
              </Box>
            </Box>
          )}

        {!loading && pageTab === "communities" && !communityConversationId && (
          <CommunitiesView
            communities={communities}
            friends={friends}
            meetings={allMeetings}
            onJoin={handleJoinCommunity}
            onCreate={handleCreateCommunity}
            onOpen={handleOpenCommunity}
            onSchedule={handleScheduleCommunityDiscussion}
            onUpdate={handleUpdateCommunity}
            onDelete={handleDeleteCommunity}
            onMembersChanged={async () => {
              await refreshCommunities();
            }}
          />
        )}

        {!loading && pageTab === "friends" && (
          <FriendsView
            friends={friends}
            friendRequests={friendRequests}
            sentFriendRequests={sentFriendRequests}
            onAddFriend={handleAddFriend}
            onResolveRequest={handleResolveFriendRequest}
          />
        )}
      </Stack>
    </Box>
  );
};
// T: O(c + p + f) and S: O(c + f), where c is communities, p is posts, and f is friends

export default CommunityFeed;
