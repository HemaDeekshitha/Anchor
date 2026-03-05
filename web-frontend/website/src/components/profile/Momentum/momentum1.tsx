"use client";

import LayoutWithSidebar from "@/components/SideBar/LayoutWithSidebar";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  Button,
  Chip,
  DialogTitle,
  DialogContent,
  Dialog,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import LogoutIcon from "@mui/icons-material/Logout";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useEffect, useState } from "react";
import { BarChart } from "@mui/x-charts";

type ActivityItem = {
  id: number;
  title: string;
  description: string;
  timestamp: string;
};

type AnalyticsMetric = {
  label: string;
  value: string | number;
  change: number;
};

type SimpleBar = {
  label: string;
  value: number;
};

const milestones = [
  {
    id: 1,
    title: "Solved 5 LeetCode Mediums",
    progress: "Arrays, Hashing, Sliding Window",
    completed: true,
  },
  {
    id: 2,
    title: "Applied to 10+ roles",
    progress: "Frontend Developer at Stripe, Vercel, Linear",
    completed: true,
  },
  {
    id: 3,
    title: "React Hooks mastery",
    progress: "Completed useEffect, useCallback modules",
    completed: true,
  },
  {
    id: 4,
    title: "System Design basics",
    progress: "2/4 videos • LRU Cache, Rate Limiter",
    completed: false,
  },
  {
    id: 5,
    title: "Mock behavioral interview",
    progress: "Schedule with mentor this Friday",
    completed: false,
  },
];

const metrics: AnalyticsMetric[] = [
  { label: "Total Sessions (30d)", value: 124, change: 12.4 },
  { label: "Avg. Session Length", value: "18m 32s", change: 4.1 },
  { label: "Profile Views", value: 892, change: -3.7 },
  { label: "Actions per Session", value: 6.3, change: 2.2 },
];

const weeklyActivity: SimpleBar[] = [
  { label: "Mon", value: 4 },
  { label: "Tue", value: 7 },
  { label: "Wed", value: 5 },
  { label: "Thu", value: 9 },
  { label: "Fri", value: 6 },
  { label: "Sat", value: 3 },
  { label: "Sun", value: 2 },
];

const jobPrepMetrics = [
  { label: "LeetCode Solved", value: "12", change: 25 },
  { label: "Tasks Completed", value: "18/25", change: 18 },
  { label: "Applications Sent", value: "8", change: 33 },
  { label: "Study Hours", value: "14h 32m", change: 18 },
];

const deadlinesData = [
  {
    group: "TODAY",
    count: 2,
    items: ["LeetCode Contest • 6:00 PM", "Stripe Application • 11:59 PM"],
  },
  {
    group: "TOMORROW",
    count: 3,
    items: [
      "Mock Interview • 2:00 PM",
      "LinkedIn Post • Anytime",
      "Vercel Application • 5:00 PM",
    ],
  },
];

export default function DashboardPage() {
  const maxBarValue = Math.max(...weeklyActivity.map((b) => b.value));
  const [profile, setProfile] = useState<any>(null);
  const [openResumeText, setOpenResumeText] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("http://localhost:3001/momentum/profile", {
          credentials: "include",
        });

        const data = await res.json();
        console.log("PROFILE DATA:", data);

        setProfile(data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    }

    fetchProfile();
  }, []);

  return (
    <LayoutWithSidebar>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top nav / header */}
        <Box
          component="header"
          sx={{
            px: { xs: 2, md: 3 },
            py: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "background.paper",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            User Dashboard
          </Typography>
        </Box>

        {/* Main content */}
        <Box
          component="main"
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2.5,
            px: { xs: 2, md: 3 },
            py: 3,
          }}
        >
          {/* Left column: profile + activity */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {/* Profile card */}
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
                  background:
                    "linear-gradient(to left, rgb(209, 112, 51), #E5B526)",
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
                  background:
                    "linear-gradient(to left, rgb(209, 112, 51), #E5B526)",
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
                      bgcolor:
                        "linear-gradient(to left, rgb(209, 112, 51), #E5B526)",
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
                      color: "text.primary",
                      fontWeight: 500,
                      lineHeight: 1.5,
                    }}
                  >
                    Weekly recap: you moved forward on key skills and stayed
                    aligned with your career goals.
                  </Typography>
                </Box>

                {/* Onboarding data grid */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                    animation: "fadeInUp 0.8s ease-out 0.2s both",
                  }}
                >
                  {/* skills */}
                  <Box sx={{ pt: 2 }}>
                    <Typography
                      variant="caption"
                      textTransform="uppercase"
                      sx={{
                        fontWeight: 600,
                        letterSpacing: 0.5,
                        color: "text.primary",
                      }}
                    >
                      Skills
                    </Typography>

                    <Box>
                      {profile?.skills?.length ? (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {profile.skills.map((skill: string) => (
                            <Chip
                              key={skill}
                              label={skill}
                              size="small"
                              sx={{
                                bgcolor: "rgba(209,112,51,0.1)",
                                color: "rgb(209,112,51)",
                                fontWeight: 500,
                              }}
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Upload your resume to extract skills automatically.
                        </Typography>
                      )}
                    </Box>
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
                        <Typography variant="body2" color="text.secondary">
                          Set your focus to guide your momentum
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Recent activity */}
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 20px 40px rgba(209, 112, 51, 0.15)",
                border: "1px solid rgba(209, 112, 51, 0.1)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  background:
                    "linear-gradient(to left, rgb(209, 112, 51), #E5B526)",
                },
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 30px 60px rgba(209, 112, 51, 0.25)",
                },
              }}
            >
              {/* Gradient header bar */}
              <Box
                sx={{
                  height: 6,
                  background:
                    "linear-gradient(to left, rgb(209, 112, 51), #E5B526)",
                  opacity: 0.95,
                }}
              />

              <CardHeader
                sx={{
                  px: 3,
                  pt: 3,
                  "& .MuiCardHeader-title": {
                    fontWeight: 700,
                    background:
                      "linear-gradient(to right, rgb(209, 112, 51), #E5B526)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  },
                  "& .MuiCardHeader-subheader": {
                    color: "rgb(209, 112, 51)",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                  },
                }}
                title="Weekly Milestones"
                subheader="3 of 5 key achievements this week"
              />

              <Divider
                sx={{
                  mx: 3,
                  background:
                    "linear-gradient(to right, rgb(209, 112, 51), #E5B526)",
                  height: 2,
                }}
              />

              <CardContent sx={{ p: 0 }}>
                <List disablePadding>
                  {milestones.map((milestone, idx) => (
                    <Box
                      key={milestone.id}
                      sx={{
                        animationDelay: `${idx * 100 + 200}ms`,
                        animation: "fadeInUp 0.6s ease-out forwards",
                      }}
                    >
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          px: 3,
                          py: 2.5,
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "rgba(209, 112, 51, 0.08)",
                            transform: milestone.completed
                              ? "scale(1.02)"
                              : "translateX(6px)",
                          },
                        }}
                      >
                        {/* Status icon */}
                        <Box
                          sx={{
                            mr: 2.5,
                            mt: 0.5,
                            width: 40,
                            height: 40,
                            borderRadius: 3,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 18,
                            fontWeight: 800,
                            transition: "all 0.4s ease",
                            ...(milestone.completed
                              ? {
                                  bgcolor: "rgba(209, 112, 51, 0.15)", // ← Light orange tint
                                  color: "rgb(209, 112, 51)", // ← Brand color checkmark
                                  borderColor: "rgba(209, 112, 51, 0.4)",
                                  boxShadow:
                                    "0 4px 12px rgba(209, 112, 51, 0.2)",
                                  transform: "scale(1.05)",
                                }
                              : {
                                  bgcolor: "rgba(209, 112, 51, 0.08)", // ← Very subtle orange
                                  color: "rgb(209, 112, 51)",
                                  borderColor: "rgba(209, 112, 51, 0.15)",
                                  "&:hover": {
                                    bgcolor: "rgba(209, 112, 51, 0.12)",
                                  },
                                }),
                          }}
                        >
                          {milestone.completed ? "✓" : "○"}
                        </Box>

                        <ListItemText
                          primary={
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 700,
                                ...(milestone.completed
                                  ? {
                                      color: "rgb(209, 112, 51)", // ← Brand orange
                                      background:
                                        "linear-gradient(to right, rgb(209, 112, 51), #E5B526)", // ← Brand gradient
                                      WebkitBackgroundClip: "text",
                                      WebkitTextFillColor: "transparent",
                                      backgroundClip: "text",
                                    }
                                  : { color: "rgb(209, 112, 51)" }),
                              }}
                            >
                              {milestone.title}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="body2"
                              sx={{
                                mt: 0.25,
                                fontWeight: 500,
                                ...(milestone.completed
                                  ? { color: "rgb(209, 112, 51)" }
                                  : { color: "text.primary" }),
                              }}
                            >
                              {milestone.progress}
                              {milestone.completed && (
                                <Box
                                  component="span"
                                  sx={{
                                    ml: 1.5,
                                    px: 1.5,
                                    py: 0.25,
                                    bgcolor: "rgba(209, 112, 51, 0.15)",
                                    color: "#059669",
                                    borderRadius: 1.5,
                                    fontSize: "0.7rem",
                                    fontWeight: 700,
                                  }}
                                >
                                  DONE
                                </Box>
                              )}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {idx < milestones.length - 1 && (
                        <Divider
                          sx={{
                            mx: 3,
                            background:
                              "linear-gradient(to right, transparent, rgba(209, 112, 51, 0.2), transparent)",
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </List>
              </CardContent>
            </Card>

            {/* 3. Application Funnel */}
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 20px 40px rgba(209, 112, 51, 0.15)",
                border: "1px solid rgba(209, 112, 51, 0.1)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  background:
                    "linear-gradient(to left, rgb(209, 112, 51), #E5B526)",
                },
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 30px 60px rgba(209, 112, 51, 0.25)",
                },
              }}
            >
              {/* Gradient header bar */}
              <Box
                sx={{
                  height: 6,
                  background:
                    "linear-gradient(to left, rgb(209, 112, 51), #E5B526)",
                  opacity: 0.95,
                }}
              />

              <CardHeader
                sx={{
                  px: 3,
                  pt: 3,
                  "& .MuiCardHeader-title": {
                    fontWeight: 700,
                    background:
                      "linear-gradient(to right, rgb(209, 112, 51), #E5B526)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  },
                }}
                title="Upcoming Deadlines"
                subheader="Don't miss these important dates"
              />

              <Divider
                sx={{
                  mx: 3,
                  background:
                    "linear-gradient(to right, rgb(209, 112, 51), #E5B526)",
                  height: 2,
                }}
              />

              <CardContent sx={{ px: 3, pb: 3 }}>
                {deadlinesData.map((deadlineGroup, groupIdx) => (
                  <Box key={groupIdx} sx={{ mb: 3 }}>
                    {/* Group header */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1.5,
                      }}
                    >
                      <Chip
                        label={`${deadlineGroup.count}`}
                        size="small"
                        sx={{
                          bgcolor: "rgb(209, 112, 51)",
                          color: "white",
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          height: 24,
                          minWidth: 32,
                        }}
                      />
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: "rgb(209, 112, 51)" }}
                      >
                        {deadlineGroup.group}
                      </Typography>
                    </Box>

                    {/* Deadline items */}
                    {deadlineGroup.items.map((item, itemIdx) => (
                      <Box
                        key={itemIdx}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          p: 2,
                          bgcolor: "rgba(209, 112, 51, 0.05)",
                          borderRadius: 2,
                          border: "1px solid rgba(209, 112, 51, 0.1)",
                          mb: 1.5,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: "rgba(209, 112, 51, 0.1)",
                            transform: "translateX(4px)",
                          },
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item}
                        </Typography>
                        <Chip
                          label="URGENT"
                          size="small"
                          sx={{
                            bgcolor: "#fef3c7",
                            color: "rgb(209, 112, 51)",
                            fontWeight: 600,
                            fontSize: "0.65rem",
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Box>

          {/* Right column: analytics */}
          <Box
            sx={{
              flex: 1.1,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {/* 2. Today's Priority Task */}
            <Card
              sx={{
                borderRadius: 3,
                bgcolor: "rgba(209, 112, 51, 0.05)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                p: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: " #E5B526",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                    }}
                  >
                    🔥
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ letterSpacing: 0.5 }}
                    >
                      TODAY'S TOP PRIORITY
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, lineHeight: 1.4, mt: 0.5 }}
                    >
                      System Design:{" "}
                      <Box component="span" sx={{ color: "text.primary" }}>
                        LRU Cache
                      </Box>
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  size="medium"
                  sx={{
                    bgcolor: "rgb(209, 112, 51)",
                    "&:hover": { bgcolor: "#e5b526" },
                    fontWeight: 600,
                    textTransform: "none",
                  }}
                >
                  Start Now
                </Button>
              </Box>
            </Card>

            {/* Analytics cards */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {jobPrepMetrics.map((metric) => {
                const isPositive = metric.change >= 0;

                return (
                  <Card
                    key={metric.label}
                    sx={{
                      flex: "1 1 200px",
                      borderRadius: 3,
                      minWidth: 200,
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="caption"
                        color="text.primary"
                        textTransform="uppercase"
                      >
                        {metric.label}
                      </Typography>
                      <Typography variant="h5" mt={0.5} mb={1}>
                        {metric.value}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        {isPositive ? (
                          <ArrowUpwardIcon
                            fontSize="small"
                            sx={{ color: "rgb(209, 112, 51)" }}
                          />
                        ) : (
                          <ArrowDownwardIcon
                            fontSize="small"
                            sx={{ color: "#ef4444" }}
                          />
                        )}
                        <Typography
                          variant="body2"
                          sx={{
                            color: isPositive ? "rgb(209, 112, 51)" : "#ef4444",
                            fontWeight: 600,
                          }}
                        >
                          {Math.abs(metric.change)}%{" "}
                          {isPositive ? "vs last week" : "drop vs last week"}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>

            {/* Weekly Activity with MUI X BarChart */}
            <Card sx={{ borderRadius: 3, mt: 1 }}>
              <CardHeader
                title="Weekly Activity"
                subheader="Tasks completed per day (last 7 days)"
                action={
                  <Chip
                    label="Last 7 days"
                    size="small"
                    variant="outlined"
                    sx={{
                      color: "rgb(209, 112, 51)",
                      borderColor: "rgba(209, 112, 51, 0.3)",
                      "& .MuiChip-label": { fontWeight: 500 },
                    }}
                  />
                }
              />
              <CardContent>
                <BarChart
                  height={220}
                  borderRadius={8}
                  yAxis={[
                    {
                      width: 0, // 👈 remove left axis space
                    },
                  ]}
                  xAxis={[
                    {
                      data: weeklyActivity.map((d) => d.label),
                      scaleType: "band",
                    },
                  ]}
                  series={[
                    {
                      data: weeklyActivity.map((d) => d.value),
                      label: "Tasks",

                      color: " #E5B526",
                    },
                  ]}
                  margin={{ top: 16, right: 12, bottom: 32, left: 40 }}
                  sx={{
                    width: "100%",

                    "& .MuiChartsAxis-line": {
                      display: "none",
                    },
                    "& .MuiChartsAxis-tick": {
                      display: "none",
                    },
                    "& .MuiChartsGrid-line": {
                      display: "none",
                    },
                    "& .MuiChartsContainer-root": {
                      "& defs": {
                        "& linearGradient#orangeGradient": {
                          x1: "0%",
                          y1: "0%",
                          x2: "100%",
                          y2: "100%",
                          gradientUnits: "userSpaceOnUse",
                        },
                        "& stop[offset='0%']": {
                          stopColor: "rgb(209, 112, 51)",
                        },
                        "& stop[offset='100%']": {
                          stopColor: "#E5B526",
                        },
                      },
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  color="text.primary"
                  sx={{ mt: 1, display: "block" }}
                >
                  Peak usage on Thursday with {maxBarValue} sessions.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
        <Dialog
          open={openResumeText}
          onClose={() => setOpenResumeText(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Resume</DialogTitle>

          <DialogContent>
            <Typography
              sx={{
                whiteSpace: "pre-line",
                fontSize: 14,
              }}
            >
              {profile?.resumeText}
            </Typography>
          </DialogContent>
        </Dialog>
      </Box>
    </LayoutWithSidebar>
  );
}
