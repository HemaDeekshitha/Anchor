"use client";

import { FONT } from "@/lib/typography";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Box,
  Stack,
  TextField,
  Button,
  Typography,
  Divider,
  Checkbox,
  FormControlLabel,
  Paper,
  Link,
  InputAdornment,
  IconButton,
} from "@mui/material";

import googleIcon from "../../../public/assets/images/google.png";
import { useState } from "react";
import { motion } from "framer-motion";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function LoginPage() {
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    const remembered = localStorage.getItem("rememberMe");
    const savedEmail = localStorage.getItem("rememberedEmail");
    return remembered === "true" && savedEmail ? savedEmail : "";
  });

  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [rememberMe, setRememberMe] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("rememberMe") === "true";
  });
  const [showPassword, setShowPassword] = useState(false);

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const emailError = touched.email && (!email || !isValidEmail(email));
  const passwordError = touched.password && !password;
  const isFormValid = email && password && isValidEmail(email);

  const router = useRouter();

  const textFieldSx = {
    "& .MuiInputLabel-root": { color: "#8c6a50" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#b87444" },
    "& .MuiInputLabel-root.Mui-error": { color: "#b45309" },
    "& .MuiOutlinedInput-root": {
      height: "clamp(46px, 3vw, 60px)",
      borderRadius: "clamp(10px, 0.8vw, 16px)",
      "& fieldset": { borderColor: "#e8ddd0" },
      "&:hover fieldset": { borderColor: "#b87444" },
      "&.Mui-focused fieldset": { borderColor: "#b87444", borderWidth: 1 },
      "& .MuiOutlinedInput-input": {
        fontSize: FONT.md,
        "&:-webkit-autofill": {
          animationName: "mui-auto-fill",
          animationDuration: "0.01s",
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
        "&:not(:-webkit-autofill)": {
          animationName: "mui-auto-fill-cancel",
          animationDuration: "0.01s",
        },
      },
    },
  };

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setApiError("");
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, rememberMe, timezone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberMe");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minHeight="100vh" display="flex" flexDirection={{ xs: "column", md: "row" }}>
      {/* ── LEFT PANEL ── */}
      <Box
        flex={0.5}
        sx={{
          background: "#f5ede0",
          borderRight: "1px solid #e8ddd0",
          padding: "clamp(32px, 4vw, 96px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* LOGO */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Box
            sx={{
              width: "clamp(36px,2vw,52px)", height: "clamp(36px,2vw,52px)",
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

        {/* WELCOME TEXT */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "clamp(12px,1vw,24px)", py: 4 }}>
          <Typography sx={{ fontFamily: "'Playfair Display', serif", fontSize: FONT.hero, fontWeight: 400, color: "#2c1a0a", lineHeight: 1.15 }}>
            Welcome to
          </Typography>
          <Typography sx={{ fontFamily: "'Playfair Display', serif", fontSize: FONT.hero, fontWeight: 700, color: "#b87444", fontStyle: "italic", lineHeight: 1.15 }}>
            Anchor
          </Typography>
          <Typography sx={{ fontSize: FONT.lg, color: "#8c6a50", lineHeight: 1.6, maxWidth: "clamp(400px,25vw,600px)" }}>
            Your job search, organized.
          </Typography>
          <Typography sx={{ fontSize: FONT.md, color: "#2c1a0a", lineHeight: 1.6, maxWidth: "clamp(400px,25vw,600px)" }}>
            Track applications, manage interviews, and stay consistent—without the overwhelm.
          </Typography>
        </Box>

        {/* PREVIEW CARD */}
        <Box sx={{ background: "white", borderRadius: "clamp(12px,1vw,20px)", padding: "clamp(20px,2vw,40px)", border: "1px solid #e8ddd0" }}>
          <Box
            sx={{
              width: "clamp(50px,3vw,70px)", height: "clamp(50px,3vw,70px)", borderRadius: "50%",
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
              maxWidth: "clamp(420px, 30vw, 650px)",
              padding: "clamp(24px, 2vw, 56px)",
              borderRadius: "clamp(18px,1.5vw,32px)",
              background: "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(250,247,243,0.75))",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              border: "1px solid rgba(212,200,184,0.5)",
              boxShadow: `
                0 25px 50px rgba(90,60,30,0.08),
                inset 0 1px 0 rgba(255,255,255,0.7)
              `,
            }}
          >
            <Stack spacing={{ xs:2, md:3, xl:4 }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                <Typography variant="h5" fontWeight={600}>Login</Typography>
                <Typography sx={{ fontSize: 14, color: "#8c6a50" }}>It's nice to see you again</Typography>
              </Box>

              <Stack spacing={1}>
                <TextField
                  id="login-email"
                  label="Email"
                  type="email"
                  fullWidth
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  error={emailError}
                  helperText={emailError ? !email ? "Email is required" : "Enter a valid email address" : " "}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ notched: true }}
                  sx={textFieldSx}
                />

                <TextField
                    id="login-password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    error={passwordError}
                    helperText={passwordError ? "Password is required" : " "}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      notched: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end" sx={{ color: "#8c6a50" }}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  sx={textFieldSx}
                />

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        sx={{ "&.Mui-checked": { color: "#b87444" } }}
                      />
                    }
                    label="Remember me"
                  />
                  <Link
                    href="/forgot-password"
                    sx={{ fontSize: 14, color: "#8c6a50", textDecoration: "none", "&:hover": { textDecoration: "underline", color: "#b87444" } }}
                  >
                    Forgot password?
                  </Link>
                </Box>

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleLogin}
                  fullWidth
                  disabled={!isFormValid}
                  sx={{
                    height: "clamp(44px, 3vw, 60px)",
                    fontSize: FONT.md,
                    borderRadius: "10px",
                    opacity: isFormValid ? 1 : 0.6,
                    backgroundColor: "#b87444",
                    color: "#fdfaf7",
                    textTransform: "none",
                    "&:hover": { backgroundColor: "#a0622e" },
                    "&.Mui-disabled": { backgroundColor: "#b87444", color: "#fdfaf7" },
                  }}
                >
                  {loading ? "Logging in..." : "Log in"}
                </Button>
              </Stack>

              {apiError && (
                <Typography color="error" textAlign="center">{apiError}</Typography>
              )}

              <Divider sx={{ color: "#b8a090", "&::before, &::after": { borderColor: "#e8ddd0" } }}>
                OR
              </Divider>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<Image src={googleIcon} alt="Google" width={24} height={24} />}
                sx={{
                  borderRadius: "10px",
                  borderColor: "#e8ddd0",
                  color: "#8c6a50",
                  textTransform: "none",
                  "&:hover": { borderColor: "#b87444", backgroundColor: "rgba(184,116,68,0.04)" },
                }}
                onClick={() => { window.location.href = `${API_BASE_URL}/auth/google`; }}
              >
                Continue with Google
              </Button>

              <Typography textAlign="center">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  sx={{ color: "#b87444", fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline", color: "#a0622e" } }}
                >
                  Sign up
                </Link>
              </Typography>
            </Stack>
          </Paper>
        </motion.div>
      </Box>
    </Box>
  );
}