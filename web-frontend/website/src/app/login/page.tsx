"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
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
} from "@mui/material";

// Images
import anchorLogo from "./images/favicon.ico";
import googleIcon from "./images/google.png";
import linkedinIcon from "./images/linkedin.png";
import githubIcon from "./images/github.png";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // 🔹 helpers
  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const emailError = touched.email && (!email || !isValidEmail(email));

  const passwordError = touched.password && !password;

  const isFormValid = email && password && isValidEmail(email);

  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) return;

    setLoading(true);
    setApiError("");

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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // ✅ Success → go to dashboard
      router.push("/dashboard");
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
        <Stack spacing={2} alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Image src={anchorLogo} alt="Anchor logo" width={48} height={48} />
            <Typography variant="h4">Anchor</Typography>
          </Stack>

          <Typography variant="h5" fontWeight={600}>
            Welcome back
          </Typography>

          <Typography textAlign="center">
            Stay motivated. Stay consistent. Grow with purpose.
          </Typography>
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
        <Paper
          elevation={3}
          sx={{
            width: "100%",
            maxWidth: 420,
            p: 4,
          }}
        >
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Login to your account
              </Typography>
              <Typography color="text.secondary">
                It’s nice to see you again
              </Typography>
            </Box>

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
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              error={passwordError}
              helperText={passwordError ? "Password is required" : " "}
            />

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <FormControlLabel control={<Checkbox />} label="Remember me" />

              <Link href="/forgot-password" style={{ fontSize: 14 }}>
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
              }}
            >
              {loading ? "Logging in..." : "Log in"}
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
            >
              Continue with Google
            </Button>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
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
            </Stack>

            <Typography textAlign="center">
              Don’t have an account? <Link href="/signup">Sign up</Link>
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
