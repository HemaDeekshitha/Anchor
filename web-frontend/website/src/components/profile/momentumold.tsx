"use client";

import LayoutWithSidebar from "@/components/SideBar/LayoutWithSidebar";
import {
  Box,
  Card,
  Typography,
  Button,
  DialogTitle,
  DialogContent,
  Dialog,
  Menu,
  MenuItem,
  Chip,
} from "@mui/material";

import { useEffect, useState } from "react";
import ProfileSection from "./profileSection";
import RecentActivity from "./recentActivity";
import ApplicationFunnel from "./ApplicationFunnel";
import AnalyticsCard from "./AnalyticsCard";
import WeeklyActivity from "./WeeklyActivity";
import { CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import React from "react";

type SimpleBar = {
  label: string;
  value: number;
};

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
  const [profile, setProfile] = useState<any>(null);
  const [weeklyRecap, setWeeklyRecap] = useState<string>("");
  const [openResumeText, setOpenResumeText] = useState(false);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [weeklyActivity, setWeeklyActivity] = useState<SimpleBar[]>([]);
  const [loading, setLoading] = useState(true);
  const topPriorityTask = milestones.find((task) => !task.completed);
  const allMilestonesCompleted =
    milestones.length > 0 && milestones.every((task) => task.completed);
  const router = useRouter();
  const [period, setPeriod] = React.useState("this_week");
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (value: string) => {
    setPeriod(value);
    handleClose();
  };
  const periodLabels: Record<string, string> = {
    this_week: "This Week",
    last_week: "Last Week",
    month: "This Month",
    all_time: "All Time",
  };

  const jobPrepMetrics = analytics
    ? [
        {
          label: "LeetCode Solved",
          value: analytics.dsaSolved,
          lastWeek: analytics.dsaSolvedLastWeek,
          change: calculateChange(
            analytics.dsaSolved,
            analytics.dsaSolvedLastWeek
          ),
        },
        {
          label: "Tasks Completed",
          value: `${analytics.tasksCompleted}`,
          lastWeek: analytics.tasksCompletedLastWeek,
          change: calculateChange(
            analytics.tasksCompleted,
            analytics.tasksCompletedLastWeek
          ),
        },
        {
          label: "Applications Sent",
          value: analytics.applicationsSent,
          lastWeek: analytics.applicationsLastWeek,
          change: calculateChange(
            analytics.applicationsSent,
            analytics.applicationsLastWeek
          ),
        },

        {
          label: "Momentum Streak",
          value: `${analytics.streak} Day Streak`,
          change: 0,
        },
      ]
    : [];

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [profileRes, recapRes, milestonesRes, analyticsRes, weeklyRes] =
          await Promise.all([
            fetch("http://localhost:3001/momentum/profile", {
              credentials: "include",
            }),
            fetch("http://localhost:3001/rag/weekly-recap", {
              credentials: "include",
            }),
            fetch("http://localhost:3001/rag/milestones", {
              credentials: "include",
            }),
            fetch(`http://localhost:3001/rag/analytics?period=${period}`, {
              credentials: "include",
            }),
            fetch("http://localhost:3001/rag/weekly-activity", {
              credentials: "include",
            }),
          ]);

        const profileData = await profileRes.json();
        const weeklyRecapData = await recapRes.json();
        const milestonesData = await milestonesRes.json();
        const analyticsData = await analyticsRes.json();
        const weeklyData = await weeklyRes.json();

        setProfile(profileData);
        setWeeklyRecap(weeklyRecapData.recap);
        setMilestones(milestonesData.tasks || []);
        setAnalytics(analyticsData);
        setWeeklyActivity(weeklyData.weeklyActivity);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [period]);

  function calculateChange(current: number, previous: number) {
    if (previous === 0) {
      return current === 0 ? 0 : 100;
    }

    return Math.round(((current - previous) / previous) * 100);
  }

  if (loading) {
    return (
      <LayoutWithSidebar>
        <Box
          sx={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress sx={{ color: "rgb(209,112,51)" }} />
        </Box>
      </LayoutWithSidebar>
    );
  }

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
            <ProfileSection
              profile={profile}
              weeklyRecap={weeklyRecap}
              setOpenResumeText={setOpenResumeText}
            />

            {/* Recent activity */}
            <RecentActivity milestones={milestones} />

            {/* 3. Application Funnel */}
            <ApplicationFunnel deadlinesData={deadlinesData} />
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
                      {allMilestonesCompleted
                        ? " Congrats! You finished today's priority task."
                        : topPriorityTask
                        ? topPriorityTask.title
                        : "Loading priority task..."}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  size="medium"
                  disabled={!topPriorityTask}
                  onClick={() => router.push("/dashboard")}
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
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography fontWeight={700} fontSize={18}>
                  Progress Overview
                </Typography>

                <Chip
                  label={periodLabels[period]}
                  onClick={handleOpen}
                  deleteIcon={
                    <KeyboardArrowDownRoundedIcon
                      sx={{
                        color: "rgb(209,112,51)",
                        fontSize: 20,
                      }}
                    />
                  }
                  onDelete={handleOpen}
                  sx={{
                    fontWeight: 600,
                    bgcolor: "rgba(209,112,51,0.08)",
                    color: "rgb(209,112,51)",
                    border: "1px solid rgba(209,112,51,0.25)",
                    px: 0.5,
                    "&:hover": {
                      bgcolor: "rgba(209,112,51,0.15)",
                    },
                    "& .MuiChip-deleteIcon": {
                      ml: 0.5,
                      mr: -0.3,
                    },
                  }}
                />

                <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                  <MenuItem onClick={() => handleSelect("this_week")}>
                    This Week
                  </MenuItem>

                  <MenuItem onClick={() => handleSelect("last_week")}>
                    Last Week
                  </MenuItem>

                  <MenuItem onClick={() => handleSelect("month")}>
                    This Month
                  </MenuItem>

                  <MenuItem onClick={() => handleSelect("all_time")}>
                    All Time
                  </MenuItem>
                </Menu>
              </Box>
              {/* Analytics cards */}
              {analytics && (
                <AnalyticsCard
                  jobPrepMetrics={jobPrepMetrics}
                  rewards={analytics?.rewards}
                  pointsEarned={analytics.pointsEarned}
                  pointsEarnedLastWeek={analytics.pointsEarnedLastWeek}
                />
              )}
            </Box>

            {/* Weekly Activity with MUI X BarChart */}
            <WeeklyActivity weeklyActivity={weeklyActivity} />
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
