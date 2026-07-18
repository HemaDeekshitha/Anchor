"use client";

import React, { useState } from "react";
import {
  Avatar,
  Box,
  Card,
  Typography,
  Button,
  Divider,
  Chip,
  Stack,
  Popover,
} from "@mui/material";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// ── Anchor palette tokens ────────────────────────────────────────────────────
const C = {
  accent: "#b87444",
  accentDark: "#a0622e",
  accentBg: "rgba(184,116,68,0.08)",
  accentBorder: "rgba(184,116,68,0.15)",
  accentFaint: "rgba(184,116,68,0.10)",
  accentHover: "rgba(184,116,68,0.06)",
  accentSelected: "rgba(184,116,68,0.13)",
  accentGrad: "linear-gradient(to right, #b87444, #a0622e)",
  cardBg: "#ffffff",
  surface: "#fdfaf7",
  divider: "#e8ddd0",
  textPrimary: "#2c1a0a",
  textSub: "#8c6a50",
  textMuted: "#b8a090",
} as const;

type ProfileSkill = { name: string; category: string };

type ProfileSectionProps = {
  profile: {
    name?: string;
    email?: string;
    primaryFocus?: string[];
    avatarUrl?: string | null;
    resumeName?: string | null;
    resumeUrl?: string | null;
    resumeText?: string | null;
    preferredRoles?: string[];
    status?: string[];
    intrests?: string[];
    employmentType?: string[];
    skills?: ProfileSkill[];
  };
  weeklyRecap?: string;
  setOpenResumeText: React.Dispatch<React.SetStateAction<boolean>>;
  onEditClick: () => void;
};

const categoryColors: Record<string, string> = {
  ai: "#c084fc",
  frontend: "#34d399",
  backend: "#fbbf24",
  database: "#60a5fa",
  devops: "#22d3ee",
  cloud: "#38bdf8",
  tools: "#a1a1aa",
};

export default function LeetcodeProfileSidebar({
  profile,
  setOpenResumeText,
  onEditClick,
}: ProfileSectionProps) {
  const [showAllSkills, setShowAllSkills] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const formatCategoryLabel = (category: string) => {
    if (!category) return "Other";
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  };

  const groupedSkills = React.useMemo(() => {
    if (!profile?.skills?.length) return {};
    return profile.skills.reduce(
      (acc: Record<string, ProfileSkill[]>, skill) => {
        const category = skill.category?.trim().toLowerCase() || "other";
        if (!acc[category]) acc[category] = [];
        acc[category].push(skill);
        return acc;
      },
      {}
    );
  }, [profile?.skills]);

  const categories = React.useMemo(
    () => Object.entries(groupedSkills),
    [groupedSkills]
  );
  const visibleCategories = showAllSkills ? categories : categories.slice(0, 3);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  return (
    <Card
      sx={{
        width: {
          xs: "100%",
          lg: 380,
        },
        minWidth: 0,
        flexShrink: 1,
        alignSelf: "flex-start",
        boxSizing: "border-box",
        borderRadius: 3,
        padding: { xs: 2, md: 2 },
        overflow: "hidden",
        background: "linear-gradient(135deg, #ffffff, #fdfaf7)",
        border: `1px solid ${C.divider}`,
        borderTop: `4px solid ${C.accent}`,
        boxShadow: "0 4px 20px rgba(44,26,10,0.06)",
      }}
    >
      {/* PROFILE HEADER */}
      <Box>
        {/* Avatar + name row */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "flex-start",
            flexDirection: { xs: "column", sm: "row" },
            width: "100%",
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          <Avatar
            src={profile?.avatarUrl ?? undefined}
            sx={{
              width: 76,
              height: 76,
              bgcolor: C.accentBg,
              color: C.accent,
              fontSize: 28,
              fontWeight: 700,
              borderRadius: 3,
              border: `2px solid ${C.accentBorder}`,
            }}
          >
            {!profile?.avatarUrl && (profile?.name?.[0]?.toUpperCase() || null)}
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
                gap: 0,
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "1.25rem",
                  color: C.textPrimary,
                  mb: -0.5,
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                }}
              >
                {profile?.name || "Guest User"}
              </Typography>
              <Typography sx={{ color: C.textSub, fontSize: "clamp(14px, 0.95vw, 17px)", wordBreak: "break-word", overflowWrap:"anywhere"}}>
                {profile?.email || "No email provided"}
              </Typography>
            </Box>

            <Box sx={{ mt: 0.5 }}>
              <Typography
                component="span"
                sx={{ fontSize: "clamp(14px, 1vw, 17px)", color: C.textPrimary }}
              >
                Resume{" "}
              </Typography>
              {profile?.resumeUrl ? (
                <Typography
                  component="a"
                  href={`${API_BASE_URL}/momentum/resume`}
                  target="_blank"
                  sx={{
                    color: C.accent,
                    fontWeight: 600,
                    textDecoration: "none",
                    fontSize: "clamp(14px, 1vw, 17px)",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {profile.resumeName}
                </Typography>
              ) : profile?.resumeText ? (
                <Typography
                  onClick={() => setOpenResumeText(true)}
                  sx={{
                    color: C.accent,
                    fontWeight: 600,
                    fontSize: "clamp(14px, 1vw, 17px)",
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  View Resume Text
                </Typography>
              ) : (
                <Typography fontSize="0.95rem" sx={{ color: C.textSub }}>
                  Upload your resume to unlock AI insights.
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* Focus */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            mt: 2,
            alignItems: "center",
            fontSize: 14,
          }}
        >
          <Typography sx={{ color: C.textPrimary }}>Focus</Typography>
          <Typography sx={{ opacity: 0.4, color: C.textSub }}>|</Typography>
          <Box sx={{ display: "flex", gap: 1,flexWrap: "wrap",minWidth: 0, }}>
            {profile?.primaryFocus?.slice(0, 2).map((focus) => (
              <Chip
                key={focus}
                label={focus}
                size="medium"
                sx={{
                  background: C.accentBg,
                  color: C.accent,
                  border: `1px solid ${C.accentBorder}`,
                  fontWeight: 500,
                  fontSize: 12,
                  borderRadius: "8px",
                }}
              />
            ))}
            {profile?.primaryFocus?.length ? (
              (profile?.primaryFocus?.length ?? 0) > 2 && (
                <Chip
                  label={`+${(profile?.primaryFocus?.length ?? 0) - 2}`}
                  size="small"
                  onClick={handleOpen}
                  sx={{
                    background: C.accentBg,
                    color: C.accent,
                    border: `1px solid ${C.accentBorder}`,
                    cursor: "pointer",
                  }}
                />
              )
            ) : (
              <Typography fontSize="0.95rem" sx={{ color: C.accent }}>
                Add your focus
              </Typography>
            )}
          </Box>
        </Box>

        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Box
            sx={{
              p: 2,
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              maxWidth: 300,
              background: "#ffffff",
              border: `1px solid ${C.divider}`,
            }}
          >
            {profile?.primaryFocus?.map((focus) => (
              <Chip
                key={focus}
                label={focus}
                size="small"
                sx={{
                  background: C.accentBg,
                  color: C.accent,
                  border: `1px solid ${C.accentBorder}`,
                  fontWeight: 600,
                  fontSize: 12,
                  borderRadius: "8px",
                }}
              />
            ))}
          </Box>
        </Popover>

        {/* Edit button */}
        <Button
          fullWidth
          onClick={onEditClick}
          sx={{
            mt: 2.5,
            py: 1.25,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.95rem",
            background: C.accentGrad,
            color: "#fff",
            boxShadow: "0 0 25px rgba(184,116,68,0.25)",
            "&:hover": {
              background: "linear-gradient(to left, #b87444, #a0622e)",
              boxShadow: "0 0 30px rgba(184,116,68,0.35)",
            },
          }}
        >
          Edit Profile
        </Button>

        <Box sx={{ mt: 3, borderBottom: `1px solid ${C.divider}` }} />
      </Box>

      {/* CAREER PROFILE */}
      <Typography
        fontWeight={700}
        fontSize="clamp(18px, 1.2vw, 24px)"
        mb={1}
        sx={{ color: C.textPrimary, fontFamily: "'Playfair Display', serif" }}
      >
        Career Profile
      </Typography>
      <Stack spacing={1}>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, flexWrap: "wrap",}}>
          <Typography fontSize="clamp(13px, 0.9vw, 16px)" sx={{ color: C.textSub }}>
            Status
          </Typography>
          <Typography fontSize="clamp(14px, 1vw, 17px)" sx={{ color: C.textPrimary ,textAlign: "right",wordBreak: "break-word",overflowWrap: "anywhere",maxWidth: "70%", }}>
            {profile?.status?.length
              ? profile.status.join(", ")
              : "No status set yet"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, flexWrap: "wrap",}}>
          <Typography fontSize="clamp(13px, 0.9vw, 16px)" sx={{ color: C.textSub }}>
            Seeking
          </Typography>
          <Typography fontSize="clamp(14px, 1vw, 17px)" sx={{ color: C.textPrimary ,textAlign: "right",wordBreak: "break-word",overflowWrap: "anywhere",maxWidth: "70%", }}>
            {profile?.employmentType?.length
              ? profile.employmentType.join(", ")
              : "Open to all opportunities"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, flexWrap: "wrap",}}>
          <Typography fontSize="clamp(13px, 0.9vw, 16px)" sx={{ color: C.textSub }}>
            Location
          </Typography>
          <Typography fontSize="clamp(14px, 1vw, 17px)" sx={{ color: C.textPrimary ,textAlign: "right",wordBreak: "break-word",overflowWrap: "anywhere",maxWidth: "70%", }}>
            {(profile as any)?.location || "Not specified"}
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ my: 3, borderColor: C.divider }} />

      {/* PREFERRED ROLES */}
      <Typography
        fontWeight={700}
        fontSize="1.05rem"
        mb={1}
        sx={{ color: C.textPrimary, fontFamily: "'Playfair Display', serif" }}
      >
        Preferred Roles
      </Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
        {(profile?.preferredRoles?.length ?? 0) > 0 ? (
          profile?.preferredRoles?.map((role) => (
            <Chip
              key={role}
              label={role}
              size="small"
              sx={{
                height: 26,
                fontSize: 12,
                fontWeight: 500,
                background: C.surface,
                color: C.textPrimary,
                border: `1px solid ${C.divider}`,
                borderRadius: "6px",
                "&:hover": {
                  background: C.accentBg,
                  color: C.accent,
                  border: `1px solid ${C.accentBorder}`,
                },
                transition: "all 0.15s",
              }}
            />
          ))
        ) : (
          <Typography fontSize="clamp(14px, 1vw, 17px)" sx={{ color: C.accent }}>
            Add your preferred roles so we can personalize your preparation
            plan.
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 3, borderColor: C.divider }} />

      {/* INDUSTRY INTERESTS */}
      <Typography
        fontWeight={700}
        fontSize="1.05rem"
        mb={1}
        sx={{ color: C.textPrimary, fontFamily: "'Playfair Display', serif" }}
      >
        Industry Interests
      </Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
        {(profile?.intrests?.length ?? 0) > 0 ? (
          profile?.intrests?.map((intrest) => (
            <Chip
              key={intrest}
              label={intrest}
              size="small"
              sx={{
                height: 26,
                fontSize: 12,
                fontWeight: 500,
                background: C.surface,
                color: C.textPrimary,
                border: `1px solid ${C.divider}`,
                borderRadius: "6px",
                "&:hover": {
                  background: C.accentBg,
                  color: C.accent,
                  border: `1px solid ${C.accentBorder}`,
                },
                transition: "all 0.15s",
              }}
            />
          ))
        ) : (
          <Typography fontSize="clamp(14px, 1vw, 17px)" sx={{ color: C.accent }}>
            Choose areas you're curious about to guide your learning path.
          </Typography>
        )}
      </Box>

      {/* SKILLS */}
      {/* {(profile?.skills?.length ?? 0) > 0 && (
        <>
          <Divider sx={{ my: 3, borderColor: C.divider }} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              fontWeight={700}
              fontSize="1.05rem"
              sx={{
                color: C.textPrimary,
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Skills
            </Typography>
            <Typography fontSize={12} sx={{ color: C.textSub }}>
              {profile?.skills?.length} total
            </Typography>
          </Box>

          {visibleCategories.map(([category, skills]) => (
            <Box key={category} mb={2}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}
              >
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: categoryColors[category] ?? C.accent,
                    boxShadow: `0 0 6px ${
                      categoryColors[category] ?? C.accent
                    }60`,
                  }}
                />
                <Typography
                  fontSize={11}
                  fontWeight={700}
                  sx={{
                    color: C.textSub,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                  }}
                >
                  {formatCategoryLabel(category)}
                </Typography>
                <Typography fontSize={11} sx={{ color: C.textMuted }}>
                  · {skills.length}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.65, minWidth: 0, width: "100%" }}>
                {skills.map((skill) => (
                  <Chip
                    key={skill.name}
                    label={skill.name}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: 12,
                      fontWeight: 500,
                      maxWidth: "100%",
                      background: C.surface,
                      color: C.textPrimary,
                      border: `1px solid ${C.divider}`,
                      borderRadius: "6px",
                      "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" },
                      "&:hover": {
                        background: C.accentBg,
                        color: C.accent,
                        border: `1px solid ${C.accentBorder}`,
                      },
                      transition: "all 0.15s",
                    }}
                  />
                ))}
              </Box>
            </Box>
          ))}

          {categories.length > 3 && (
            <Box
              onClick={() => setShowAllSkills(!showAllSkills)}
              sx={{
                mt: 1,
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                fontSize: 13,
                fontWeight: 600,
                color: C.accent,
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {showAllSkills
                ? "Show less ↑"
                : `Show ${categories.length - 3} more categories ↓`}
            </Box>
          )}
        </>
      )} */}
    </Card>
  );
}
