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
} from "@mui/material";

// Images
import anchorLogo from "../../../public/assets/logo.png";
import googleIcon from "../../../public/assets/images/google.png";
import linkedinIcon from "../login/images/linkedin.png";
import githubIcon from "../login/images/github.png";
import { useRouter } from "next/navigation";

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
    form.password.length >= 6 &&
    form.password === form.confirmPassword;

  const handleChange = (field: string) => (e: { target: { value: any } }) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleBlur = (field: string) => () => {
    setTouched({ ...touched, [field]: true });
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
        bgcolor="#ff7a5c"
        color="#3b1d16"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        px={4}
        py={6}
      >
        <Stack spacing={3} alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Image src={anchorLogo} alt="Anchor logo" width={48} height={48} />
            <Typography variant="h2" sx={{ fontWeight: "Bold" }}>
              Anchor
            </Typography>
          </Stack>

          <Stack spacing={1} alignItems="center">
            <Typography variant="h4" fontWeight={600}>
              Create your account
            </Typography>

            <Typography textAlign="center">
              Start building better habits and staying consistent.
            </Typography>
          </Stack>
        </Stack>
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
        <Paper elevation={3} sx={{ width: "100%", maxWidth: 420, p: 4 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Create an account
              </Typography>
              <Typography color="text.secondary">
                It takes less than a minute
              </Typography>
            </Box>

            <Stack spacing={0} direction={"column"}>
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
                  // backgroundColor: "#f7f7f7",
                  borderRadius: 1,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#ddd",
                    },
                    "&:hover fieldset": {
                      borderColor: "#be123c", // hover color (optional)
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#be123c", // focus color
                      borderWidth: 1,
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
                onBlur={handleBlur("email")}
                error={emailError}
                helperText={
                  emailError
                    ? !form.email
                      ? "Email is required"
                      : "Enter a valid email"
                    : " "
                }
                sx={{
                  // backgroundColor: "#f7f7f7",
                  borderRadius: 1,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#ddd",
                    },
                    "&:hover fieldset": {
                      borderColor: "#be123c", // hover color (optional)
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#be123c", // focus color
                      borderWidth: 1,
                    },
                  },
                }}
              />

              {/* PASSWORD */}
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={form.password}
                onChange={handleChange("password")}
                onBlur={handleBlur("password")}
                error={passwordError}
                helperText={
                  passwordError ? "Password must be at least 6 characters" : " "
                }
                sx={{
                  // backgroundColor: "#f7f7f7",
                  borderRadius: 1,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#ddd",
                    },
                    "&:hover fieldset": {
                      borderColor: "#be123c", // hover color (optional)
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#be123c", // focus color
                      borderWidth: 1,
                    },
                  },
                }}
              />

              {/* CONFIRM PASSWORD */}
              <TextField
                label="Confirm password"
                type="password"
                fullWidth
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                onBlur={handleBlur("confirmPassword")}
                error={confirmPasswordError}
                helperText={
                  confirmPasswordError ? "Passwords do not match" : " "
                }
                sx={{
                  // backgroundColor: "#f7f7f7",
                  borderRadius: 1,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#ddd",
                    },
                    "&:hover fieldset": {
                      borderColor: "#be123c", // hover color (optional)
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#be123c", // focus color
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
      </Box>
    </Box>
  );
}
