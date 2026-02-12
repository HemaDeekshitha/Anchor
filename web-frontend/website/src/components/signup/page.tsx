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
import anchorLogo from "../../../public/assets/logo.png";
import googleIcon from "../../../public/assets/images/google.png";
import linkedinIcon from "../login/images/linkedin.png";
import githubIcon from "../login/images/github.png";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function SignupPage() {
  // 🔹 form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  // 🔹 helpers
  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const nameError = touched.name && !form.name;

  const emailError =
    touched.email && (!form.email || !isValidEmail(form.email));

  const passwordError = touched.password && form.password.length < 6;

  const confirmPasswordError =
    touched.confirmPassword &&
    (!form.confirmPassword || form.confirmPassword !== form.password);

  const isFormValid =
    form.name &&
    isValidEmail(form.email) &&
    !emailExists &&
    form.password.length >= 6 &&
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
      setCheckingEmail(true);
      const res = await fetch(
        `http://localhost:3001/auth/check-email?email=${email}`
      );
      const data = await res.json();
      setEmailExists(data.exists);
    } catch {
      setEmailExists(false);
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleSignup = async () => {
    if (!isFormValid) return;

    setLoading(true);
    setApiError("");

    try {
      const res = await fetch(`http://localhost:3001/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // important to include cookies
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Signup failed");
      }

      // ✅ Success → go to login
      router.push("/steps");
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
                  Welcome to Anchor
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
                  A simple space to reflect, grow, and stay consistent.
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
            <Stack spacing={2}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  Create an account
                </Typography>
                <Typography color="text.secondary">
                  It takes less than a minute
                </Typography>
              </Box>

              <Stack spacing={1} direction={"column"}>
                {/* FULL NAME */}
                <TextField
                  label="Full name"
                  fullWidth
                  value={form.name}
                  onChange={handleChange("name")}
                  onBlur={handleBlur("name")}
                  error={nameError}
                  helperText={nameError ? "Full name is required" : " "}
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

                {/* EMAIL */}
                <TextField
                  label="Email address"
                  type="email"
                  fullWidth
                  value={form.email}
                  onChange={handleChange("email")}
                  onBlur={() => {
                    handleBlur("email")();
                    checkEmailExists(form.email);
                  }}
                  error={emailError}
                  helperText={
                    emailError ? (
                      !form.email ? (
                        "Email is required"
                      ) : (
                        "Enter a valid email"
                      )
                    ) : emailExists ? (
                      <span>
                        This email is already registered.{" "}
                        <Link
                          href="/login"
                          sx={{ color: "red" }}
                          underline="hover"
                        >
                          Log in instead
                        </Link>
                      </span>
                    ) : (
                      " "
                    )
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
                        "& .MuiFormHelperText-root": {
                          color: emailExists ? "#92400e" : "#6b7280",
                        },
                      },
                    },
                  }}
                />

                {/* PASSWORD */}
                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  value={form.password}
                  onChange={handleChange("password")}
                  onBlur={handleBlur("password")}
                  error={passwordError}
                  helperText={
                    passwordError
                      ? "Password must be at least 6 characters"
                      : " "
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                          onMouseDown={(e) => e.preventDefault()}
                          sx={{ color: "#6b7280" }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    borderRadius: 1,
                    "& .MuiInputLabel-root": { color: "#6b7280" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#be123c" },
                    "& .MuiInputLabel-root.Mui-error": { color: "#dc2626" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#ddd" },
                      "&:hover fieldset": { borderColor: "#be123c" },
                      "&.Mui-focused fieldset": {
                        borderColor: "#be123c",
                        borderWidth: 1,
                      },
                    },
                  }}
                />

                {/* CONFIRM PASSWORD */}
                <TextField
                  label="Confirm password"
                  type={showConfirmPassword ? "text" : "password"}
                  fullWidth
                  value={form.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  error={confirmPasswordError}
                  helperText={
                    confirmPasswordError ? "Passwords do not match" : " "
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowConfirmPassword((prev) => !prev)
                          }
                          edge="end"
                          onMouseDown={(e) => e.preventDefault()}
                          sx={{ color: "#6b7280" }}
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    borderRadius: 1,
                    "& .MuiInputLabel-root": { color: "#6b7280" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#be123c" },
                    "& .MuiInputLabel-root.Mui-error": { color: "#dc2626" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#ddd" },
                      "&:hover fieldset": { borderColor: "#be123c" },
                      "&.Mui-focused fieldset": {
                        borderColor: "#be123c",
                        borderWidth: 1,
                      },
                    },
                  }}
                />
              </Stack>
              {/* SIGN UP BUTTON */}
              <Button
                variant="contained"
                size="large"
                fullWidth
                disabled={!isFormValid}
                sx={{
                  opacity: isFormValid ? 1 : 0.6,
                  backgroundColor: "#ff7a5c",
                }}
                onClick={handleSignup}
              >
                {loading ? "Creating account..." : "Sign up"}
              </Button>
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
              >
                LinkedIn
              </Button>

              <Button
                variant="outlined"
                fullWidth
                startIcon={
                  <Image src={githubIcon} alt="GitHub" width={22} height={22} />
                }
              >
                GitHub
              </Button>
            </Stack> */}

              <Typography textAlign="center">
                Already have an account?{" "}
                <Link
                  href="/login"
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
                  Log in
                </Link>
              </Typography>
            </Stack>
          </Paper>
        </motion.div>
      </Box>
    </Box>
  );
}
