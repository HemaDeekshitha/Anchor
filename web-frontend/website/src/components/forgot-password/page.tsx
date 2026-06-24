"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { motion } from "framer-motion";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

import anchorLogo from "../../../public/assets/logo.png";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const emailError = touched && (!email || !isValidEmail(email));

  const handleSubmit = async () => {
    if (!email || !isValidEmail(email)) return;

    setLoading(true);
    setError(""); // 🔥 CLEAR OLD ERROR HERE
    setSubmitted(false);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      // ⚠️ Always success (even if email doesn't exist)
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }
      setSubmitted(true);
    } catch (err: any) {
      // Optional: log error, but don't show scary UI
      setError(err.message || "Failed to send reset link. Please try again.");
      setEmail(""); // Clear email to prevent resubmission with same value
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{
        background: "linear-gradient(to right, rgb(209 51 51), #E5B526)",
      }}
      px={2}
    >
      {/* 🎬 Animated container */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 1.4,
          ease: [0.16, 1, 0.3, 1], // same premium easing
        }}
        style={{ width: "100%", maxWidth: 420 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            position: "relative",

            // 🌫 Proper glass effect
            background: "white",
            // background: "linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.18))",
            backdropFilter: "blur(22px)",
            WebkitBackdropFilter: "blur(22px)",

            // ✨ Glass border + depth
            border: "1px solid rgba(255,255,255,0.45)",
            boxShadow: `
              0 30px 60px rgba(0,0,0,0.25),
              inset 0 1px 0 rgba(255,255,255,0.45)
            `,
          }}
        >
          <Stack spacing={3}>
            {/* Brand */}
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              justifyContent="center"
            >
              <Image
                src={anchorLogo}
                alt="Anchor logo"
                width={42}
                height={42}
              />
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ letterSpacing: "-0.02em" }}
              >
                Anchor
              </Typography>
            </Stack>

            {/* Title */}
            <Stack spacing={1} textAlign="center">
              <Typography variant="h6" fontWeight={600}>
                Forgot your password?
              </Typography>

              <Typography fontSize={14} sx={{ opacity: 0.75, lineHeight: 1.6 }}>
                Enter your email and we’ll send you a reset link.
              </Typography>
            </Stack>

            {/* Email input */}
            <TextField
              label="Email address"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
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
                  "& .MuiOutlinedInput-input": {
                    "&:-webkit-autofill": {
                      WebkitBoxShadow: "0 0 0 1000px #ffffff inset",
                      WebkitTextFillColor: "#000",
                    },
                  },
                },
              }}
            />
            {error && (
              <Typography
                textAlign="center"
                sx={{ color: "red", fontSize: 14 }}
              >
                {error}
              </Typography>
            )}

            {submitted && !error && (
              <Typography
                textAlign="center"
                sx={{ color: "green", fontSize: 14 }}
              >
                Reset link sent successfully.
              </Typography>
            )}

            {/* Action */}
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              fullWidth
              disabled={!email || !isValidEmail(email)}
              sx={{
                opacity: email && isValidEmail(email) ? 1 : 0.6,
                backgroundColor: "#ff7a5c",
                "&:hover": {
                  backgroundColor: "#ff6a4a",
                },
              }}
            >
              Send reset link
            </Button>

            {/* Back link */}
            <Typography textAlign="center" fontSize={14}>
              <Link
                href="/login"
                style={{
                  textDecoration: "none",
                  color: "#000",
                }}
              >
                ← Back to login
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </motion.div>
    </Box>
  );
}
