"use client";

import React from "react";
import { Box, Typography, Card, Stack } from "@mui/material";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import { useRouter } from "next/navigation";

const C = {
  accent: "rgb(209,112,51)",
  accentGold: "#E5B526",
  accentBg: "rgba(209,112,51,0.08)",
  accentBorder: "rgba(209,112,51,0.15)",
  accentFaint: "rgba(209,112,51,0.1)",
  accentHover: "rgba(226, 114, 44, 0.06)",
  accentSelected: "rgba(209,112,51,0.13)",
  accentGrad: "linear-gradient(to right, rgb(209,112,51), #E5B526)",
  cardBg: "#ffffff",
  divider: "rgba(0,0,0,0.06)",
  textMuted: "black",
  textSub: "rgba(0,0,0,0.5)",
} as const;

// ---- types ----
export type Submission = {
  id: string;
  title: string;
  category: string; // 👈 add
  createdAt: string;
};

// ---- helper: time ago ----
function getTimeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  const units = [
    { label: "year", value: 60 * 60 * 24 * 365 },
    { label: "month", value: 60 * 60 * 24 * 30 },
    { label: "week", value: 60 * 60 * 24 * 7 },
    { label: "day", value: 60 * 60 * 24 },
    { label: "hour", value: 60 * 60 },
    { label: "minute", value: 60 },
  ];

  for (let unit of units) {
    const count = Math.floor(diff / unit.value);
    if (count >= 1) {
      return `${count} ${unit.label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}

// ---- main component ----
type Props = {
  submissions: Submission[];
};

const RecentSubmissions = ({ submissions }: Props) => {
  const latest = submissions
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 10);

  const route = useRouter();

  return (
    <Card
      sx={{
        mt: 3,
        p: 3,
        borderRadius: 3,
        borderTop: `4px solid ${C.accentFaint}`,
        borderImage: `linear-gradient(to right, ${C.accent}, ${C.accentGold}) 1`,
        background: C.cardBg,
        boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography
          sx={{
            fontSize: "1.1rem",
            fontWeight: 600,
            color: C.accent,
          }}
        >
          Recent Submissions
        </Typography>

        <Box
          onClick={() => route.push("/profile/submissions")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            cursor: "pointer",
            color: C.textSub,
            fontSize: "0.9rem",
            "&:hover": { color: C.accent },
          }}
        >
          <Typography sx={{ fontSize: "0.85rem" }}>
            View all submissions
          </Typography>
          <ArrowForwardIosRoundedIcon sx={{ fontSize: 12 }} />
        </Box>
      </Box>

      {/* List */}
      <Stack spacing={1}>
        {latest.length === 0 ? (
          <Typography
            sx={{
              color: C.textSub,
              fontSize: "0.9rem",
              textAlign: "center",
              py: 2,
            }}
          >
            No submissions yet
          </Typography>
        ) : (
          latest.map((item, idx) => (
            <Box
              key={item.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 2,
                py: 1.5,
                borderRadius: 2,
                transition: "all 0.2s ease",
                bgcolor: idx % 2 === 0 ? "transparent" : C.accentHover,
                "&:hover": {
                  background: C.accentHover,
                },
                flexWrap: "wrap",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    flexShrink: 0,
                    opacity: 0.7,
                    bgcolor: "rgb(209,112,51)",
                  }}
                />
                {/* Title */}
                <Typography
                  sx={{
                    color: "text.primary",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                  }}
                >
                  {item.title}
                </Typography>
              </Box>

              {/* Time */}
              <Typography
                sx={{
                  color: C.textSub,
                  fontSize: "0.8rem",
                }}
              >
                {getTimeAgo(item.createdAt)}
              </Typography>
            </Box>
          ))
        )}
      </Stack>
    </Card>
  );
};

export default RecentSubmissions;
