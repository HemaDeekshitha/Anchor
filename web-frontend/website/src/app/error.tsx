"use client";

import { useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Anchor page error", error);
  }, [error]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        bgcolor: "var(--background, #ffffff)",
        p: 3,
      }}
    >
      <Box
        sx={{
          maxWidth: 520,
          bgcolor: "var(--anchor-surface, #ffffff)",
          border: "1px solid var(--anchor-divider, #e5e7eb)",
          borderRadius: 4,
          p: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          Anchor hit a snag
        </Typography>
        <Typography sx={{ color: "var(--anchor-muted, #666666)", mb: 3 }}>
          Try loading this page again, or sign in if your session has ended.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5 }}>
          <Button variant="outlined" href="/login">
            Sign in again
          </Button>
          <Button variant="contained" onClick={reset}>
            Try again
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
