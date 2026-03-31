import {
  Avatar,
  Box,
  Card,
  Chip,
  Divider,
  CircularProgress,
  IconButton,
  Modal,
  Tooltip,
  Typography,
  Fade,
  Backdrop,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import React from "react";
import CloseIcon from "@mui/icons-material/Close";

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
    skills?: ProfileSkill[];
  };
  weeklyRecap: string;
  setOpenResumeText: React.Dispatch<React.SetStateAction<boolean>>;
  onSkillsRefreshed?: () => void;
};

export default function ProfileSection({
  profile,
  weeklyRecap,
  setOpenResumeText,
  onSkillsRefreshed,
}: ProfileSectionProps) {
  const [openSkillsModal, setOpenSkillsModal] = React.useState(false);
  const [resyncing, setResyncing] = React.useState(false);

  const handleResyncSkills = async () => {
    setResyncing(true);
    try {
      await fetch("http://localhost:3001/momentum/resync-skills", {
        method: "POST",
        credentials: "include",
      });
      onSkillsRefreshed?.();
    } catch (err) {
      console.error("Failed to resync skills", err);
    } finally {
      setResyncing(false);
    }
  };

  const skillsCount = profile?.skills?.length ?? 0;

  const groupedSkills = React.useMemo(() => {
    if (!profile?.skills) return {};

    return profile.skills.reduce(
      (acc: Record<string, ProfileSkill[]>, skill) => {
        const category = skill.category || "other";

        if (!acc[category]) acc[category] = [];

        acc[category].push(skill);

        return acc;
      },
      {}
    );
  }, [profile?.skills]);

  return (
    <>
      <Card
        sx={{
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 2px 10px rgba(15,23,42,0.04)",
          overflow: "hidden",
        }}
      >
        {/* PROFILE HEADER */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            px: 3,
            py: 2.5,
          }}
        >
          <Avatar
            sx={{
              width: 56,
              height: 56,
              fontWeight: 700,
            }}
            src="/assets/images/pro.jpg"
          />

          <Box sx={{ flex: 1 }}>
            <Typography fontWeight={700} fontSize={18}>
              {profile?.name || "Complete your profile"}
            </Typography>

            <Typography fontSize={14} color="text.secondary" sx={{ mt: 0.3 }}>
              {profile?.email || "Add your email"}
            </Typography>
          </Box>

          <Chip
            label="Job Seeker"
            size="small"
            sx={{
              fontWeight: 600,
              bgcolor: "rgba(209,112,51,0.1)",
              color: "rgb(209,112,51)",
            }}
          />

          <IconButton size="small">
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider />

        {/* WEEKLY RECAP */}
        <Box sx={{ px: 3, py: 2 }}>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: "rgb(209,112,51)",
            }}
          >
            {weeklyRecap ||
              "Complete your today's plan to unlock streaks and rewards"}
          </Typography>
        </Box>
        {/* Skills */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography
              variant="caption"
              textTransform="uppercase"
              sx={{ fontWeight: 600, letterSpacing: 0.5 }}
            >
              Skills
            </Typography>
            <Tooltip title="Re-extract skills from resume">
              <IconButton
                size="small"
                onClick={handleResyncSkills}
                disabled={resyncing}
                sx={{ p: 0.3, color: "rgb(209,112,51)" }}
              >
                {resyncing ? (
                  <CircularProgress
                    size={12}
                    sx={{ color: "rgb(209,112,51)" }}
                  />
                ) : (
                  <RefreshIcon sx={{ fontSize: 14 }} />
                )}
              </IconButton>
            </Tooltip>
          </Box>
          <Divider />
          {/* SKILLS */}
          <Box sx={{ px: 3, py: 2 }}>
            <Typography
              sx={{
                fontSize: 12,
                textTransform: "uppercase",
                fontWeight: 700,
                letterSpacing: 0.5,
                color: "text.secondary",
                mb: 1,
              }}
            >
              Skills
            </Typography>
            {skillsCount > 5 && (
              <Typography
                onClick={() => setOpenSkillsModal(true)}
                sx={{
                  mt: 1.5,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "rgb(209,112,51)",
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                + {skillsCount - 5} more skills
              </Typography>
            )}
          </Box>
          ) : (
          <Typography variant="body2" color="text.secondary">
            Upload your resume to extract skills automatically.
          </Typography>
          )
        </Box>

        {/* resume */}
        <Box>
          <Typography
            variant="caption"
            textTransform="uppercase"
            sx={{
              fontWeight: 600,
              letterSpacing: 0.5,
              color: "text.primary",
            }}
          >
            Resume
          </Typography>

          <Box>
            {profile?.resumeUrl ? (
              <Typography
                component="a"
                href="http://localhost:3001/momentum/resume"
                target="_blank"
                sx={{
                  color: "rgb(209,112,51)",
                  fontWeight: 600,
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                {profile.resumeName}
              </Typography>
            ) : profile?.resumeText ? (
              // CASE 2: Resume TEXT provided
              <Typography
                onClick={() => setOpenResumeText(true)}
                sx={{
                  color: "rgb(209,112,51)",
                  fontWeight: 600,
                  textDecoration: "none",
                  cursor: "pointer",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                View Resume Text
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Upload your resume to unlock personalized AI insights.
              </Typography>
            )}
          </Box>
        </Box>
        {/* focus */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="caption"
              textTransform="uppercase"
              sx={{
                fontWeight: 600,
                letterSpacing: 0.5,
                color: "text.primary",
              }}
            >
              Focus
            </Typography>
          </Box>

          {profile?.skills?.length ? (
            <>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                {profile.skills.slice(0, 6).map((skill) => (
                  <Chip
                    key={skill.name}
                    label={skill.name}
                    size="small"
                    sx={{
                      bgcolor: "rgba(209,112,51,0.08)",
                      color: "rgb(209,112,51)",
                      fontWeight: 500,
                      border: "1px solid rgba(209,112,51,0.2)",
                    }}
                  />
                ))}
              </Box>

              {skillsCount > 6 && (
                <Typography
                  onClick={() => setOpenSkillsModal(true)}
                  sx={{
                    mt: 1,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "rgb(209,112,51)",
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  + {skillsCount - 6} more skills
                </Typography>
              )}
            </>
          ) : (
            <Typography fontSize={14} color="text.secondary">
              Upload your resume to extract skills automatically.
            </Typography>
          )}
        </Box>

        <Divider />

        {/* RESUME */}
        <Box sx={{ px: 3, py: 2 }}>
          <Typography
            sx={{
              fontSize: 12,
              textTransform: "uppercase",
              fontWeight: 700,
              letterSpacing: 0.5,
              color: "text.secondary",
              mb: 1,
            }}
          >
            Resume
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

        <Divider />

        {/* FOCUS */}
        <Box sx={{ px: 3, py: 2 }}>
          <Typography
            sx={{
              fontSize: 12,
              textTransform: "uppercase",
              fontWeight: 700,
              letterSpacing: 0.5,
              color: "text.secondary",
              mb: 1,
            }}
          >
            Focus
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            {profile?.primaryFocus?.length ? (
              profile.primaryFocus.map((focus: string) => (
                <Chip
                  key={focus}
                  label={focus}
                  size="small"
                  sx={{
                    bgcolor: "rgba(209,112,51,0.12)",
                    color: "rgb(209,112,51)",
                    fontWeight: 600,
                    border: "1px solid rgba(209,112,51,0.25)",
                  }}
                />
              ))
            ) : (
              <Typography fontSize={14} color="text.secondary">
                Set your focus to guide your momentum
              </Typography>
            )}
          </Box>
        </Box>
      </Card>

      {/* SKILLS MODAL */}

      <Modal
        open={openSkillsModal}
        onClose={() => setOpenSkillsModal(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 300,
            sx: {
              backdropFilter: "blur(6px)",
              backgroundColor: "rgba(0,0,0,0.3)",
            },
          },
        }}
      >
        <Fade in={openSkillsModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 520,
              maxHeight: "75vh",
              bgcolor: "white",
              borderRadius: 3,
              boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* HEADER */}
            <Box
              sx={{
                px: 3,
                py: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <Typography fontWeight={700} fontSize={18}>
                Skills ({skillsCount})
              </Typography>

              <IconButton
                onClick={() => setOpenSkillsModal(false)}
                sx={{
                  bgcolor: "rgba(0,0,0,0.04)",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* CONTENT */}

            <Box
              sx={{
                px: 3,
                py: 2,
                overflowY: "auto",
              }}
            >
              {Object.entries(groupedSkills).map(([category, skills]) => (
                <Box key={category} sx={{ mb: 3 }}>
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: "text.secondary",
                      mb: 1,
                      letterSpacing: 0.6,
                    }}
                  >
                    {category}
                  </Typography>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {skills.map((skill) => (
                      <Chip
                        key={skill.name}
                        label={skill.name}
                        size="small"
                        sx={{
                          bgcolor: "rgba(209,112,51,0.08)",
                          color: "rgb(209,112,51)",
                          border: "1px solid rgba(209,112,51,0.18)",
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Fade>
      </Modal>
    </>
  );
}
