"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Stack,
  Avatar,
  Chip,
  Divider,
} from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import PollOutlinedIcon from "@mui/icons-material/PollOutlined";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";

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
};

export type ForumPost = {
  id: string;
  communityId: string;
  category: string;
  type: "Discussion" | "Doubt" | "Achievement";
  timeAgo: string;
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
  verified?: boolean;
  tags: string[];
  title: string;
  body: string;
  upvotes: string;
  downvotes: string;
  views: string;
  initialComments?: ForumComment[];
};

// ── Sentinel id for the "all communities" view ──────────────────────────────
const ALL_ID = "all";

export type ScheduledMeeting = {
  id: string;
  communityId: string;
  withName: string;
  withAvatar?: string;
  topic: string;
  date: string;
  time: string;
  via: string;
};

export type Community = {
  id: string;
  slug: string;
  name: string;
  description: string;
  memberCount: string;
  joined: boolean;
  isActive: boolean;
};

// ── Sample static data ───────────────────────────────────────────────────────
const SAMPLE_POSTS: ForumPost[] = [
  {
    id: "1",
    communityId: "1",
    category: "Data Engineering",
    type: "Discussion",
    timeAgo: "4h",
    authorName: "Marie Kirk",
    authorHandle: "@mariekirk32",
    verified: true,
    tags: ["#SQL", "#Interviews", "#Daily", "#Productivity"],
    title: "Is Rust the future of system programming?",
    body: "I've been diving into Rust for the past few weeks, and honestly, it feels like a game changer compared to C++. The memory safety + performance combo is impressive. Curious — do you think Rust will replace C++ in large-scale projects, or is it just hype?",
    upvotes: "3.6K",
    downvotes: "210",
    views: "3.6K",
    initialComments: [
      {
        id: "c1",
        authorName: "Dev A.",
        body: "Depends on the domain — for systems-level infra I'd bet on Rust growing fast, but C++ isn't going anywhere in game engines soon.",
        timeAgo: "3h",
      },
      {
        id: "c2",
        authorName: "Priya K.",
        body: "The tooling gap is closing quickly too. Worth learning either way for interviews.",
        timeAgo: "2h",
      },
    ],
  },
  {
    id: "2",
    communityId: "3",
    category: "Behavioral Rounds",
    type: "Doubt",
    timeAgo: "5h",
    authorName: "Nam So hee",
    authorHandle: "@namsohee",
    verified: true,
    tags: ["#Wellbeing", "#Interviews", "#Daily", "#Productivity"],
    title: "How do you disconnect from screens?",
    body: "With remote work and constant notifications, I've realized I spend 10+ hours daily in front of a screen. What's your favorite way to recharge offline? Hiking, journaling, or something else?",
    upvotes: "1.2K",
    downvotes: "510",
    views: "1.6K",
    initialComments: [
      {
        id: "c1",
        authorName: "Riya Sharma",
        body: "A short walk without my phone right after work has helped a lot more than I expected.",
        timeAgo: "4h",
      },
    ],
  },
  {
    id: "3",
    communityId: "1",
    category: "Data Engineer track",
    type: "Achievement",
    timeAgo: "2h",
    authorName: "Riya Sharma",
    authorHandle: "@riyash",
    verified: false,
    tags: ["#SQL", "#Redshift", "#Milestone"],
    title: "Finished week 3 of Structured Preparation",
    body: "40 SQL and Redshift questions down. Feeling a lot more confident going into the applied round — happy to share notes if anyone's on the same track.",
    upvotes: "980",
    downvotes: "12",
    views: "1.1K",
    initialComments: [],
  },
];

const SAMPLE_MEETINGS: ScheduledMeeting[] = [
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

const SAMPLE_COMMUNITIES: Community[] = [
  {
    id: "1",
    slug: "data-engineering",
    name: "Data Engineering",
    description: "SQL, pipelines, warehousing",
    memberCount: "2.8K members",
    joined: true,
    isActive: true,
  },
  {
    id: "2",
    slug: "system-design",
    name: "System Design",
    description: "Scalability & architecture prep",
    memberCount: "1.9K members",
    joined: false,
    isActive: false,
  },
  {
    id: "3",
    slug: "behavioral-rounds",
    name: "Behavioral Rounds",
    description: "STAR stories & soft skills",
    memberCount: "1.2K members",
    joined: true,
    isActive: false,
  },
];

const typeChipStyle = (type: ForumPost["type"]) => {
  switch (type) {
    case "Achievement":
      return { bgcolor: "rgba(63,125,79,0.10)", color: C.green };
    case "Doubt":
      return { bgcolor: "rgba(184,68,68,0.08)", color: C.red };
    default:
      return { bgcolor: C.accentFaint, color: C.accentDark };
  }
};

// ── Composer ─────────────────────────────────────────────────────────────────
const Composer = () => (
  <Card
    sx={{
      p: 2.5,
      borderRadius: 3,
      background: C.cardBg,
      border: `1px solid ${C.divider}`,
      boxShadow: "0 4px 20px rgba(44,26,10,0.06)",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Avatar
        sx={{
          width: 38,
          height: 38,
          bgcolor: C.accentFaint,
          color: C.accentDark,
          fontSize: "0.9rem",
        }}
      >
        M
      </Avatar>
      <Box
        sx={{
          flex: 1,
          px: 2,
          py: 1.2,
          borderRadius: 2,
          bgcolor: C.surface,
          border: `1px solid ${C.divider}`,
          color: C.textMuted,
          fontSize: "0.9rem",
          cursor: "text",
        }}
      >
        Share something today...
      </Box>
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: C.accentGrad,
          color: "#fff",
          flexShrink: 0,
          cursor: "pointer",
        }}
      >
        <SendRoundedIcon sx={{ fontSize: 18 }} />
      </Box>
    </Box>

    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
      {[
        { label: "Image", icon: <ImageOutlinedIcon sx={{ fontSize: 16 }} /> },
        {
          label: "Video",
          icon: <VideocamOutlinedIcon sx={{ fontSize: 16 }} />,
        },
        { label: "Poll", icon: <PollOutlinedIcon sx={{ fontSize: 16 }} /> },
      ].map((item) => (
        <Box
          key={item.label}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.6,
            px: 1.5,
            py: 0.6,
            borderRadius: 2,
            border: `1px solid ${C.divider}`,
            color: C.textSub,
            fontSize: "0.8rem",
            cursor: "pointer",
            "&:hover": { background: C.accentHover, color: C.accentDark },
          }}
        >
          {item.icon}
          {item.label}
        </Box>
      ))}
    </Stack>
  </Card>
);

// ── Post card ────────────────────────────────────────────────────────────────
const PostCard = ({
  post,
  communityName,
}: {
  post: ForumPost;
  communityName?: string;
}) => {
  const [comments, setComments] = useState<ForumComment[]>(
    post.initialComments ?? []
  );
  const [showComments, setShowComments] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleReply = () => {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    setComments((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        authorName: "You",
        body: trimmed,
        timeAgo: "Just now",
      },
    ]);
    setReplyText("");
  };

  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 3,
        background: C.cardBg,
        border: `1px solid ${C.divider}`,
        boxShadow: "0 4px 20px rgba(44,26,10,0.06)",
      }}
    >
      {/* Meta row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        {communityName && (
          <Chip
            label={communityName}
            size="small"
            sx={{
              height: 22,
              fontSize: "0.72rem",
              fontWeight: 700,
              bgcolor: C.accentFaint,
              color: C.accentDark,
            }}
          />
        )}
        <Typography
          sx={{ fontSize: "0.8rem", color: C.textSub, fontWeight: 600 }}
        >
          {post.category}
        </Typography>
        <Typography sx={{ fontSize: "0.8rem", color: C.textMuted }}>
          · {post.timeAgo}
        </Typography>
        <Chip
          label={post.type}
          size="small"
          sx={{
            ...typeChipStyle(post.type),
            fontSize: "0.72rem",
            height: 22,
            fontWeight: 600,
          }}
        />
      </Box>

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
              {post.authorHandle}
            </Typography>
          </Box>
        </Box>
        <MoreHorizRoundedIcon
          sx={{ fontSize: 20, color: C.textMuted, cursor: "pointer" }}
        />
      </Box>

      {/* Tags */}
      <Stack
        direction="row"
        spacing={1}
        sx={{ mb: 1.5, flexWrap: "wrap", rowGap: 1 }}
      >
        {post.tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            size="small"
            sx={{
              bgcolor: C.surface,
              color: C.textSub,
              border: `1px solid ${C.divider}`,
              fontSize: "0.72rem",
              height: 24,
            }}
          />
        ))}
      </Stack>

      {/* Title + body */}
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
      <Typography
        sx={{ fontSize: "0.9rem", color: C.textSub, lineHeight: 1.6, mb: 2.5 }}
      >
        {post.body}
      </Typography>

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
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.4,
              color: C.green,
            }}
          >
            <ArrowUpwardRoundedIcon sx={{ fontSize: 16 }} />
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 600 }}>
              {post.upvotes}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.4,
              color: C.red,
            }}
          >
            <ArrowDownwardRoundedIcon sx={{ fontSize: 16 }} />
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 600 }}>
              {post.downvotes}
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
            onClick={() => setShowComments((v) => !v)}
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
              {comments.length} {comments.length === 1 ? "reply" : "replies"}
            </Typography>
          </Box>
        </Stack>
      </Box>

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
                      bgcolor: C.surface,
                      border: `1px solid ${C.divider}`,
                      borderRadius: 2,
                      px: 1.5,
                      py: 1,
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
                      <Typography
                        sx={{ fontSize: "0.7rem", color: C.textMuted }}
                      >
                        {comment.timeAgo}
                      </Typography>
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
                px: 1.5,
                py: 1,
                borderRadius: 2,
                bgcolor: C.surface,
                border: `1px solid ${C.divider}`,
                fontSize: "0.85rem",
                color: C.textPrimary,
                fontFamily: "inherit",
                outline: "none",
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
              }}
            >
              <SendRoundedIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
        </Box>
      )}
    </Card>
  );
};

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
  const scopedMeetings = meetings.filter(
    (m) => m.communityId === activeCommunityId
  );

  return (
    <Card
      sx={{
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
        Schedule a Discussion
      </Typography>

      {isAllView ? (
        <>
          <Typography sx={{ fontSize: "0.82rem", color: C.textSub, mb: 2 }}>
            Scheduling is scoped to a single community's members. Switch to one
            of your joined communities to book a session.
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              py: 1.2,
              borderRadius: 2,
              border: `1px dashed ${C.divider}`,
              color: C.textMuted,
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            <CalendarMonthRoundedIcon sx={{ fontSize: 18 }} />
            Select a community to schedule
          </Box>
        </>
      ) : (
        <>
          <Typography sx={{ fontSize: "0.82rem", color: C.textSub, mb: 2.5 }}>
            Book time with a member of {activeCommunityName ?? "this community"}{" "}
            — a doubt, a mock interview, or general prep.
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              py: 1.2,
              borderRadius: 2,
              background: C.accentGrad,
              color: "#fff",
              fontSize: "0.88rem",
              fontWeight: 600,
              cursor: "pointer",
              mb: 2.5,
              "&:hover": { opacity: 0.92 },
            }}
          >
            <CalendarMonthRoundedIcon sx={{ fontSize: 18 }} />
            Schedule via Comm360
          </Box>

          <Typography
            sx={{
              fontSize: "0.75rem",
              color: C.textMuted,
              textTransform: "uppercase",
              letterSpacing: 0.4,
              fontWeight: 600,
              mb: 1.5,
            }}
          >
            Upcoming
          </Typography>

          <Stack spacing={0}>
            {scopedMeetings.length === 0 ? (
              <Typography
                sx={{
                  color: C.textMuted,
                  fontSize: "0.85rem",
                  textAlign: "center",
                  py: 2,
                }}
              >
                No meetings scheduled yet
              </Typography>
            ) : (
              scopedMeetings.map((meeting, idx) => (
                <React.Fragment key={meeting.id}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.3,
                      py: 1.4,
                    }}
                  >
                    <Avatar
                      src={meeting.withAvatar}
                      sx={{
                        width: 34,
                        height: 34,
                        bgcolor: C.accentFaint,
                        color: C.accentDark,
                        fontSize: "0.78rem",
                      }}
                    >
                      {meeting.withName.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: C.textPrimary,
                        }}
                      >
                        {meeting.withName}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: C.textMuted,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {meeting.topic}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.4,
                          color: C.textSub,
                        }}
                      >
                        <AccessTimeRoundedIcon sx={{ fontSize: 13 }} />
                        <Typography sx={{ fontSize: "0.75rem" }}>
                          {meeting.date}, {meeting.time}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.4,
                          justifyContent: "flex-end",
                          mt: 0.3,
                        }}
                      >
                        <VideocamRoundedIcon
                          sx={{ fontSize: 13, color: C.accent }}
                        />
                        <Typography
                          sx={{
                            fontSize: "0.72rem",
                            color: C.accent,
                            fontWeight: 600,
                          }}
                        >
                          {meeting.via}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  {idx < scopedMeetings.length - 1 && (
                    <Divider sx={{ borderColor: C.divider }} />
                  )}
                </React.Fragment>
              ))
            )}
          </Stack>
        </>
      )}
    </Card>
  );
};

// ── Suggested communities panel ─────────────────────────────────────────────
// Clicking any community joins it (if not already joined) and switches the
// active feed to it in one action — no modal, no separate confirmation step.
const SuggestedCommunities = ({
  communities,
  activeCommunityId,
  onSelectCommunity,
}: {
  communities: Community[];
  activeCommunityId: string;
  onSelectCommunity: (id: string) => void;
}) => {
  const isAllView = activeCommunityId === ALL_ID;

  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 3,
        background: C.cardBg,
        border: `1px solid ${C.divider}`,
        boxShadow: "0 4px 20px rgba(44,26,10,0.06)",
      }}
    >
      <Typography
        sx={{
          fontSize: "1.05rem",
          fontWeight: 700,
          color: C.accent,
          mb: 2,
          fontFamily: "'Playfair Display', serif",
        }}
      >
        Communities
      </Typography>

      <Stack spacing={0}>
        {/* Pinned: All Communities — default view */}
        <Box
          onClick={() => onSelectCommunity(ALL_ID)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.3,
            py: 1.4,
            px: 1,
            mx: -1,
            borderRadius: 2,
            cursor: "pointer",
            bgcolor: isAllView ? C.accentFaint : "transparent",
            transition: "background 0.15s ease",
            "&:hover": { background: C.accentHover },
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: C.accentFaint,
              color: C.accentDark,
              flexShrink: 0,
            }}
          >
            <GroupsRoundedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
              <Typography
                sx={{
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  color: C.textPrimary,
                }}
              >
                All Communities
              </Typography>
              {isAllView && (
                <Chip
                  label="Current"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    bgcolor: C.accentFaint,
                    color: C.accentDark,
                  }}
                />
              )}
            </Box>
            <Typography sx={{ fontSize: "0.75rem", color: C.textMuted }}>
              Posts from everywhere you've joined
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ borderColor: C.divider }} />

        {communities.map((community, idx) => {
          const isCurrent = community.id === activeCommunityId;
          return (
            <React.Fragment key={community.id}>
              <Box
                onClick={() => onSelectCommunity(community.id)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.3,
                  py: 1.4,
                  px: 1,
                  mx: -1,
                  borderRadius: 2,
                  cursor: "pointer",
                  bgcolor: isCurrent ? C.accentFaint : "transparent",
                  transition: "background 0.15s ease",
                  "&:hover": { background: C.accentHover },
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: C.accentFaint,
                    color: C.accentDark,
                    flexShrink: 0,
                  }}
                >
                  <GroupsRoundedIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                    <Typography
                      sx={{
                        fontSize: "0.88rem",
                        fontWeight: 600,
                        color: C.textPrimary,
                      }}
                    >
                      {community.name}
                    </Typography>
                    {isCurrent && (
                      <Chip
                        label="Current"
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          bgcolor: C.accentFaint,
                          color: C.accentDark,
                        }}
                      />
                    )}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: C.textMuted,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {community.description} · {community.memberCount}
                  </Typography>
                </Box>

                {community.joined ? (
                  <Typography
                    sx={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: C.textMuted,
                      flexShrink: 0,
                    }}
                  >
                    Joined
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      flexShrink: 0,
                      px: 1.6,
                      py: 0.5,
                      borderRadius: 1.5,
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      background: C.accentGrad,
                      color: "#fff",
                    }}
                  >
                    Join
                  </Box>
                )}
              </Box>
              {idx < communities.length - 1 && (
                <Divider sx={{ borderColor: C.divider }} />
              )}
            </React.Fragment>
          );
        })}
      </Stack>
    </Card>
  );
};

// ── Page-level layout ────────────────────────────────────────────────────────
type Props = {
  posts?: ForumPost[];
  meetings?: ScheduledMeeting[];
  communities?: Community[];
};

const CommunityFeed = ({
  posts = SAMPLE_POSTS,
  meetings = SAMPLE_MEETINGS,
  communities: initialCommunities = SAMPLE_COMMUNITIES,
}: Props) => {
  // Default landing view is "All Communities" only until we know better —
  // rehydrated from storage right after mount (see effect below).
  const [activeCommunityId, setActiveCommunityId] = useState<string>(ALL_ID);
  const [communities, setCommunities] =
    useState<Community[]>(initialCommunities);
  const [hydrated, setHydrated] = useState(false);

  // On mount, restore whichever community the user was last viewing.
  useEffect(() => {
    const saved = window.localStorage.getItem("anchor:activeCommunityId");
    if (saved) setActiveCommunityId(saved);
    setHydrated(true);
  }, []);

  // Keep storage in sync whenever the active community changes.
  useEffect(() => {
    if (!hydrated) return; // avoid overwriting saved value with the initial default
    window.localStorage.setItem("anchor:activeCommunityId", activeCommunityId);
  }, [activeCommunityId, hydrated]);

  // Selecting a community both switches the feed to it and joins it
  // (if the user hadn't already) — no separate confirmation step.
  const handleSelectCommunity = (id: string) => {
    setActiveCommunityId(id);
    if (id !== ALL_ID) {
      setCommunities((prev) =>
        prev.map((c) => (c.id === id ? { ...c, joined: true } : c))
      );
    }
  };

  const isAllView = activeCommunityId === ALL_ID;
  const activeCommunity = communities.find((c) => c.id === activeCommunityId);
  const communityNameById = new Map(communities.map((c) => [c.id, c.name]));
  const visiblePosts = isAllView
    ? posts
    : posts.filter((p) => p.communityId === activeCommunityId);

  return (
    <Box sx={{ bgcolor: C.surface, minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2.4fr 1fr" },
          gap: 3,
          maxWidth: 1200,
          mx: "auto",
        }}
      >
        {/* Feed column */}
        <Stack spacing={3}>
          <Box>
            <Typography
              sx={{ fontSize: "0.78rem", color: C.textMuted, mb: 0.3 }}
            >
              Viewing feed for
            </Typography>
            <Typography
              sx={{
                fontSize: "1.3rem",
                fontWeight: 700,
                color: C.textPrimary,
                fontFamily: "'Playfair Display', serif",
              }}
            >
              {isAllView
                ? "All Communities"
                : activeCommunity?.name ?? "Community"}
            </Typography>
          </Box>

          <Composer />

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
                No posts yet in{" "}
                {isAllView
                  ? "any of your communities"
                  : activeCommunity?.name ?? "this community"}{" "}
                — be the first to share something.
              </Typography>
            </Card>
          ) : (
            visiblePosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                communityName={
                  isAllView
                    ? communityNameById.get(post.communityId)
                    : undefined
                }
              />
            ))
          )}
        </Stack>

        {/* Sidebar column */}
        <Stack spacing={3}>
          <ScheduleMeetings
            meetings={meetings}
            activeCommunityId={activeCommunityId}
            activeCommunityName={activeCommunity?.name}
          />
          <SuggestedCommunities
            communities={communities}
            activeCommunityId={activeCommunityId}
            onSelectCommunity={handleSelectCommunity}
          />
        </Stack>
      </Box>
    </Box>
  );
};

export default CommunityFeed;
