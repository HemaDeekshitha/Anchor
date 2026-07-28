"use client";
import { FONT } from "@/lib/typography";
import { SPACE } from "@/lib/spacing";
import { SIZE } from "@/lib/sizes";
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
      height: "clamp(46px,3vw,60px)",
      borderRadius: "10px",
      "& fieldset": { borderColor: "#e8ddd0" },
      "&:hover fieldset": { borderColor: "#b87444" },
      "&.Mui-focused fieldset": { borderColor: "#b87444", borderWidth: 1 },
      "& .MuiOutlinedInput-input": {
        fontSize: FONT.md,
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
          padding: "clamp(32px,4vw,96px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
      >
        {/* LOGO ROW */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Box
            sx={{
              width: "clamp(36px,2vw,52px)", height: "clamp(36px,2vw,52px)",
              background: "#b87444",
              borderRadius: "clamp(9px,0.8vw,14px)",
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
          <Typography sx={{ fontFamily: "'Playfair Display', serif", fontSize: FONT.xl, color: "#2c1a0a", fontWeight: 400 }}>
            Anchor
          </Typography>
        </Box>

        {/* MIDDLE — Welcome text + tagline */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: SPACE.md, mt: { xs: 6, md: "clamp(96px,14vh,180px)" } }}>
          <Typography sx={{ fontFamily: "'Playfair Display', serif", fontSize:  FONT.hero , fontWeight: 400, color: "#2c1a0a", lineHeight: 1.15 }}>
            Welcome to
          </Typography>
          <Typography sx={{ fontFamily: "'Playfair Display', serif", fontSize:   FONT.hero , fontWeight: 700, color: "#b87444", fontStyle: "italic", lineHeight: 1.15 }}>
            Anchor
          </Typography>
          <Typography sx={{ fontSize:  FONT.lg, color: "#8c6a50", lineHeight: 1.6, maxWidth: "clamp(400px,25vw,600px)",}}>
            Your job search companion.
          </Typography>
          <Typography sx={{ fontSize: "clamp(16px,1.1vw,22px)", color: "#2c1a0a", lineHeight: 1.6 }}>
            <Box component="span" sx={{ display: "block", whiteSpace: { md: "nowrap" } }}>
              Anchor guides your practice, keeps you focused,
            </Box>
            <Box component="span" sx={{ display: "block", whiteSpace: { md: "nowrap" } }}>
              and helps you move steadily toward your next role.
            </Box>
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
              maxWidth: "clamp(420px,30vw,650px)",
              p: "clamp(24px,2vw,56px)",
              borderRadius: "clamp(18px,1.5vw,32px)",
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
            <Stack spacing={{ xs: 2, md: 3, xl: 4 }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                <Typography variant="h5" fontWeight={600} sx={{ color: "#2c1a0a",fontSize: FONT.lg, }}>
                  Create an account
                </Typography>
                <Typography sx={{ fontSize: FONT.md, color: "#8c6a50" }}>
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
                    sx={{ height: "clamp(44px,3vw,60px)",fontSize: FONT.md,borderRadius: "clamp(10px,0.8vw,16px)",bgcolor: "#b87444", textTransform: "none", "&:hover": { bgcolor: "#a0622e" } }}>
                    {loading ? "Verifying..." : "Verify and continue"}
                  </Button>
                  <Button onClick={resendOtp} sx={{ color: "#b87444", textTransform: "none" }}>Resend code</Button>
                  {apiError && <Typography color="error" textAlign="center">{apiError}</Typography>}
                </Stack>
              ) : (
              <>
              <Stack spacing={{ xs: 1.5, md: 2, xl: 3 }} direction="column">
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
                  <Image src={googleIcon} alt="Google" width={24} height={24} />
                }
                sx={{
                  height: "clamp(44px,3vw,60px)",
                  fontSize: FONT.md,
                  borderRadius: "clamp(10px,0.8vw,16px)",
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
