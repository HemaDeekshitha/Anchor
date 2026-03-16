import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Modal,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import Fade from "@mui/material/Fade";
import Backdrop from "@mui/material/Backdrop";

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
};

export default function ProfileSection({
  profile,
  weeklyRecap,
  setOpenResumeText,
}: ProfileSectionProps) {
  const [showAllSkills, setShowAllSkills] = React.useState(false);
  const [openSkillsModal, setOpenSkillsModal] = React.useState(false);

  const skillsCount = profile?.skills?.length ?? 0;

  const groupedSkills = React.useMemo(() => {
    if (!profile?.skills) return {};

    return profile.skills.reduce(
      (acc: Record<string, ProfileSkill[]>, skill) => {
        const category = skill.category || "other";

        if (!acc[category]) {
          acc[category] = [];
        }

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
          boxShadow: "0 20px 40px rgba(209, 112, 51, 0.15)",
          border: "1px solid rgba(209, 112, 51, 0.1)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(to left, rgb(209, 112, 51), #E5B526)",
          },
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: "0 30px 60px rgba(209, 112, 51, 0.25)",
          },
        }}
      >
        {/* Decorative top gradient bar */}
        <Box
          sx={{
            height: 6,
            background: "linear-gradient(to left, rgb(209, 112, 51), #E5B526)",
            opacity: 0.9,
          }}
        />

        <CardHeader
          sx={{ px: 3, pt: 3 }}
          avatar={
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: "linear-gradient(to left, rgb(209, 112, 51), #E5B526)",
                color: "white",
                fontWeight: 700,
                fontSize: "1.25rem",
                boxShadow: "0 12px 24px rgba(209, 112, 51, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0 16px 32px rgba(209, 112, 51, 0.4)",
                },
              }}
              src="/assets/images/pro.jpg"
            >
              JD
            </Avatar>
          }
          action={
            <IconButton
              aria-label="edit profile"
              sx={{
                bgcolor: "rgba(209, 112, 51, 0.1)",
                color: "rgb(209, 112, 51)",
                "&:hover": {
                  bgcolor: "rgba(209, 112, 51, 0.2)",
                  transform: "rotate(90deg)",
                },
              }}
            >
              <EditIcon />
            </IconButton>
          }
          title={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  background:
                    "linear-gradient(to right, rgb(209, 112, 51), #E5B526)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {profile?.name || "Complete your profile"}
              </Typography>
              <Chip
                label="Job Seeker"
                size="small"
                sx={{
                  bgcolor: "rgba(209, 112, 51, 0.15)",
                  color: "rgb(209, 112, 51)",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              />
            </Box>
          }
          subheader={
            <Typography
              variant="body1"
              sx={{
                color: "rgb(209, 112, 51)",
                fontWeight: 500,
                mt: 0.5,
                fontSize: "0.95rem",
              }}
            >
              {profile?.email || "Add your email in profile settings"}
            </Typography>
          }
        />

        <CardContent sx={{ px: 3, pb: 3 }}>
          {/* Weekly progress summary */}
          <Box
            sx={{
              // mb: 3,
              p: 2,
              bgcolor: "rgba(209, 112, 51, 0.08)",
              borderRadius: 2,
              border: "1px solid rgba(209, 112, 51, 0.12)",
              animation: "fadeInUp 0.6s ease-out",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                position: "relative",
                borderRadius: 2,
                padding: "12px 16px",
                fontWeight: 600,
                fontSize: 14,
                overflow: "hidden",

                background:
                  "linear-gradient(to right, rgb(209,112,51), #E5B526)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",

                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "-50%",
                  width: "200%",
                  height: "100%",
                  background:
                    "linear-gradient(120deg, rgba(209,112,51,0) 0%, rgba(209,112,51,0.2) 50%, rgba(209,112,51,0) 100%)",
                  animation: "shine 3s infinite",
                  borderRadius: 2,
                },

                "@keyframes pulse": {
                  "0%": { transform: "scale(1)" },
                  "50%": { transform: "scale(1.02)" },
                  "100%": { transform: "scale(1)" },
                },

                animation: "pulse 2s infinite",
              }}
            >
              {weeklyRecap ||
                "Complete your today's plan to unlock streaks and rewards"}
            </Typography>
          </Box>

          {/* Onboarding data grid */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              animation: "fadeInUp 0.8s ease-out 0.2s both",
              pt: 2,
            }}
          >
            {/* Skills */}
            <Box>
              <Typography
                variant="caption"
                textTransform="uppercase"
                sx={{
                  fontWeight: 600,
                  letterSpacing: 0.5,
                }}
              >
                Skills
              </Typography>

              {profile?.skills?.length ? (
                <Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {profile.skills.slice(0, 5).map((skill) => (
                      <Chip
                        key={skill.name}
                        label={skill.name}
                        size="small"
                        sx={{
                          mt: 0.5,
                          bgcolor: "rgba(209,112,51,0.1)",
                          color: "rgb(209,112,51)",
                          fontWeight: 500,
                        }}
                      />
                    ))}
                  </Box>

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
                      + {skillsCount} skills
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Upload your resume to extract skills automatically.
                </Typography>
              )}
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

              <Box
                sx={{
                  pt: 1,
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
                        bgcolor: "rgba(209,112,51,0.15)",
                        color: "rgb(209,112,51)",
                        fontWeight: 600,
                        border: "1px solid rgba(209,112,51,0.3)",
                      }}
                    />
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: -1 }}
                  >
                    Set your focus to guide your momentum
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

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
            {/* Header */}
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
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                Skills ({skillsCount})
              </Typography>

              <IconButton
                onClick={() => setOpenSkillsModal(false)}
                sx={{
                  bgcolor: "rgba(0,0,0,0.04)",
                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.08)",
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Scrollable content */}
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
                      mb: 1.2,
                      letterSpacing: 0.6,
                    }}
                  >
                    {category}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    {skills.map((skill) => (
                      <Chip
                        key={skill.name}
                        label={skill.name}
                        size="small"
                        sx={{
                          bgcolor: "rgba(209,112,51,0.08)",
                          color: "rgb(209,112,51)",
                          fontWeight: 500,
                          border: "1px solid rgba(209,112,51,0.18)",
                          "&:hover": {
                            bgcolor: "rgba(209,112,51,0.15)",
                          },
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
