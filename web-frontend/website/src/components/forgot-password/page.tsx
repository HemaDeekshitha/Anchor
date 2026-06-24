"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=]).{8,}$/;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const requestCode = async () => {
    if (!validEmail(email)) return;
    setLoading(true); setError(""); setMessage("");
    try {
      const response = await fetch(`${API}/auth/password/reset/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Unable to send verification code");
      setCodeSent(true);
      setMessage("If an account exists for this email, a six-digit verification code has been sent.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to send verification code");
    } finally { setLoading(false); }
  };

  const resetPassword = async () => {
    setError("");
    if (!strongPassword.test(password)) {
      setError("Use at least 8 characters with uppercase, lowercase, a number, and a symbol.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API}/auth/password/reset/confirm-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Unable to reset password");
      setMessage("Password reset successfully. Redirecting to login…");
      window.setTimeout(() => router.push("/login"), 900);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Unable to reset password");
    } finally { setLoading(false); }
  };

  return (
    <Box minHeight="100vh" display="flex" justifyContent="center" alignItems="center" px={2}
      sx={{ background: "linear-gradient(135deg, #ede8e0, #f8f3ed)" }}>
      <Paper elevation={0} sx={{ width: "100%", maxWidth: 460, p: { xs: 3, sm: 4.5 }, borderRadius: 4,
        border: "1px solid #e8ddd0", boxShadow: "0 24px 60px rgba(44,26,10,.12)" }}>
        <Stack spacing={2.3}>
          <Box textAlign="center">
            <Typography sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 30, color: "#2c1a0a" }}>
              Reset your password
            </Typography>
            <Typography sx={{ color: "#8c6a50", mt: 0.75 }}>
              {codeSent ? "Enter the code and choose a new password." : "We’ll verify your email with a one-time code."}
            </Typography>
          </Box>

          <TextField label="Email address" type="email" value={email} disabled={codeSent}
            onChange={(event) => setEmail(event.target.value)} error={email.length > 0 && !validEmail(email)} />

          {codeSent && (
            <>
              <Typography sx={{ color: "#8c6a50", fontSize: 13 }}>{message}</Typography>
              <Typography sx={{ color: "#8c6a50", fontSize: 13 }}>
                If you don&apos;t see the email in your inbox, check your spam or junk folder.
              </Typography>
              <TextField label="Verification code" value={otp} autoFocus
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                inputProps={{ inputMode: "numeric", maxLength: 6, style: { textAlign: "center", letterSpacing: ".4em" } }} />
              <TextField label="New password" type="password" value={password}
                onChange={(event) => setPassword(event.target.value)} />
              <TextField label="Confirm new password" type="password" value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)} />
            </>
          )}

          {error && <Typography color="error" textAlign="center" fontSize={14}>{error}</Typography>}
          {message.startsWith("Password reset") && (
            <Typography textAlign="center" sx={{ color: "#5f806c", fontSize: 14 }}>{message}</Typography>
          )}

          <Button variant="contained" size="large" disabled={loading || (codeSent ? otp.length !== 6 : !validEmail(email))}
            onClick={codeSent ? resetPassword : requestCode}
            sx={{ bgcolor: "#b87444", textTransform: "none", "&:hover": { bgcolor: "#a0622e" } }}>
            {loading ? "Please wait…" : codeSent ? "Verify and reset password" : "Send verification code"}
          </Button>
          {codeSent && <Button onClick={requestCode} disabled={loading} sx={{ color: "#b87444", textTransform: "none" }}>Resend code</Button>}
          <Typography textAlign="center" fontSize={14}>
            <Link href="/login" style={{ color: "#6f5542", textDecoration: "none" }}>← Back to login</Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
