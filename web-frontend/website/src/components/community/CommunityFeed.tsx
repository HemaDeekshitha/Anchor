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
import PollOutlinedIcon from "@mui/icons-material/PollOutlined";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
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
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ReplyRoundedIcon from "@mui/icons-material/ReplyRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import AlternateEmailRoundedIcon from "@mui/icons-material/AlternateEmailRounded";
import MicNoneRoundedIcon from "@mui/icons-material/MicNoneRounded";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import FormatBoldRoundedIcon from "@mui/icons-material/FormatBoldRounded";
import FormatItalicRoundedIcon from "@mui/icons-material/FormatItalicRounded";
import FormatUnderlinedRoundedIcon from "@mui/icons-material/FormatUnderlinedRounded";
import StrikethroughSRoundedIcon from "@mui/icons-material/StrikethroughSRounded";
import InsertLinkRoundedIcon from "@mui/icons-material/InsertLinkRounded";
import FormatListNumberedRoundedIcon from "@mui/icons-material/FormatListNumberedRounded";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import {
  CommunityPostRecord,
  CommunityFriendRequest,
  CommunityTypingUser,
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
  listCommunityTyping,
  listFriendRequests,
  listSentFriendRequests,
  listFriends,
  listGlobalPosts,
  getComm360Meeting,
  removeFriend,
  removeCommunityMember,
  sendFriendRequest,
  searchPeople,
  setCommunityTyping,
  resolveFriendRequest,
  votePoll,
  votePost,
  updatePost,
  updateCommunity,
  updateCommunityMemberRole,
  uploadCommunityMedia,
} from "@/lib/community-api";
import {
  INBOX_CHANGED_EVENT,
  OPEN_POST_EVENT,
  consumePendingPostHighlight,
  markPendingPostHighlight,
  peekPendingPostHighlight,
  playCommunityMessageSound,
  readDeviceNotificationMode,
  readNotifiedPostIds,
  readRecentlyActiveCommunityOrder,
  saveNotifiedPostIds,
  seedReadPosition,
  touchRecentlyActiveCommunities,
  useAppChrome,
  type OpenPostDetail,
} from "@/lib/app-chrome";

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

const COMMUNITY_GUTTER = { xs: 1, sm: 2, md: 4, lg: 5 } as const;
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
    media: Array<{
      id: string;
      type: "image" | "video" | "audio" | "file";
      url: string;
      posterUrl?: string | null;
      originalFilename?: string | null;
    }>;
  } | null;
  media?: Array<{
    id: string;
    type: "image" | "video" | "audio" | "file";
    url: string;
    posterUrl?: string | null;
    originalFilename?: string | null;
  }>;
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
  communityName?: string;
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
type ComposerMode =
  | "text"
  | "emoji"
  | "image"
  | "video"
  | "audio"
  | "file"
  | "poll";

const joinDictatedText = (base: string, spoken: string) => {
  const left = base.replace(/\s+$/, "");
  const right = spoken.replace(/^\s+/, "");
  if (!left) return right;
  if (!right) return left;
  return `${left} ${right}`;
};

type SpeechRecognitionController = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult:
    | ((event: {
        resultIndex: number;
        results: ArrayLike<{
          isFinal: boolean;
          0?: { transcript: string };
          item?: (index: number) => { transcript?: string } | undefined;
        }>;
      }) => void)
    | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

const getSpeechRecognitionConstructor = ():
  | (new () => SpeechRecognitionController)
  | null => {
  if (typeof window === "undefined") return null;
  const speechWindow = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionController;
    webkitSpeechRecognition?: new () => SpeechRecognitionController;
  };
  return (
    speechWindow.SpeechRecognition ??
    speechWindow.webkitSpeechRecognition ??
    null
  );
};

const AUDIO_WAVE_BAR_COUNT = 36;

function formatAudioClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/** Idle “planned” wave shape — always visible before/after playback. */
function plannedWaveHeights(barCount: number): number[] {
  return Array.from({ length: barCount }, (_, index) => {
    const wave =
      0.34 +
      0.28 * Math.sin(index * 0.48) +
      0.16 * Math.sin(index * 1.15 + 0.8) +
      0.1 * Math.sin(index * 2.1 + 1.6);
    return Math.min(0.95, Math.max(0.16, wave));
  });
}

function getAudioContextConstructor(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  return (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext ||
    null
  );
}

/**
 * Live bars from analyser data: strength (volume) + pitch (dominant freq).
 * Base planned shape is multiplied so the wave stays readable while reacting.
 */
function liveWaveFromAnalyser(
  frequency: Uint8Array,
  timeDomain: Uint8Array,
  planned: number[],
  sampleRate: number,
  fftSize: number,
): number[] {
  let strengthSum = 0;
  for (let i = 0; i < timeDomain.length; i += 1) {
    strengthSum += Math.abs((timeDomain[i] ?? 128) - 128);
  }
  const strength = Math.min(1, (strengthSum / timeDomain.length / 128) * 2.4);

  // Dominant bin in speech-ish range (~80Hz–1.2kHz) as a pitch proxy.
  const binHz = sampleRate / fftSize;
  const minBin = Math.max(1, Math.floor(80 / binHz));
  const maxBin = Math.min(frequency.length - 1, Math.floor(1200 / binHz));
  let peakBin = minBin;
  let peakValue = 0;
  for (let bin = minBin; bin <= maxBin; bin += 1) {
    const value = frequency[bin] ?? 0;
    if (value > peakValue) {
      peakValue = value;
      peakBin = bin;
    }
  }
  const pitchHz = peakBin * binHz;
  const pitchNorm = Math.min(1, Math.max(0, (pitchHz - 80) / 700));

  const barCount = planned.length;
  const usableBins = Math.max(8, Math.floor(frequency.length * 0.45));

  return planned.map((base, index) => {
    const bin = Math.min(
      usableBins - 1,
      Math.floor((index / barCount) * usableBins),
    );
    const freqLevel = (frequency[bin] ?? 0) / 255;
    // Higher pitch lifts the right side of the wave a bit more.
    const side = index / Math.max(1, barCount - 1);
    const pitchShape =
      0.7 + 0.3 * (pitchNorm * side + (1 - pitchNorm) * (1 - side));
    const live = freqLevel * (0.45 + 0.55 * strength) * pitchShape;
    // Mix planned shape with live energy so bars always look like a wave.
    return Math.min(
      1,
      Math.max(0.12, base * 0.35 + live * 0.9 + strength * 0.12),
    );
  });
}

/** Live mic waveform — same planned + pitch/strength style as posted voice notes. */
const RecordingWaveform = ({
  accent,
  stream,
}: {
  accent: string;
  stream: MediaStream | null;
}) => {
  const plannedBars = useRef(plannedWaveHeights(AUDIO_WAVE_BAR_COUNT)).current;
  const [bars, setBars] = useState<number[]>(() => [...plannedBars]);

  useEffect(() => {
    if (!stream) {
      setBars([...plannedBars]);
      return;
    }

    const AudioCtx = getAudioContextConstructor();
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.55;
    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);
    // Do not connect to destination — monitoring would cause echo.

    let raf = 0;
    let active = true;

    const tick = () => {
      if (!active) return;
      const frequency = new Uint8Array(analyser.frequencyBinCount);
      const timeDomain = new Uint8Array(analyser.fftSize);
      analyser.getByteFrequencyData(frequency);
      analyser.getByteTimeDomainData(timeDomain);
      setBars(
        liveWaveFromAnalyser(
          frequency,
          timeDomain,
          plannedBars,
          ctx.sampleRate,
          analyser.fftSize,
        ),
      );
      raf = requestAnimationFrame(tick);
    };

    void ctx.resume().then(() => {
      if (active) raf = requestAnimationFrame(tick);
    });

    return () => {
      active = false;
      cancelAnimationFrame(raf);
      try {
        source.disconnect();
        analyser.disconnect();
      } catch {
        // already disconnected
      }
      void ctx.close().catch(() => undefined);
      setBars([...plannedBars]);
    };
  }, [stream, plannedBars]);

  return (
    <Box
      aria-hidden
      sx={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        gap: "3px",
        height: 40,
      }}
    >
      {bars.map((height, index) => (
        <Box
          key={`rec-wave-${index}`}
          sx={{
            flex: 1,
            maxWidth: 5,
            minWidth: 2.5,
            height: `${Math.round(height * 100)}%`,
            borderRadius: 999,
            bgcolor: accent,
            opacity: 0.5 + height * 0.5,
            transition: "height 50ms linear, opacity 50ms linear",
          }}
        />
      ))}
    </Box>
  );
};

const MAX_DEVICE_RECENTS = 5;
const DEVICE_MEDIA_DB = "anchor-community-device-media";
const DEVICE_MEDIA_STORE = "handles";
const DEVICE_PICTURES_KEY = "picturesDirectory";

type DeviceRecentEntry = {
  id: string;
  kind: "image" | "video";
  name: string;
  previewUrl: string;
  lastModified: number;
  handle: FileSystemFileHandle;
};

type FileSystemPermissionMode = "read" | "readwrite";

type FileSystemHandleWithPermission = FileSystemHandle & {
  queryPermission?: (descriptor?: {
    mode?: FileSystemPermissionMode;
  }) => Promise<PermissionState>;
  requestPermission?: (descriptor?: {
    mode?: FileSystemPermissionMode;
  }) => Promise<PermissionState>;
};

type FileSystemDirectoryHandleWithEntries = FileSystemDirectoryHandle & {
  entries?: () => AsyncIterableIterator<
    [string, FileSystemHandle]
  >;
  values?: () => AsyncIterableIterator<FileSystemHandle>;
};

type WindowWithFilePicker = Window & {
  showDirectoryPicker?: (options?: {
    id?: string;
    mode?: FileSystemPermissionMode;
    startIn?:
      | "desktop"
      | "documents"
      | "downloads"
      | "music"
      | "pictures"
      | "videos"
      | FileSystemHandle;
  }) => Promise<FileSystemDirectoryHandle>;
};

function supportsDeviceMediaLibrary(): boolean {
  return typeof window !== "undefined" &&
    typeof (window as WindowWithFilePicker).showDirectoryPicker === "function";
}

function openDeviceMediaDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DEVICE_MEDIA_DB, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DEVICE_MEDIA_STORE)) {
        db.createObjectStore(DEVICE_MEDIA_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Could not open media library"));
  });
}

async function storeDeviceDirectoryHandle(
  handle: FileSystemDirectoryHandle,
): Promise<void> {
  const db = await openDeviceMediaDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DEVICE_MEDIA_STORE, "readwrite");
    tx.objectStore(DEVICE_MEDIA_STORE).put(handle, DEVICE_PICTURES_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(tx.error ?? new Error("Could not save media folder access"));
  });
  db.close();
}

async function loadDeviceDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDeviceMediaDb();
    const handle = await new Promise<FileSystemDirectoryHandle | null>(
      (resolve, reject) => {
        const tx = db.transaction(DEVICE_MEDIA_STORE, "readonly");
        const request = tx.objectStore(DEVICE_MEDIA_STORE).get(DEVICE_PICTURES_KEY);
        request.onsuccess = () =>
          resolve((request.result as FileSystemDirectoryHandle | undefined) ?? null);
        request.onerror = () =>
          reject(request.error ?? new Error("Could not read media folder access"));
      },
    );
    db.close();
    return handle;
  } catch {
    return null;
  }
}

async function ensureDirectoryPermission(
  handle: FileSystemDirectoryHandle,
): Promise<boolean> {
  const permissionHandle = handle as FileSystemHandleWithPermission;
  if (typeof permissionHandle.queryPermission !== "function") return true;
  const current = await permissionHandle.queryPermission({ mode: "read" });
  if (current === "granted") return true;
  if (typeof permissionHandle.requestPermission !== "function") return false;
  const next = await permissionHandle.requestPermission({ mode: "read" });
  return next === "granted";
}

function mediaKindFromFile(file: File): "image" | "video" | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (/\.(png|jpe?g|gif|webp|bmp|heic|heif)$/i.test(file.name)) return "image";
  if (/\.(mp4|mov|m4v|webm|avi)$/i.test(file.name)) return "video";
  return null;
}

async function createDeviceMediaPreview(
  file: File,
  kind: "image" | "video",
): Promise<string> {
  if (kind === "image") {
    return URL.createObjectURL(file);
  }
  const objectUrl = URL.createObjectURL(file);
  try {
    return await new Promise<string>((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;
      video.onloadeddata = () => {
        const seekTo = Math.min(0.2, (video.duration || 1) / 4);
        const capture = () => {
          const canvas = document.createElement("canvas");
          const maxEdge = 220;
          const width = video.videoWidth || 220;
          const height = video.videoHeight || 220;
          const scale = Math.min(1, maxEdge / Math.max(width, height));
          canvas.width = Math.max(1, Math.round(width * scale));
          canvas.height = Math.max(1, Math.round(height * scale));
          const context = canvas.getContext("2d");
          if (!context) {
            reject(new Error("Could not preview video"));
            return;
          }
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.72));
        };
        if (seekTo > 0) {
          video.onseeked = capture;
          video.currentTime = seekTo;
        } else {
          capture();
        }
      };
      video.onerror = () => reject(new Error("Could not preview video"));
      video.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function revokeDeviceRecentPreviews(entries: DeviceRecentEntry[]) {
  for (const entry of entries) {
    if (entry.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(entry.previewUrl);
    }
  }
}

async function listDeviceRecentMedia(
  directory: FileSystemDirectoryHandle,
): Promise<DeviceRecentEntry[]> {
  const candidates: Array<{
    handle: FileSystemFileHandle;
    file: File;
    kind: "image" | "video";
  }> = [];

  const walk = async (
    dir: FileSystemDirectoryHandle,
    depth: number,
  ): Promise<void> => {
    // Keep the walk shallow so opening the panel stays snappy.
    if (depth > 2 || candidates.length >= 80) return;
    const directory = dir as FileSystemDirectoryHandleWithEntries;
    const iterator =
      typeof directory.entries === "function"
        ? directory.entries()
        : typeof directory.values === "function"
          ? (async function* () {
              for await (const value of directory.values!()) {
                yield [value.name, value] as [string, FileSystemHandle];
              }
            })()
          : null;
    if (!iterator) return;
    for await (const [, handle] of iterator) {
      if (candidates.length >= 80) break;
      if (handle.kind === "directory") {
        await walk(handle as FileSystemDirectoryHandle, depth + 1);
        continue;
      }
      try {
        const file = await (handle as FileSystemFileHandle).getFile();
        const kind = mediaKindFromFile(file);
        if (!kind) continue;
        candidates.push({
          handle: handle as FileSystemFileHandle,
          file,
          kind,
        });
      } catch {
        // Skip unreadable entries.
      }
    }
  };

  await walk(directory, 0);
  candidates.sort((left, right) => right.file.lastModified - left.file.lastModified);

  const entries: DeviceRecentEntry[] = [];
  for (const candidate of candidates.slice(0, MAX_DEVICE_RECENTS)) {
    try {
      const previewUrl = await createDeviceMediaPreview(
        candidate.file,
        candidate.kind,
      );
      entries.push({
        id: `${candidate.file.name}-${candidate.file.size}-${candidate.file.lastModified}`,
        kind: candidate.kind,
        name: candidate.file.name,
        previewUrl,
        lastModified: candidate.file.lastModified,
        handle: candidate.handle,
      });
    } catch {
      // Skip files we cannot preview.
    }
  }
  return entries;
}

function mediaFileLabel(
  url: string,
  originalFilename?: string | null,
) {
  const named = originalFilename?.trim();
  if (named) return named;
  try {
    const path = decodeURIComponent(new URL(url).pathname);
    const name = path.split("/").pop() ?? "";
    return name.split("?")[0] || "Attached document";
  } catch {
    return "Attached document";
  }
}

function isPdfMediaUrl(url: string) {
  return /\.pdf($|\?)/i.test(url) || /\/[^/?]*pdf($|\?)/i.test(url);
}

function isImageLikeFileUrl(url: string) {
  return /\.(png|jpe?g|gif|webp|bmp|svg)($|\?)/i.test(url);
}

/** Retries once on failure so brief signed-URL / network blips do not leave a blank tile. */
function CommunityFeedImage({
  url,
  alt,
  onOpen,
}: {
  url: string;
  alt: string;
  onOpen: () => void;
}) {
  const [src, setSrc] = useState(url);
  const [failed, setFailed] = useState(false);
  const retriedRef = useRef(false);

  useEffect(() => {
    setSrc(url);
    setFailed(false);
    retriedRef.current = false;
  }, [url]);

  return (
    <Box
      component="button"
      type="button"
      aria-label={alt}
      onClick={onOpen}
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
        minHeight: { xs: 160, sm: 200 },
      }}
    >
      {failed ? (
        <Stack
          alignItems="center"
          justifyContent="center"
          spacing={0.75}
          sx={{ minHeight: { xs: 160, sm: 200 }, px: 2 }}
        >
          <Typography sx={{ color: C.textMuted, fontSize: "0.82rem" }}>
            Could not load image
          </Typography>
          <Button
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              retriedRef.current = false;
              setFailed(false);
              setSrc(`${url}${url.includes("?") ? "&" : "?"}retry=${Date.now()}`);
            }}
            sx={{ textTransform: "none", color: C.accentDark }}
          >
            Retry
          </Button>
        </Stack>
      ) : (
        <Box
          component="img"
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => {
            if (!retriedRef.current) {
              retriedRef.current = true;
              setSrc(`${url}${url.includes("?") ? "&" : "?"}retry=${Date.now()}`);
              return;
            }
            setFailed(true);
          }}
          sx={{
            display: "block",
            width: "100%",
            minHeight: { xs: 160, sm: 200 },
            maxHeight: { xs: 260, sm: 380 },
            objectFit: "contain",
            bgcolor: C.surface,
          }}
        />
      )}
    </Box>
  );
}

/** Uses a Cloudinary poster frame so mobile does not show a black tile before play. */
function CommunityFeedVideo({
  url,
  posterUrl,
}: {
  url: string;
  posterUrl?: string | null;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [fallbackPoster, setFallbackPoster] = useState<string | null>(null);

  useEffect(() => {
    setFallbackPoster(null);
    const video = videoRef.current;
    if (!video || posterUrl) return;

    let cancelled = false;
    const captureFrame = () => {
      if (cancelled || video.videoWidth < 2 || video.videoHeight < 2) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext("2d");
        if (!context) return;
        context.drawImage(video, 0, 0);
        setFallbackPoster(canvas.toDataURL("image/jpeg", 0.72));
      } catch {
        // Cross-origin canvases may be tainted; poster URL from API is preferred.
      }
    };

    const onLoadedData = () => {
      if (cancelled) return;
      if (video.readyState >= 2) {
        const seekTo = Math.min(0.15, Math.max(0.01, (video.duration || 1) / 20));
        const onSeeked = () => {
          captureFrame();
          video.removeEventListener("seeked", onSeeked);
        };
        video.addEventListener("seeked", onSeeked);
        try {
          video.currentTime = seekTo;
        } catch {
          captureFrame();
        }
      }
    };

    video.addEventListener("loadeddata", onLoadedData);
    return () => {
      cancelled = true;
      video.removeEventListener("loadeddata", onLoadedData);
    };
  }, [url, posterUrl]);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: { xs: "100%", sm: 640 },
        mr: "auto",
        mb: 2,
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "#111",
        minHeight: { xs: 180, sm: 220 },
      }}
    >
      <Box
        component="video"
        ref={videoRef}
        src={url}
        poster={posterUrl || fallbackPoster || undefined}
        controls
        playsInline
        preload="metadata"
        controlsList="nodownload"
        sx={{
          display: "block",
          width: "100%",
          maxHeight: { xs: 260, sm: 380 },
          minHeight: { xs: 180, sm: 220 },
          bgcolor: "#111",
          verticalAlign: "middle",
        }}
      />
    </Box>
  );
}

/** Voice-note player: planned waves at rest, live pitch/strength waves while playing. */
function CommunityFeedAudio({ url }: { url: string }) {
  const plannedBars = useRef(plannedWaveHeights(AUDIO_WAVE_BAR_COUNT)).current;
  const [bars, setBars] = useState<number[]>(() => [...plannedBars]);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const startedAtRef = useRef(0);
  const offsetRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const playingRef = useRef(false);
  const modeRef = useRef<"buffer" | "element">("buffer");

  const stopAnimation = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const resetToPlanned = () => {
    setBars([...plannedBars]);
  };

  const ensureContext = async () => {
    const AudioCtx = getAudioContextConstructor();
    if (!AudioCtx) return null;
    if (!audioContextRef.current) {
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.55;
      analyser.connect(ctx.destination);
      audioContextRef.current = ctx;
      analyserRef.current = analyser;
    }
    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  useEffect(() => {
    let cancelled = false;
    audioBufferRef.current = null;
    offsetRef.current = 0;
    setProgress(0);
    setCurrent(0);
    setDuration(0);
    setPlaying(false);
    playingRef.current = false;
    modeRef.current = "buffer";
    resetToPlanned();

    const load = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Could not load audio");
        const bytes = await response.arrayBuffer();
        if (cancelled) return;

        const OfflineCtor =
          window.OfflineAudioContext ||
          (
            window as unknown as {
              webkitOfflineAudioContext?: typeof OfflineAudioContext;
            }
          ).webkitOfflineAudioContext;
        let decoded: AudioBuffer | null = null;
        if (OfflineCtor) {
          const offline = new OfflineCtor(1, 1, 44100);
          decoded = await offline.decodeAudioData(bytes.slice(0));
        } else {
          const AudioCtx = getAudioContextConstructor();
          if (AudioCtx) {
            const temp = new AudioCtx();
            decoded = await temp.decodeAudioData(bytes.slice(0));
            void temp.close().catch(() => undefined);
          }
        }
        if (cancelled || !decoded) return;
        audioBufferRef.current = decoded;
        setDuration(decoded.duration);
      } catch {
        // Fall back to <audio> element playback + analyser if possible.
        modeRef.current = "element";
      }
    };

    void load();
    return () => {
      cancelled = true;
      stopAnimation();
      try {
        sourceRef.current?.stop();
      } catch {
        // already stopped
      }
      sourceRef.current = null;
      playingRef.current = false;
      htmlAudioRef.current?.pause();
    };
  }, [url]);

  const readLiveBars = () => {
    const ctx = audioContextRef.current;
    const analyser = analyserRef.current;
    if (!ctx || !analyser) return null;
    const frequency = new Uint8Array(analyser.frequencyBinCount);
    const timeDomain = new Uint8Array(analyser.fftSize);
    analyser.getByteFrequencyData(frequency);
    analyser.getByteTimeDomainData(timeDomain);
    return liveWaveFromAnalyser(
      frequency,
      timeDomain,
      plannedBars,
      ctx.sampleRate,
      analyser.fftSize,
    );
  };

  const tickBuffer = () => {
    const ctx = audioContextRef.current;
    const buffer = audioBufferRef.current;
    if (!ctx || !buffer || !playingRef.current) return;

    const elapsed = ctx.currentTime - startedAtRef.current + offsetRef.current;
    const nextCurrent = Math.min(buffer.duration, Math.max(0, elapsed));
    setCurrent(nextCurrent);
    setProgress(buffer.duration > 0 ? nextCurrent / buffer.duration : 0);

    if (nextCurrent >= buffer.duration - 0.02) {
      playingRef.current = false;
      setPlaying(false);
      offsetRef.current = 0;
      setProgress(0);
      setCurrent(0);
      sourceRef.current = null;
      stopAnimation();
      resetToPlanned();
      return;
    }

    const live = readLiveBars();
    if (live) setBars(live);
    rafRef.current = requestAnimationFrame(tickBuffer);
  };

  const tickElement = () => {
    const audio = htmlAudioRef.current;
    if (!audio || !playingRef.current) return;

    const nextDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
    const nextCurrent = audio.currentTime;
    if (nextDuration > 0) {
      setDuration(nextDuration);
      setProgress(nextCurrent / nextDuration);
    }
    setCurrent(nextCurrent);

    if (audio.ended) {
      playingRef.current = false;
      setPlaying(false);
      setProgress(0);
      setCurrent(0);
      stopAnimation();
      resetToPlanned();
      return;
    }

    const live = readLiveBars();
    if (live) {
      setBars(live);
    } else {
      // No analyser (CORS) — still animate planned waves with a strength pulse.
      const pulse =
        0.55 +
        0.45 * Math.abs(Math.sin(nextCurrent * 8.2)) *
          (0.35 + 0.65 * Math.abs(Math.sin(nextCurrent * 2.1)));
      setBars(
        plannedBars.map((base, index) => {
          const ripple = 0.75 + 0.25 * Math.sin(nextCurrent * 10 + index * 0.45);
          return Math.min(1, Math.max(0.14, base * pulse * ripple));
        }),
      );
    }
    rafRef.current = requestAnimationFrame(tickElement);
  };

  const stopSource = () => {
    try {
      sourceRef.current?.stop();
    } catch {
      // already stopped
    }
    sourceRef.current = null;
  };

  const startBufferFromOffset = async (offsetSeconds: number) => {
    const buffer = audioBufferRef.current;
    const ctx = await ensureContext();
    const analyser = analyserRef.current;
    if (!buffer || !ctx || !analyser) return false;

    stopSource();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(analyser);
    const startAt = Math.min(
      Math.max(0, offsetSeconds),
      Math.max(0, buffer.duration - 0.05),
    );
    offsetRef.current = startAt;
    startedAtRef.current = ctx.currentTime;
    source.start(0, startAt);
    sourceRef.current = source;
    playingRef.current = true;
    setPlaying(true);
    stopAnimation();
    rafRef.current = requestAnimationFrame(tickBuffer);
    return true;
  };

  const startElementPlayback = async () => {
    const audio = htmlAudioRef.current;
    if (!audio) return false;
    const ctx = await ensureContext();
    const analyser = analyserRef.current;
    if (ctx && analyser && !mediaSourceRef.current) {
      try {
        audio.crossOrigin = "anonymous";
        const mediaSource = ctx.createMediaElementSource(audio);
        mediaSource.connect(analyser);
        mediaSourceRef.current = mediaSource;
      } catch {
        // Element already hooked or CORS — waves may use pulse fallback.
      }
    }
    try {
      await audio.play();
    } catch {
      return false;
    }
    playingRef.current = true;
    setPlaying(true);
    stopAnimation();
    rafRef.current = requestAnimationFrame(tickElement);
    return true;
  };

  const togglePlayback = async () => {
    if (playingRef.current) {
      if (modeRef.current === "buffer" && audioBufferRef.current) {
        const ctx = audioContextRef.current;
        if (ctx) {
          offsetRef.current = Math.min(
            audioBufferRef.current.duration,
            ctx.currentTime - startedAtRef.current + offsetRef.current,
          );
          setCurrent(offsetRef.current);
          setProgress(
            audioBufferRef.current.duration > 0
              ? offsetRef.current / audioBufferRef.current.duration
              : 0,
          );
        }
        stopSource();
      } else {
        htmlAudioRef.current?.pause();
      }
      playingRef.current = false;
      setPlaying(false);
      stopAnimation();
      resetToPlanned();
      return;
    }

    if (audioBufferRef.current) {
      modeRef.current = "buffer";
      await startBufferFromOffset(offsetRef.current);
      return;
    }

    modeRef.current = "element";
    await startElementPlayback();
  };

  const seekToRatio = async (ratio: number) => {
    const clamped = Math.min(1, Math.max(0, ratio));
    if (audioBufferRef.current && audioBufferRef.current.duration > 0) {
      const next = clamped * audioBufferRef.current.duration;
      offsetRef.current = next;
      setCurrent(next);
      setProgress(clamped);
      if (playingRef.current) {
        await startBufferFromOffset(next);
      }
      return;
    }
    const audio = htmlAudioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) {
      return;
    }
    audio.currentTime = clamped * audio.duration;
    setCurrent(audio.currentTime);
    setProgress(clamped);
  };

  const seekFromPointer = (
    event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clientX =
      "touches" in event
        ? (event.touches[0]?.clientX ?? event.changedTouches[0]?.clientX ?? 0)
        : event.clientX;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    void seekToRatio(ratio);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.15,
        width: "100%",
        maxWidth: 520,
        mr: "auto",
        mb: 2,
        px: 1.25,
        py: 1.15,
        minHeight: { xs: 68, sm: 72 },
        borderRadius: 3,
        bgcolor: C.surface,
        border: `1px solid ${C.divider}`,
        boxSizing: "border-box",
      }}
    >
      <Box
        component="audio"
        ref={htmlAudioRef}
        src={url}
        preload="metadata"
        crossOrigin="anonymous"
        onLoadedMetadata={(event) => {
          const media = event.currentTarget;
          if (!audioBufferRef.current && Number.isFinite(media.duration)) {
            setDuration(media.duration);
          }
        }}
        sx={{ display: "none" }}
      />
      <IconButton
        aria-label={playing ? "Pause voice note" : "Play voice note"}
        onClick={() => {
          void togglePlayback();
        }}
        sx={{
          width: 42,
          height: 42,
          flexShrink: 0,
          color: "#fff",
          bgcolor: C.accent,
          "&:hover": { bgcolor: C.accentDark },
        }}
      >
        {playing ? (
          <PauseRoundedIcon sx={{ fontSize: 22 }} />
        ) : (
          <PlayArrowRoundedIcon sx={{ fontSize: 24 }} />
        )}
      </IconButton>

      <Box
        role="slider"
        aria-label="Voice note waveform"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        tabIndex={0}
        onClick={seekFromPointer}
        onTouchEnd={seekFromPointer}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            void seekToRatio(Math.min(1, progress + 0.05));
          } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            void seekToRatio(Math.max(0, progress - 0.05));
          }
        }}
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          gap: "3px",
          height: 40,
          cursor: "pointer",
          touchAction: "none",
        }}
      >
        {bars.map((height, index) => {
          const played = index / bars.length <= progress;
          return (
            <Box
              key={`wave-${index}`}
              aria-hidden
              sx={{
                flex: 1,
                maxWidth: 5,
                minWidth: 2.5,
                height: `${Math.round(height * 100)}%`,
                borderRadius: 999,
                bgcolor: playing || played ? C.accent : C.textMuted,
                opacity: playing ? 0.5 + height * 0.5 : played ? 1 : 0.4,
                transition: playing
                  ? "height 50ms linear, opacity 50ms linear"
                  : "height 180ms ease, background-color 120ms ease, opacity 120ms ease",
              }}
            />
          );
        })}
      </Box>

      <Typography
        sx={{
          flexShrink: 0,
          minWidth: 36,
          textAlign: "right",
          fontSize: "0.72rem",
          fontWeight: 600,
          color: C.textMuted,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {formatAudioClock(playing || current > 0 ? current : duration)}
      </Typography>
    </Box>
  );
}

function CommunityPdfBlobFrame({
  url,
  title,
  height,
}: {
  url: string;
  title: string;
  height: string | number;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    setBlobUrl(null);
    setFailed(false);
    void (async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Could not load PDF");
        const bytes = await response.blob();
        const pdfBlob =
          bytes.type === "application/pdf" || bytes.type === "application/octet-stream"
            ? new Blob([bytes], { type: "application/pdf" })
            : bytes.type
              ? bytes
              : new Blob([bytes], { type: "application/pdf" });
        objectUrl = URL.createObjectURL(pdfBlob);
        if (!cancelled) setBlobUrl(objectUrl);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  if (failed) {
    return (
      <Stack spacing={2} alignItems="center" sx={{ px: 2, py: 4 }}>
        <PictureAsPdfOutlinedIcon sx={{ fontSize: 56, color: C.accentDark }} />
        <Typography sx={{ color: C.textMuted, textAlign: "center" }}>
          Preview unavailable. Open the file to view it.
        </Typography>
        <Button
          component="a"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          variant="contained"
          sx={{
            textTransform: "none",
            fontWeight: 700,
            bgcolor: C.accent,
            "&:hover": { bgcolor: C.accentDark },
          }}
        >
          Open file
        </Button>
      </Stack>
    );
  }

  if (!blobUrl) {
    return <CircularProgress size={28} sx={{ color: C.accent }} />;
  }

  return (
    <Box
      component="iframe"
      src={`${blobUrl}#toolbar=1&navpanes=0&scrollbar=0&view=FitH`}
      title={title}
      sx={{
        width: "100%",
        height,
        border: 0,
        borderRadius: 2,
        bgcolor: "#fff",
      }}
    />
  );
}

function CommunityFilePreviewCard({
  url,
  label,
  kind,
  onOpen,
}: {
  url: string;
  label: string;
  kind: "pdf" | "document";
  onOpen: () => void;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (kind !== "pdf") return;
    let objectUrl: string | null = null;
    let cancelled = false;
    setBlobUrl(null);
    setFailed(false);
    void (async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Could not load PDF");
        const bytes = await response.blob();
        objectUrl = URL.createObjectURL(
          new Blob([bytes], { type: "application/pdf" }),
        );
        if (!cancelled) setBlobUrl(objectUrl);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [kind, url]);

  return (
    <Box
      component="button"
      type="button"
      aria-label={`Open ${label}`}
      onClick={onOpen}
      sx={{
        display: "block",
        width: "100%",
        maxWidth: { xs: "100%", sm: 560 },
        mr: "auto",
        p: 0,
        border: `1px solid ${C.divider}`,
        borderRadius: 2.5,
        bgcolor: C.cardBg,
        mb: 2,
        overflow: "hidden",
        cursor: "zoom-in",
        textAlign: "left",
        boxShadow: "0 1px 2px rgba(17,17,17,0.04)",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: { xs: 220, sm: 300 },
          bgcolor: kind === "pdf" ? "#f3eee6" : C.surface,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {kind === "pdf" && blobUrl ? (
          <Box
            component="iframe"
            src={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
            title={label}
            sx={{
              width: "100%",
              height: "130%",
              border: 0,
              pointerEvents: "none",
              bgcolor: "#fff",
              transform: "scale(1)",
              transformOrigin: "top center",
            }}
          />
        ) : kind === "pdf" && !failed ? (
          <CircularProgress size={28} sx={{ color: C.accent }} />
        ) : (
          <Stack alignItems="center" spacing={1} sx={{ px: 2 }}>
            {kind === "pdf" ? (
              <PictureAsPdfOutlinedIcon sx={{ fontSize: 64, color: "#b42318" }} />
            ) : (
              <InsertDriveFileOutlinedIcon
                sx={{ fontSize: 64, color: C.accentDark }}
              />
            )}
            <Typography
              sx={{
                fontSize: { xs: "0.92rem", sm: "1rem" },
                fontWeight: 800,
                color: C.textPrimary,
                textAlign: "center",
                wordBreak: "break-word",
                maxWidth: "100%",
              }}
            >
              {label}
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: C.textMuted }}>
              Tap to open
            </Typography>
          </Stack>
        )}
        <Box
          sx={{
            position: "absolute",
            left: 10,
            bottom: 10,
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            px: 1,
            py: 0.35,
            borderRadius: 999,
            bgcolor: "rgba(0,0,0,0.55)",
            color: "#fff",
          }}
        >
          {kind === "pdf" ? (
            <PictureAsPdfOutlinedIcon sx={{ fontSize: 16 }} />
          ) : (
            <InsertDriveFileOutlinedIcon sx={{ fontSize: 16 }} />
          )}
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 700 }}>
            {kind === "pdf" ? "PDF" : "FILE"}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          px: 1.35,
          py: 1.05,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          borderTop: `1px solid ${C.divider}`,
          bgcolor: C.cardBg,
        }}
      >
        <Typography
          sx={{
            fontSize: "0.86rem",
            fontWeight: 700,
            color: C.textPrimary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </Typography>
        <DownloadRoundedIcon sx={{ color: C.textMuted, fontSize: 20 }} />
      </Box>
    </Box>
  );
}

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

const countUnreadCommunityMessages = (
  posts: CommunityPostRecord[],
  communityId: string,
): number => {
  const scope = `community:${communityId}`;
  const sorted = [...posts]
    .filter((post) => post.status === "published")
    .sort(
      (left, right) =>
        new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
    );
  if (sorted.length === 0) return 0;
  const latestId = sorted.at(-1)?.id;
  let lastReadId: string | null = null;
  try {
    lastReadId = window.localStorage.getItem(
      `${COMMUNITY_READ_POSITION_PREFIX}.${scope}`,
    );
  } catch {
    lastReadId = null;
  }
  if (!lastReadId) {
    if (latestId) seedReadPosition(scope, latestId);
    return 0;
  }
  const index = sorted.findIndex((post) => post.id === lastReadId);
  if (index === -1) {
    if (latestId) seedReadPosition(scope, latestId);
    return 0;
  }
  return sorted.length - index - 1;
};

const sortJoinedCommunities = (
  communities: Community[],
  recentlyActiveOrder: string[],
  unreadCounts: Record<string, number>,
): Community[] => {
  const orderIndex = new Map(
    recentlyActiveOrder.map((id, index) => [id, index]),
  );
  return [...communities].sort((left, right) => {
    const unreadLeft = unreadCounts[left.id] ?? 0;
    const unreadRight = unreadCounts[right.id] ?? 0;
    const leftHasUnread = unreadLeft > 0;
    const rightHasUnread = unreadRight > 0;
    if (leftHasUnread !== rightHasUnread) {
      return leftHasUnread ? -1 : 1;
    }
    if (leftHasUnread && rightHasUnread && unreadLeft !== unreadRight) {
      return unreadRight - unreadLeft;
    }
    const leftOrder = orderIndex.get(left.id);
    const rightOrder = orderIndex.get(right.id);
    if (leftOrder == null && rightOrder == null) return 0;
    if (leftOrder == null) return 1;
    if (rightOrder == null) return -1;
    return leftOrder - rightOrder;
  });
};
const COMM360_URL =
  process.env.NEXT_PUBLIC_COMM360_URL || "https://comm360.feeltiptop.com/";
const MESSAGE_URL_PATTERN = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;

const getComm360Host = () => {
  try {
    return new URL(COMM360_URL).hostname.replace(/^www\./i, "");
  } catch {
    return "comm360.feeltiptop.com";
  }
};

const extractComm360RoomIds = (message: string): string[] => {
  const host = getComm360Host().replace(/\./g, "\\.");
  const pattern = new RegExp(
    `(?:https?:\\/\\/)?(?:www\\.)?${host}\\/meetings?\\/([A-Za-z0-9_-]+)`,
    "gi",
  );
  const roomIds: string[] = [];
  for (const match of message.matchAll(pattern)) {
    const roomId = match[1];
    if (roomId && !roomIds.includes(roomId)) roomIds.push(roomId);
  }
  return roomIds;
};

const meetingFromRoomId = (roomId: string): Comm360Meeting => {
  const base = COMM360_URL.replace(/\/$/, "");
  return {
    id: roomId,
    roomId,
    title: "Community discussion",
    description: "",
    startTime: "",
    organizerName: "Comm360",
    joinUrl: `${base}/meeting/${encodeURIComponent(roomId)}?type=direct`,
  };
};

const loadComm360Meeting = async (roomId: string): Promise<Comm360Meeting> => {
  try {
    return await getComm360Meeting(roomId);
  } catch {
    return meetingFromRoomId(roomId);
  }
};

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

const COMPOSER_EMOJI_GROUPS = [
  {
    label: "Smileys",
    icon: "😀",
    emojis:
      "😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😝 😜 🤪 🤨 🧐 🤓 😎 🤩 🥳 😏 😒 😞 😔 😟 😕 🙁 ☹️ 😣 😖 😫 😩 🥺 😢 😭 😤 😠 😡 🤬 🤯 😳 🥵 🥶 😱 😨 😰 😥 😓 🤗 🤔 🫣 🤭 🫢 🫡 🤫 🫠 🤥 😶 🫥 😐 🫤 😑 😬 🙄 😯 😦 😧 😮 😲 🥱 😴 🤤 😪 😵 🤐 🥴 🤢 🤮 🤧 😷 🤒 🤕".split(
        " ",
      ),
  },
  {
    label: "People",
    icon: "👋",
    emojis:
      "👋 🤚 🖐️ ✋ 🖖 🫱 🫲 🫳 🫴 👌 🤌 🤏 ✌️ 🤞 🫰 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ 🫵 👍 👎 ✊ 👊 🤛 🤜 👏 🙌 🫶 👐 🤲 🤝 🙏 ✍️ 💅 🤳 💪 🦾 🦿 🦵 🦶 👂 👃 🧠 🫀 🫁 🦷 🦴 👀 👁️ 👅 👄 🫦 👶 🧒 👦 👧 🧑 👱 👨 🧔 👩 🧓 👴 👵 🙍 🙎 🙅 🙆 💁 🙋 🧏 🙇 🤦 🤷 👮 👷 💂 🕵️ 👩‍⚕️ 👩‍🎓 👩‍🏫 👩‍💻 👩‍🔧 👩‍🔬 👩‍🎨 👩‍🚒 👩‍✈️ 👩‍🚀 👩‍⚖️".split(
        " ",
      ),
  },
  {
    label: "Nature",
    icon: "🐶",
    emojis:
      "🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐻‍❄️ 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🙈 🙉 🙊 🐒 🐔 🐧 🐦 🐤 🦆 🦅 🦉 🦇 🐺 🐗 🐴 🦄 🐝 🪱 🐛 🦋 🐌 🐞 🐜 🪰 🪲 🪳 🦟 🦗 🕷️ 🦂 🐢 🐍 🦎 🐙 🦑 🦐 🦞 🦀 🐠 🐟 🐡 🐬 🐳 🐋 🦈 🐊 🐅 🐆 🦓 🦍 🦧 🐘 🦛 🦏 🐪 🐫 🦒 🦘 🦬 🐃 🐂 🐄 🐎 🐖 🐏 🐑 🦙 🐐 🦌 🐕 🐩 🦮 🐈 🐓 🦃 🦚 🦜 🦢 🦩 🕊️ 🐇 🦝 🦨 🦡 🦫 🦦 🦥 🌵 🎄 🌲 🌳 🌴 🪴 🌱 🌿 ☘️ 🍀 🎍 🪷 🌺 🌸 🌼 🌻 🌞 🌝 🌛 ⭐ 🌟 ✨ ⚡ 🔥 🌈".split(
        " ",
      ),
  },
  {
    label: "Food",
    icon: "🍕",
    emojis:
      "🍏 🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🫐 🍈 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🍆 🥑 🥦 🥬 🥒 🌶️ 🫑 🌽 🥕 🫒 🧄 🧅 🥔 🍠 🥐 🥯 🍞 🥖 🥨 🧀 🥚 🍳 🧈 🥞 🧇 🥓 🥩 🍗 🍖 🌭 🍔 🍟 🍕 🫓 🥪 🥙 🧆 🌮 🌯 🫔 🥗 🥘 🫕 🥫 🍝 🍜 🍲 🍛 🍣 🍱 🥟 🦪 🍤 🍙 🍚 🍘 🍥 🥠 🥮 🍢 🍡 🍧 🍨 🍦 🥧 🧁 🍰 🎂 🍮 🍭 🍬 🍫 🍿 🍩 🍪 🌰 🥜 🍯 🥛 ☕ 🫖 🍵 🧃 🥤 🧋 🍺 🍻 🥂 🍷 🍸 🍹".split(
        " ",
      ),
  },
  {
    label: "Activities",
    icon: "⚽",
    emojis:
      "⚽ 🏀 🏈 ⚾ 🥎 🎾 🏐 🏉 🥏 🎱 🪀 🏓 🏸 🏒 🏑 🥍 🏏 🪃 🥅 ⛳ 🪁 🏹 🎣 🤿 🥊 🥋 🎽 🛹 🛼 🛷 ⛸️ 🥌 🎿 ⛷️ 🏂 🪂 🏋️ 🤼 🤸 ⛹️ 🤺 🤾 🏌️ 🏇 🧘 🏄 🏊 🤽 🚣 🧗 🚵 🚴 🏆 🥇 🥈 🥉 🏅 🎖️ 🏵️ 🎗️ 🎫 🎟️ 🎪 🤹 🎭 🩰 🎨 🎬 🎤 🎧 🎼 🎹 🥁 🪘 🎷 🎺 🪗 🎸 🪕 🎻 🎲 ♟️ 🎯 🎳 🎮 🎰 🧩".split(
        " ",
      ),
  },
  {
    label: "Travel",
    icon: "🚀",
    emojis:
      "🚗 🚕 🚙 🚌 🚎 🏎️ 🚓 🚑 🚒 🚐 🛻 🚚 🚛 🚜 🦯 🦽 🦼 🛴 🚲 🛵 🏍️ 🛺 🚨 🚔 🚍 🚘 🚖 🚡 🚠 🚟 🚃 🚋 🚞 🚝 🚄 🚅 🚈 🚂 🚆 🚇 🚊 🚉 ✈️ 🛫 🛬 🛩️ 💺 🛰️ 🚀 🛸 🚁 🛶 ⛵ 🚤 🛥️ 🛳️ ⛴️ 🚢 ⚓ 🛟 ⛽ 🚧 🚦 🗺️ 🗿 🗽 🗼 🏰 🏯 🏟️ 🎡 🎢 🎠 ⛲ ⛱️ 🏖️ 🏝️ 🏜️ 🌋 ⛰️ 🏕️ ⛺ 🛖 🏠 🏡 🏢 🏥 🏦 🏨 🏪 🏫 🏛️ ⛪ 🕌 🛕 🕍 ⛩️ 🕋 🌅 🌄 🌠 🎇 🎆 🌇 🌆 🏙️ 🌃 🌉".split(
        " ",
      ),
  },
  {
    label: "Objects",
    icon: "💡",
    emojis:
      "⌚ 📱 💻 ⌨️ 🖥️ 🖨️ 🖱️ 🖲️ 🕹️ 🗜️ 💽 💾 💿 📀 📼 📷 📸 📹 🎥 📽️ 🎞️ 📞 ☎️ 📟 📠 📺 📻 🎙️ 🎚️ 🎛️ 🧭 ⏱️ ⏲️ ⏰ 🕰️ ⌛ ⏳ 📡 🔋 🪫 🔌 💡 🔦 🕯️ 🪔 🧯 🛢️ 💸 💵 💴 💶 💷 🪙 💰 💳 💎 ⚖️ 🪜 🧰 🪛 🔧 🔨 ⚒️ 🛠️ ⛏️ 🪚 🔩 ⚙️ 🪤 🧱 ⛓️ 🧲 🔫 💣 🧨 🪓 🔪 🗡️ ⚔️ 🛡️ 🚬 ⚰️ 🪦 ⚱️ 🏺 🔮 📿 🧿 🪬 💈 ⚗️ 🔭 🔬 🩹 🩺 💊 💉 🩸 🧬 🦠 🧹 🪠 🧺 🧻 🚽 🚿 🛁 🧼 🪥 🪒 🧽 🪣 🧴 🔑 🗝️ 🚪 🪑 🛋️ 🛏️ 🧸 🪆 🖼️ 🪞 🪟 🛍️ 🎁 🎈 🎏 🎀 🪄 🪅 🎊 🎉 ✉️ 📩 📨 📧 💌 📥 📤 📦 🏷️ 📪 📫 📬 📭 📮 📯 📜 📃 📄 📑 🧾 📊 📈 📉 🗒️ 🗓️ 📆 📅 🗑️ 📇 🗃️ 🗳️ 🗄️ 📋 📁 📂 🗂️ 🗞️ 📰 📓 📔 📒 📕 📗 📘 📙 📚 📖 🔖 🧷 🔗 📎 🖇️ 📐 📏 🧮 📌 📍 ✂️ 🖊️ 🖋️ ✒️ 🖌️ 🖍️ 📝 ✏️ 🔍 🔎 🔏 🔐 🔒 🔓".split(
        " ",
      ),
  },
  {
    label: "Symbols",
    icon: "❤️",
    emojis:
      "❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❤️‍🔥 ❤️‍🩹 ❣️ 💕 💞 💓 💗 💖 💘 💝 💟 ☮️ ✝️ ☪️ 🕉️ ☸️ ✡️ 🔯 🕎 ☯️ ☦️ 🛐 ⛎ ♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓ 🆔 ⚛️ ☢️ ☣️ 📴 📳 🈶 🈚 🈸 🈺 🈷️ ✴️ 🆚 💮 🉐 ㊙️ ㊗️ 🈴 🈵 🈹 🈲 🅰️ 🅱️ 🆎 🆑 🅾️ 🆘 ❌ ⭕ 🛑 ⛔ 📛 🚫 💯 💢 ♨️ 🚷 🚯 🚳 🚱 🔞 📵 🚭 ❗ ❕ ❓ ❔ ‼️ ⁉️ 🔅 🔆 〽️ ⚠️ 🚸 🔱 ⚜️ 🔰 ♻️ ✅ 🈯 💹 ❇️ ✳️ ❎ 🌐 💠 Ⓜ️ 🌀 💤 🏧 🚾 ♿ 🅿️ 🛗 🛂 🛃 🛄 🛅 🚹 🚺 🚼 ⚧️ 🚻 🚮 🎦 📶 🈁 🔣 ℹ️ 🔤 🔡 🔠 🆖 🆗 🆙 🆒 🆕 🆓 0️⃣ 1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣ 🔟 🔢 ▶️ ⏸️ ⏯️ ⏹️ ⏺️ ⏭️ ⏮️ ⏩ ⏪ 🔀 🔁 🔂 ◀️ 🔼 🔽 ⏫ ⏬ ➡️ ⬅️ ⬆️ ⬇️ ↗️ ↘️ ↙️ ↖️ ↕️ ↔️ 🔄 ↪️ ↩️ 🔃 🔚 🔙 🔛 🔝 🔜 ☑️ 🔘 ⚪ ⚫ 🔴 🔵 🟤 🟣 🟢 🟡 🟠 🔺 🔻 🔸 🔹 🔶 🔷 🔳 🔲".split(
        " ",
      ),
  },
  {
    label: "Flags",
    icon: "🏳️",
    emojis:
      "🏁 🚩 🎌 🏴 🏳️ 🏳️‍🌈 🏳️‍⚧️ 🏴‍☠️ 🇺🇳 🇺🇸 🇨🇦 🇲🇽 🇧🇷 🇦🇷 🇬🇧 🇮🇪 🇫🇷 🇩🇪 🇪🇸 🇮🇹 🇵🇹 🇳🇱 🇧🇪 🇨🇭 🇦🇹 🇸🇪 🇳🇴 🇩🇰 🇫🇮 🇵🇱 🇺🇦 🇬🇷 🇹🇷 🇮🇳 🇵🇰 🇧🇩 🇱🇰 🇳🇵 🇨🇳 🇯🇵 🇰🇷 🇸🇬 🇲🇾 🇮🇩 🇵🇭 🇹🇭 🇻🇳 🇦🇺 🇳🇿 🇿🇦 🇳🇬 🇰🇪 🇪🇬 🇸🇦 🇦🇪 🇮🇱".split(
        " ",
      ),
  },
] as const;

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
          (post.replyTo.kind === "poll" ? "Shared a poll" : ""),
        kind: post.replyTo.kind,
        media: (post.replyTo.media ?? [])
          .filter((item): item is typeof item & { url: string } =>
            Boolean(item.url),
          )
          .map((item) => ({
            id: item.id,
            type: item.resourceType,
            url: item.url,
            posterUrl: item.posterUrl ?? null,
            originalFilename: item.originalFilename ?? null,
          })),
      }
    : null,
  media: (post.media ?? [])
    .filter((item): item is typeof item & { url: string } => Boolean(item.url))
    .map((item) => ({
      id: item.id,
      type: item.resourceType,
      url: item.url,
      posterUrl: item.posterUrl ?? null,
      originalFilename: item.originalFilename ?? null,
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

const sameFeedPosts = (current: ForumPost[], next: ForumPost[]) =>
  current.length === next.length &&
  current.every((post, index) => {
    const candidate = next[index];
    return (
      post.id === candidate?.id &&
      post.body === candidate.body &&
      post.status === candidate.status &&
      post.replyCount === candidate.replyCount &&
      post.upvotes === candidate.upvotes &&
      post.viewerVote === candidate.viewerVote &&
      post.poll?.status === candidate.poll?.status
    );
  });
// T: O(p) and S: O(1), where p is the number of posts

/** Keep freshly created local posts when a stale list response omits them. */
const LOCAL_FEED_GRACE_MS = 60_000;

const mergeFeedPosts = (
  current: ForumPost[],
  incoming: ForumPost[],
  localSeenAt: Map<string, number>,
  options?: { replaceScope?: boolean },
): ForumPost[] => {
  const now = Date.now();
  const incomingById = new Map(incoming.map((post) => [post.id, post]));

  for (const post of incoming) {
    localSeenAt.delete(post.id);
  }

  const mergedById = new Map<string, ForumPost>();
  if (!options?.replaceScope) {
    for (const post of current) {
      if (incomingById.has(post.id)) continue;
      if (post.status === "deleted" || post.status === "removed") continue;
      const seenAt = localSeenAt.get(post.id);
      const isFreshLocal =
        post.status === "processing" ||
        (typeof seenAt === "number" && now - seenAt < LOCAL_FEED_GRACE_MS);
      if (isFreshLocal) {
        mergedById.set(post.id, post);
      }
    }
  }
  for (const post of incoming) {
    mergedById.set(post.id, post);
  }

  return [...mergedById.values()].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
};
// T: O((c + i) log (c + i)) and S: O(c + i), where c is current posts and i is incoming

const rememberLocalFeedPosts = (
  localSeenAt: Map<string, number>,
  posts: ForumPost[],
) => {
  const now = Date.now();
  for (const post of posts) {
    if (!localSeenAt.has(post.id)) localSeenAt.set(post.id, now);
  }
  if (localSeenAt.size > 200) {
    const cutoff = now - LOCAL_FEED_GRACE_MS;
    for (const [id, seenAt] of localSeenAt) {
      if (seenAt < cutoff) localSeenAt.delete(id);
    }
  }
};
// T: O(p) and S: O(1), where p is remembered posts

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
  communityName,
  onCreated,
  replyTo,
  onCancelReply,
}: {
  scope: "global" | "community";
  communityId?: string;
  communityName?: string;
  onCreated: (post: CommunityPostRecord) => Promise<void>;
  replyTo?: ForumPost | null;
  onCancelReply?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ComposerMode>("text");
  const [emojiCategory, setEmojiCategory] = useState(0);
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
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(
    null,
  );
  const [isDictating, setIsDictating] = useState(false);
  const [uploadStage, setUploadStage] = useState<
    "idle" | "uploading" | "uploaded" | "publishing"
  >("idle");
  const [error, setError] = useState("");
  const [attachmentMenuAnchor, setAttachmentMenuAnchor] =
    useState<HTMLElement | null>(null);
  const [deviceRecentMedia, setDeviceRecentMedia] = useState<
    DeviceRecentEntry[]
  >([]);
  const [deviceMediaLoading, setDeviceMediaLoading] = useState(false);
  const [formattingOpen, setFormattingOpen] = useState(false);
  const [composerFont, setComposerFont] = useState<
    "standard" | "emphasis" | "monospace"
  >("standard");
  const [composerItalic, setComposerItalic] = useState(false);
  const [composerUnderline, setComposerUnderline] = useState(false);
  const [composerStrike, setComposerStrike] = useState(false);
  const [mentionMembers, setMentionMembers] = useState<CommunityMemberRecord[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoCaptureInputRef = useRef<HTMLInputElement>(null);
  const composerInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const composerOpenedAtRef = useRef(0);
  const suppressComposerCollapseRef = useRef(0);
  const pendingCaretRef = useRef<number | null>(null);
  const mediaUploadAbortRef = useRef<AbortController | null>(null);
  const mediaUploadPromiseRef = useRef<Promise<string> | null>(null);
  const mediaUploadRequestRef = useRef(0);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const pendingAudioSendRef = useRef(false);
  const speechRecognitionRef = useRef<SpeechRecognitionController | null>(null);
  const dictationBaseRef = useRef("");
  const dictationWantedRef = useRef(false);
  const typingActiveRef = useRef(false);
  const lastTypingPulseRef = useRef(0);
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
    (isRecordingAudio ||
      (mode === "image" ||
      mode === "video" ||
      mode === "audio" ||
      mode === "file"
        ? Boolean(file)
        : Boolean(content.trim()))) &&
    (mode !== "poll" || validPollOptions.length >= 2) &&
    (mode === "poll" ? Boolean(content.trim()) : true);
  const messagePlaceholder =
    scope === "community" && communityName
      ? `Message ${communityName}`
      : "Start a message or post";

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
    if (scope !== "community" || !communityId) return;
    const isTyping =
      Boolean(content.trim()) ||
      Boolean(file) ||
      isRecordingAudio ||
      isDictating;
    const clearTyping = () => {
      if (!typingActiveRef.current) return;
      typingActiveRef.current = false;
      void setCommunityTyping(communityId, false).catch(() => undefined);
    };
    if (!isTyping) {
      clearTyping();
      return;
    }
    typingActiveRef.current = true;
    const now = Date.now();
    if (now - lastTypingPulseRef.current > 1_800) {
      lastTypingPulseRef.current = now;
      void setCommunityTyping(communityId, true).catch(() => undefined);
    }
    const timer = window.setInterval(() => {
      lastTypingPulseRef.current = Date.now();
      void setCommunityTyping(communityId, true).catch(() => undefined);
    }, 2_000);
    return () => {
      window.clearInterval(timer);
    };
  }, [communityId, content, file, isDictating, isRecordingAudio, scope]);

  useEffect(
    () => () => {
      if (typingActiveRef.current && communityId) {
        typingActiveRef.current = false;
        void setCommunityTyping(communityId, false).catch(() => undefined);
      }
    },
    [communityId],
  );

  useEffect(() => {
    if (!replyTo) return;
    composerOpenedAtRef.current = Date.now();
    setOpen(true);
    window.requestAnimationFrame(() => composerInputRef.current?.focus());
  }, [replyTo]);

  useEffect(() => {
    if (!attachmentMenuAnchor) return;
    let cancelled = false;
    const load = async () => {
      if (!supportsDeviceMediaLibrary()) {
        setDeviceRecentMedia((current) => {
          revokeDeviceRecentPreviews(current);
          return [];
        });
        return;
      }
      setDeviceMediaLoading(true);
      try {
        // Only reuse a previously granted folder. Never prompt for directory
        // access just because "+" was opened — that should show options first.
        const directory = await loadDeviceDirectoryHandle();
        if (!directory) {
          if (!cancelled) {
            setDeviceRecentMedia((current) => {
              revokeDeviceRecentPreviews(current);
              return [];
            });
          }
          return;
        }
        const allowed = await ensureDirectoryPermission(directory);
        if (!allowed) {
          if (!cancelled) {
            setDeviceRecentMedia((current) => {
              revokeDeviceRecentPreviews(current);
              return [];
            });
          }
          return;
        }
        const entries = await listDeviceRecentMedia(directory);
        if (cancelled) {
          revokeDeviceRecentPreviews(entries);
          return;
        }
        setDeviceRecentMedia((current) => {
          revokeDeviceRecentPreviews(current);
          return entries;
        });
      } catch {
        if (!cancelled) {
          setDeviceRecentMedia((current) => {
            revokeDeviceRecentPreviews(current);
            return [];
          });
        }
      } finally {
        if (!cancelled) setDeviceMediaLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [attachmentMenuAnchor]);

  useEffect(
    () => () => {
      setDeviceRecentMedia((current) => {
        revokeDeviceRecentPreviews(current);
        return [];
      });
    },
    [],
  );

  const insertMention = (member: CommunityMemberRecord) => {
    const next = `${content.replace(/@[^\s@]*$/, "")}@${member.name} `;
    pendingCaretRef.current = next.length;
    setContent(next);
  };

  useEffect(() => {
    if (pendingCaretRef.current == null) return;
    const caret = pendingCaretRef.current;
    pendingCaretRef.current = null;
    const input = composerInputRef.current;
    if (!input) return;
    input.focus();
    input.setSelectionRange(caret, caret);
  }, [content]);

  const cancelMediaUpload = () => {
    mediaUploadRequestRef.current += 1;
    mediaUploadAbortRef.current?.abort();
    mediaUploadAbortRef.current = null;
    mediaUploadPromiseRef.current = null;
    setUploadedAssetId(null);
  };
  // T: O(1) and S: O(1)

  const discardAudioRecording = () => {
    const recorder = audioRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = null;
      recorder.stop();
    }
    audioStreamRef.current?.getTracks().forEach((track) => track.stop());
    audioRecorderRef.current = null;
    audioStreamRef.current = null;
    audioChunksRef.current = [];
    setRecordingStream(null);
    setIsRecordingAudio(false);
  };
  // T: O(t) and S: O(1), where t is the number of media tracks

  const discardDictationRecording = () => {
    dictationWantedRef.current = false;
    setIsDictating(false);
    const recognition = speechRecognitionRef.current;
    if (!recognition) return;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    try {
      recognition.stop();
    } catch {
      try {
        recognition.abort();
      } catch {
        // Recognition may already be stopped.
      }
    }
  };
  // T: O(1) and S: O(1)

  useEffect(
    () => () => {
      discardDictationRecording();
    },
    [],
  );

  const handleModeChange = (nextMode: ComposerMode) => {
    if (nextMode !== mode) {
      if (mode === "audio") discardAudioRecording();
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

  const handleAnyMediaSelected = (selectedFile: File | null) => {
    if (!selectedFile) return;
    handleMediaSelected(
      selectedFile.type.startsWith("video/") ? "video" : "image",
      selectedFile,
    );
  };
  // T: O(1) and S: O(1)

  const openPhotosAndVideosPicker = () => {
    setAttachmentMenuAnchor(null);
    window.requestAnimationFrame(() => {
      if (mediaInputRef.current) {
        mediaInputRef.current.value = "";
        mediaInputRef.current.click();
      }
    });
  };
  // T: O(1) and S: O(1)

  const handleRecentMediaSelect = async (entry: DeviceRecentEntry) => {
    setError("");
    try {
      const file = await entry.handle.getFile();
      setAttachmentMenuAnchor(null);
      handleMediaSelected(entry.kind, file);
    } catch {
      setAttachmentMenuAnchor(null);
      setOpen(true);
      setError(
        "Could not open that photo or video. Choose it again from Photos & Videos.",
      );
    }
  };
  // T: O(1) and S: O(1)

  const requestRecordingPermission = async (
    kind: "camera" | "microphone",
  ): Promise<boolean> => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setOpen(true);
      setError(
        `${kind === "camera" ? "Camera" : "Microphone"} access is not supported by this browser.`,
      );
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: kind === "camera",
        audio: kind === "microphone" || kind === "camera",
      });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (caught) {
      setOpen(true);
      setError(
        caught instanceof DOMException && caught.name === "NotAllowedError"
          ? `${kind === "camera" ? "Camera" : "Microphone"} permission was denied. Enable it in your browser or device settings to continue.`
          : `Could not access the ${kind}. Please check your device settings.`,
      );
      return false;
    }
  };
  // T: O(1) and S: O(1)

  const handleStartAudioRecording = async () => {
    setAttachmentMenuAnchor(null);
    setOpen(true);
    setError("");
    if (isDictating || dictationWantedRef.current) {
      discardDictationRecording();
    }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError("Audio recording is not supported by this browser.");
      return;
    }
    if (isRecordingAudio) return;
    pendingAudioSendRef.current = false;
    cancelMediaUpload();
    setMode("audio");
    setFile(null);
    setUploadStage("idle");
    setUploadProgress(0);
    setUploadedBytes(0);
    setTotalUploadBytes(0);
    setUploadedAssetId(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Prefer MP4/AAC first — iOS Safari cannot play WebM voice notes.
      const preferredMimeType = [
        "audio/mp4",
        "audio/mp4;codecs=mp4a.40.2",
        "audio/aac",
        "audio/mpeg",
        "audio/webm;codecs=opus",
        "audio/webm",
      ].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(
        stream,
        preferredMimeType ? { mimeType: preferredMimeType } : undefined,
      );
      audioStreamRef.current = stream;
      audioRecorderRef.current = recorder;
      audioChunksRef.current = [];
      setRecordingStream(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const mimeType = recorder.mimeType || preferredMimeType || "audio/mp4";
        const extension = /mp4|mpeg|aac|m4a/i.test(mimeType)
          ? "m4a"
          : /ogg/i.test(mimeType)
            ? "ogg"
            : "webm";
        const recording = new File(
          audioChunksRef.current,
          `voice-message-${Date.now()}.${extension}`,
          { type: mimeType.split(";")[0] || mimeType },
        );
        stream.getTracks().forEach((track) => track.stop());
        audioRecorderRef.current = null;
        audioStreamRef.current = null;
        audioChunksRef.current = [];
        setRecordingStream(null);
        setIsRecordingAudio(false);
        const shouldSend = pendingAudioSendRef.current;
        pendingAudioSendRef.current = false;
        if (recording.size <= 0) {
          if (shouldSend) {
            setSubmitting(false);
            setError("No audio captured. Hold a moment longer, then tap send.");
          }
          return;
        }
        if (shouldSend) {
          void shareRecordedAudio(recording);
          return;
        }
        handleMediaSelected("audio", recording);
      };
      setIsRecordingAudio(true);
      recorder.start(250);
    } catch (caught) {
      setIsRecordingAudio(false);
      setRecordingStream(null);
      pendingAudioSendRef.current = false;
      setError(
        caught instanceof DOMException && caught.name === "NotAllowedError"
          ? "Microphone permission was denied. Enable it in your browser or device settings to continue."
          : "Could not start audio recording. Please check your microphone.",
      );
    }
  };
  // T: O(1) setup and S: O(a), where a is the recorded audio size

  const handleStopAudioRecording = () => {
    const recorder = audioRecorderRef.current;
    if (recorder?.state === "recording") recorder.stop();
  };
  // T: O(1) and S: O(1)

  const shareRecordedAudio = async (recording: File) => {
    setSubmitting(true);
    setMode("audio");
    setFile(recording);
    setUploadProgress(0);
    setUploadedBytes(0);
    setTotalUploadBytes(recording.size);
    setError("");
    if (typingActiveRef.current && communityId) {
      typingActiveRef.current = false;
      void setCommunityTyping(communityId, false).catch(() => undefined);
    }
    try {
      setUploadStage("uploading");
      const providerAssetId = await uploadCommunityMedia(
        recording,
        "audio",
        (percentage, loadedBytes, totalBytes) => {
          setUploadProgress(percentage);
          setUploadedBytes(loadedBytes);
          setTotalUploadBytes(totalBytes);
        },
      );
      setUploadedAssetId(providerAssetId);
      setUploadProgress(100);
      setUploadStage("publishing");
      const post = await createPost({
        communityId: scope === "community" ? communityId : null,
        replyToPostId: replyTo?.id,
        body: content,
        mode: "audio",
        file: recording,
        providerAssetId,
      });
      resetComposer();
      setOpen(false);
      onCancelReply?.();
      void onCreated(post);
    } catch (caught) {
      setUploadStage("idle");
      setError(
        caught instanceof Error ? caught.message : "Could not create post",
      );
    } finally {
      setSubmitting(false);
    }
  };
  // T: O(a) and S: O(a), where a is the audio payload size

  const startSpeechToText = async () => {
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) {
      setOpen(true);
      setError(
        "Live speech-to-text is not supported in this browser. Try Chrome or Safari.",
      );
      return;
    }
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setOpen(true);
      setError(
        "Speech-to-text needs HTTPS (or localhost). Open Anchor over a secure connection.",
      );
      return;
    }
    if (isRecordingAudio) discardAudioRecording();
    discardDictationRecording();

    setOpen(true);
    setMode("text");
    setError("");

    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (caught) {
        setError(
          caught instanceof DOMException && caught.name === "NotAllowedError"
            ? "Microphone permission was denied. Enable it in your browser or device settings, then try again."
            : "Could not access the microphone for speech-to-text.",
        );
        return;
      }
    }

    const isAppleMobile =
      typeof navigator !== "undefined" &&
      (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

    dictationWantedRef.current = true;
    dictationBaseRef.current = content;

    let recognition = speechRecognitionRef.current;
    if (!recognition) {
      recognition = new Recognition();
      speechRecognitionRef.current = recognition;
    }

    recognition.continuous = !isAppleMobile;
    recognition.interimResults = true;
    recognition.lang =
      typeof navigator !== "undefined" && navigator.language
        ? navigator.language
        : "en-US";

    recognition.onresult = (event) => {
      let finals = "";
      let interim = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (!result) continue;
        const transcript =
          (result[0] && result[0].transcript) ||
          (typeof result.item === "function"
            ? result.item(0)?.transcript
            : "") ||
          "";
        if (!transcript) continue;
        if (result.isFinal) finals += transcript;
        else interim += transcript;
      }
      if (finals) {
        dictationBaseRef.current = joinDictatedText(
          dictationBaseRef.current,
          finals,
        );
      }
      setContent(joinDictatedText(dictationBaseRef.current, interim));
    };

    recognition.onerror = (event) => {
      const code = event.error ?? "";
      if (code === "aborted" || code === "no-speech") return;
      if (code === "network") {
        setError(
          "Live speech-to-text needs an internet connection. Check your network and try again.",
        );
      } else if (code === "not-allowed" || code === "service-not-allowed") {
        setError(
          "Microphone permission was denied. Enable it to use speech-to-text.",
        );
      } else {
        setError("Could not continue speech-to-text. Please try again.");
      }
      dictationWantedRef.current = false;
      setIsDictating(false);
    };

    recognition.onend = () => {
      if (!dictationWantedRef.current) {
        setIsDictating(false);
        return;
      }
      window.setTimeout(() => {
        if (!dictationWantedRef.current || !speechRecognitionRef.current) {
          setIsDictating(false);
          return;
        }
        try {
          speechRecognitionRef.current.start();
          setIsDictating(true);
        } catch {
          setIsDictating(true);
        }
      }, isAppleMobile ? 280 : 120);
    };

    try {
      recognition.start();
      setIsDictating(true);
      window.requestAnimationFrame(() => composerInputRef.current?.focus());
    } catch {
      dictationWantedRef.current = false;
      setIsDictating(false);
      setError("Could not start speech-to-text. Please try again.");
    }
  };
  // T: O(1) and S: O(1)

  const handleToggleSpeechToText = () => {
    if (isDictating || dictationWantedRef.current) return;
    void startSpeechToText();
  };
  // T: O(1) and S: O(1)

  const insertComposerText = (value: string) => {
    const input = composerInputRef.current;
    const start = input?.selectionStart ?? content.length;
    const end = input?.selectionEnd ?? start;
    const next = `${content.slice(0, start)}${value}${content.slice(end)}`;
    pendingCaretRef.current = start + value.length;
    setContent(next);
  };
  // T: O(c) and S: O(c), where c is the current message length

  const handleMediaSelected = (
    resourceType: "image" | "video" | "audio" | "file",
    selectedFile: File | null,
  ) => {
    cancelMediaUpload();
    const maxBytes =
      resourceType === "video"
        ? 50_000_000
        : resourceType === "audio"
          ? 20_000_000
          : resourceType === "file"
            ? 25_000_000
            : 10_000_000;
    if (selectedFile && selectedFile.size > maxBytes) {
      setOpen(true);
      setError(
        `${resourceType === "video" ? "Video" : resourceType === "audio" ? "Audio" : resourceType === "file" ? "File" : "Image"} must be smaller than ${
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
    setOpen(true);

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
    insertComposerText(emoji);
  };
  // T: O(c) and S: O(c), where c is the current post length

  const handleEmojiPickerToggle = () => {
    handleModeChange(mode === "emoji" ? "text" : "emoji");
  };
  // T: O(1) and S: O(1)

  const handleOpen = () => {
    setError("");
    composerOpenedAtRef.current = Date.now();
    setOpen(true);
    window.requestAnimationFrame(() => composerInputRef.current?.focus());
  };

  const handleMentionClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setMode("text");
    const input = composerInputRef.current;
    const start = input?.selectionStart ?? content.length;
    const end = input?.selectionEnd ?? start;
    const prefix =
      start > 0 && content[start - 1] && !/\s/.test(content[start - 1]!)
        ? " @"
        : "@";
    const next = `${content.slice(0, start)}${prefix}${content.slice(end)}`;
    pendingCaretRef.current = start + prefix.length;
    setContent(next);
  };
  // T: O(1) and S: O(1)

  const resetComposer = () => {
    discardAudioRecording();
    discardDictationRecording();
    pendingAudioSendRef.current = false;
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
    setComposerFont("standard");
    setComposerItalic(false);
    setComposerUnderline(false);
    setComposerStrike(false);
    setFormattingOpen(false);
  };
  // T: O(1) and S: O(1)

  const handleCancelComposer = (event: React.MouseEvent) => {
    event.stopPropagation();
    resetComposer();
    setOpen(false);
    setAttachmentMenuAnchor(null);
    onCancelReply?.();
  };
  // T: O(1) and S: O(1)

  const hasPendingDraft =
    Boolean(file) ||
    isRecordingAudio ||
    isDictating ||
    uploadStage === "uploading" ||
    uploadStage === "uploaded" ||
    uploadStage === "publishing";
  const composerExpanded = open || hasPendingDraft;

  useEffect(() => {
    if (!hasPendingDraft) return;
    setOpen(true);
  }, [hasPendingDraft]);

  // After attaching media on mobile/tablet, lock the feed scroll and pin the
  // composer dock to the visual viewport so iOS cannot rubber-band into white space.
  useEffect(() => {
    if (!hasPendingDraft) return;
    const main = composerRef.current?.closest("main");
    if (!(main instanceof HTMLElement)) return;

    const lockedScrollTop = main.scrollTop;
    const previousOverflowY = main.style.overflowY;
    const previousOverscroll = main.style.overscrollBehavior;
    const previousTouchAction = main.style.touchAction;
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverscroll = html.style.overscrollBehavior;
    const previousBodyOverscroll = body.style.overscrollBehavior;

    main.style.overflowY = "hidden";
    main.style.overscrollBehavior = "none";
    main.style.touchAction = "none";
    main.scrollTop = lockedScrollTop;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";
    window.scrollTo(0, 0);

    const dock = composerRef.current?.closest(
      "[data-composer-dock]",
    ) as HTMLElement | null;
    const previousDockBottom = dock?.style.bottom ?? "";
    const visualViewport = window.visualViewport;

    const pinDock = () => {
      if (!dock) return;
      const vv = window.visualViewport;
      if (!vv) {
        dock.style.bottom = "";
        return;
      }
      // Stick the dock to the visible bottom (layout viewport can diverge on iOS).
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      dock.style.bottom = `calc(${inset}px + max(12px, env(safe-area-inset-bottom, 0px)))`;
    };

    const freezeScroll = () => {
      if (main.scrollTop !== lockedScrollTop) {
        main.scrollTop = lockedScrollTop;
      }
      if (window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    };

    const blockFeedTouchScroll = (event: TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        event.preventDefault();
        return;
      }
      if (target.closest("[data-composer-scroll]")) return;
      if (
        target.closest(".MuiPopover-root, .MuiMenu-root, .MuiDialog-root")
      ) {
        return;
      }
      event.preventDefault();
    };

    pinDock();
    const pinTimers = [50, 250, 600].map((ms) =>
      window.setTimeout(pinDock, ms),
    );
    visualViewport?.addEventListener("resize", pinDock);
    visualViewport?.addEventListener("scroll", pinDock);
    main.addEventListener("scroll", freezeScroll);
    window.addEventListener("scroll", freezeScroll, { passive: true });
    document.addEventListener("touchmove", blockFeedTouchScroll, {
      passive: false,
    });

    return () => {
      main.style.overflowY = previousOverflowY;
      main.style.overscrollBehavior = previousOverscroll;
      main.style.touchAction = previousTouchAction;
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      html.style.overscrollBehavior = previousHtmlOverscroll;
      body.style.overscrollBehavior = previousBodyOverscroll;
      pinTimers.forEach((timer) => window.clearTimeout(timer));
      visualViewport?.removeEventListener("resize", pinDock);
      visualViewport?.removeEventListener("scroll", pinDock);
      main.removeEventListener("scroll", freezeScroll);
      window.removeEventListener("scroll", freezeScroll);
      document.removeEventListener("touchmove", blockFeedTouchScroll);
      if (dock) {
        dock.style.bottom = previousDockBottom;
      }
    };
  }, [hasPendingDraft]);

  useEffect(() => {
    if (!composerExpanded) return;
    const handleDocumentPointerDown = (event: PointerEvent) => {
      if (submitting || hasPendingDraft) return;
      if (
        event.target instanceof Element &&
        event.target.closest(".MuiPopover-root, .MuiMenu-root, .MuiDialog-root")
      ) {
        return;
      }
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
  }, [composerExpanded, hasPendingDraft, submitting]);

  // Mobile/tablet: scrolling the feed collapses the expanded composer back to
  // the compact pill. Keep it expanded while a draft/upload is pending, or
  // while the attachment sheet is open / just opened (keyboard dismiss noise).
  useEffect(() => {
    if (!open || hasPendingDraft || submitting || attachmentMenuAnchor) return;

    const isInsideComposerOrOverlay = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false;
      if (composerRef.current?.contains(target)) return true;
      return Boolean(
        target.closest(".MuiPopover-root, .MuiMenu-root, .MuiDialog-root"),
      );
    };

    const collapseComposer = () => {
      if (Date.now() - composerOpenedAtRef.current < 450) return;
      if (Date.now() < suppressComposerCollapseRef.current) return;
      setOpen(false);
      setAttachmentMenuAnchor(null);
      composerInputRef.current?.blur();
    };

    const handleScroll = (event: Event) => {
      if (isInsideComposerOrOverlay(event.target)) return;
      const target = event.target;
      const main = composerRef.current?.closest("main");
      // Only collapse for real feed scrolling — ignore keyboard/viewport jitter.
      if (target !== main && target !== document.documentElement) return;
      collapseComposer();
    };

    let touchStartY: number | null = null;
    const handleTouchStart = (event: TouchEvent) => {
      if (isInsideComposerOrOverlay(event.target)) {
        touchStartY = null;
        return;
      }
      touchStartY = event.touches[0]?.clientY ?? null;
    };
    const handleTouchMove = (event: TouchEvent) => {
      if (touchStartY == null) return;
      if (Date.now() < suppressComposerCollapseRef.current) return;
      const currentY = event.touches[0]?.clientY;
      if (currentY == null) return;
      if (Math.abs(currentY - touchStartY) > 12) {
        collapseComposer();
      }
    };

    const main = composerRef.current?.closest("main");
    main?.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
      capture: true,
    });
    document.addEventListener("touchmove", handleTouchMove, {
      passive: true,
      capture: true,
    });

    return () => {
      main?.removeEventListener("scroll", handleScroll);
      document.removeEventListener("touchstart", handleTouchStart, true);
      document.removeEventListener("touchmove", handleTouchMove, true);
    };
  }, [open, hasPendingDraft, submitting, attachmentMenuAnchor]);

  useEffect(
    () => () => {
      const recorder = audioRecorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.onstop = null;
        recorder.stop();
      }
      audioStreamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

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
    if (isRecordingAudio) {
      pendingAudioSendRef.current = true;
      setSubmitting(true);
      setError("");
      handleStopAudioRecording();
      return;
    }
    if (!canSubmit) {
      setError(
        scope === "community" && !communityId
          ? "Choose a community before posting."
          : mode === "poll" && validPollOptions.length < 2
            ? "A poll needs at least two options."
          : (mode === "image" ||
                mode === "video" ||
                mode === "audio" ||
                mode === "file") &&
              !file
              ? `Choose a ${mode} to upload.`
              : "Write something before posting.",
      );
      return;
    }
    setSubmitting(true);
    setUploadProgress(0);
    discardDictationRecording();
    if (typingActiveRef.current && communityId) {
      typingActiveRef.current = false;
      void setCommunityTyping(communityId, false).catch(() => undefined);
    }
    setUploadedBytes(uploadedAssetId ? file?.size ?? 0 : 0);
    setTotalUploadBytes(file?.size ?? 0);
    setError("");
    try {
      let providerAssetId = uploadedAssetId;
      if (
        (mode === "image" ||
          mode === "video" ||
          mode === "audio" ||
          mode === "file") &&
        !providerAssetId
      ) {
        const pendingUpload = mediaUploadPromiseRef.current;
        if (!pendingUpload) {
          throw new Error(`Choose a ${mode} to upload.`);
        }
        setUploadStage("uploading");
        providerAssetId = await pendingUpload;
      }
      if (
        mode === "image" ||
        mode === "video" ||
        mode === "audio" ||
        mode === "file"
      ) {
        setUploadStage("publishing");
      }
      const post = await createPost({
        communityId: scope === "community" ? communityId : null,
        replyToPostId: replyTo?.id,
        body: content,
        mode: mode === "emoji" ? "text" : mode,
        file,
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

  return (
    <Card
      ref={composerRef}
      onClick={handleOpen}
      elevation={0}
      sx={{
        position: "relative",
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        maxHeight: composerExpanded
          ? { xs: "min(42dvh, 380px)", sm: "min(48dvh, 460px)" }
          : { xs: 58, sm: 60, md: 62 },
        minHeight: composerExpanded ? 0 : { xs: 58, sm: 60, md: 62 },
        p: composerExpanded ? { xs: 1, sm: 1.25 } : 0,
        borderRadius: composerExpanded ? { xs: 3, sm: 3.5 } : 999,
        bgcolor: C.cardBg,
        touchAction: "manipulation",
        border: `1px solid ${composerExpanded ? C.accentBorder : C.divider}`,
        boxShadow: composerExpanded
          ? "0 10px 30px rgba(44,26,10,0.12)"
          : "0 3px 14px rgba(44,26,10,0.06)",
        overflow: "hidden",
        overscrollBehavior: "none",
        transition:
          "max-height 320ms cubic-bezier(0.4, 0, 0.2, 1), border-color 200ms ease, box-shadow 200ms ease",
      }}
    >
      {composerExpanded && !replyTo && (
        <IconButton
          aria-label="Cancel message"
          size="small"
          onClick={handleCancelComposer}
          sx={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 28,
            height: 28,
            zIndex: 6,
            color: C.textMuted,
            bgcolor: C.surface,
            border: `1px solid ${C.divider}`,
            "&:hover": { color: C.textPrimary, bgcolor: C.accentFaint },
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: 17 }} />
        </IconButton>
      )}
      {composerExpanded && replyTo && (
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
            {replyTo.body && (
              <Typography
                noWrap
                sx={{ color: C.textMuted, fontSize: "0.72rem" }}
              >
                {replyTo.body}
              </Typography>
            )}
            {replyTo.media?.[0] && (
              replyTo.media[0].type === "file" ? (
                <Box
                  component="a"
                  href={replyTo.media[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    mt: 0.6,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    color: C.accentDark,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                  }}
                >
                  <DownloadRoundedIcon sx={{ fontSize: 16 }} />
                  Attached file
                </Box>
              ) : (
                <Box
                  component={
                    replyTo.media[0].type === "image"
                      ? "img"
                      : replyTo.media[0].type === "audio"
                        ? "audio"
                        : "video"
                  }
                  src={replyTo.media[0].url}
                  controls={replyTo.media[0].type === "audio"}
                  muted={replyTo.media[0].type === "video"}
                  playsInline={replyTo.media[0].type === "video"}
                  sx={{
                    display: "block",
                    width: replyTo.media[0].type === "audio" ? 220 : 52,
                    height: replyTo.media[0].type === "audio" ? 40 : 38,
                    mt: 0.6,
                    borderRadius: 1,
                    objectFit: "cover",
                    bgcolor: C.surface,
                  }}
                />
              )
            )}
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
          alignItems: composerExpanded ? "flex-start" : "center",
          gap: composerExpanded ? 0 : 0.5,
          minHeight: composerExpanded ? 0 : { xs: 56, sm: 58, md: 60 },
          pr: composerExpanded && !replyTo ? 3.5 : 0,
          flexShrink: 0,
        }}
      >
        {!composerExpanded && (
          <IconButton
            aria-label="Add an image, video, or file"
            onClick={(event) => {
              event.stopPropagation();
              suppressComposerCollapseRef.current = Date.now() + 1600;
              composerOpenedAtRef.current = Date.now();
              setOpen(true);
              setAttachmentMenuAnchor(event.currentTarget);
            }}
            sx={{
              width: { xs: 48, sm: 50 },
              height: { xs: 48, sm: 50 },
              ml: 0.55,
              flexShrink: 0,
              color: C.textSub,
              bgcolor: C.surface,
              "&:hover": { bgcolor: C.accentFaint },
            }}
          >
            <AddRoundedIcon sx={{ fontSize: { xs: 30, sm: 32 } }} />
          </IconButton>
        )}
        <Box sx={{ position: "relative", flex: 1, minWidth: 0 }}>
        <TextField
          inputRef={composerInputRef}
          fullWidth
          multiline
          minRows={composerExpanded ? 2 : 1}
          maxRows={composerExpanded ? 4 : 1}
          value={content}
          disabled={submitting}
          onFocus={handleOpen}
          onChange={(event) => {
            const next = event.target.value;
            setContent(next);
            if (isDictating) dictationBaseRef.current = next;
          }}
          inputProps={{ maxLength: mode === "poll" ? 150 : 10_000 }}
          helperText={
            composerExpanded && mode === "poll" ? `${content.length}/150` : ""
          }
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
            composerExpanded && mode === "poll"
              ? "What is the question?"
              : messagePlaceholder
          }
          variant="standard"
          InputProps={{ disableUnderline: true }}
          sx={{
            minWidth: 0,
            py: composerExpanded ? 0.3 : 0.25,
            "& .MuiInputBase-root": {
              alignItems: composerExpanded ? "flex-start" : "center",
              color: C.textPrimary,
              fontSize: { xs: "18px", sm: "17px" },
              lineHeight: 1.55,
              border: 0,
              borderRadius: 0,
              bgcolor: "transparent",
              px: composerExpanded
                ? { xs: 0.75, sm: 1 }
                : { xs: 1, sm: 1.25, md: 1.5 },
              py: composerExpanded ? 0.8 : 0,
            },
            "& .MuiInputBase-input": {
              fontSize: { xs: "18px", sm: "17px" },
              fontWeight: composerFont === "emphasis" ? 700 : 400,
              fontStyle: composerItalic ? "italic" : "normal",
              textDecoration: [
                composerUnderline ? "underline" : "",
                composerStrike ? "line-through" : "",
              ]
                .filter(Boolean)
                .join(" "),
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

        {composerExpanded && mentionSuggestions.length > 0 && (
          <Box
            role="listbox"
            aria-label="Mention a community member"
            sx={{
              position: "absolute",
              bottom: "calc(100% + 8px)",
              left: 0,
              width: { xs: "100%", sm: 320 },
              maxHeight: 220,
              zIndex: 8,
              bgcolor: C.cardBg,
              border: `1px solid ${C.divider}`,
              borderRadius: 2,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              overflowY: "auto",
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
        </Box>

        {(!composerExpanded || isDictating) && (
          <IconButton
            aria-label={isDictating ? "Listening" : "Dictate message"}
            aria-pressed={isDictating}
            aria-disabled={isDictating}
            onClick={(event) => {
              event.stopPropagation();
              handleToggleSpeechToText();
            }}
            sx={{
              width: { xs: 44, sm: 46 },
              height: { xs: 44, sm: 46 },
              mr: { xs: 0.55, sm: 0.75 },
              flexShrink: 0,
              color: isDictating ? C.red : C.textSub,
              bgcolor: isDictating
                ? "color-mix(in srgb, #d32f2f 12%, transparent)"
                : "transparent",
              "@keyframes anchorMicPulse": {
                "0%": { transform: "scale(1)", opacity: 1 },
                "100%": { transform: "scale(1.08)", opacity: 0.75 },
              },
              animation: isDictating
                ? "anchorMicPulse 0.9s ease-in-out infinite alternate"
                : "none",
            }}
          >
            <MicNoneRoundedIcon sx={{ fontSize: { xs: 27, sm: 29 } }} />
          </IconButton>
        )}
      </Box>

      {error && (
        <Alert
          severity="error"
          onClick={(event) => event.stopPropagation()}
          onClose={() => setError("")}
          sx={{ mx: 1, mb: 0.75, py: 0 }}
        >
          {error}
        </Alert>
      )}

      {isDictating && (
        <Typography
          onClick={(event) => event.stopPropagation()}
          sx={{
            px: 1.5,
            pb: composerExpanded ? 0 : 0.25,
            color: C.red,
            fontSize: "0.75rem",
            fontWeight: 600,
          }}
        >
          Listening… live text appears below. Tap send when you&apos;re done
        </Typography>
      )}

      <Box
        aria-hidden={!composerExpanded}
        data-composer-scroll={composerExpanded ? "true" : undefined}
        sx={{
          pl: 0,
          flex: composerExpanded ? 1 : "none",
          minHeight: 0,
          overflowY: composerExpanded ? "auto" : "visible",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
          opacity: composerExpanded ? 1 : 0,
          transform: composerExpanded ? "translateY(0)" : "translateY(10px)",
          pointerEvents: composerExpanded ? "auto" : "none",
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

        {(mode === "image" ||
          mode === "video" ||
          mode === "audio" ||
          mode === "file") && (
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
            {mode === "audio" && isRecordingAudio && (
              <Box
                sx={{
                  mb: 1,
                  px: 1.25,
                  py: 1.15,
                  minHeight: { xs: 68, sm: 72 },
                  borderRadius: 3,
                  border: `1px solid color-mix(in srgb, ${C.red} 35%, ${C.divider})`,
                  bgcolor: "color-mix(in srgb, #d32f2f 8%, transparent)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.15,
                  boxSizing: "border-box",
                }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: C.red,
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: "#fff",
                      "@keyframes anchorRecBlink": {
                        "0%": { opacity: 1 },
                        "100%": { opacity: 0.35 },
                      },
                      animation:
                        "anchorRecBlink 0.9s ease-in-out infinite alternate",
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <RecordingWaveform
                    accent={C.red}
                    stream={recordingStream}
                  />
                  <Typography
                    sx={{
                      mt: 0.35,
                      color: C.textMuted,
                      fontSize: "0.7rem",
                      fontWeight: 600,
                    }}
                  >
                    Recording… tap send to post
                  </Typography>
                </Box>
              </Box>
            )}
            {mediaPreviewUrl && mode !== "file" && mode !== "audio" && (
              <Box
                component={mode === "image" ? "img" : "video"}
                src={mediaPreviewUrl}
                controls={mode === "video"}
                muted={mode === "video"}
                playsInline={mode === "video"}
                sx={{
                  display: "block",
                  width: "100%",
                  maxHeight: { xs: 140, sm: 200, md: 280 },
                  objectFit: "contain",
                  borderRadius: 1.5,
                  bgcolor: mode === "video" ? "#111" : C.surface,
                  mb: 1,
                }}
              />
            )}
            {mediaPreviewUrl && mode === "audio" && file && (
              <Box sx={{ mb: 1 }}>
                {/webm/i.test(file.type || file.name) &&
                typeof navigator !== "undefined" &&
                /iPhone|iPad|iPod/i.test(navigator.userAgent) ? (
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                      px: 1.25,
                      py: 1.1,
                      borderRadius: 2,
                      bgcolor: C.cardBg,
                      border: `1px solid ${C.divider}`,
                    }}
                  >
                    <MicNoneRoundedIcon sx={{ color: C.accentDark }} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        sx={{
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: C.textPrimary,
                        }}
                      >
                        Voice note ready
                      </Typography>
                      <Typography
                        noWrap
                        sx={{ fontSize: "0.7rem", color: C.textMuted }}
                      >
                        {file.name} · tap send to post
                      </Typography>
                    </Box>
                  </Stack>
                ) : (
                  <Box
                    component="audio"
                    src={mediaPreviewUrl}
                    controls
                    preload="metadata"
                    sx={{
                      display: "block",
                      width: "100%",
                      height: 54,
                      borderRadius: 1.5,
                    }}
                  />
                )}
              </Box>
            )}
            {mediaPreviewUrl && mode === "file" && file && (
              <Box
                sx={{
                  mb: 1,
                  borderRadius: 1.5,
                  overflow: "hidden",
                  border: `1px solid ${C.divider}`,
                  bgcolor: C.cardBg,
                }}
              >
                {file.type === "application/pdf" ||
                /\.pdf$/i.test(file.name) ? (
                  <Stack
                    alignItems="center"
                    spacing={0.75}
                    sx={{ py: 3.5, px: 2, bgcolor: "#f3eee6" }}
                  >
                    <PictureAsPdfOutlinedIcon
                      sx={{ fontSize: 56, color: "#b42318" }}
                    />
                    <Typography
                      sx={{
                        fontSize: "0.9rem",
                        fontWeight: 800,
                        color: C.textPrimary,
                        textAlign: "center",
                        wordBreak: "break-word",
                      }}
                    >
                      {file.name}
                    </Typography>
                  </Stack>
                ) : file.type.startsWith("image/") ? (
                  <Box
                    component="img"
                    src={mediaPreviewUrl}
                    alt={file.name}
                    sx={{
                      display: "block",
                      width: "100%",
                      maxHeight: { xs: 140, sm: 200, md: 280 },
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <Stack
                    alignItems="center"
                    spacing={0.75}
                    sx={{ py: 3, px: 2 }}
                  >
                    <InsertDriveFileOutlinedIcon
                      sx={{ fontSize: 48, color: C.accentDark }}
                    />
                    <Typography
                      sx={{
                        fontSize: "0.86rem",
                        fontWeight: 700,
                        color: C.textPrimary,
                        textAlign: "center",
                        wordBreak: "break-word",
                      }}
                    >
                      {file.name}
                    </Typography>
                  </Stack>
                )}
              </Box>
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
                  : mode === "audio"
                    ? isRecordingAudio
                      ? "Recording… tap send to post"
                      : "Record a voice message · max 20 MB"
                    : mode === "file"
                      ? "Choose a document · max 25 MB"
                    : `Choose ${mode === "image" ? "an image" : "a video"} from your device${
                        mode === "video" ? " · max 50 MB" : ""
                      }`}
              </Typography>
              <Button
                size="small"
                variant="text"
                disabled={submitting || (mode === "audio" && isRecordingAudio)}
                onClick={() =>
                  file && uploadStage === "idle"
                    ? handleMediaSelected(mode, file)
                    : mode === "audio"
                      ? void handleStartAudioRecording()
                      : mode === "file"
                        ? fileInputRef.current?.click()
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
                    : mode === "audio"
                      ? "Record"
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
              width: "min(100%, 420px)",
              border: `1px solid ${C.divider}`,
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: C.cardBg,
            }}
          >
            <Stack
              direction="row"
              role="tablist"
              aria-label="Emoji categories"
              sx={{
                px: 0.5,
                py: 0.4,
                overflowX: "auto",
                borderBottom: `1px solid ${C.divider}`,
              }}
            >
              {COMPOSER_EMOJI_GROUPS.map((group, index) => (
                <IconButton
                  key={group.label}
                  role="tab"
                  aria-label={group.label}
                  aria-selected={emojiCategory === index}
                  title={group.label}
                  size="small"
                  onClick={() => setEmojiCategory(index)}
                  sx={{
                    flexShrink: 0,
                    fontSize: "1.25rem",
                    color: "inherit",
                    opacity: 1,
                    WebkitTextFillColor: "initial",
                    bgcolor:
                      emojiCategory === index ? C.accentFaint : "transparent",
                  }}
                >
                  {group.icon}
                </IconButton>
              ))}
            </Stack>
            <Box
              role="tabpanel"
              aria-label={`${COMPOSER_EMOJI_GROUPS[emojiCategory]?.label ?? "Smileys"} emojis`}
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(8, minmax(34px, 1fr))",
                gap: 0.2,
                p: 0.6,
                maxHeight: 250,
                overflowY: "auto",
              }}
            >
              {(COMPOSER_EMOJI_GROUPS[emojiCategory]?.emojis ??
                COMPOSER_EMOJI_GROUPS[0].emojis
              ).map((emoji, index) => (
                <Box
                  key={`${emoji}-${index}`}
                  component="button"
                  type="button"
                  aria-label={`Add ${emoji}`}
                  title={emoji}
                  onClick={() => handleEmojiSelect(emoji)}
                  sx={{
                    width: "100%",
                    minHeight: 40,
                    border: 0,
                    borderRadius: 1.5,
                    bgcolor: "transparent",
                    cursor: "pointer",
                    fontSize: "1.55rem",
                    lineHeight: 1.2,
                    color: "inherit",
                    opacity: 1,
                    WebkitTextFillColor: "initial",
                    filter: "none",
                    "&:hover": { bgcolor: C.accentFaint },
                  }}
                >
                  {emoji}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {formattingOpen && (
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.25}
            sx={{
              mt: 0.75,
              py: 0.55,
              overflowX: "auto",
              borderTop: `1px solid ${C.divider}`,
              borderBottom: `1px solid ${C.divider}`,
            }}
          >
            <IconButton
              aria-label="Close formatting options"
              size="small"
              onClick={() => setFormattingOpen(false)}
              sx={{ mr: 0.5, color: "#fff", bgcolor: C.accent, "&:hover": { bgcolor: C.accentDark } }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
            <IconButton
              aria-label="Bold"
              aria-pressed={composerFont === "emphasis"}
              size="small"
              onClick={() =>
                setComposerFont((current) =>
                  current === "emphasis" ? "standard" : "emphasis",
                )
              }
              sx={{
                color: composerFont === "emphasis" ? C.accentDark : C.textSub,
                bgcolor:
                  composerFont === "emphasis" ? C.accentFaint : "transparent",
              }}
            >
              <FormatBoldRoundedIcon fontSize="small" />
            </IconButton>
            <IconButton
              aria-label="Italic"
              aria-pressed={composerItalic}
              size="small"
              onClick={() => setComposerItalic((current) => !current)}
              sx={{ color: composerItalic ? C.accentDark : C.textSub }}
            >
              <FormatItalicRoundedIcon fontSize="small" />
            </IconButton>
            <IconButton
              aria-label="Underline"
              aria-pressed={composerUnderline}
              size="small"
              onClick={() => setComposerUnderline((current) => !current)}
              sx={{ color: composerUnderline ? C.accentDark : C.textSub }}
            >
              <FormatUnderlinedRoundedIcon fontSize="small" />
            </IconButton>
            <IconButton
              aria-label="Strikethrough"
              aria-pressed={composerStrike}
              size="small"
              onClick={() => setComposerStrike((current) => !current)}
              sx={{ color: composerStrike ? C.accentDark : C.textSub }}
            >
              <StrikethroughSRoundedIcon fontSize="small" />
            </IconButton>
            <IconButton
              aria-label="Insert link"
              size="small"
              onClick={() => insertComposerText("https://")}
              sx={{ color: C.textSub }}
            >
              <InsertLinkRoundedIcon fontSize="small" />
            </IconButton>
            <IconButton
              aria-label="Start numbered list"
              size="small"
              onClick={() => insertComposerText(content ? "\n1. " : "1. ")}
              sx={{ color: C.textSub }}
            >
              <FormatListNumberedRoundedIcon fontSize="small" />
            </IconButton>
            <IconButton
              aria-label="Start bulleted list"
              size="small"
              onClick={() => insertComposerText(content ? "\n• " : "• ")}
              sx={{ color: C.textSub }}
            >
              <FormatListBulletedRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mt: 0.75,
            pt: 0.35,
          }}
        >
          <Stack
            direction="row"
            spacing={{ xs: 0.05, sm: 0.3 }}
            alignItems="center"
          >
            <Tooltip title="Add an image, video, or file">
              <IconButton
                aria-label="Add an image, video, or file"
                onClick={(event) => {
                  event.stopPropagation();
                  suppressComposerCollapseRef.current = Date.now() + 1600;
                  composerOpenedAtRef.current = Date.now();
                  setOpen(true);
                  setAttachmentMenuAnchor(event.currentTarget);
                }}
                sx={{ color: C.textSub, bgcolor: C.surface }}
              >
                <AddRoundedIcon sx={{ fontSize: 28 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Text style">
              <IconButton
                aria-label="Show formatting options"
                aria-expanded={formattingOpen}
                onClick={(event) => {
                  event.stopPropagation();
                  setFormattingOpen((current) => !current);
                }}
                sx={{
                  color:
                    formattingOpen || composerFont !== "standard"
                      ? C.accentDark
                      : C.textSub,
                  bgcolor:
                    formattingOpen || composerFont !== "standard"
                      ? C.accentFaint
                      : "transparent",
                  fontSize: "1.1rem",
                  fontWeight: 500,
                }}
              >
                Aa
              </IconButton>
            </Tooltip>
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
            <Tooltip title="Mention someone">
              <IconButton
                aria-label="Mention someone"
                onClick={handleMentionClick}
                sx={{ color: C.textSub }}
              >
                <AlternateEmailRoundedIcon />
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
            variant="text"
            aria-label="Send message"
            onClick={handleShare}
            disabled={!canSubmit || submitting}
            sx={{
              minWidth: 44,
              width: 44,
              height: 44,
              p: 0,
              borderRadius: "50%",
              color: canSubmit ? C.accent : C.textMuted,
              "&:hover": { bgcolor: C.accentFaint },
            }}
          >
            {submitting ? (
              <CircularProgress size={20} sx={{ color: C.accent }} />
            ) : (
              <SendRoundedIcon sx={{ fontSize: 30 }} />
            )}
          </Button>
        </Box>
      </Box>
      <Dialog
        open={Boolean(attachmentMenuAnchor)}
        onClose={() => setAttachmentMenuAnchor(null)}
        fullWidth
        maxWidth="xs"
        aria-labelledby="attachment-panel-title"
        PaperProps={{
          sx: {
            position: { xs: "fixed", sm: "relative" },
            bottom: { xs: 0, sm: "auto" },
            left: { xs: 0, sm: "auto" },
            right: { xs: 0, sm: "auto" },
            width: { xs: "100%", sm: "100%" },
            m: { xs: 0, sm: 4 },
            borderRadius: { xs: "22px 22px 0 0", sm: 3 },
            overflow: "hidden",
          },
        }}
      >
        <Box
          sx={{
            display: { xs: "flex", sm: "none" },
            justifyContent: "center",
            pt: 1,
            pb: 0.25,
          }}
        >
          <Box
            sx={{
              width: 42,
              height: 4,
              borderRadius: 999,
              bgcolor: C.divider,
            }}
          />
        </Box>
        <DialogTitle
          id="attachment-panel-title"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            px: 2,
            pt: { xs: 0.5, sm: 2 },
            pb: 1,
            fontWeight: 800,
          }}
        >
          <Box component="span">Add</Box>
          <Button
            size="small"
            onClick={() => setAttachmentMenuAnchor(null)}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              color: C.textSub,
              minWidth: 0,
              px: 0.5,
            }}
          >
            Cancel
          </Button>
        </DialogTitle>
        <DialogContent sx={{ px: 0, pb: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              px: 2,
              pb: 1.5,
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <Box
              component="button"
              type="button"
              aria-label="Take a picture"
              onClick={() => {
                // Click the capture input first (same user gesture). Awaiting
                // getUserMedia first breaks camera on mobile/tablet browsers.
                const input = photoCaptureInputRef.current;
                if (input) {
                  input.value = "";
                  input.click();
                }
                setAttachmentMenuAnchor(null);
                setOpen(true);
                setError("");
              }}
              sx={{
                flex: "0 0 auto",
                width: 84,
                height: 84,
                borderRadius: 2.5,
                border: `1px solid ${C.divider}`,
                bgcolor: C.cardBg,
                color: C.textSub,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                p: 0,
              }}
            >
              <PhotoCameraOutlinedIcon sx={{ fontSize: 30 }} />
            </Box>
            {deviceMediaLoading && deviceRecentMedia.length === 0 && (
              <Box
                sx={{
                  flex: "0 0 auto",
                  width: 84,
                  height: 84,
                  borderRadius: 2.5,
                  border: `1px solid ${C.divider}`,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: C.cardBg,
                }}
              >
                <CircularProgress size={20} sx={{ color: C.accent }} />
              </Box>
            )}
            {deviceRecentMedia.map((entry) => (
              <Box
                key={entry.id}
                component="button"
                type="button"
                aria-label={`Use recent ${entry.kind}: ${entry.name}`}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  void handleRecentMediaSelect(entry);
                }}
                sx={{
                  position: "relative",
                  flex: "0 0 auto",
                  width: 84,
                  height: 84,
                  p: 0,
                  border: `1px solid ${C.divider}`,
                  borderRadius: 2.5,
                  overflow: "hidden",
                  bgcolor: C.cardBg,
                  cursor: "pointer",
                }}
              >
                <Box
                  component="img"
                  src={entry.previewUrl}
                  alt=""
                  sx={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                {entry.kind === "video" && (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "rgba(0,0,0,0.28)",
                    }}
                  >
                    <PlayArrowRoundedIcon sx={{ color: "#fff", fontSize: 26 }} />
                  </Box>
                )}
                <Box
                  sx={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    border: "2px solid #fff",
                    bgcolor: "rgba(0,0,0,0.18)",
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.15)",
                  }}
                />
              </Box>
            ))}
            <Box
              component="button"
              type="button"
              aria-label="More photos and videos"
              onClick={openPhotosAndVideosPicker}
              sx={{
                flex: "0 0 auto",
                width: 84,
                height: 84,
                borderRadius: 2.5,
                border: `1px solid ${C.divider}`,
                bgcolor: C.cardBg,
                color: C.textSub,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.4,
                cursor: "pointer",
                p: 0,
              }}
            >
              <PhotoLibraryOutlinedIcon sx={{ fontSize: 28 }} />
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                More
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: C.divider }} />

          <MenuItem
            onClick={openPhotosAndVideosPicker}
            sx={{ gap: 1.5, minHeight: 54, px: 2, borderRadius: 0 }}
          >
            <PhotoLibraryOutlinedIcon sx={{ color: C.textSub }} />
            Photos &amp; Videos
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAttachmentMenuAnchor(null);
              window.requestAnimationFrame(() => {
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                  fileInputRef.current.click();
                }
              });
            }}
            sx={{ gap: 1.5, minHeight: 54, px: 2, borderRadius: 0 }}
          >
            <UploadFileOutlinedIcon sx={{ color: C.textSub }} />
            Upload a File
          </MenuItem>
          <MenuItem
            onClick={() => void handleStartAudioRecording()}
            sx={{ gap: 1.5, minHeight: 54, px: 2, borderRadius: 0 }}
          >
            <MicNoneRoundedIcon sx={{ color: C.textSub }} />
            Record an Audio Clip
          </MenuItem>
        </DialogContent>
      </Dialog>
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
      <input
        ref={mediaInputRef}
        hidden
        type="file"
        multiple
        accept="image/*,video/mp4,video/quicktime,video/x-m4v,video/webm,.mp4,.mov,.m4v,.webm"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          handleAnyMediaSelected(files[0] ?? null);
        }}
      />
      <input
        ref={fileInputRef}
        hidden
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf,.zip,application/pdf"
        onChange={(event) =>
          handleMediaSelected("file", event.target.files?.[0] ?? null)
        }
      />
      <input
        ref={photoCaptureInputRef}
        hidden
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(event) => {
          const selected = event.target.files?.[0] ?? null;
          if (!selected) return;
          handleMediaSelected("image", selected);
        }}
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
  searchHighlighted = false,
  forwardCommunities = [],
  onUpdated,
  onDeleted,
  onReply,
  onMeetingDiscovered,
  discoveryCommunityId,
}: {
  post: ForumPost;
  communityName?: string;
  conversationStyle?: boolean;
  dateLabel?: string;
  viewerName: string;
  searchHighlighted?: boolean;
  forwardCommunities?: Array<{ id: string; name: string }>;
  onUpdated: (postId: string, body: string) => void;
  onDeleted: (postId: string) => void;
  onReply: (post: ForumPost) => void;
  onMeetingDiscovered?: (
    meeting: Comm360Meeting,
    communityId: string,
  ) => void;
  discoveryCommunityId?: string;
}) => {
  const [comments, setComments] = useState<ForumComment[]>(
    post.initialComments ?? [],
  );
  const [showComments, setShowComments] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [commentCount, setCommentCount] = useState(post.replyCount ?? 0);
  const [commentsNextCursor, setCommentsNextCursor] = useState<string | null>(
    null,
  );
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsLoadingMore, setCommentsLoadingMore] = useState(false);
  const [deletingComment, setDeletingComment] =
    useState<ForumComment | null>(null);
  const [commentDeletePending, setCommentDeletePending] = useState(false);
  const [commentDeleteError, setCommentDeleteError] = useState("");
  const [commentMenu, setCommentMenu] = useState<{
    anchor: HTMLElement;
    comment: ForumComment;
  } | null>(null);
  const [activeCommentActionsId, setActiveCommentActionsId] = useState<
    string | null
  >(null);
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
  const [ownerMenuPosition, setOwnerMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [forwardOpen, setForwardOpen] = useState(false);
  const [forwardPending, setForwardPending] = useState(false);
  const [forwardError, setForwardError] = useState("");
  const [forwardTargetId, setForwardTargetId] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editBody, setEditBody] = useState(post.body);
  const [postActionPending, setPostActionPending] = useState(false);
  const [postActionError, setPostActionError] = useState("");
  const [mobileSwipeOffset, setMobileSwipeOffset] = useState(0);
  const [messageActionsVisible, setMessageActionsVisible] = useState(false);
  const [imageViewerUrl, setImageViewerUrl] = useState<string | null>(null);
  const [imageZoomed, setImageZoomed] = useState(false);
  const [fileViewer, setFileViewer] = useState<{
    url: string;
    label: string;
    kind: "pdf" | "image" | "document";
  } | null>(null);
  const mobileLongPressTimerRef = useRef<number | null>(null);
  const mobileLongPressTriggeredRef = useRef(false);
  const mobileTouchMovedRef = useRef(false);
  const mobileTouchStartXRef = useRef(0);
  const mobileTouchStartYRef = useRef(0);
  const mobileSwipeOffsetRef = useRef(0);
  const lastMobileTapAtRef = useRef(0);
  const commentLongPressTimerRef = useRef<number | null>(null);
  const commentLongPressTriggeredRef = useRef(false);
  const commentLastTapRef = useRef<{ id: string; at: number }>({
    id: "",
    at: 0,
  });
  const commentTouchMovedRef = useRef(false);
  const commentTouchStartRef = useRef({ x: 0, y: 0 });
  const [editWindowOpen, setEditWindowOpen] = useState(
    Date.now() - new Date(post.createdAt).getTime() < 5 * 60 * 1000,
  );
  const pollClosed = Boolean(
    poll &&
      (poll.status === "closed" ||
        (poll.endsAt && new Date(poll.endsAt).getTime() <= Date.now())),
  );

  useEffect(() => {
    const communityId = post.communityId ?? discoveryCommunityId;
    const roomIds = [
      ...extractComm360RoomIds(displayBody),
      ...comments.flatMap((comment) => extractComm360RoomIds(comment.body)),
    ];
    if (!communityId || roomIds.length === 0) return;
    let cancelled = false;
    for (const roomId of roomIds) {
      void loadComm360Meeting(roomId).then((meeting) => {
        if (cancelled) return;
        onMeetingDiscovered?.(meeting, communityId);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [
    comments,
    discoveryCommunityId,
    displayBody,
    onMeetingDiscovered,
    post.communityId,
  ]);
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

  const clearCommentLongPressTimer = () => {
    if (commentLongPressTimerRef.current !== null) {
      window.clearTimeout(commentLongPressTimerRef.current);
      commentLongPressTimerRef.current = null;
    }
  };

  const revealCommentActions = (commentId: string) => {
    setActiveCommentActionsId(commentId);
  };

  const handleCommentRowPointerDown = (
    event: React.PointerEvent<HTMLElement>,
    commentId: string,
  ) => {
    if (event.pointerType === "mouse") return;
    commentTouchMovedRef.current = false;
    commentTouchStartRef.current = { x: event.clientX, y: event.clientY };
    commentLongPressTriggeredRef.current = false;
    clearCommentLongPressTimer();
    commentLongPressTimerRef.current = window.setTimeout(() => {
      commentLongPressTriggeredRef.current = true;
      revealCommentActions(commentId);
    }, 420);
  };

  const handleCommentRowPointerMove = (
    event: React.PointerEvent<HTMLElement>,
  ) => {
    if (event.pointerType === "mouse") return;
    const dx = event.clientX - commentTouchStartRef.current.x;
    const dy = event.clientY - commentTouchStartRef.current.y;
    if (Math.hypot(dx, dy) > 12) {
      commentTouchMovedRef.current = true;
      clearCommentLongPressTimer();
    }
  };

  const handleCommentRowPointerUp = (
    event: React.PointerEvent<HTMLElement>,
    comment: ForumComment,
  ) => {
    if (event.pointerType === "mouse") return;
    clearCommentLongPressTimer();
    if (commentTouchMovedRef.current) return;
    if (commentLongPressTriggeredRef.current) {
      commentLongPressTriggeredRef.current = false;
      return;
    }
    const now = Date.now();
    const last = commentLastTapRef.current;
    if (last.id === comment.id && now - last.at < 350) {
      commentLastTapRef.current = { id: "", at: 0 };
      revealCommentActions(comment.id);
      void handleCommentLike(comment);
      return;
    }
    commentLastTapRef.current = { id: comment.id, at: now };
    revealCommentActions(comment.id);
  };

  useEffect(() => {
    if (!showComments) setActiveCommentActionsId(null);
  }, [showComments]);

  useEffect(() => {
    if (!activeCommentActionsId) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(`[data-comment-row="${activeCommentActionsId}"]`)) {
        return;
      }
      if (target.closest(".MuiMenu-root, .MuiPopover-root, .MuiDialog-root")) {
        return;
      }
      setActiveCommentActionsId(null);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [activeCommentActionsId]);

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

  const mapCommentRecords = (
    records: Awaited<ReturnType<typeof listComments>>["items"],
  ): ForumComment[] =>
    records.map((comment) => ({
      id: comment.id,
      authorName: comment.author?.name ?? "Anchor member",
      body: comment.body,
      timeAgo: formatTimeAgo(comment.createdAt),
      canDelete: comment.canDelete,
      canEdit: comment.canEdit,
      likeCount: comment.likeCount,
      viewerLiked: comment.viewerLiked,
    }));

  const handleToggleComments = async () => {
    const nextVisible = !showComments;
    setShowComments(nextVisible);
    if (!nextVisible || commentsLoaded) return;
    setReplyError("");
    setCommentsLoading(true);
    try {
      const page = await listComments(post.id, { limit: 10 });
      setComments(mapCommentRecords(page.items));
      setCommentsNextCursor(page.nextCursor);
      setCommentCount(
        Math.max(post.replyCount ?? 0, page.items.length),
      );
      setCommentsLoaded(true);
    } catch (caught) {
      setReplyError(
        caught instanceof Error ? caught.message : "Could not load replies",
      );
    } finally {
      setCommentsLoading(false);
    }
  };
  // T: O(c) and S: O(c), where c is returned comments

  const handleLoadMoreComments = async () => {
    if (!commentsNextCursor || commentsLoadingMore) return;
    setCommentsLoadingMore(true);
    setReplyError("");
    try {
      const page = await listComments(post.id, {
        limit: 10,
        cursor: commentsNextCursor,
      });
      setComments((current) => {
        const existingIds = new Set(current.map((comment) => comment.id));
        const next = mapCommentRecords(page.items).filter(
          (comment) => !existingIds.has(comment.id),
        );
        return [...current, ...next];
      });
      setCommentsNextCursor(page.nextCursor);
    } catch (caught) {
      setReplyError(
        caught instanceof Error ? caught.message : "Could not load more replies",
      );
    } finally {
      setCommentsLoadingMore(false);
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
    window.matchMedia("(max-width: 899.95px)").matches;

  const closeOwnerMenu = () => {
    setOwnerMenuAnchor(null);
    setOwnerMenuPosition(null);
  };

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
    // Scrolling while actions are open restores the compact message look.
    if (messageActionsVisible && Math.abs(deltaY) > 10) {
      setMessageActionsVisible(false);
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
      setMessageActionsVisible(true);
      if (!liked) void handleLike();
      return;
    }
    lastMobileTapAtRef.current = tappedAt;
    // Tap toggles the action bar on mobile/tablet.
    setMessageActionsVisible((current) => !current);
  };

  useEffect(() => {
    if (!messageActionsVisible) return;

    const dismissActions = () => setMessageActionsVisible(false);
    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest(`[data-message-row="${post.id}"]`)) return;
      if (
        event.target.closest(".MuiPopover-root, .MuiMenu-root, .MuiDialog-root")
      ) {
        return;
      }
      dismissActions();
    };

    let touchStartY: number | null = null;
    const handleTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? null;
    };
    const handleTouchMove = (event: TouchEvent) => {
      if (touchStartY == null) return;
      const currentY = event.touches[0]?.clientY;
      if (currentY == null) return;
      // Any intentional vertical drag (scroll up/down) restores the compact row.
      if (Math.abs(currentY - touchStartY) > 10) {
        dismissActions();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
      capture: true,
    });
    document.addEventListener("touchmove", handleTouchMove, {
      passive: true,
      capture: true,
    });
    // Capture scrolls from window, main, and nested overflow containers.
    document.addEventListener("scroll", dismissActions, {
      passive: true,
      capture: true,
    });
    window.addEventListener("wheel", dismissActions, { passive: true });

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("touchstart", handleTouchStart, true);
      document.removeEventListener("touchmove", handleTouchMove, true);
      document.removeEventListener("scroll", dismissActions, true);
      window.removeEventListener("wheel", dismissActions);
    };
  }, [messageActionsVisible, post.id]);

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

  const handleOpenForward = () => {
    setForwardError("");
    setForwardTargetId(forwardCommunities[0]?.id ?? "");
    setForwardOpen(true);
  };
  // T: O(1) and S: O(1)

  const handleForwardToCommunity = async () => {
    if (!forwardTargetId || forwardPending) return;
    setForwardPending(true);
    setForwardError("");
    try {
      const media = post.media?.[0];
      let file: File | null = null;
      let mode: "text" | "image" | "video" | "audio" | "file" = "text";
      if (media?.url) {
        mode = media.type;
        const response = await fetch(media.url);
        if (!response.ok) {
          throw new Error("Could not copy the attached media to forward.");
        }
        const blob = await response.blob();
        const fallbackName =
          media.originalFilename?.trim() ||
          `forwarded-${media.type}-${Date.now()}`;
        file = new File([blob], fallbackName, {
          type: blob.type || undefined,
        });
      }
      const preface = `Forwarded from ${post.authorName}`;
      const body = [preface, displayBody.trim()].filter(Boolean).join("\n\n");
      await createPost({
        communityId: forwardTargetId,
        body:
          body ||
          (media
            ? `${preface}\n\nShared a ${media.type}.`
            : preface),
        mode: media ? mode : "text",
        file,
      });
      setForwardOpen(false);
      setActionMessage(
        `Forwarded to ${
          forwardCommunities.find((item) => item.id === forwardTargetId)
            ?.name ?? "community"
        }.`,
      );
    } catch (caught) {
      setForwardError(
        caught instanceof Error
          ? caught.message
          : "Could not forward this message",
      );
    } finally {
      setForwardPending(false);
    }
  };
  // T: O(b + m) and S: O(b + m), where b is body length and m is media bytes

  const handleMenuShare = async () => {
    closeOwnerMenu();
    await handleSharePost();
  };
  // T: O(b) and S: O(b), where b is the post text length

  const handleCopyPostText = async () => {
    closeOwnerMenu();
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
    closeOwnerMenu();
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
    closeOwnerMenu();
    setFriendActionPending(true);
    setActionMessage("");
    try {
      await removeFriend(post.authorId);
      setFriendshipStatus("none");
      setActionMessage(`You are no longer friends with ${post.authorName}.`);
    } catch (caught) {
      setActionMessage(
        caught instanceof Error
          ? caught.message
          : `Could not unfriend ${post.authorName}`,
      );
    } finally {
      setFriendActionPending(false);
    }
  };
  // T: O(1) and S: O(1)

  const handleOpenEdit = () => {
    if (!editWindowOpen) return;
    closeOwnerMenu();
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
    closeOwnerMenu();
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
      data-message-row={post.id}
      onClick={(event) => {
        // Mouse / stylus on tablet widths: click toggles the action bar.
        // Touch devices already toggle it from handleMobileTouchEnd.
        if (!isMobileTouchLayout() || isInteractiveTouchTarget(event.target)) {
          return;
        }
        if (window.matchMedia("(pointer: coarse)").matches) return;
        setMessageActionsVisible((current) => !current);
      }}
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
        bgcolor: searchHighlighted || messageActionsVisible ? C.surface : C.cardBg,
        border: 0,
        borderRadius: 0,
        px: 0,
        boxShadow: "none",
        overflow: "hidden",
        transition: "background-color 280ms ease",
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
        // Desktop: fade actions in on hover. Mobile/tablet uses tap + scroll dismiss.
        "@media (hover: hover) and (min-width: 900px)": {
          "& .message-actions": {
            opacity: 0,
            transform: "translateY(4px)",
            pointerEvents: "none",
          },
          "&:hover .message-actions, &:focus-within .message-actions": {
            opacity: 1,
            transform: "translateY(0)",
            pointerEvents: "auto",
          },
        },
      }}
    >
      <Stack
        className="message-actions"
        direction="row"
        alignItems="center"
        spacing={0.25}
        sx={{
          // Mobile/tablet: in-flow row so the message box grows while selected;
          // scrolling dismisses this and restores the compact height.
          display: {
            xs: messageActionsVisible ? "flex" : "none",
            md: "flex",
          },
          position: { xs: "relative", md: "absolute" },
          top: { md: 8 },
          right: { md: 8 },
          alignSelf: { xs: "flex-end", md: "auto" },
          width: "fit-content",
          ml: "auto",
          mb: { xs: messageActionsVisible ? 0.85 : 0, md: 0 },
          p: 0.35,
          border: `1px solid ${C.divider}`,
          borderRadius: 2,
          bgcolor: C.cardBg,
          boxShadow: "0 4px 14px rgba(0,0,0,0.10)",
          transition: "opacity 140ms ease, transform 140ms ease",
          zIndex: 2,
          "& .MuiIconButton-root": {
            width: { xs: 34, sm: 36, md: 32 },
            height: { xs: 34, sm: 36, md: 32 },
          },
          "& .MuiSvgIcon-root": {
            fontSize: { xs: 21, sm: 22, md: 19 },
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
        <Tooltip title="Forward to a community">
          <IconButton
            size="small"
            aria-label="Forward message to another community"
            onClick={() => handleOpenForward()}
            sx={{ color: C.textMuted }}
          >
            <ReplyRoundedIcon sx={{ transform: "scaleX(-1)" }} />
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
            onClick={(event) => {
              setOwnerMenuPosition(null);
              setOwnerMenuAnchor(event.currentTarget);
            }}
            sx={{ color: C.textMuted }}
          >
            <MoreHorizRoundedIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      {/* Author row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: { xs: 0.55, sm: 0.8 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: { xs: 1, sm: 1.15 },
          }}
        >
          <Avatar
            src={post.authorAvatar}
            sx={{
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              flexShrink: 0,
              bgcolor: C.accentFaint,
              color: C.accentDark,
              fontSize: "0.95rem",
            }}
          >
            {post.authorName.charAt(0)}
          </Avatar>
          <Box sx={{ minWidth: 0, pt: "1px" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.4,
                minHeight: { xs: "1.2rem", sm: "1.25rem" },
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  lineHeight: 1.25,
                  color: C.textPrimary,
                  fontFamily: "Inter, sans-serif",
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
                mt: 0.15,
                fontSize: "0.72rem",
                fontWeight: 400,
                lineHeight: 1.35,
                color: C.textMuted,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {post.authorProfession} · {post.timeAgo}
            </Typography>
          </Box>
        </Box>
        <Menu
          id={`post-menu-${post.id}`}
          anchorEl={ownerMenuAnchor}
          anchorReference={ownerMenuPosition ? "anchorPosition" : "anchorEl"}
          anchorPosition={ownerMenuPosition ?? undefined}
          open={Boolean(ownerMenuAnchor || ownerMenuPosition)}
          onClose={closeOwnerMenu}
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
                  Unfriend {post.authorName}
                </MenuItem>
              )}
        </Menu>
      </Box>

      <Box sx={{ ml: { xs: 5.5, sm: 6.15 }, minWidth: 0 }}>

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
              {post.replyTo.body && (
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
              )}
              {post.replyTo.media?.[0] && (
                post.replyTo.media[0].type === "file" ? (
                  <Box
                    component="a"
                    href={post.replyTo.media[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      mt: 0.65,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.5,
                      color: C.accentDark,
                      fontSize: "0.72rem",
                      fontWeight: 700,
                    }}
                  >
                    <DownloadRoundedIcon sx={{ fontSize: 16 }} />
                    Attached file
                  </Box>
                ) : (
                  <Box
                    component={
                      post.replyTo.media[0].type === "image"
                        ? "img"
                        : post.replyTo.media[0].type === "audio"
                          ? "audio"
                          : "video"
                    }
                    src={post.replyTo.media[0].url}
                    controls={post.replyTo.media[0].type === "audio"}
                    muted={post.replyTo.media[0].type === "video"}
                    playsInline={post.replyTo.media[0].type === "video"}
                    sx={{
                      display: "block",
                      width:
                        post.replyTo.media[0].type === "audio"
                          ? { xs: 210, sm: 260 }
                          : { xs: 64, sm: 76 },
                      height:
                        post.replyTo.media[0].type === "audio"
                          ? 40
                          : { xs: 46, sm: 54 },
                      mt: 0.65,
                      borderRadius: 1.25,
                      objectFit: "cover",
                      bgcolor: C.surface,
                    }}
                  />
                )
              )}
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
          fontWeight: 400,
          color: C.textPrimary,
          lineHeight: 1.5,
          fontFamily: "Inter, sans-serif",
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
          <CommunityFeedImage
            key={item.id}
            url={item.url}
            alt="Community post upload"
            onOpen={() => {
              setImageZoomed(false);
              setImageViewerUrl(item.url);
            }}
          />
        ) : item.type === "file" ? (
          (() => {
            const label = mediaFileLabel(item.url, item.originalFilename);
            const pdf =
              isPdfMediaUrl(item.url) ||
              /\.pdf$/i.test(label) ||
              /\.pdf$/i.test(item.originalFilename ?? "");
            const imageLike = isImageLikeFileUrl(item.url);
            if (imageLike) {
              return (
                <CommunityFeedImage
                  key={item.id}
                  url={item.url}
                  alt={label}
                  onOpen={() =>
                    setFileViewer({ url: item.url, label, kind: "image" })
                  }
                />
              );
            }
            return (
              <CommunityFilePreviewCard
                key={item.id}
                url={item.url}
                label={label}
                kind={pdf ? "pdf" : "document"}
                onOpen={() =>
                  setFileViewer({
                    url: item.url,
                    label,
                    kind: pdf ? "pdf" : "document",
                  })
                }
              />
            );
          })()
        ) : item.type === "audio" ? (
          <CommunityFeedAudio key={item.id} url={item.url} />
        ) : (
          <CommunityFeedVideo
            key={item.id}
            url={item.url}
            posterUrl={item.posterUrl}
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

      {(likeCount > 0 || commentCount > 0) && (
      <Stack
        direction="row"
        alignItems="center"
        spacing={{ xs: 1, sm: 1.25 }}
        sx={{ mt: 0.75, minHeight: 24 }}
      >
        {likeCount > 0 && (
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
            fontSize: "0.82rem",
            fontWeight: 600,
            textTransform: "none",
            lineHeight: 1.2,
            "& .MuiButton-startIcon": { mr: 0.35 },
            "& .MuiSvgIcon-root": { fontSize: "0.78rem" },
          }}
        >
          {likeCount}
        </Button>
        )}
        {commentCount > 0 && (
        <Button
          size="small"
          onClick={() => void handleToggleComments()}
          startIcon={<ChatBubbleOutlineRoundedIcon />}
          sx={{
            minWidth: 0,
            px: 0.25,
            color: showComments ? C.accentDark : C.textMuted,
            fontSize: "0.82rem",
            fontWeight: 600,
            textTransform: "none",
            lineHeight: 1.2,
            "& .MuiButton-startIcon": { mr: 0.35 },
            "& .MuiSvgIcon-root": { fontSize: "0.78rem" },
          }}
        >
          {commentCount}
        </Button>
        )}
      </Stack>
      )}

      {actionMessage && (
        <Typography sx={{ mt: 1, color: C.textMuted, fontSize: "0.75rem" }}>
          {actionMessage}
        </Typography>
      )}
      </Box>

      {/* Comments + reply box */}
      {showComments && (
        <Box sx={{ mt: 2, ml: { xs: 5.5, sm: 6.15 } }}>
          <Divider sx={{ borderColor: C.divider, mb: 1.5 }} />

          {commentsLoading && comments.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={22} sx={{ color: C.accent }} />
            </Box>
          ) : comments.length === 0 ? (
            <Typography sx={{ fontSize: "0.88rem", color: C.textMuted, mb: 2 }}>
              No replies yet — be the first to help.
            </Typography>
          ) : (
            <Stack spacing={1.1} sx={{ mb: 2 }}>
              {comments.map((comment) => {
                const actionsVisible = activeCommentActionsId === comment.id;
                return (
                <Box
                  key={comment.id}
                  data-comment-row={comment.id}
                  onPointerDown={(event) =>
                    handleCommentRowPointerDown(event, comment.id)
                  }
                  onPointerMove={handleCommentRowPointerMove}
                  onPointerUp={(event) =>
                    handleCommentRowPointerUp(event, comment)
                  }
                  onPointerCancel={clearCommentLongPressTimer}
                  onDoubleClick={() => {
                    revealCommentActions(comment.id);
                    void handleCommentLike(comment);
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.2,
                    position: "relative",
                    pr: { xs: 0, md: 16 },
                    borderRadius: 1.5,
                    touchAction: "manipulation",
                    WebkitUserSelect: "none",
                    userSelect: "none",
                    bgcolor: actionsVisible ? C.surface : "transparent",
                    "& .comment-actions": {
                      opacity: actionsVisible ? 1 : 0,
                      pointerEvents: actionsVisible ? "auto" : "none",
                      transition: "opacity 140ms ease",
                    },
                    "@media (hover: hover) and (min-width: 900px)": {
                      "&:hover .comment-actions, &:focus-within .comment-actions":
                        {
                          opacity: 1,
                          pointerEvents: "auto",
                        },
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
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: C.textPrimary,
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {comment.authorName}
                      </Typography>
                      <Typography sx={{ fontSize: "0.7rem", color: C.textMuted }}>
                        {comment.timeAgo}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                      <Typography
                        sx={{
                          fontSize: "0.86rem",
                          fontWeight: 400,
                          color: C.textPrimary,
                          lineHeight: 1.45,
                          flex: "0 1 auto",
                          fontFamily: "Inter, sans-serif",
                          WebkitUserSelect: "text",
                          userSelect: "text",
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
                    onPointerDown={(event) => event.stopPropagation()}
                    onPointerUp={(event) => event.stopPropagation()}
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
                    }}
                  >
                    <Button
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleCommentLike(comment);
                      }}
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
                        "& .MuiButton-startIcon": { mr: 0.3 },
                        "& .MuiSvgIcon-root": { fontSize: "0.75rem" },
                      }}
                    >
                      {comment.likeCount}
                    </Button>
                    {(comment.canEdit || comment.canDelete) && (
                      <IconButton
                        size="small"
                        aria-label={`Comment options for ${comment.authorName}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setCommentMenu({
                            anchor: event.currentTarget,
                            comment,
                          });
                        }}
                        sx={{ color: C.textMuted }}
                      >
                        <MoreHorizRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                  </Stack>
                </Box>
              );
              })}
              {commentsNextCursor && (
                <Box sx={{ display: "flex", justifyContent: "center", pt: 0.5 }}>
                  <Button
                    size="small"
                    onClick={() => void handleLoadMoreComments()}
                    disabled={commentsLoadingMore}
                    endIcon={
                      commentsLoadingMore ? (
                        <CircularProgress size={14} sx={{ color: C.accent }} />
                      ) : (
                        <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18 }} />
                      )
                    }
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      color: C.accentDark,
                      px: 1.5,
                      py: 0.4,
                      borderRadius: 999,
                      bgcolor: C.accentFaint,
                      "&:hover": { bgcolor: C.surface },
                    }}
                  >
                    {commentsLoadingMore
                      ? "Loading…"
                      : "Scroll down · next 10"}
                  </Button>
                </Box>
              )}
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
                fontSize: "16px",
                fontWeight: 400,
                color: C.textPrimary,
                fontFamily: "Inter, sans-serif",
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
        open={Boolean(fileViewer)}
        onClose={() => setFileViewer(null)}
        fullScreen
        PaperProps={{
          sx: {
            bgcolor: fileViewer?.kind === "image" ? "#111" : C.cardBg,
          },
        }}
      >
        <Box
          sx={{
            position: "fixed",
            top: 12,
            left: 12,
            right: 12,
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography
            sx={{
              color: fileViewer?.kind === "image" ? "#fff" : C.textPrimary,
              fontWeight: 700,
              fontSize: "0.92rem",
              px: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "55%",
              textShadow:
                fileViewer?.kind === "image"
                  ? "0 1px 4px rgba(0,0,0,0.65)"
                  : "none",
            }}
          >
            {fileViewer?.label}
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <IconButton
              component="a"
              href={fileViewer?.url}
              download
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download file"
              sx={{
                color: fileViewer?.kind === "image" ? "#fff" : C.textPrimary,
                bgcolor:
                  fileViewer?.kind === "image"
                    ? "rgba(0,0,0,0.48)"
                    : C.surface,
              }}
            >
              <DownloadRoundedIcon />
            </IconButton>
            <IconButton
              aria-label="Close file viewer"
              onClick={() => setFileViewer(null)}
              sx={{
                color: fileViewer?.kind === "image" ? "#fff" : C.textPrimary,
                bgcolor:
                  fileViewer?.kind === "image"
                    ? "rgba(0,0,0,0.48)"
                    : C.surface,
              }}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Box>
        </Box>
        <DialogContent
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 1, sm: 2 },
            pt: { xs: 8, sm: 9 },
            overflow: "hidden",
          }}
        >
          {fileViewer?.kind === "image" ? (
            <Box
              component="img"
              src={fileViewer.url}
              alt={fileViewer.label}
              sx={{
                display: "block",
                maxWidth: "100%",
                maxHeight: "calc(100vh - 96px)",
                objectFit: "contain",
              }}
            />
          ) : fileViewer?.kind === "pdf" ? (
            <CommunityPdfBlobFrame
              url={fileViewer.url}
              title={fileViewer.label}
              height="calc(100vh - 96px)"
            />
          ) : fileViewer ? (
            <Stack
              spacing={2}
              alignItems="center"
              sx={{
                width: "min(100%, 420px)",
                px: 2,
                py: 4,
                borderRadius: 3,
                border: `1px solid ${C.divider}`,
                bgcolor: C.surface,
                textAlign: "center",
              }}
            >
              <InsertDriveFileOutlinedIcon
                sx={{ fontSize: 64, color: C.accentDark }}
              />
              <Typography sx={{ fontWeight: 800, color: C.textPrimary }}>
                {fileViewer.label}
              </Typography>
              <Typography sx={{ color: C.textMuted, fontSize: "0.85rem" }}>
                This file type opens in a new tab for full viewing or download.
              </Typography>
              <Button
                component="a"
                href={fileViewer.url}
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  bgcolor: C.accent,
                  "&:hover": { bgcolor: C.accentDark },
                }}
              >
                Open file
              </Button>
            </Stack>
          ) : null}
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
        open={forwardOpen}
        onClose={() => !forwardPending && setForwardOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ color: C.textPrimary, fontWeight: 700 }}>
          Forward to a community
        </DialogTitle>
        <DialogContent>
          {forwardCommunities.length === 0 ? (
            <Typography sx={{ color: C.textSub, fontSize: "0.9rem" }}>
              Join another community first to forward this message.
            </Typography>
          ) : (
            <TextField
              select
              fullWidth
              size="small"
              label="Community"
              value={forwardTargetId}
              onChange={(event) => setForwardTargetId(event.target.value)}
              sx={{ mt: 0.5 }}
            >
              {forwardCommunities.map((community) => (
                <MenuItem key={community.id} value={community.id}>
                  {community.name}
                </MenuItem>
              ))}
            </TextField>
          )}
          {forwardError && (
            <Typography sx={{ color: C.red, fontSize: "0.78rem", mt: 1.5 }}>
              {forwardError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setForwardOpen(false)}
            disabled={forwardPending}
            sx={{ color: C.textSub, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleForwardToCommunity()}
            disabled={
              forwardPending ||
              !forwardTargetId ||
              forwardCommunities.length === 0
            }
            sx={{
              bgcolor: C.accent,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": { bgcolor: C.accentDark, boxShadow: "none" },
            }}
          >
            {forwardPending ? "Forwarding…" : "Forward"}
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
    .filter((meeting) =>
      isAllView ? true : meeting.communityId === activeCommunityId,
    )
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

      {isAllView && (
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
      )}

      {(!isAllView || scopedMeetings.length > 0) && (
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
                  (!Number.isFinite(startsAt) ||
                    (currentTime >= startsAt &&
                      currentTime <= startsAt + 2 * 60 * 60_000));
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
                        {isAllView && meeting.communityName && (
                          <Typography
                            sx={{
                              mt: 0.2,
                              fontSize: "0.72rem",
                              fontWeight: 600,
                              color: C.accentDark,
                            }}
                          >
                            {meeting.communityName}
                          </Typography>
                        )}
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
          minHeight: { xs: 40, sm: 54 },
          "& .MuiTabs-flexContainer": {
            minHeight: { xs: 40, sm: 54 },
          },
          "& .MuiTabs-indicator": {
            height: 2,
            bgcolor: C.accent,
          },
          "& .MuiTab-root": {
            minHeight: { xs: 40, sm: 54 },
            py: { xs: 0.5, sm: 1 },
            color: C.textPrimary,
            textTransform: "none",
            fontSize: { xs: "0.82rem", sm: "0.95rem" },
            fontWeight: 500,
            lineHeight: 1.2,
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
  const [showAllDiscoverable, setShowAllDiscoverable] = useState(false);
  const [recentlyActiveOrder, setRecentlyActiveOrder] = useState<string[]>(
    [],
  );
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
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

  useEffect(() => {
    setRecentlyActiveOrder(readRecentlyActiveCommunityOrder());
  }, []);

  useEffect(() => {
    let cancelled = false;
    let debounceTimer = 0;

    const refreshUnreadCounts = async () => {
      setRecentlyActiveOrder(readRecentlyActiveCommunityOrder());
      const joined = communities.filter((community) => community.joined);
      if (joined.length === 0) {
        if (!cancelled) setUnreadCounts({});
        return;
      }
      const priority = sortJoinedCommunities(
        joined,
        readRecentlyActiveCommunityOrder(),
        {},
      ).slice(0, 8);
      const entries = await Promise.all(
        priority.map(async (community) => {
          const posts = await listCommunityFeed(community.id).catch(
            () => [] as CommunityPostRecord[],
          );
          return [
            community.id,
            countUnreadCommunityMessages(posts, community.id),
          ] as const;
        }),
      );
      if (cancelled) return;
      setUnreadCounts((current) => ({
        ...current,
        ...Object.fromEntries(entries),
      }));
    };

    void refreshUnreadCounts();
    const handleInboxChanged = () => {
      window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => {
        void refreshUnreadCounts();
      }, 800);
    };
    window.addEventListener(INBOX_CHANGED_EVENT, handleInboxChanged);
    return () => {
      cancelled = true;
      window.clearTimeout(debounceTimer);
      window.removeEventListener(INBOX_CHANGED_EVENT, handleInboxChanged);
    };
    // unreadCounts intentionally omitted to avoid refresh loops
  }, [communities]);

  const joinedCommunities = sortJoinedCommunities(
    communities.filter((community) => community.joined),
    recentlyActiveOrder,
    unreadCounts,
  );
  const visibleJoinedCommunities = showAllCommunities
    ? joinedCommunities
    : joinedCommunities.slice(0, 4);
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
  const visibleDiscoverableCommunities = showAllDiscoverable
    ? discoverableCommunities
    : discoverableCommunities.slice(0, 4);
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
        description: description.trim(),
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
          variant="fullWidth"
          sx={{
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            boxSizing: "border-box",
            px: 0,
            overflow: "hidden",
            borderBottom: `1px solid ${C.divider}`,
            "& .MuiTabs-flexContainer": { width: "100%" },
            "& .MuiTabs-indicator": { bgcolor: C.accent },
            "& .MuiTab-root": {
              flex: 1,
              minWidth: 0,
              maxWidth: "none",
              px: { xs: 0.75, sm: 1.5 },
              color: C.textMuted,
              textTransform: "none",
              fontWeight: 600,
              fontSize: { xs: "0.72rem", sm: "0.875rem" },
              lineHeight: 1.25,
              whiteSpace: "normal",
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

        <Box sx={{ width: "100%", maxWidth: "100%", minWidth: 0, boxSizing: "border-box", p: { xs: 1, sm: 2, md: 2.5 }, pt: { xs: 1.5, sm: 2 }, overflow: "hidden" }}>
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
                            xs: "repeat(2, minmax(0, 1fr))",
                            md: "repeat(3, minmax(0, 1fr))",
                          }
                        : "1fr",
                    justifyContent: "stretch",
                    alignItems: "stretch",
                    gap:
                      layout === "grid" ? { xs: 1, sm: 1.5 } : 0,
                    width: "100%",
                  }}
                >
                  {visibleJoinedCommunities.map((community) => {
                    const isSelected = community.id === scheduleCommunityId;
                    const unreadCount = unreadCounts[community.id] ?? 0;
                    const openCommunity = () => {
                      setScheduleCommunityId(community.id);
                      setUnreadCounts((current) => ({
                        ...current,
                        [community.id]: 0,
                      }));
                      onOpen(community.id);
                    };
                    return (
                      <Box
                        key={community.id}
                        role="button"
                        tabIndex={0}
                        aria-label={
                          unreadCount > 0
                            ? `Open ${community.name}, ${unreadCount} unread message${unreadCount === 1 ? "" : "s"}`
                            : `Open ${community.name}`
                        }
                        onClick={openCommunity}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter" && event.key !== " ") return;
                          event.preventDefault();
                          openCommunity();
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
                              ? { xs: 1, sm: 2 }
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
                          overflow: "visible",
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
                        <Badge
                          badgeContent={unreadCount}
                          color="error"
                          overlap="circular"
                          invisible={unreadCount < 1}
                          sx={{
                            flexShrink: 0,
                            "& .MuiBadge-badge": {
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              minWidth: 18,
                              height: 18,
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
                            }}
                          >
                            <GroupsRoundedIcon fontSize="small" />
                          </Box>
                        </Badge>
                        <Box sx={{ flex: 1, minWidth: 0, width: "100%", maxWidth: "100%" }}>
                          <Typography
                            sx={{
                              color: C.textPrimary,
                              fontSize: { xs: "0.8rem", sm: "0.88rem" },
                              fontWeight: 700,
                              overflowWrap: "anywhere",
                            }}
                          >
                            {community.name}
                          </Typography>
                          {community.description.trim() &&
                          community.description.trim() !==
                            "A new Anchor community" ? (
                            <Typography
                              sx={{
                                color: C.textMuted,
                                fontSize: { xs: "0.68rem", sm: "0.74rem" },
                                lineHeight: 1.35,
                                overflowWrap: "anywhere",
                                display: "-webkit-box",
                                WebkitLineClamp: layout === "grid" ? 2 : 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {community.description.trim()}
                            </Typography>
                          ) : null}
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
                            {unreadCount > 0 && (
                              <Typography
                                sx={{
                                  color: C.accentDark,
                                  fontSize: "0.68rem",
                                  fontWeight: 700,
                                  ml: 0.5,
                                }}
                              >
                                · {unreadCount} new
                              </Typography>
                            )}
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

                {joinedCommunities.length > 4 && (
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
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "stretch", sm: "center" },
                  gap: 1,
                  mb: 2,
                  minWidth: 0,
                }}
              >
                <TextField
                  fullWidth
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search communities"
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
                      overflow: "visible",
                      opacity: 1,
                    },
                    "& input": {
                      minWidth: 0,
                      fontSize: "16px",
                    },
                  }}
                />
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <CommunityLayoutToggle
                    layout={layout}
                    onChange={handleLayoutChange}
                  />
                </Box>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns:
                    layout === "grid"
                      ? {
                          xs: "repeat(2, minmax(0, 1fr))",
                          md: "repeat(3, minmax(0, 1fr))",
                        }
                      : "1fr",
                  justifyContent: "stretch",
                  alignItems: "stretch",
                  gap: layout === "grid" ? { xs: 1, sm: 1.5 } : 0,
                  width: "100%",
                  maxWidth: "100%",
                  minWidth: 0,
                }}
              >
                {visibleDiscoverableCommunities.map((community) => (
                  <Box
                    key={community.id}
                    sx={{
                      display: "flex",
                      flexDirection: layout === "grid" ? "column" : "row",
                      alignItems:
                        layout === "grid"
                          ? "flex-start"
                          : { xs: "flex-start", sm: "center" },
                      gap: { xs: 0.8, sm: 1.5 },
                      p: layout === "grid" ? { xs: 1, sm: 1.5 } : { xs: 1.1, sm: 1.5 },
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
                      {community.description.trim() &&
                      community.description.trim() !==
                        "A new Anchor community" ? (
                        <Typography
                          sx={{
                            color: C.textMuted,
                            fontSize: "0.78rem",
                            lineHeight: 1.35,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {community.description.trim()}
                        </Typography>
                      ) : null}
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
              {discoverableCommunities.length > 4 && (
                <Box
                  component="button"
                  type="button"
                  onClick={() =>
                    setShowAllDiscoverable((current) => !current)
                  }
                  aria-expanded={showAllDiscoverable}
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
                      transform: showAllDiscoverable
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 160ms ease",
                    }}
                  />
                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 700 }}>
                    {showAllDiscoverable
                      ? "Show fewer community groups"
                      : "Open all community groups"}
                  </Typography>
                </Box>
              )}
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
  onRemoveFriend,
  onResolveRequest,
}: {
  friends: Friend[];
  friendRequests: CommunityFriendRequest[];
  sentFriendRequests: CommunityFriendRequest[];
  onAddFriend: (friendId: string) => Promise<void>;
  onRemoveFriend: (friendId: string) => Promise<void>;
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
  const [unfriendActionId, setUnfriendActionId] = useState("");
  const [showAllFriends, setShowAllFriends] = useState(false);
  const normalizedSearch = search.trim().toLowerCase();
  const currentFriends = friends.filter((friend) => friend.isFriend);
  const visibleFriends = showAllFriends
    ? currentFriends
    : currentFriends.slice(0, 4);

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
              mutualFriends: Number(person.mutualFriends) || 0,
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

  const handleUnfriend = async (friendId: string) => {
    if (unfriendActionId) return;
    setUnfriendActionId(friendId);
    setSearchError("");
    setRequestError("");
    try {
      await onRemoveFriend(friendId);
      setSearchResults((current) =>
        current.map((friend) =>
          friend.id === friendId
            ? { ...friend, isFriend: false, friendshipStatus: "none" }
            : friend,
        ),
      );
    } catch (caught) {
      setRequestError(
        caught instanceof Error ? caught.message : "Could not unfriend",
      );
    } finally {
      setUnfriendActionId("");
    }
  };
  // T: O(1) and S: O(1)

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
              fontSize: "16px",
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
                onRemoveFriend={handleUnfriend}
                removePending={unfriendActionId === friend.id}
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
            <>
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
              {visibleFriends.map((friend) => (
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
                    onRemoveFriend={handleUnfriend}
                    removePending={unfriendActionId === friend.id}
                    compact
                  />
                </Card>
              ))}
            </Box>
            {currentFriends.length > 4 && (
              <Box
                component="button"
                type="button"
                onClick={() => setShowAllFriends((current) => !current)}
                aria-expanded={showAllFriends}
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
                    transform: showAllFriends
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "transform 160ms ease",
                  }}
                />
                <Typography sx={{ fontSize: "0.78rem", fontWeight: 700 }}>
                  {showAllFriends ? "Show fewer friends" : "Show all friends"}
                </Typography>
              </Box>
            )}
            </>
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
                    {request.handle}
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
                    {request.handle}
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
  onRemoveFriend,
  removePending = false,
  compact = false,
}: {
  friend: Friend;
  onAddFriend: (friendId: string) => void | Promise<void>;
  onRemoveFriend?: (friendId: string) => void | Promise<void>;
  removePending?: boolean;
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
          {friend.handle}
        </Typography>
        <Typography sx={{ color: C.textSub, fontSize: "0.7rem", mt: 0.3 }}>
          {friend.mutualFriends}{" "}
          {friend.mutualFriends === 1 ? "mutual friend" : "mutual friends"}
        </Typography>
      </Box>
      {friend.isFriend || friend.friendshipStatus === "accepted" ? (
        onRemoveFriend ? (
          <Button
            size="small"
            disabled={removePending}
            startIcon={<PersonRemoveOutlinedIcon />}
            onClick={() => void onRemoveFriend(friend.id)}
            sx={{
              color: C.red,
              bgcolor: "rgba(211,47,47,0.08)",
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {removePending ? "Removing…" : "Unfriend"}
          </Button>
        ) : (
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
        )
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
  const { setMessages, setViewingScope } = useAppChrome();
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
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const [missedBehindCount, setMissedBehindCount] = useState(0);
  const [readTrackingReady, setReadTrackingReady] = useState(false);
  const [currentProfileName, setCurrentProfileName] = useState("");
  const [showCommunityChrome, setShowCommunityChrome] = useState(true);
  const [communityHeaderHeight, setCommunityHeaderHeight] = useState(62);
  const [communityMenuAnchor, setCommunityMenuAnchor] =
    useState<HTMLElement | null>(null);
  const [communitySharePending, setCommunitySharePending] = useState(false);
  const [groupDetailsOpen, setGroupDetailsOpen] = useState(false);
  const [groupDetailsMembers, setGroupDetailsMembers] = useState<
    CommunityMemberRecord[]
  >([]);
  const [groupDetailsLoading, setGroupDetailsLoading] = useState(false);
  const [groupDetailsError, setGroupDetailsError] = useState("");
  const [typingUsers, setTypingUsers] = useState<CommunityTypingUser[]>([]);
  const [discoveredMeetings, setDiscoveredMeetings] = useState<
    ScheduledMeeting[]
  >([]);
  const inviteHandled = useRef(false);
  const communityInviteLinksRef = useRef<Record<string, string>>({});
  const activePostScopeRef = useRef<string>(ALL_ID);
  const conversationRequestRef = useRef(0);
  const lastCommunityConversationIdRef = useRef<string | null>(null);
  const seenPostIdsRef = useRef<Set<string> | null>(null);
  const localFeedPostSeenAtRef = useRef<Map<string, number>>(new Map());
  const feedMarkerByScopeRef = useRef<Record<string, string | null>>({});
  const feedForceRefreshRef = useRef<Record<string, number>>({});
  const knownFriendRequestIdsRef = useRef<Set<string> | null>(null);
  const acknowledgedFriendRequestIdsRef = useRef<Set<string> | null>(null);
  const pageRootRef = useRef<HTMLDivElement | null>(null);
  const communityHeaderRef = useRef<HTMLDivElement | null>(null);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const restoredReadScopeRef = useRef("");
  const jumpingToLatestRef = useRef(false);
  const caughtUpThisVisitRef = useRef(false);
  const userReadingHistoryRef = useRef(false);
  const stickToLatestRef = useRef(false);
  const scrolledToQueryPostRef = useRef("");
  const highlightPostTimerRef = useRef<number | null>(null);
  const [highlightedPostId, setHighlightedPostId] = useState<string | null>(
    null,
  );
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

  useEffect(() => {
    if (pageTab === "posts") {
      setViewingScope("feed");
    } else if (communityConversationId) {
      setViewingScope(`community:${communityConversationId}`);
    } else {
      setViewingScope(null);
    }
  }, [communityConversationId, pageTab, setViewingScope]);

  useEffect(
    () => () => {
      setViewingScope(null);
    },
    [setViewingScope],
  );

  const handleMeetingDiscovered = useCallback(
    (meeting: Comm360Meeting, communityId: string) => {
      const start = meeting.startTime ? new Date(meeting.startTime) : null;
      const validStart = Boolean(start && !Number.isNaN(start.getTime()));
      setDiscoveredMeetings((current) => {
        const mapped: ScheduledMeeting = {
          id: meeting.id,
          communityId,
          communityName: communities.find((item) => item.id === communityId)
            ?.name,
          withName: meeting.organizerName,
          topic: meeting.title,
          description: meeting.description,
          date: validStart
            ? start!.toLocaleDateString([], {
                weekday: "short",
                month: "short",
                day: "numeric",
              })
            : "Scheduled in Comm360",
          time: validStart
            ? start!.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })
            : "Open to join",
          via: "Comm360",
          startAt: validStart ? meeting.startTime : undefined,
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
    [communities],
  );
  // T: O(m) and S: O(m), where m is discovered meetings

  useEffect(() => {
    const fallbackCommunityId = communityConversationId;
    const requested = new Set<string>();
    for (const post of posts) {
      const communityId = post.communityId ?? fallbackCommunityId;
      if (!communityId) continue;
      for (const roomId of extractComm360RoomIds(post.body)) {
        const key = `${communityId}:${roomId}`;
        if (requested.has(key)) continue;
        requested.add(key);
        void loadComm360Meeting(roomId).then((meeting) =>
          handleMeetingDiscovered(meeting, communityId),
        );
      }
    }
  }, [communityConversationId, handleMeetingDiscovered, posts]);
  // T: O(p) and S: O(p), where p is loaded posts

  const refreshPosts = useCallback(async (communityId: string) => {
    const previousScope = activePostScopeRef.current;
    const scopeChanged = previousScope !== communityId;
    activePostScopeRef.current = communityId;
    if (scopeChanged) {
      localFeedPostSeenAtRef.current.clear();
    }
    const records =
      communityId === ALL_ID
        ? await listGlobalPosts({ fresh: true })
        : await listCommunityFeed(communityId, { fresh: true });
    const mapped = records.map(mapPost);
    if (activePostScopeRef.current === communityId) {
      setPosts((current) => {
        const merged = mergeFeedPosts(
          scopeChanged ? [] : current,
          mapped,
          localFeedPostSeenAtRef.current,
          { replaceScope: scopeChanged },
        );
        return sameFeedPosts(current, merged) ? current : merged;
      });
      seenPostIdsRef.current = new Set(records.map((record) => record.id));
      const latestPost = [...mapped].sort(
        (left, right) =>
          new Date(left.createdAt).getTime() -
          new Date(right.createdAt).getTime(),
      ).at(-1);
      feedMarkerByScopeRef.current[communityId] = latestPost?.id ?? null;
      feedForceRefreshRef.current[communityId] = Date.now();
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
      lastCommunityConversationIdRef.current = restoredConversation;
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
    void navigator.serviceWorker?.register("/community-sw.js").catch(() => undefined);
    void getCurrentCommunityProfile()
      .then((profile) => setCurrentProfileName(profile.name))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    let stopped = false;
    let inFlight = false;
    let pendingKick = false;
    let timer: number | undefined;

    const applyRecords = (
      target: string,
      records: Awaited<ReturnType<typeof listCommunityFeed>>,
    ) => {
      const mapped = records.map(mapPost);
      const previousMarker = feedMarkerByScopeRef.current[target];
      const previousIds = seenPostIdsRef.current ?? new Set<string>();
      const gainedMessages = mapped.some((post) => !previousIds.has(post.id));
      const latestId =
        [...mapped]
          .sort(
            (left, right) =>
              new Date(left.createdAt).getTime() -
              new Date(right.createdAt).getTime(),
          )
          .at(-1)?.id ?? null;
      setPosts((current) => {
        const merged = mergeFeedPosts(
          current,
          mapped,
          localFeedPostSeenAtRef.current,
        );
        return sameFeedPosts(current, merged) ? current : merged;
      });
      if (
        gainedMessages &&
        !userReadingHistoryRef.current &&
        (caughtUpThisVisitRef.current ||
          (() => {
            const scroller = pageRootRef.current?.closest(
              "main",
            ) as HTMLElement | null;
            if (!scroller) return caughtUpThisVisitRef.current;
            return (
              scroller.scrollHeight -
                scroller.scrollTop -
                scroller.clientHeight <=
              150
            );
          })())
      ) {
        stickToLatestRef.current = true;
      }
      seenPostIdsRef.current = new Set(records.map((record) => record.id));
      // Prevent the notification watcher from re-alerting for posts already shown in-chat.
      if (records.length > 0) {
        const notified = readNotifiedPostIds();
        let changed = false;
        for (const record of records) {
          if (!notified.has(record.id)) {
            notified.add(record.id);
            changed = true;
          }
        }
        if (changed) saveNotifiedPostIds(notified);
      }
      if (
        gainedMessages &&
        target !== ALL_ID &&
        previousMarker != null &&
        latestId !== previousMarker
      ) {
        playCommunityMessageSound("in-chat");
      }
      // While watching this thread, mark it read so the top inbox stays quiet.
      if (
        latestId &&
        target !== ALL_ID &&
        caughtUpThisVisitRef.current &&
        !userReadingHistoryRef.current
      ) {
        seedReadPosition(`community:${target}`, latestId, true);
      }
      feedMarkerByScopeRef.current[target] = latestId;
      feedForceRefreshRef.current[target] = Date.now();
    };

    const runSync = async () => {
      if (stopped) return;
      if (inFlight) {
        pendingKick = true;
        return;
      }
      const target = activePostScopeRef.current;
      if (target === "community-list") return;
      inFlight = true;
      try {
        do {
          pendingKick = false;
          const scope = activePostScopeRef.current;
          if (scope === "community-list") break;
          // Always pull a fresh page while a conversation is open — marker gating
          // previously dropped updates under overlapping polls.
          const records =
            scope === ALL_ID
              ? await listGlobalPosts({ fresh: true })
              : await listCommunityFeed(scope, { fresh: true });
          if (stopped || activePostScopeRef.current !== scope) break;
          applyRecords(scope, records);
        } while (pendingKick && !stopped);
      } catch {
        // Keep the current view intact during temporary background-sync failures.
      } finally {
        inFlight = false;
      }
    };

    const scheduleNext = () => {
      if (stopped) return;
      if (timer != null) window.clearTimeout(timer);
      const hidden = document.visibilityState === "hidden";
      timer = window.setTimeout(() => {
        void runSync().finally(scheduleNext);
      }, hidden ? 1_200 : 350);
    };

    void runSync().finally(scheduleNext);

    const kick = () => {
      void runSync();
    };
    document.addEventListener("visibilitychange", kick);
    window.addEventListener("focus", kick);
    window.addEventListener("pageshow", kick);
    window.addEventListener("online", kick);
    window.addEventListener(INBOX_CHANGED_EVENT, kick);
    return () => {
      stopped = true;
      if (timer != null) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", kick);
      window.removeEventListener("focus", kick);
      window.removeEventListener("pageshow", kick);
      window.removeEventListener("online", kick);
      window.removeEventListener(INBOX_CHANGED_EVENT, kick);
    };
  }, [hydrated]);

  useEffect(() => {
    if (!communityConversationId || pageTab !== "communities") {
      setTypingUsers([]);
      return;
    }
    let stopped = false;
    const pollTyping = async () => {
      try {
        const users = await listCommunityTyping(communityConversationId);
        if (!stopped) setTypingUsers(users);
      } catch {
        if (!stopped) setTypingUsers([]);
      }
    };
    void pollTyping();
    const timer = window.setInterval(() => {
      void pollTyping();
    }, 1_000);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [communityConversationId, pageTab]);

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
          Notification.permission === "granted" &&
          readDeviceNotificationMode() !== "off"
        ) {
          const registration = await navigator.serviceWorker?.ready;
          const silent = readDeviceNotificationMode() === "silent";
          for (const request of incoming.slice(0, 3)) {
            await registration?.showNotification("New friend request", {
              body: `${request.name} sent you a friend request.`,
              icon: "/assets/Anchor_logo.png",
              badge: "/assets/Anchor_logo.png",
              tag: `friend-request-${request.id}`,
              silent,
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
      touchRecentlyActiveCommunities([record.id]);
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
      lastCommunityConversationIdRef.current = null;
      window.localStorage.removeItem(COMMUNITY_CONVERSATION_STORAGE_KEY);
      setPosts([]);
    }
    await refreshCommunities();
  };
  // T: O(c) and S: O(c), where c is returned communities

  const replaceCommunityUrl = useCallback(
    (tab: CommunityPageTab, conversationId?: string | null) => {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab === "posts" ? "feed" : tab);
      if (tab === "communities" && conversationId) {
        url.searchParams.set("community", conversationId);
      } else {
        url.searchParams.delete("community");
      }
      url.searchParams.delete("invite");
      url.searchParams.delete("post");
      window.history.replaceState({}, "", `${url.pathname}${url.search}`);
    },
    [],
  );
  // T: O(q) and S: O(q), where q is the number of URL query parameters

  const handleOpenCommunity = useCallback(
    async (communityId: string) => {
      const requestId = conversationRequestRef.current + 1;
      conversationRequestRef.current = requestId;
      const previousConversationId = lastCommunityConversationIdRef.current;
      setConversationLoading(true);
      setActiveCommunityId(communityId);
      setCommunityConversationId(communityId);
      lastCommunityConversationIdRef.current = communityId;
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
      activePostScopeRef.current = communityId;
      if (previousConversationId && previousConversationId !== communityId) {
        setPosts([]);
        localFeedPostSeenAtRef.current.clear();
      }
      try {
        const records = await listCommunityFeed(communityId, { fresh: true });
        if (conversationRequestRef.current !== requestId) return;
        const mapped = records.map(mapPost);
        setPosts(mapped);
        seenPostIdsRef.current = new Set(records.map((record) => record.id));
        const latestPost = [...mapped].sort(
          (left, right) =>
            new Date(left.createdAt).getTime() -
            new Date(right.createdAt).getTime(),
        ).at(-1);
        feedMarkerByScopeRef.current[communityId] = latestPost?.id ?? null;
        feedForceRefreshRef.current[communityId] = Date.now();
        // Do not seed read position here — landing scroll decides:
        // caught up → latest; otherwise first missed message.
      } catch (caught) {
        if (conversationRequestRef.current === requestId) {
          setPageError(
            caught instanceof Error
              ? caught.message
              : "Could not open community",
          );
        }
      } finally {
        if (conversationRequestRef.current === requestId) {
          setConversationLoading(false);
        }
      }
    },
    [replaceCommunityUrl],
  );
  // T: O(p) and S: O(p), where p is the returned community posts

  const handlePageTabChange = (nextTab: CommunityPageTab) => {
    if (nextTab === "friends") {
      acknowledgeFriendRequests(friendRequests);
    }
    if (nextTab === "communities") {
      const previousCommunityId =
        lastCommunityConversationIdRef.current ??
        window.localStorage.getItem(COMMUNITY_CONVERSATION_STORAGE_KEY);
      if (
        previousCommunityId &&
        communities.some(
          (community) =>
            community.id === previousCommunityId && community.joined,
        )
      ) {
        void handleOpenCommunity(previousCommunityId);
        return;
      }
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
    lastCommunityConversationIdRef.current = null;
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

  const handleOpenGroupDetails = async (community: Community) => {
    setGroupDetailsOpen(true);
    setGroupDetailsLoading(true);
    setGroupDetailsError("");
    setGroupDetailsMembers([]);
    try {
      setGroupDetailsMembers(await listCommunityMembers(community.id));
    } catch (caught) {
      setGroupDetailsError(
        caught instanceof Error
          ? caught.message
          : "Could not load group members",
      );
    } finally {
      setGroupDetailsLoading(false);
    }
  };
  // T: O(m) and S: O(m), where m is returned members

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
            setPosts((current) => {
              const merged = mergeFeedPosts(
                current,
                mapped,
                localFeedPostSeenAtRef.current,
              );
              return sameFeedPosts(current, merged) ? current : merged;
            });
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
    if (post.communityId) {
      touchRecentlyActiveCommunities([post.communityId]);
      window.dispatchEvent(new Event(INBOX_CHANGED_EVENT));
    }
    const optimisticPost: ForumPost = {
      ...mapPost(post),
      friendshipStatus: "self",
    };
    rememberLocalFeedPosts(localFeedPostSeenAtRef.current, [optimisticPost]);
    if (activePostScopeRef.current === target) {
      // Sender is composing at the bottom — keep them on the newest message.
      if (!userReadingHistoryRef.current || isNearLatestMessages()) {
        queueStickToLatest();
        caughtUpThisVisitRef.current = true;
        userReadingHistoryRef.current = false;
      }
      setPosts((current) => {
        if (current.some((item) => item.id === optimisticPost.id)) {
          return current.map((item) =>
            item.id === optimisticPost.id ? optimisticPost : item,
          );
        }
        return [...current, optimisticPost];
      });
    }

    if (post.status === "processing") {
      void reconcileCreatedPost(post.id, target);
      return;
    }

    // Trust the create response; avoid an immediate list refresh that can
    // race a stale cache and briefly wipe the new message.
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

  const handleRemoveFriend = async (friendId: string): Promise<void> => {
    await removeFriend(friendId);
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
  const forwardCommunities = communities
    .filter(
      (community) =>
        community.joined && community.id !== communityConversationId,
    )
    .map((community) => ({ id: community.id, name: community.name }));
  const currentReadScope =
    pageTab === "posts"
      ? "feed"
      : communityConversationId
        ? `community:${communityConversationId}`
        : "";
  const latestVisiblePostId = visiblePosts.at(-1)?.id;
  const typingLabel =
    typingUsers.length === 0
      ? null
      : typingUsers.length === 1
        ? `${typingUsers[0].name} is typing…`
        : typingUsers.length === 2
          ? `${typingUsers[0].name} and ${typingUsers[1].name} are typing…`
          : `${typingUsers[0].name} and ${typingUsers.length - 1} others are typing…`;

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
  }, [communities, conversationCommunity?.name, posts, setMessages]);

  useEffect(() => {
    return () => setMessages([]);
  }, [setMessages]);

  const flashPostHighlight = useCallback((postId: string) => {
    if (highlightPostTimerRef.current !== null) {
      window.clearTimeout(highlightPostTimerRef.current);
      highlightPostTimerRef.current = null;
    }
    setHighlightedPostId(postId);
    highlightPostTimerRef.current = window.setTimeout(() => {
      setHighlightedPostId((current) => (current === postId ? null : current));
      highlightPostTimerRef.current = null;
    }, 2000);
  }, []);

  const scrollToPostAndHighlight = useCallback(
    async (postId: string) => {
      for (let attempt = 0; attempt < 50; attempt += 1) {
        const target = document.querySelector(
          `[data-community-post-id="${CSS.escape(postId)}"]`,
        ) as HTMLElement | null;
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          // Apply shade immediately so it is visible during/after scroll.
          flashPostHighlight(postId);
          consumePendingPostHighlight();
          const url = new URL(window.location.href);
          if (url.searchParams.get("post") === postId) {
            url.searchParams.delete("post");
            window.history.replaceState(
              {},
              "",
              `${url.pathname}${url.search}`,
            );
          }
          return true;
        }
        await delay(120);
      }
      return false;
    },
    [flashPostHighlight],
  );

  useEffect(
    () => () => {
      if (highlightPostTimerRef.current !== null) {
        window.clearTimeout(highlightPostTimerRef.current);
      }
    },
    [],
  );

  // Deep-link / search: wait until the message row exists, then scroll + shade.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("post");
    const fromPending = peekPendingPostHighlight();
    const postId = fromUrl || fromPending;
    if (!postId || posts.length === 0) return;
    if (!posts.some((post) => post.id === postId)) return;
    const focusKey = `${pageTab}:${communityConversationId ?? "feed"}:${postId}`;
    if (scrolledToQueryPostRef.current === focusKey) return;

    let cancelled = false;
    void (async () => {
      const focused = await scrollToPostAndHighlight(postId);
      if (cancelled) return;
      if (focused) {
        scrolledToQueryPostRef.current = focusKey;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    communityConversationId,
    pageTab,
    posts,
    scrollToPostAndHighlight,
  ]);

  useEffect(() => {
    const openFromInbox = (event: Event) => {
      const detail = (event as CustomEvent<OpenPostDetail>).detail;
      if (!detail?.postId) return;
      markPendingPostHighlight(detail.postId);
      // Force a fresh focus attempt for this selection.
      scrolledToQueryPostRef.current = "";
      const open = async () => {
        if (detail.communityId) {
          await handleOpenCommunity(detail.communityId);
        } else {
          setPageTab("posts");
          setCommunityConversationId(null);
          replaceCommunityUrl("posts");
          await refreshPosts(ALL_ID);
        }
        await scrollToPostAndHighlight(detail.postId);
      };
      void open();
    };
    window.addEventListener(OPEN_POST_EVENT, openFromInbox);
    return () => window.removeEventListener(OPEN_POST_EVENT, openFromInbox);
  }, [
    handleOpenCommunity,
    refreshPosts,
    replaceCommunityUrl,
    scrollToPostAndHighlight,
  ]);

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

  const threadScroller = () =>
    pageRootRef.current?.closest("main") as HTMLElement | null;

  /** Composer + safe-area take space at the bottom of the thread. */
  const bottomChromeInset = () => {
    if (typeof window === "undefined") return 140;
    return window.matchMedia("(max-width: 600px)").matches ? 150 : 140;
  };

  const isNearLatestMessages = () => {
    const scroller = threadScroller();
    if (!scroller) {
      const items = messageItems();
      const latest = items.at(-1);
      if (!latest) return caughtUpThisVisitRef.current;
      return (
        latest.getBoundingClientRect().bottom <=
        window.innerHeight - bottomChromeInset() + 24
      );
    }
    const remaining =
      scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    return remaining <= bottomChromeInset();
  };

  const scrollThreadToLatest = (behavior: ScrollBehavior = "auto") => {
    const scroller = threadScroller();
    if (scroller) {
      if (behavior === "smooth") {
        scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
      } else {
        scroller.scrollTop = scroller.scrollHeight;
      }
      return;
    }
    messageItems()
      .at(-1)
      ?.scrollIntoView({ behavior, block: "end" });
  };

  const scrollThreadToPost = (
    postId: string,
    behavior: ScrollBehavior = "auto",
  ) => {
    const target = messageListRef.current?.querySelector<HTMLElement>(
      `[data-community-post-id="${postId}"]`,
    );
    if (!target) return;
    const scroller = threadScroller();
    if (scroller) {
      const scrollerRect = scroller.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const headerOffset = Math.max(communityHeaderHeight, 56) + 12;
      const nextTop =
        scroller.scrollTop + (targetRect.top - scrollerRect.top) - headerOffset;
      if (behavior === "smooth") {
        scroller.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" });
      } else {
        scroller.scrollTop = Math.max(0, nextTop);
      }
      return;
    }
    target.scrollIntoView({ behavior, block: "start" });
  };

  const queueStickToLatest = () => {
    stickToLatestRef.current = true;
  };

  const persistLatestRead = (items: HTMLElement[]) => {
    const latestId = items.at(-1)?.dataset.communityPostId;
    if (!latestId || !currentReadScope) return;
    seedReadPosition(currentReadScope, latestId, true);
  };

  const markVisitCaughtUp = (items: HTMLElement[]) => {
    caughtUpThisVisitRef.current = true;
    userReadingHistoryRef.current = false;
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
    const scroller = threadScroller();
    const inset = bottomChromeInset();
    const nearBottom = scroller
      ? scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight <=
        inset
      : (() => {
          const viewportBottom = window.innerHeight - inset;
          const latest = items.at(-1);
          return Boolean(
            latest && latest.getBoundingClientRect().top < viewportBottom - 8,
          );
        })();
    if (nearBottom) {
      setShowJumpToLatest(false);
      markVisitCaughtUp(items);
      return 0;
    }
    const viewportBottom = scroller
      ? scroller.getBoundingClientRect().bottom - inset
      : window.innerHeight - inset;
    let lastVisibleIndex = -1;
    items.forEach((item, index) => {
      if (item.getBoundingClientRect().top < viewportBottom - 8) {
        lastVisibleIndex = index;
      }
    });
    const behind = Math.max(0, items.length - 1 - lastVisibleIndex);
    setShowJumpToLatest(behind > 0);
    userReadingHistoryRef.current = true;
    caughtUpThisVisitRef.current = false;
    return behind;
  };
  // T: O(p) and S: O(1), where p is the number of rendered posts

  useEffect(() => {
    restoredReadScopeRef.current = "";
    caughtUpThisVisitRef.current = false;
    userReadingHistoryRef.current = false;
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
    let retryTimer = 0;
    const restoreLanding = () => {
      const items = messageItems();
      if (items.length === 0) return false;
      if (items.length < visiblePosts.length) return false;

      const storageKey = `${COMMUNITY_READ_POSITION_PREFIX}.${currentReadScope}`;
      let savedPostId: string | null = null;
      try {
        savedPostId = window.localStorage.getItem(storageKey);
      } catch {
        savedPostId = null;
      }
      const savedIndex = savedPostId
        ? items.findIndex(
            (item) => item.dataset.communityPostId === savedPostId,
          )
        : -1;
      const hasMissed =
        savedIndex >= 0 && savedIndex < items.length - 1;

      if (userReadingHistoryRef.current) {
        setShowJumpToLatest(true);
      } else if (!hasMissed) {
        scrollThreadToLatest();
        setShowJumpToLatest(false);
        markVisitCaughtUp(items);
      } else {
        const firstMissedId =
          items[savedIndex + 1]?.dataset.communityPostId ?? null;
        if (firstMissedId) scrollThreadToPost(firstMissedId);
        caughtUpThisVisitRef.current = false;
        userReadingHistoryRef.current = true;
        const behind = items.length - 1 - savedIndex;
        setMissedBehindCount(behind);
        setShowJumpToLatest(behind > 0);
      }
      restoredReadScopeRef.current = currentReadScope;
      readyTimer = window.setTimeout(() => setReadTrackingReady(true), 350);
      return true;
    };

    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        if (restoreLanding()) return;
        // DOM may still be catching up after posts paint.
        retryTimer = window.setTimeout(() => {
          if (restoredReadScopeRef.current === currentReadScope) return;
          restoreLanding();
        }, 120);
      });
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(readyTimer);
      window.clearTimeout(retryTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restore read position once the thread is painted
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
    const scroller = threadScroller();
    const handleScroll = () => syncCaughtUpState();
    syncCaughtUpState();
    scroller?.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      scroller?.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync caught-up state from the visible thread
  }, [
    currentReadScope,
    latestVisiblePostId,
    readTrackingReady,
    visiblePosts.length,
  ]);

  // After new messages paint, pin to the bottom when the user was already on latest.
  useEffect(() => {
    if (!stickToLatestRef.current) return;
    if (!latestVisiblePostId) return;
    stickToLatestRef.current = false;
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        scrollThreadToLatest();
        caughtUpThisVisitRef.current = true;
        userReadingHistoryRef.current = false;
        setShowJumpToLatest(false);
        const items = messageItems();
        if (items.length > 0) markVisitCaughtUp(items);
      });
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stick after the newest post id changes
  }, [latestVisiblePostId, posts.length]);

  const handleJumpToLatest = () => {
    const items = messageItems();
    jumpingToLatestRef.current = true;
    userReadingHistoryRef.current = false;
    caughtUpThisVisitRef.current = true;
    setShowJumpToLatest(false);
    markVisitCaughtUp(items);
    scrollThreadToLatest("smooth");
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
          left: { xs: 0, md: "var(--anchor-sidebar-width, 0px)" },
          right: 0,
          zIndex: 1150,
          minHeight: { xs: 44, sm: 56 },
          boxSizing: "border-box",
          bgcolor: { xs: "var(--anchor-header-bg)", md: "var(--anchor-header-bg)" },
          pl: COMMUNITY_GUTTER,
          pr: COMMUNITY_GUTTER,
          pt: 0,
          pb: 0,
          borderBottom: `1px solid ${C.divider}`,
          boxShadow: { xs: "0 3px 14px rgba(17,17,17,0.08)", md: "none" },
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
          height: {
            xs: communityConversationId ? 0 : 44,
            sm: 56,
          },
        }}
      />

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
                <Stack
                  ref={messageListRef}
                  spacing={0}
                  sx={{ width: "100%", overflowAnchor: "none" }}
                >
                {visiblePosts.map((post) => (
                  <Box key={post.id} data-community-post-id={post.id}>
                    <PostCard
                      post={post}
                      viewerName={currentProfileName}
                      searchHighlighted={highlightedPostId === post.id}
                      forwardCommunities={forwardCommunities}
                      onReply={setReplyingToPost}
                      onUpdated={handlePostUpdated}
                      onDeleted={handlePostDeleted}
                      onMeetingDiscovered={handleMeetingDiscovered}
                      discoveryCommunityId={communityConversationId ?? undefined}
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
                    left: { xs: 0, md: "var(--anchor-sidebar-width, 0px)" },
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
                        ml: -0.35,
                        mr: 0.75,
                        mt: 0,
                        p: 0,
                        color: C.textPrimary,
                        bgcolor: C.cardBg,
                        border: `1px solid ${C.divider}`,
                        boxShadow: "0 1px 2px rgba(44,26,10,0.04)",
                        "&:hover": {
                          bgcolor: C.surface,
                          borderColor: C.divider,
                        },
                      }}
                    >
                      <ChevronLeftRoundedIcon sx={{ fontSize: 22 }} />
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
                    <Tooltip title="Group details">
                      <IconButton
                        aria-label={`Group details, ${
                          Number.parseInt(conversationCommunity.memberCount, 10) ||
                          0
                        } members`}
                        onClick={() =>
                          void handleOpenGroupDetails(conversationCommunity)
                        }
                        sx={{
                          color: C.textMuted,
                          borderRadius: 2,
                          px: 0.75,
                          gap: 0.4,
                        }}
                      >
                        <GroupsRoundedIcon sx={{ fontSize: { xs: 20, md: 22 } }} />
                        <Typography
                          component="span"
                          sx={{ fontSize: "0.86rem", fontWeight: 700 }}
                        >
                          {Number.parseInt(conversationCommunity.memberCount, 10) ||
                            0}
                        </Typography>
                      </IconButton>
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
                  <Stack
                  ref={messageListRef}
                  spacing={0}
                  sx={{ width: "100%", overflowAnchor: "none" }}
                >
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
                        searchHighlighted={highlightedPostId === post.id}
                        forwardCommunities={forwardCommunities}
                        onReply={setReplyingToPost}
                        communityName={conversationCommunity.name}
                        conversationStyle
                        dateLabel={currentDate !== previousDate ? formatMessageDate(post.createdAt) : undefined}
                        onUpdated={handlePostUpdated}
                        onDeleted={handlePostDeleted}
                        onMeetingDiscovered={handleMeetingDiscovered}
                        discoveryCommunityId={conversationCommunity.id}
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
              data-composer-dock
              sx={{
                position: "fixed",
                left: {
                  xs: "12px",
                  sm: "18px",
                  md: "calc(var(--anchor-sidebar-width, 0px) + 32px)",
                  lg: "calc(var(--anchor-sidebar-width, 0px) + 40px)",
                },
                right: { xs: "12px", sm: "18px", md: "32px", lg: "40px" },
                bottom: {
                  xs: "max(12px, env(safe-area-inset-bottom))",
                  sm: 16,
                  md: 18,
                },
                zIndex: 1100,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 1,
                px: 0,
                boxSizing: "border-box",
                width: "auto",
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
                  maxWidth: "100%",
                  pointerEvents: "auto",
                }}
              >
                {typingLabel && (
                  <Typography
                    sx={{
                      mb: 0.75,
                      px: 1.5,
                      color: C.textMuted,
                      fontSize: "0.78rem",
                      fontStyle: "italic",
                      lineHeight: 1.3,
                      textAlign: "left",
                    }}
                    aria-live="polite"
                  >
                    {typingLabel}
                  </Typography>
                )}
                <Composer
                  scope={pageTab === "posts" ? "global" : "community"}
                  communityId={communityConversationId ?? undefined}
                  communityName={conversationCommunity?.name}
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
              onRemoveFriend={handleRemoveFriend}
              onResolveRequest={handleResolveFriendRequest}
            />
          </Box>
        )}
      </Stack>

      <Dialog
        open={groupDetailsOpen}
        onClose={() => setGroupDetailsOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          {conversationCommunity?.name ?? "Group details"}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: C.textSub, mb: 2 }}>
            {groupDetailsLoading
              ? "Loading members…"
              : `${groupDetailsMembers.length} ${
                  groupDetailsMembers.length === 1 ? "member" : "members"
                } in this group`}
          </Typography>
          {conversationCommunity?.description?.trim() &&
          conversationCommunity.description.trim() !==
            "A new Anchor community" ? (
            <Typography
              sx={{
                color: C.textMuted,
                fontSize: "0.86rem",
                mb: 2,
                lineHeight: 1.45,
              }}
            >
              {conversationCommunity.description.trim()}
            </Typography>
          ) : null}
          {groupDetailsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {groupDetailsError}
            </Alert>
          )}
          {groupDetailsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} sx={{ color: C.accent }} />
            </Box>
          ) : (
            <Stack divider={<Divider flexItem sx={{ borderColor: C.divider }} />}>
              {groupDetailsMembers.map((member) => (
                <Box
                  key={member.userId}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    py: 1.25,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: C.accentFaint,
                      color: C.accentDark,
                      fontSize: "0.85rem",
                    }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, color: C.textPrimary }}>
                      {member.name}
                      {member.isCurrentUser ? " (you)" : ""}
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
                      {member.email}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={
                      member.role === "owner"
                        ? "Owner"
                        : member.role === "admin"
                          ? "Admin"
                          : member.role === "moderator"
                            ? "Moderator"
                            : "Member"
                    }
                    variant="outlined"
                    sx={{
                      fontWeight: 600,
                      borderColor: C.divider,
                      color: C.textSub,
                    }}
                  />
                </Box>
              ))}
              {!groupDetailsError && groupDetailsMembers.length === 0 && (
                <Typography
                  sx={{ color: C.textMuted, textAlign: "center", py: 3 }}
                >
                  No members found for this group.
                </Typography>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setGroupDetailsOpen(false)}
            sx={{ textTransform: "none", color: C.textSub }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
// T: O(c + p + f) and S: O(c + f), where c is communities, p is posts, and f is friends

export default CommunityFeed;
