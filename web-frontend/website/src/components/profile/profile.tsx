"use client";
import React, { useEffect, useState } from "react";

import { Box, CircularProgress } from "@mui/material";
import LeetcodeProfileSidebar from "./LeetcodeProfileSidebar";
import LayoutWithSidebar from "../SideBar/LayoutWithSidebar";

import MomentumGraphCard from "./ProfileGraphCard";
import RecentSubmissions from "./RecentSubmission";

export default function momentum() {
  const [profile, setProfile] = useState<any>(null);
  const [openResumeText, setOpenResumeText] = useState(false);
  const [activity, setActivity] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = React.useState("this_week");

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [profileRes, activityRes, submissionsRes] = await Promise.all([
          fetch("http://localhost:3001/momentum/profile", {
            credentials: "include",
          }),
          fetch(`http://localhost:3001/rag/activity?period=${period}`, {
            credentials: "include",
          }),

          fetch("http://localhost:3001/momentum/recent-submissions", {
            credentials: "include",
          }),
        ]);

        const profileData = await profileRes.json();
        const activityData = await activityRes.json();
        const submissionsData = await submissionsRes.json(); // 👈 add

        setProfile(profileData);
        setActivity(activityData);

        setSubmissions(submissionsData);
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
              gap: 0,
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
            <RecentSubmissions submissions={submissions} />
          </Box>
        </Box>
      </Box>
    </LayoutWithSidebar>
  );
}
