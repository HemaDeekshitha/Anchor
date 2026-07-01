"use client";
import React, { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import LeetcodeProfileSidebar from "./LeetcodeProfileSidebar";
import LayoutWithSidebar from "../SideBar/LayoutWithSidebar";
import MomentumGraphCard from "./ProfileGraphCard";
import RecentSubmissions from "./RecentSubmission";
import EditProfileModal, { EditableProfile } from "./EditProfile";
import { apiFetch, requireOk } from "@/lib/auth-client";
import ProfilePasswordDialog from "./ProfilePasswordDialog";

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [, setOpenResumeText] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activity, setActivity] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = React.useState("this_week");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpError, setEmailOtpError] = useState("");
  const [profileSaveError, setProfileSaveError] = useState("");
  const [passwordMode, setPasswordMode] = useState<"change" | "forgot" | null>(null);
  const [pendingEmailSave, setPendingEmailSave] = useState<{
    updated: EditableProfile; avatarFile: File | null; resumeFile: File | null; removeAvatar: boolean;
  } | null>(null);
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  useEffect(() => {
    loadDashboardData();
  }, [period]);

  async function loadDashboardData() {
    try {
      const [profileRes, activityRes, submissionsRes] = await Promise.all([
        apiFetch(`${API}/momentum/profile`),
        apiFetch(`${API}/rag/activity?period=${period}`),
        apiFetch(`${API}/momentum/recent-submissions`),
      ]);
      await Promise.all([
        requireOk(profileRes, "Failed to load profile"),
        requireOk(activityRes, "Failed to load activity"),
        requireOk(submissionsRes, "Failed to load submissions"),
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
    resumeFile: File | null,
    removeAvatar: boolean,
    emailAlreadyVerified = false,
  ) {
    setSaving(true);
    setProfileSaveError("");
    try {
      if (!emailAlreadyVerified && updated.email.trim().toLowerCase() !== String(profile?.email ?? "").toLowerCase()) {
        const response = await apiFetch(`${API}/auth/email-change/request`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: updated.email.trim() }),
        });
        await requireOk(response, "Failed to send verification code");
        setPendingEmailSave({ updated, avatarFile, resumeFile, removeAvatar });
        setEmailOtp(""); setEmailOtpError("");
        return;
      }
      if (removeAvatar) {
        const avatarResponse = await apiFetch(`${API}/momentum/profile/avatar`, {
          method: "DELETE",
        });
        await requireOk(avatarResponse, "Failed to remove profile photo");
      } else if (avatarFile) {
        const fd = new FormData();
        fd.append("file", avatarFile);
        const avatarResponse = await apiFetch(`${API}/momentum/profile/avatar`, {
          method: "POST",
          body: fd,
        });
        await requireOk(avatarResponse, "Failed to upload profile photo");
      }

      if (resumeFile) {
        const fd = new FormData();
        fd.append("file", resumeFile);
        const resumeResponse = await apiFetch(`${API}/momentum/profile/resume`, {
          method: "POST",
          body: fd,
        });
        await requireOk(resumeResponse, "Failed to upload resume");
      }

      const updateResponse = await apiFetch(`${API}/momentum/profile`, {
        method: "PATCH",
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
          ...(resumeFile ? {} : { resumeText: updated.resumeText }),
        }),
      });
      await requireOk(updateResponse, "Failed to update profile");

      const freshResponse = await apiFetch(`${API}/momentum/profile`);
      await requireOk(freshResponse, "Failed to refresh profile");
      const freshData = await freshResponse.json();
      setProfile(freshData);
      setEditOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save profile";
      setProfileSaveError(
        message === "Email already in use"
          ? "An account already exists with this email. Please use a different email address."
          : message,
      );
    } finally {
      setSaving(false);
    }
  }

  async function verifyEmailChange() {
    if (!pendingEmailSave || emailOtp.length !== 6) return;
    setSaving(true); setEmailOtpError("");
    try {
      const response = await apiFetch(`${API}/auth/email-change/verify`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: emailOtp }),
      });
      await requireOk(response, "Email verification failed");
      const pending = pendingEmailSave;
      setPendingEmailSave(null);
      await handleProfileSave(pending.updated, pending.avatarFile, pending.resumeFile, pending.removeAvatar, true);
    } catch (error) {
      setEmailOtpError(error instanceof Error ? error.message : "Email verification failed");
    } finally { setSaving(false); }
  }

  async function resendEmailChangeOtp() {
    if (!pendingEmailSave) return;
    setEmailOtpError("");
    try {
      const response = await apiFetch(`${API}/auth/email-change/request`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmailSave.updated.email.trim() }),
      });
      await requireOk(response, "Could not resend verification code");
    } catch (error) {
      setEmailOtpError(error instanceof Error ? error.message : "Could not resend code");
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
          maxWidth: "100%",
          display: "flex",
          justifyContent: "center",
          px: { xs: 1, sm: 2, md: 3 },
          py: { xs: 2, md: 3 },
          overflowX: "hidden",
          boxSizing: "border-box",
          background: "#ede8e0",
          color: "#2c1a0a",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 1400,
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            alignItems: "stretch",
            gap: { xs: 2, lg: 3 },
            minWidth: 0,
            overflowX: "hidden",
          }}
        >
          <LeetcodeProfileSidebar
            profile={profile}
            setOpenResumeText={setOpenResumeText}
            onEditClick={() => {
              setProfileSaveError("");
              setEditOpen(true);
            }}
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
        onClose={() => {
          setProfileSaveError("");
          setEditOpen(false);
        }}
        profile={profile ?? {}}
        onSave={handleProfileSave}
        saving={saving}
        saveError={profileSaveError}
        onChangePassword={() => setPasswordMode("change")}
        onForgotPassword={() => setPasswordMode("forgot")}
      />
      <ProfilePasswordDialog
        open={passwordMode !== null}
        mode={passwordMode ?? "change"}
        email={String(profile?.email ?? "")}
        onClose={() => setPasswordMode(null)}
      />
      <Dialog open={Boolean(pendingEmailSave)} onClose={() => !saving && setPendingEmailSave(null)} PaperProps={{ sx: { borderRadius: 3, width: 430 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Verify your new email</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#8c6a50", mb: 2 }}>
            Enter the six-digit code sent to {pendingEmailSave?.updated.email} before saving this change.
          </Typography>
          <Typography sx={{ color: "#8c6a50", fontSize: 13, mt: -1, mb: 2 }}>
            If you don&apos;t see the email in your inbox, check your spam or junk folder.
          </Typography>
          <TextField fullWidth autoFocus label="Verification code" value={emailOtp}
            onChange={(event) => setEmailOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
            error={Boolean(emailOtpError)} helperText={emailOtpError}
            inputProps={{ inputMode: "numeric", maxLength: 6, style: { textAlign: "center", letterSpacing: "0.45em", fontSize: 21, fontWeight: 700 } }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={resendEmailChangeOtp} disabled={saving}>Resend code</Button>
          <Button onClick={() => setPendingEmailSave(null)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={verifyEmailChange} disabled={emailOtp.length !== 6 || saving}>Verify and save</Button>
        </DialogActions>
      </Dialog>
    </LayoutWithSidebar>
  );
}
