"use client";

import React from "react";
import { Box, Typography, Card, Stack } from "@mui/material";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import { useRouter } from "next/navigation";
import { C } from "@/lib/ui-colors";

export type Submission = {
  id: string;
  title: string;
  category: string;
  createdAt: string;
};

function getTimeAgo(dateString: string) {
  const diff  = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  const units = [
    { label: "year",   value: 60 * 60 * 24 * 365 },
    { label: "month",  value: 60 * 60 * 24 * 30  },
    { label: "week",   value: 60 * 60 * 24 * 7   },
    { label: "day",    value: 60 * 60 * 24        },
    { label: "hour",   value: 60 * 60             },
    { label: "minute", value: 60                  },
  ];
  for (const unit of units) {
    const count = Math.floor(diff / unit.value);
    if (count >= 1) return `${count} ${unit.label}${count > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

type Props = { submissions: Submission[]; };

const RecentSubmissions = ({ submissions }: Props) => {
  const latest = submissions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);
  const route = useRouter();

  return (
    <Card sx={{
      mt: 3, p: 3, borderRadius: 3,
      flex: 1,
      background: C.cardBg,
      border: `1px solid ${C.divider}`,
      borderTop: `4px solid ${C.accent}`,
      boxShadow: "0 4px 20px rgba(44,26,10,0.07)",
    }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap" }}>
        <Typography sx={{
          fontSize: "1.1rem", fontWeight: 700, color: C.accent,
          fontFamily: "'Playfair Display', serif",
        }}>
          Recent Submissions
        </Typography>

        <Box onClick={() => route.push("/profile/submissions")} sx={{
          display: "flex", alignItems: "center", gap: 0.5,
          cursor: "pointer", color: C.textSub, fontSize: "0.9rem",
          "&:hover": { color: C.accent },
        }}>
          <Typography sx={{ fontSize: "0.85rem" }}>View all submissions</Typography>
          <ArrowForwardIosRoundedIcon sx={{ fontSize: 12 }} />
        </Box>
      </Box>

      {/* List */}
      <Stack spacing={1}>
        {latest.length === 0 ? (
          <Typography sx={{ color: C.textSub, fontSize: "0.9rem", textAlign: "center", py: 2 }}>
            No submissions yet
          </Typography>
        ) : (
          latest.map((item, idx) => (
            <Box key={item.id} sx={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              px: 2, py: 1.5, borderRadius: 2,
              transition: "all 0.2s ease",
              bgcolor: idx % 2 === 0 ? "transparent" : C.accentHover,
              "&:hover": { background: C.accentHover },
              flexWrap: "wrap",
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, opacity: 0.7, bgcolor: C.accent }} />
                <Typography sx={{ color: C.textPrimary, fontSize: "0.95rem", fontWeight: 500 }}>
                  {item.title}
                </Typography>
              </Box>
              <Typography sx={{ color: C.textSub, fontSize: "0.8rem" }}>
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
