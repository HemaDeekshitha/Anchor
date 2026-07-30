"use client";

import React from "react";
import { Box, Avatar, Chip, Button, Typography } from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import { C } from "./constants";
import { Friend } from "./Types";

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

export default FriendRow;
