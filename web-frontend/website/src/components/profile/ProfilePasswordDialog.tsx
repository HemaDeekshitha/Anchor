"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { apiFetch, requireOk } from "@/lib/auth-client";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=]).{8,}$/;

export default function ProfilePasswordDialog({
  open,
  mode,
  email,
  onClose,
}: {
  open: boolean;
  mode: "change" | "forgot";
  email: string;
  onClose: () => void;
}) {
  const [codeSent, setCodeSent] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCodeSent(false);
    setCurrentPassword("");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setMessage("");
  }, [open, mode]);

  const requestCode = async () => {
    setLoading(true); setError(""); setMessage("");
    try {
      const response = await apiFetch(
        mode === "change"
          ? `${API}/auth/password/change/request`
          : `${API}/auth/password/reset/request-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            mode === "change" ? { currentPassword } : { email },
          ),
        },
      );
      await requireOk(response, "Unable to send verification code");
      setCodeSent(true);
      setMessage(`A six-digit verification code was sent to ${email}.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to send verification code");
    } finally { setLoading(false); }
  };

  const savePassword = async () => {
    if (mode === "change" && password === currentPassword) {
      setError("New password must be different from your current password.");
      return;
    }
    if (!strongPassword.test(password)) {
      setError("Use at least 8 characters with uppercase, lowercase, a number, and a symbol.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true); setError("");
    try {
      const response = await apiFetch(
        mode === "change"
          ? `${API}/auth/password/change/confirm`
          : `${API}/auth/password/reset/confirm-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            mode === "change"
              ? { currentPassword, otp, password }
              : { email, otp, password },
          ),
        },
      );
      await requireOk(response, "Unable to update password");
      setMessage("Your password was updated successfully.");
      window.setTimeout(onClose, 900);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to update password");
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={() => !loading && onClose()} PaperProps={{ sx: { borderRadius: 3, width: 440 } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>
        {mode === "change" ? "Change password" : "Forgot password"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {!codeSent && mode === "change" && (
            <TextField label="Current password" type="password" value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)} autoFocus />
          )}
          {!codeSent && mode === "forgot" && (
            <Typography sx={{ color: "#8c6a50" }}>
              We will send a verification code to {email}.
            </Typography>
          )}
          {codeSent && (
            <>
              <Typography sx={{ color: "#8c6a50", fontSize: 14 }}>{message}</Typography>
              <Typography sx={{ color: "#8c6a50", fontSize: 13 }}>
                If you don&apos;t see the email in your inbox, check your spam or junk folder.
              </Typography>
              <TextField label="Verification code" value={otp} autoFocus
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                inputProps={{ inputMode: "numeric", maxLength: 6 }} />
              <TextField label="New password" type="password" value={password}
                onChange={(event) => setPassword(event.target.value)} />
              <TextField label="Confirm new password" type="password" value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)} />
            </>
          )}
          {error && <Typography color="error" fontSize={14}>{error}</Typography>}
          {message === "Your password was updated successfully." && (
            <Typography sx={{ color: "#5f806c", fontSize: 14 }}>{message}</Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        {codeSent && <Button onClick={requestCode} disabled={loading}>Resend code</Button>}
        <Button variant="contained" disabled={loading || (codeSent ? otp.length !== 6 : mode === "change" && !currentPassword)}
          onClick={codeSent ? savePassword : requestCode}>
          {loading ? "Please wait…" : codeSent ? "Verify and update" : "Send code"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
