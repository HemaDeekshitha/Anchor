"use client";
import React, { useEffect, useState } from "react";

import { Box, CircularProgress } from "@mui/material";
import LeetcodeProfileSidebar from "./NewVersion/LeetcodeProfileSidebar";
import LayoutWithSidebar from "../SideBar/LayoutWithSidebar";
import { useRouter } from "next/navigation";

import MomentumGraphCard from "./NewVersion/MomentumGraphCard";
import TaskHeatmap from "./NewVersion/TaskHeatMap";

type SimpleBar = {
  label: string;
  value: number;
};

export default function momentum() {
  const [profile, setProfile] = useState<any>(null);
  const [openResumeText, setOpenResumeText] = useState(false);
  const [activity, setActivity] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [weeklyActivity, setWeeklyActivity] = useState<SimpleBar[]>([]);
  const [loading, setLoading] = useState(true);

  const allMilestonesCompleted =
    milestones.length > 0 && milestones.every((task) => task.completed);
  const router = useRouter();
  const [period, setPeriod] = React.useState("this_week");
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

  function calculateChange(current: number, previous: number) {
    if (previous === 0) {
      return current === 0 ? 0 : 100;
    }

    return Math.round(((current - previous) / previous) * 100);
  }

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [
          profileRes,
          activityRes,
          milestonesRes,
          analyticsRes,
          weeklyRes,
        ] = await Promise.all([
          fetch("http://localhost:3001/momentum/profile", {
            credentials: "include",
          }),
          fetch(`http://localhost:3001/rag/activity?period=${period}`, {
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
        const activityData = await activityRes.json();
        const milestonesData = await milestonesRes.json();
        const analyticsData = await analyticsRes.json();
        const weeklyData = await weeklyRes.json();

        setProfile(profileData);
        setActivity(activityData);
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
          width: "100%",
          display: "flex",
          justifyContent: "center",
          px: { xs: 2, md: 3 },
          py: 3,
          background: "transparent",

          color: "black",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 1400,

            display: "flex",
            gap: 2,

            flexDirection: {
              xs: "column",
              lg: "row", // 🔥 ONLY switch at large screens
            },

            alignItems: "flex-start",
          }}
        >
          <LeetcodeProfileSidebar
            profile={profile}
            // weeklyRecap={weeklyRecap}
            setOpenResumeText={setOpenResumeText}
          />

          <Box
            sx={{
              flex: 1,
              width: "100%", // 🔥 ADD THIS
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              gap: 3,
              maxWidth: {
                xs: "100%",
                md: "100%",
              },
            }}
          >
            <MomentumGraphCard
              data={activity?.data || []}
              period={period}
              setPeriod={setPeriod}
            />
            <TaskHeatmap />
          </Box>
        </Box>
      </Box>
    </LayoutWithSidebar>
  );
}
