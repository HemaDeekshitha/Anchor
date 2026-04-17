"use client";
import React, { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import LeetcodeProfileSidebar from "./LeetcodeProfileSidebar";
import LayoutWithSidebar from "../SideBar/LayoutWithSidebar";
import MomentumGraphCard from "./ProfileGraphCard";
import RecentSubmissions from "./RecentSubmission";
import EditProfileModal, { EditableProfile } from "./EditProfile";

export default function momentum() {
  const [profile, setProfile] = useState<any>(null);
  const [openResumeText, setOpenResumeText] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activity, setActivity] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = React.useState("this_week");
  const API = "http://localhost:3001";

  useEffect(() => {
    loadDashboardData();
  }, [period]);

  async function loadDashboardData() {
    try {
      const [profileRes, activityRes, submissionsRes] = await Promise.all([
        fetch(`${API}/momentum/profile`, { credentials: "include" }),
        fetch(`${API}/rag/activity?period=${period}`, {
          credentials: "include",
        }),
        fetch(`${API}/momentum/recent-submissions`, { credentials: "include" }),
      ]);
      setProfile(await profileRes.json());
      setActivity(await activityRes.json());
      setSubmissions(await submissionsRes.json());
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleProfileSave(
    updated: EditableProfile,
    avatarFile: File | null,
    resumeFile: File | null
  ) {
    setSaving(true);
    try {
      if (avatarFile) {
        const fd = new FormData();
        fd.append("file", avatarFile);
        const avatarRes = await fetch(`${API}/momentum/profile/avatar`, {
          method: "POST",
          credentials: "include",
          body: fd,
        });
        console.log("Avatar upload status:", avatarRes.status); // ← add
        const avatarData = await avatarRes.json();
        console.log("Avatar upload response:", avatarData);
      }
      if (resumeFile) {
        const fd = new FormData();
        fd.append("file", resumeFile);
        await fetch(`${API}/momentum/profile/resume`, {
          method: "POST",
          credentials: "include",
          body: fd,
        });
      }
      await fetch(`${API}/momentum/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updated.name,
          email: updated.email,
          primaryFocus: updated.primaryFocus,
          currentStatus: updated.status,
          preferredRole: updated.preferredRoles,
          areasOfInterest: updated.intrests,
          employmentType: updated.employmentType,
          ...(resumeFile ? {} : { resumeText: updated.resumeText }),
        }),
      });
      const fresh = await fetch(`${API}/momentum/profile`, {
        credentials: "include",
      });
      console.log("Fresh fetch status:", fresh.status);
      const freshData = await fresh.json();
      console.log("Fresh profile data:", JSON.stringify(freshData));
      setProfile(freshData);

      setEditOpen(false);
    } catch (err) {
      console.error("Failed to save profile", err);
    } finally {
      setSaving(false);
    }
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
            background: "#ede8e0",
          }}
        >
          <CircularProgress sx={{ color: "#b87444" }} />
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
          // px: { xs: 2, md: 3 }, py: 3,
          background: "#ede8e0",
          color: "#2c1a0a",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 1400,
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", lg: "row" },
            alignItems: "flex-start",
          }}
        >
          <LeetcodeProfileSidebar
            profile={profile}
            setOpenResumeText={setOpenResumeText}
            onEditClick={() => setEditOpen(true)}
          />
          <Box
            sx={{
              flex: 1,
              width: "100%",
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              gap: 0,
              maxWidth: { xs: "100%", md: "100%" },
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

      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        profile={profile ?? {}}
        onSave={handleProfileSave}
        saving={saving}
      />
    </LayoutWithSidebar>
  );
}
