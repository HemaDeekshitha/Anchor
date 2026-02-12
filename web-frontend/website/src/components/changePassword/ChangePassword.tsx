"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordError = password.length > 0 && password.length < 6;
  const confirmError =
    confirmPassword.length > 0 && password !== confirmPassword;

  const canSubmit =
    token && password.length >= 6 && password === confirmPassword && !loading;

  const handleSubmit = async () => {
    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:3001/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Something went wrong");
      }

      // ✅ success → redirect to login
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
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
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: "100%", maxWidth: 420 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            backdropFilter: "blur(22px)",
            border: "1px solid rgba(255,255,255,0.4)",
            boxShadow: `
              0 30px 60px rgba(0,0,0,0.25),
              inset 0 1px 0 rgba(255,255,255,0.45)
            `,
          }}
        >
          <Stack spacing={3}>
            <Typography variant="h5" fontWeight={600} textAlign="center">
              Reset your password
            </Typography>

            <TextField
              label="New password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              error={passwordError}
              helperText={passwordError ? "Minimum 6 characters" : " "}
              fullWidth
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
            />

            <TextField
              label="Confirm password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError("");
              }}
              error={confirmError}
              helperText={confirmError ? "Passwords do not match" : " "}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      edge="end"
                      onMouseDown={(e) => e.preventDefault()}
                      sx={{ color: "#6b7280" }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {error && (
              <Typography color="error" textAlign="center">
                {error}
              </Typography>
            )}

            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={!canSubmit}
              onClick={handleSubmit}
              sx={{
                backgroundColor: "#ff7a5c",
                opacity: canSubmit ? 1 : 0.6,
              }}
            >
              {loading ? "Resetting..." : "Reset password"}
            </Button>
          </Stack>
        </Paper>
      </motion.div>
    </Box>
  );
}
