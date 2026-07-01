"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Box,
  Stack,
  TextField,
  Button,
  Typography,
  Divider,
  Paper,
  Link,
  InputAdornment,
  IconButton,
} from "@mui/material";

// Images
import googleIcon from "../../../public/assets/images/google.png";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,}$/;

  const isStrongPassword = (password: string) => passwordRegex.test(password);

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [emailExists, setEmailExists] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [otp, setOtp] = useState("");

  const router = useRouter();

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const nameError = touched.name && !form.name;
  const emailError =
    touched.email && (!form.email || !isValidEmail(form.email));
  const passwordError = touched.password && !isStrongPassword(form.password);
  const confirmPasswordError =
    touched.confirmPassword &&
    (!form.confirmPassword || form.confirmPassword !== form.password);

  const isFormValid =
    form.name &&
    isValidEmail(form.email) &&
    !emailExists &&
    isStrongPassword(form.password) &&
    form.password === form.confirmPassword;

  const handleChange = (field: string) => (e: { target: { value: any } }) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleBlur = (field: string) => () => {
    setTouched({ ...touched, [field]: true });
  };

  const checkEmailExists = async (email: string) => {
    if (!isValidEmail(email)) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/auth/check-email?email=${email}`
      );
      const data = await res.json();
      setEmailExists(data.exists);
    } catch {
      setEmailExists(false);
    }
  };

  const handleSignup = async () => {
    if (!isFormValid) return;
    setLoading(true);
    setApiError("");
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");
      setAwaitingOtp(true);
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) return;
    setLoading(true); setApiError("");
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup/verify-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ email: form.email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed");
      router.push("/steps");
    } catch (err: any) { setApiError(err.message); } finally { setLoading(false); }
  };

  const resendOtp = async () => {
    setApiError("");
    const res = await fetch(`${API_BASE_URL}/auth/signup/resend-otp`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setApiError(data.message || "Could not resend code");
  };

  // ─── Shared TextField sx (Anchor palette) ───────────────────────────────────
  const textFieldSx = {
    borderRadius: 1,
    "& .MuiInputLabel-root": { color: "#8c6a50" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#b87444" },
    "& .MuiInputLabel-root.Mui-error": { color: "#b45309" },
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      "& fieldset": { borderColor: "#e8ddd0" },
      "&:hover fieldset": { borderColor: "#b87444" },
      "&.Mui-focused fieldset": { borderColor: "#b87444", borderWidth: 1 },
      "& .MuiOutlinedInput-input": {
        "&:-webkit-autofill": {
          WebkitBoxShadow: "0 0 0 1000px #fdfaf7 inset",
          WebkitTextFillColor: "#2c1a0a",
          caretColor: "#2c1a0a",
        },
        "&:-webkit-autofill:hover": {
          WebkitBoxShadow: "0 0 0 1000px #fdfaf7 inset",
        },
        "&:-webkit-autofill:focus": {
          WebkitBoxShadow: "0 0 0 1000px #fdfaf7 inset",
        },
        "&:-webkit-autofill:active": {
          WebkitBoxShadow: "0 0 0 1000px #fdfaf7 inset",
        },
      },
    },
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection={{ xs: "column", md: "row" }}
    >
      {/* ── LEFT PANEL ── */}
      <Box
        flex={0.5}
        sx={{
          background: "#f5ede0",
          borderRight: "1px solid #e8ddd0",
          padding: "80px 80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* LOGO ROW */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Box
            sx={{
              width: 36, height: 36,
              background: "#b87444",
              borderRadius: "9px",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="13" width="14" height="2.5" rx="1.2" fill="white" />
              <rect x="3" y="8.5" width="14" height="2.5" rx="1.2" fill="white" opacity="0.7" />
              <rect x="3" y="4" width="14" height="2.5" rx="1.2" fill="white" opacity="0.4" />
            </svg>
          </Box>
          <Typography sx={{ fontFamily: "'Playfair Display', serif", fontSize: 40, color: "#2c1a0a", fontWeight: 400 }}>
            Anchor
          </Typography>
        </Box>

        {/* MIDDLE — Welcome text + tagline */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", py: 4 }}>
          <Typography sx={{ fontFamily: "'Playfair Display', serif", fontSize:  { xs: 42, sm: 52, md: 72 } , fontWeight: 400, color: "#2c1a0a", lineHeight: 1.15 }}>
            Welcome to
          </Typography>
          <Typography sx={{ fontFamily: "'Playfair Display', serif", fontSize:   { xs: 42, sm: 52, md: 72 } , fontWeight: 700, color: "#b87444", fontStyle: "italic", lineHeight: 1.15 }}>
            Anchor
          </Typography>
          <Typography sx={{ fontSize:   { xs: 16, sm: 18, md: 20 }, color: "#8c6a50", lineHeight: 1.6, maxWidth: 400 }}>
            Your job search, organized.
          </Typography>
          <Typography sx={{ fontSize:   { xs: 12, sm: 13, md: 14 } , color: "#2c1a0a", lineHeight: 1.6, maxWidth: 400 }}>
            Track applications, manage interviews, and stay consistent—without the overwhelm.
          </Typography>
        </Box>

        {/* PREVIEW CARD */}
        <Box
          sx={{
            background: "white",
            borderRadius: "14px",
            padding: "32px",
            border: "1px solid #e8ddd0",
          }}
        >
          {/* Avatar */}
          <Box
            sx={{
              width: 50, height: 50, borderRadius: "50%",
              background: "#f0e6d8",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 14px",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b87444" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </Box>

          {/* Progress bars */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "6px", mb: "10px" }}>
            <Box sx={{ height: 6, borderRadius: 3, background: "#b87444", width: "40%" }} />
            <Box sx={{ height: 6, borderRadius: 3, background: "#e8ddd0", width: "70%" }} />
            <Box sx={{ height: 6, borderRadius: 3, background: "#e8ddd0", width: "50%" }} />
          </Box>

          <Typography sx={{ fontSize: 16, color: "#8c6a50" }}>
            Your journey starts here.
          </Typography>
        </Box>
      </Box>

      {/* ── RIGHT PANEL ── */}
      <Box
        flex={1}
        sx={{ background: "linear-gradient(160deg, #FFFFFF 0%, #fdfaf7 100%)" }}
        display="flex"
        justifyContent="center"
        alignItems="center"
        px={2}
        py={6}
      >
        <motion.div
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <Paper
            elevation={3}
            sx={{
              position: "relative",
              overflow: "hidden",
              width: "100%",
              maxWidth: 420,
              p: 6,
              borderRadius: 5,
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(250,247,243,0.75))",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              border: "1px solid rgba(212,200,184,0.5)",
              boxShadow: `
                0 25px 50px rgba(90,60,30,0.08),
                inset 0 1px 0 rgba(255,255,255,0.7)
              `,
            }}
          >
            <Stack spacing={2}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                <Typography variant="h5" fontWeight={600} sx={{ color: "#2c1a0a" }}>
                  Create an account
                </Typography>
                <Typography sx={{ fontSize: 14, color: "#8c6a50" }}>
                  Start organizing your job search in seconds
                </Typography>
              </Box>

              {awaitingOtp ? (
                <Stack spacing={2.2}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: "#f5ede0", border: "1px solid #e8ddd0" }}>
                    <Typography fontWeight={700} sx={{ color: "#2c1a0a" }}>Check your email</Typography>
                    <Typography fontSize={13} sx={{ color: "#8c6a50", mt: 0.5 }}>
                      We sent a six-digit verification code to {form.email}.
                    </Typography>
                    <Typography fontSize={12.5} sx={{ color: "#8c6a50", mt: 0.75 }}>
                      If you don&apos;t see the email in your inbox, check your spam or junk folder.
                    </Typography>
                  </Box>
                  <TextField
                    label="Verification code"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    inputProps={{ inputMode: "numeric", maxLength: 6, style: { textAlign: "center", letterSpacing: "0.5em", fontSize: 22, fontWeight: 700 } }}
                    sx={textFieldSx}
                    autoFocus
                  />
                  <Button variant="contained" disabled={otp.length !== 6 || loading} onClick={verifyOtp}
                    sx={{ bgcolor: "#b87444", textTransform: "none", "&:hover": { bgcolor: "#a0622e" } }}>
                    {loading ? "Verifying..." : "Verify and continue"}
                  </Button>
                  <Button onClick={resendOtp} sx={{ color: "#b87444", textTransform: "none" }}>Resend code</Button>
                  {apiError && <Typography color="error" textAlign="center">{apiError}</Typography>}
                </Stack>
              ) : (
              <>
              <Stack spacing={1} direction="column">
                {/* FULL NAME */}
                <TextField
                  id="signup-name"
                  label="Full name"
                  fullWidth
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange("name")}
                  onBlur={handleBlur("name")}
                  error={nameError}
                  helperText={nameError ? "Full name is required" : " "}
                  sx={textFieldSx}
                />

                {/* EMAIL */}
                <TextField
                  id="signup-email"
                  label="Email address"
                  type="email"
                  fullWidth
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  onBlur={() => {
                    handleBlur("email")();
                    checkEmailExists(form.email);
                  }}
                  error={emailError}
                  helperText={
                    emailError ? (
                      !form.email ? "Email is required" : "Enter a valid email"
                    ) : emailExists ? (
                      <span>
                        This email is already registered.{" "}
                        <Link href="/login" sx={{ color: "#b87444" }} underline="hover">
                          Log in instead
                        </Link>
                      </span>
                    ) : (
                      " "
                    )
                  }
                  sx={textFieldSx}
                />

                {/* PASSWORD */}
                <TextField
                  id="signup-password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange("password")}
                  onBlur={handleBlur("password")}
                  error={passwordError}
                  helperText={
                    passwordError
                      ? "At least 8 characters with uppercase, lowercase, number, and symbol."
                      : " "
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                          onMouseDown={(e) => e.preventDefault()}
                          sx={{ color: "#8c6a50" }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={textFieldSx}
                />

                {/* CONFIRM PASSWORD */}
                <TextField
                  id="signup-confirm-password"
                  label="Confirm password"
                  type={showConfirmPassword ? "text" : "password"}
                  fullWidth
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  error={confirmPasswordError}
                  helperText={confirmPasswordError ? "Passwords do not match" : " "}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          edge="end"
                          onMouseDown={(e) => e.preventDefault()}
                          sx={{ color: "#8c6a50" }}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={textFieldSx}
                />
              </Stack>

              {/* SIGN UP BUTTON */}
              <Button
                variant="contained"
                size="large"
                fullWidth
                disabled={!isFormValid}
                sx={{
                  borderRadius: "10px",
                  opacity: isFormValid ? 1 : 0.6,
                  backgroundColor: "#b87444",
                  color: "#fdfaf7",
                  textTransform: "none",
                  "&:hover": { backgroundColor: "#a0622e" },
                  "&.Mui-disabled": {
                    backgroundColor: "#b87444",
                    color: "#fdfaf7",
                  },
                }}
                onClick={handleSignup}
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>

              {apiError && (
                <Typography color="error" textAlign="center">
                  {apiError}
                </Typography>
              )}

              <Divider sx={{ color: "#b8a090", "&::before, &::after": { borderColor: "#e8ddd0" } }}>
                OR
              </Divider>

              {/* GOOGLE */}
              <Button
                variant="outlined"
                fullWidth
                startIcon={
                  <Image src={googleIcon} alt="Google" width={20} height={20} />
                }
                sx={{
                  borderRadius: "10px",
                  borderColor: "#e8ddd0",
                  color: "#8c6a50",
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "#b87444",
                    backgroundColor: "rgba(196,119,59,0.04)",
                  },
                }}
                onClick={() => {
                  window.location.href = `${API_BASE_URL}/auth/google`;
                }}
              >
                Continue with Google
              </Button>

              <Typography textAlign="center" sx={{ color: "#8c6a50" }}>
                Already have an account?{" "}
                <Link
                  href="/login"
                  sx={{
                    color: "#b87444",
                    textDecoration: "none",
                    fontWeight: 600,
                    "&:hover": { textDecoration: "underline", color: "#a0622e" },
                  }}
                >
                  Log in
                </Link>
              </Typography>
              </>
              )}
            </Stack>
          </Paper>
        </motion.div>
      </Box>
    </Box>
  );
}
