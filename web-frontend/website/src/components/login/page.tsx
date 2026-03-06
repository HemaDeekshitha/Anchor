"use client";

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

// Images
import anchorLogo from "../../../public/assets/logo.png";
import googleIcon from "../../../public/assets/images/google.png";

import linkedinIcon from "./images/linkedin.png";
import githubIcon from "./images/github.png";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🔹 helpers
  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const emailError = touched.email && (!email || !isValidEmail(email));

  const passwordError = touched.password && !password;

  const isFormValid = email && password && isValidEmail(email);

  const router = useRouter();

  useEffect(() => {
    const remembered = localStorage.getItem("rememberMe");
    const savedEmail = localStorage.getItem("rememberedEmail");

    if (remembered === "true" && savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async () => {
    if (!email || !password) return;

    setLoading(true);
    setApiError("");
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    try {
      const res = await fetch(`http://localhost:3001/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          rememberMe,
          timezone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // ✅ Success → go to dashboard
      router.push("/dashboard");
      // after router.push or before it
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberMe");
      }
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection={{ xs: "column", md: "row" }}
    >
      {/* LEFT PANEL */}
      <Box
        flex={1}
        sx={{
          background: "linear-gradient(to right, rgb(209 51 51), #E5B526)",
        }}
        color="#3b1d16"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        px={4}
        py={6}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1.6,
            ease: [0.16, 1, 0.3, 1], // premium easing
          }}
        >
          <Paper
            elevation={0}
            sx={{
              px: 7,
              py: 6,
              borderRadius: 4,

              background:
                "linear-gradient(135deg, rgba(255,255,255,0.28), rgba(255,255,255,0.12))",
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",

              border: "1px solid rgba(255, 255, 255, 0.35)",

              boxShadow: `
        0 20px 50px rgba(0,0,0,0.25),
        inset 0 1px 0 rgba(255,255,255,0.4)
      `,
            }}
          >
            <Stack spacing={4} alignItems="center">
              {/* LOGO */}
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Image
                  src={anchorLogo}
                  alt="Anchor logo"
                  width={52}
                  height={52}
                />
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: "#24160F",
                  }}
                >
                  Anchor
                </Typography>
              </Stack>

              {/* TEXT */}
              <Stack spacing={1.5} alignItems="center">
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    color: "#24160F",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Welcome back
                </Typography>

                <Typography
                  textAlign="center"
                  sx={{
                    color: "#24160F",
                    opacity: 0.78,
                    maxWidth: 380,
                    fontSize: 16,
                    lineHeight: 1.6,
                  }}
                >
                  Stay motivated. Stay consistent. Grow with purpose.
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        </motion.div>
      </Box>

      {/* RIGHT PANEL */}

      <Box
        flex={1}
        bgcolor="white"
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
          transition={{
            delay: 0.2, // comes after left
            duration: 1.4, // slower than default
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <Paper
            elevation={3}
            sx={{
              position: "relative", // 👈 REQUIRED
              overflow: "hidden",
              width: "100%",
              maxWidth: 420,
              p: 4,
              borderRadius: 3,

              // 🌫 Glass effect
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.75), rgba(255,255,255,0.55))",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",

              // ✨ Soft border + depth
              border: "1px solid rgba(255,255,255,0.6)",
              boxShadow: `
                0 25px 50px rgba(0,0,0,0.12),
                inset 0 1px 0 rgba(255,255,255,0.6)
              `,
            }}
          >
            <Stack spacing={2.5}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Typography variant="h5" fontWeight={600}>
                  Login
                </Typography>
                <Typography color="text.secondary">
                  It’s nice to see you again
                </Typography>
              </Box>

              <Stack spacing={1}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  error={emailError}
                  helperText={
                    emailError
                      ? !email
                        ? "Email is required"
                        : "Enter a valid email address"
                      : " "
                  }
                  sx={{
                    borderRadius: 1,

                    // 👇 Label default color
                    "& .MuiInputLabel-root": {
                      color: "#6b7280", // gray
                    },

                    // 👇 Label when focused
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#be123c", // your red
                    },

                    // 👇 Label when error
                    "& .MuiInputLabel-root.Mui-error": {
                      color: "#dc2626",
                    },

                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#ddd",
                      },
                      "&:hover fieldset": {
                        borderColor: "#be123c",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#be123c",
                        borderWidth: 1,
                      },
                      "& .MuiOutlinedInput-input": {
                        "&:-webkit-autofill": {
                          WebkitBoxShadow: "0 0 0 1000px #ffffff inset",
                          WebkitTextFillColor: "#000",
                          caretColor: "#000",
                        },
                        "&:-webkit-autofill:hover": {
                          WebkitBoxShadow: "0 0 0 1000px #ffffff inset",
                        },
                        "&:-webkit-autofill:focus": {
                          WebkitBoxShadow: "0 0 0 1000px #ffffff inset",
                        },
                        "&:-webkit-autofill:active": {
                          WebkitBoxShadow: "0 0 0 1000px #ffffff inset",
                        },
                      },
                    },
                  }}
                />

                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  error={passwordError}
                  helperText={passwordError ? "Password is required" : " "}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                          sx={{ color: "#6b7280" }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    borderRadius: 1,

                    "& .MuiInputLabel-root": {
                      color: "#6b7280",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#be123c",
                    },
                    "& .MuiInputLabel-root.Mui-error": {
                      color: "#dc2626",
                    },

                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#ddd",
                      },
                      "&:hover fieldset": {
                        borderColor: "#be123c",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#be123c",
                        borderWidth: 1,
                      },
                    },
                  }}
                />

                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        sx={{
                          "&.Mui-checked": {
                            color: "#ff7a5c", // checked
                          },
                        }}
                      />
                    }
                    label="Remember me"
                  />

                  <Link
                    href="/forgot-password"
                    sx={{
                      fontSize: 14,
                      color: "#000",
                      textDecoration: "none",
                      "&:hover": {
                        textDecoration: "underline",
                        color: "#be123c",
                      },
                    }}
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
                    opacity: isFormValid ? 1 : 0.6,
                    backgroundColor: "#ff7a5c",
                  }}
                >
                  {loading ? "Logging in..." : "Log in"}
                </Button>
              </Stack>

              {apiError && (
                <Typography color="error" textAlign="center">
                  {apiError}
                </Typography>
              )}

              <Divider>OR</Divider>

              {/* SOCIAL LOGIN */}
              <Button
                variant="outlined"
                fullWidth
                startIcon={
                  <Image src={googleIcon} alt="Google" width={20} height={20} />
                }
                sx={{ borderColor: "#ddd", color: "#000" }}
                onClick={() => {
                  window.location.href = "http://localhost:3001/auth/google";
                }}
              >
                Continue with Google
              </Button>

              {/* <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={
                  <Image
                    src={linkedinIcon}
                    alt="LinkedIn"
                    width={22}
                    height={22}
                  />
                }
                sx={{ borderColor: "#ddd", color: "#000" }}
              >
                LinkedIn
              </Button>

              <Button
                variant="outlined"
                fullWidth
                startIcon={
                  <Image src={githubIcon} alt="GitHub" width={22} height={22} />
                }
                sx={{ borderColor: "#ddd", color: "#000" }}
              >
                GitHub
              </Button>
            </Stack> */}

              <Typography textAlign="center">
                Don’t have an account?{" "}
                <Link
                  href="/signup"
                  sx={{
                    // fontSize: 14,
                    color: "#000",
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                      color: "#be123c",
                    },
                  }}
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
