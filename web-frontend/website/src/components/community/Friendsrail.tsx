"use client";

import React from "react";
import {
  Box,
  Card,
  Stack,
  Avatar,
  Chip,
  Divider,
  Typography,
} from "@mui/material";
import { CommunityFriendRequest } from "@/lib/community-api";
import { C } from "./constants";
import { Friend } from "./Types";

// Compact sidebar panel that replaces the old "Friends" tab for quick
// glancing. Full search, add/cancel, and accept/decline flows still live in
// FriendsView, reachable via "Manage friends" below.
const FriendsRail = ({
  friends,
  friendRequests,
  onManage,
}: {
  friends: Friend[];
  friendRequests: CommunityFriendRequest[];
  onManage: () => void;
}) => {
  const currentFriends = friends
    .filter((friend) => friend.isFriend)
    .slice(0, 5);

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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: "1.05rem",
            fontWeight: 700,
            color: C.accent,
            fontFamily: "'Playfair Display', serif",
          }}
        >
          Friends
        </Typography>
        <Chip
          label="Manage"
          size="small"
          onClick={onManage}
          sx={{
            bgcolor: C.accentFaint,
            color: C.accentDark,
            fontWeight: 700,
            fontSize: "0.7rem",
            cursor: "pointer",
          }}
        />
      </Box>

      {friendRequests.length > 0 && (
        <Box
          onClick={onManage}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            px: 1.5,
            py: 1,
            mb: 1.5,
            borderRadius: 2,
            bgcolor: C.accentFaint,
            cursor: "pointer",
            "&:hover": { bgcolor: C.accentHover },
          }}
        >
          <Typography
            sx={{ fontSize: "0.82rem", fontWeight: 600, color: C.accentDark }}
          >
            {friendRequests.length}{" "}
            {friendRequests.length === 1
              ? "pending request"
              : "pending requests"}
          </Typography>
          <Typography
            sx={{ fontSize: "0.75rem", color: C.accentDark, fontWeight: 700 }}
          >
            Review
          </Typography>
        </Box>
      )}

      <Stack spacing={0} divider={<Divider sx={{ borderColor: C.divider }} />}>
        {currentFriends.map((friend) => (
          <Box
            key={friend.id}
            sx={{ display: "flex", alignItems: "center", gap: 1.3, py: 1.2 }}
          >
            <Avatar
              src={friend.avatarUrl ?? undefined}
              sx={{
                width: 36,
                height: 36,
                bgcolor: C.accentFaint,
                color: C.accentDark,
                fontSize: "0.8rem",
              }}
            >
              {friend.name.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: "0.86rem",
                  fontWeight: 600,
                  color: C.textPrimary,
                }}
              >
                {friend.name}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.74rem",
                  color: C.textMuted,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {friend.handle}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>

      {currentFriends.length === 0 && friendRequests.length === 0 && (
        <Typography
          sx={{
            color: C.textMuted,
            fontSize: "0.82rem",
            textAlign: "center",
            py: 2,
          }}
        >
          Add friends to see them here.
        </Typography>
      )}
    </Card>
  );
};
// T: O(f + r) and S: O(f + r), where f is displayed friends and r is friend requests

export default FriendsRail;
