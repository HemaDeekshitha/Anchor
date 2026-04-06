"use client";

import React from "react";
import { Box, Typography, Card, Stack } from "@mui/material";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";

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

  return (
    <Card
      sx={{
        mt: 3,
        p: 3,
        borderRadius: 3,

        background: `
          radial-gradient(circle at 18% 24%, rgba(99,102,241,0.16), transparent 32%),
          radial-gradient(circle at 82% 72%, rgba(249,115,22,0.12), transparent 30%),
          linear-gradient(180deg, #0f1020 0%, #06070d 100%)
        `,

        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "#fff",
          }}
        >
          Recent Submissions
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            cursor: "pointer",
            color: "rgba(255,255,255,0.6)",
            fontSize: "0.9rem",
            "&:hover": { color: "#fff" },
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
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.9rem",
              textAlign: "center",
              py: 2,
            }}
          >
            No submissions yet
          </Typography>
        ) : (
          latest.map((item) => (
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
                "&:hover": {
                  background: "rgba(255,255,255,0.05)",
                },
              }}
            >
              {/* Title */}
              <Typography
                sx={{
                  color: "#fff",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                }}
              >
                {item.title}
              </Typography>

              {/* Time */}
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.5)",
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
