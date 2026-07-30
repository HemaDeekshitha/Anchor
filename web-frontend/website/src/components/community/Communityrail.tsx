"use client";

import React, { useState } from "react";
import { Box, Card, Stack, Chip, Divider, Typography } from "@mui/material";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import { C, ALL_ID } from "./constants";
import { Community } from "./Types";

// Compact sidebar panel that replaces the old "Communities" tab for quick
// switching. Selecting a joined community switches the feed to it; selecting
// one you haven't joined joins it first. Full discover/create flows still
// live in CommunitiesView, reachable via "Manage communities" below.
const CommunityRail = ({
  communities,
  activeCommunityId,
  onSelect,
  onJoin,
  onManage,
}: {
  communities: Community[];
  activeCommunityId: string;
  onSelect: (communityId: string) => void;
  onJoin: (communityId: string) => Promise<void>;
  onManage: () => void;
}) => {
  const [joiningId, setJoiningId] = useState("");
  const isAllView = activeCommunityId === ALL_ID;
  const joined = communities.filter((community) => community.joined);
  const suggestions = communities.filter((community) => !community.joined);
  const visible = [...joined, ...suggestions].slice(0, 6);

  const handleRowClick = async (community: Community) => {
    if (!community.joined) {
      if (joiningId) return;
      setJoiningId(community.id);
      try {
        await onJoin(community.id);
      } finally {
        setJoiningId("");
      }
    }
    onSelect(community.id);
  };
  // T: O(1) network request and S: O(1)

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
          Communities
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

      <Stack spacing={0}>
        <Box
          onClick={() => onSelect(ALL_ID)}
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
              Posts from everywhere you&apos;ve joined
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ borderColor: C.divider }} />

        {visible.map((community, idx) => {
          const isCurrent = community.id === activeCommunityId;
          return (
            <React.Fragment key={community.id}>
              <Box
                onClick={() => handleRowClick(community)}
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
                      opacity: joiningId === community.id ? 0.6 : 1,
                    }}
                  >
                    {joiningId === community.id ? "Joining…" : "Join"}
                  </Box>
                )}
              </Box>
              {idx < visible.length - 1 && (
                <Divider sx={{ borderColor: C.divider }} />
              )}
            </React.Fragment>
          );
        })}

        {visible.length === 0 && (
          <Typography
            sx={{
              color: C.textMuted,
              fontSize: "0.82rem",
              textAlign: "center",
              py: 2,
            }}
          >
            No communities yet — create one to get started.
          </Typography>
        )}
      </Stack>
    </Card>
  );
};
// T: O(c) and S: O(c), where c is the number of communities

export default CommunityRail;
