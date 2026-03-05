"use client";

import LayoutWithSidebar from "@/components/SideBar/LayoutWithSidebar";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
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

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useEffect, useState } from "react";
import { BarChart } from "@mui/x-charts";
import ProfileSection from "./profileSection";
import RecentActivity from "./recentActivity";
import ApplicationFunnel from "./ApplicationFunnel";
import AnalyticsCard from "./AnalyticsCard";
import WeeklyActivity from "./WeeklyActivity";

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

// const milestones = [
//   {
//     id: 1,
//     title: "Solved 5 LeetCode Mediums",
//     progress: "Arrays, Hashing, Sliding Window",
//     completed: true,
//   },
//   {
//     id: 2,
//     title: "Applied to 10+ roles",
//     progress: "Frontend Developer at Stripe, Vercel, Linear",
//     completed: true,
//   },
//   {
//     id: 3,
//     title: "React Hooks mastery",
//     progress: "Completed useEffect, useCallback modules",
//     completed: true,
//   },
//   {
//     id: 4,
//     title: "System Design basics",
//     progress: "2/4 videos • LRU Cache, Rate Limiter",
//     completed: false,
//   },
//   {
//     id: 5,
//     title: "Mock behavioral interview",
//     progress: "Schedule with mentor this Friday",
//     completed: false,
//   },
// ];

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
  const [milestones, setMilestones] = useState<any[]>([]);
  const topPriorityTask = milestones.find((task) => !task.completed);
  const allMilestonesCompleted =
    milestones.length > 0 && milestones.every((task) => task.completed);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [profileRes, milestonesRes] = await Promise.all([
          fetch("http://localhost:3001/momentum/profile", {
            credentials: "include",
          }),
          fetch("http://localhost:3001/rag/milestones", {
            credentials: "include",
          }),
        ]);

        const profileData = await profileRes.json();
        const milestonesData = await milestonesRes.json();

        setProfile(profileData);
        setMilestones(milestonesData.tasks || []);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    }

    loadDashboardData();
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
            <ProfileSection
              profile={profile}
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
            <AnalyticsCard jobPrepMetrics={jobPrepMetrics} />

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
