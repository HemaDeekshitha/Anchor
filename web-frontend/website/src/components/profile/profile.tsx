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
  const [editOpen, setEditOpen] = useState(false); // ← add
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
        fetch(`${API}/momentum/profile`, {
          credentials: "include",
        }),
        fetch(`${API}/rag/activity?period=${period}`, {
          credentials: "include",
        }),

        fetch(`${API}/momentum/recent-submissions`, {
          credentials: "include",
        }),
      ]);

      const profileData = await profileRes.json();
      const activityData = await activityRes.json();
      const submissionsData = await submissionsRes.json();

      setProfile(profileData);
      setActivity(activityData);
      setSubmissions(Array.isArray(submissionsData) ? submissionsData : []);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  }
  // ── Save handler ────────────────────────────────────────────────────────────
  async function handleProfileSave(
    updated: EditableProfile,
    avatarFile: File | null,
    resumeFile: File | null,
    removeAvatar: boolean
  ) {
    setSaving(true);
    try {
      // 1a. Remove avatar if requested
      if (removeAvatar && !avatarFile) {
        await fetch(`${API}/momentum/profile/avatar`, {
          method: "DELETE",
          credentials: "include",
        });
      }

      // 1b. Upload new avatar if changed (backend deletes the old one automatically)
      if (avatarFile) {
        const fd = new FormData();
        fd.append("file", avatarFile);
        await fetch(`${API}/momentum/profile/avatar`, {
          method: "POST",
          credentials: "include",
          body: fd,
        });
      }

      // 2. Upload resume file if changed
      if (resumeFile) {
        const fd = new FormData();
        fd.append("file", resumeFile);
        await fetch(`${API}/momentum/profile/resume`, {
          method: "POST",
          credentials: "include",
          body: fd,
        });
      }

      // 3. Patch text fields
      await fetch(`${API}/momentum/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updated.name,
          email: updated.email,
          location: updated.location,
          primaryFocus: updated.primaryFocus,
          currentStatus: updated.status,
          preferredRole: updated.preferredRoles,
          areasOfInterest: updated.intrests,
          employmentType: updated.employmentType,
          // only send resumeText if no file was uploaded
          ...(resumeFile ? {} : { resumeText: updated.resumeText }),
        }),
      });

      // 4. Refresh profile from server
      const fresh = await fetch(`${API}/momentum/profile`, {
        credentials: "include",
      });
      setProfile(await fresh.json());
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
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", md: "row" },
          alignItems: "flex-start",
          width: "100%",
          boxSizing: "border-box",
          color: "black",
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
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 0,
            width: 0, // forces flex to respect minWidth:0 boundary
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
