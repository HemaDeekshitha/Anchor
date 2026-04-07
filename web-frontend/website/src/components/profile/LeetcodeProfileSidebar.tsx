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

type ProfileSkill = {
  name: string;
  category: string;
};

type ProfileSectionProps = {
  profile: {
    name?: string;
    email?: string;
    primaryFocus?: string[];
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

  const categories = React.useMemo(() => {
    return Object.entries(groupedSkills);
  }, [groupedSkills]);

  const topSkills = React.useMemo(() => {
    if (!profile?.skills?.length) return [];
    return profile.skills.slice(0, 5);
  }, [profile?.skills]);

  const visibleCategories = showAllSkills ? categories : categories.slice(0, 3);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  return (
    <Card
      sx={{
        width: {
          xs: "100%",
          sm: "100%",
          md: "100%", // 👈 IMPORTANT
          lg: 380, // only fixed on large screens
          borderRadius: 3,
          borderTop: `4px solid ${C.accentFaint}`,
          borderImage: `linear-gradient(to right, ${C.accent}, ${C.accentGold}) 1`,
        },

        flexShrink: 0,

        borderRadius: 3,
        p: 3,

        background: "linear-gradient(135deg,#ffffff,#fff7ed)",
        color: "black",
      }}
    >
      {/* PROFILE HEADER */}

      <Box>
        {/* Top row avatar + name */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
          }}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "#d9d9d9",
              borderRadius: 3,
            }}
            src="/assets/images/pro.jpg"
          />

          <Box>
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
                  fontSize: 20,
                  color: "black",
                  mb: -0.5,
                }}
              >
                {profile?.name || "Guest User"}
              </Typography>
              <Typography
                sx={{
                  color: "grey",
                  fontSize: 14,
                }}
              >
                {profile?.email || "No email provided"}
              </Typography>
            </Box>

            <Box sx={{ mt: 0.5 }}>
              <Typography
                component="span"
                sx={{
                  // fontWeight: 600,
                  fontSize: 14,
                  color: "black",
                }}
              >
                Resume{" "}
              </Typography>
              {profile?.resumeUrl ? (
                <Typography
                  component="a"
                  href="http://localhost:3001/momentum/resume"
                  target="_blank"
                  sx={{
                    color: "rgb(209,112,51)",
                    fontWeight: 600,
                    textDecoration: "none",
                    fontSize: 14,
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {profile.resumeName}
                </Typography>
              ) : profile?.resumeText ? (
                <Typography
                  onClick={() => setOpenResumeText(true)}
                  sx={{
                    color: "rgb(209,112,51)",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  View Resume Text
                </Typography>
              ) : (
                <Typography fontSize={14} color="text.secondary">
                  Upload your resume to unlock AI insights.
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* Focus section */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            mt: 2,
            alignItems: "center",
            fontSize: 14,
            color: "#black",
          }}
        >
          <Typography>Focus</Typography>

          <Typography sx={{ opacity: 0.4 }}>|</Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            {profile?.primaryFocus?.slice(0, 2).map((focus) => (
              <Chip
                key={focus}
                label={focus}
                size="medium"
                sx={{
                  background: "#2a2a2a",
                  color: "#fff",
                  fontWeight: 500,
                  fontSize: 12,
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
                    background: "#1e1e1e",
                    color: "#black",
                    cursor: "pointer",
                  }}
                />
              )
            ) : (
              <Typography fontSize={14} sx={{ color: "rgb(209,112,51)" }}>
                Add your focus
              </Typography>
            )}
          </Box>
        </Box>
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <Box
            sx={{
              p: 2,
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              maxWidth: 300,
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

        {/* Edit profile button */}
        <Button
          fullWidth
          onClick={onEditClick}
          sx={{
            mt: 2.5,
            py: 1.2,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            fontSize: 16,
            background: C.accentGrad,
            color: "#fff",
            boxShadow: "0 0 25px rgba(255,138,61,0.35)",
            "&:hover": {
              background: "linear-gradient(to left, rgb(209,112,51), #E5B526)",
            },
          }}
        >
          Edit Profile
        </Button>

        {/* divider */}
        <Box
          sx={{
            mt: 3,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        />
      </Box>

      {/* CAREER PROFILE */}

      <Typography fontWeight={700} mb={1}>
        Career Profile
      </Typography>

      <Stack spacing={1}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography fontSize={13} color="gray">
            Status
          </Typography>
          <Typography fontSize={14}>
            {profile?.status?.length
              ? profile.status.join(", ")
              : "No status set yet"}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography fontSize={13} color="gray">
            Seeking
          </Typography>
          <Typography fontSize={14}>
            {profile?.employmentType?.length
              ? profile.employmentType.join(", ")
              : "Open to all employment opportunities"}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography fontSize={13} color="gray">
            Location
          </Typography>
          <Typography fontSize={14}>Fremont, CA</Typography>
        </Box>
      </Stack>
      <Divider sx={{ my: 3, borderColor: "#2a2a2a" }} />

      {/* PREFERRED ROLES */}

      <Typography fontWeight={700} mb={1}>
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
                background: "#f5f5f5",
                color: "rgba(0,0,0,0.70)",
                border: "1px solid rgba(0,0,0,0.07)",
                borderRadius: "6px",
              }}
            />
          ))
        ) : (
          <Typography fontSize={14} sx={{ color: "rgb(209,112,51)" }}>
            Add your preferred roles so we can personalize your preparation
            plan.
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 3, borderColor: "#2a2a2a" }} />

      {/* INDUSTRY INTERESTS */}

      <Typography fontWeight={700} mb={1}>
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
                background: "#f5f5f5",
                color: "rgba(0,0,0,0.70)",
                border: "1px solid rgba(0,0,0,0.07)",
                borderRadius: "6px",
              }}
            />
          ))
        ) : (
          <Typography fontSize={14} sx={{ color: "rgb(209,112,51)" }}>
            Choose areas you're curious about to guide your learning path.
          </Typography>
        )}
      </Box>

      {/* SKILLS */}
      {/* SKILLS */}
      {(profile?.skills?.length ?? 0) > 0 && (
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
            <Typography fontWeight={700} color="black">
              Skills
            </Typography>
            <Typography fontSize={12} sx={{ color: C.textSub }}>
              {profile?.skills?.length} total
            </Typography>
          </Box>

          {/* TOP SKILLS */}
          {topSkills.length > 0 && (
            <Box mb={2.5}>
              <Typography
                fontSize={11}
                fontWeight={700}
                sx={{
                  color: C.textSub,
                  mb: 1,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                Top Skills
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {topSkills.map((skill) => (
                  <Chip
                    key={skill.name}
                    label={skill.name}
                    size="small"
                    sx={{
                      height: 28,
                      fontSize: 12,
                      fontWeight: 600,
                      background: C.accentBg,
                      color: C.accent,
                      border: `1px solid ${C.accentBorder}`,
                      borderRadius: "8px",
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* SKILLS BY CATEGORY */}
          {visibleCategories.map(([category, skills]) => (
            <Box key={category} mb={2}>
              {/* category label with colored dot */}
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

              {/* skill chips */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.65 }}>
                {skills.map((skill) => (
                  <Chip
                    key={skill.name}
                    label={skill.name}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: 12,
                      fontWeight: 500,
                      background: "#f5f5f5",
                      color: "rgba(0,0,0,0.70)",
                      border: "1px solid rgba(0,0,0,0.07)",
                      borderRadius: "6px",
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

          {/* SHOW MORE */}
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
      )}
    </Card>
  );
}
