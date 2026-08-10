import { ScheduledMeeting } from "./Types";

// ── Anchor palette tokens ────────────────────────────────────────────────────
export const C = {
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

// ── Sentinel id for the "all communities" view ──────────────────────────────
export const ALL_ID = "all";

export const COMPOSER_EMOJIS = [
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

export const SAMPLE_MEETINGS: ScheduledMeeting[] = [
  {
    id: "1",
    communityId: "1",
    withName: "Priya K.",
    topic: "Mock interview · System Design",
    date: "Tomorrow",
    time: "4:00 PM",
    via: "Comm360",
  },
  {
    id: "2",
    communityId: "3",
    withName: "Dev A.",
    topic: "Doubt session · SQL joins",
    date: "Fri",
    time: "11:00 AM",
    via: "Comm360",
  },
];
