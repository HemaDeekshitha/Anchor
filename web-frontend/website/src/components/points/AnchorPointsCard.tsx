"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import { Zap, Trophy } from "lucide-react";
import { api, PointsSummary } from "@/lib/api";

interface AnchorPointsCardProps {
  /**
   * Bump this number to trigger a silent re-fetch of the points balance.
   * Dashboard increments it after a task is approved so the card stays
   * in sync without needing a full page reload.
   */
  refreshKey?: number;
}

export default function AnchorPointsCard({
  refreshKey = 0,
}: AnchorPointsCardProps) {
  const [data, setData] = useState<PointsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConverting, setIsConverting] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);

  const fetchPoints = useCallback(async () => {
    try {
      const result = await api.getMyPoints();
      setData(result);
    } catch {
      // silently ignore — card just shows dashes if unauthenticated
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount and whenever refreshKey changes
  useEffect(() => {
    fetchPoints();
  }, [fetchPoints, refreshKey]);

  const handleConvert = async () => {
    setIsConverting(true);
    setConvertError(null);
    try {
      const updated = await api.convertTo360();
      // Merge the returned balance into our existing data (history stays)
      setData((prev) =>
        prev
          ? {
              ...prev,
              anchorPoints: updated.anchorPoints,
              points360: updated.points360,
              pointsToNextConversion: updated.pointsToNextConversion,
              progressPercent: updated.progressPercent,
              canConvert: updated.canConvert,
            }
          : null
      );
    } catch (err: any) {
      setConvertError(err.message || "Conversion failed. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <Card sx={{ flex: 1, minWidth: 0 }}>
        <CardContent
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: 3,
          }}
        >
          <CircularProgress size={24} sx={{ color: "#f59e0b" }} />
        </CardContent>
      </Card>
    );
  }

  const anchorPoints = data?.anchorPoints ?? 0;
  const points360 = data?.points360 ?? 0;
  const progressPercent = data?.progressPercent ?? 0;
  const pointsToNext = data?.pointsToNextConversion ?? 100;
  const canConvert = data?.canConvert ?? false;

  return (
    <Card
      sx={{
        flex: 1,
        minWidth: 0,
        // border: "1px solid",
        // borderColor: canConvert ? "#fbbf24" : "#fecdd3",
        // Subtle gold glow when ready to convert
        boxShadow: canConvert ? "0 0 0 2px rgba(251,191,36,0.25)" : undefined,
        transition: "box-shadow 0.3s ease",
      }}
    >
      <CardContent>
        {/* ── Header row ── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Zap size={16} color="#f59e0b" fill="#f59e0b" />
            <Typography variant="subtitle2" color="text.secondary">
              Anchor Points
            </Typography>
          </Box>

          {/* 360 Points badge — only visible when user has earned at least one */}
          {points360 > 0 && (
            <Chip
              icon={<Trophy size={13} />}
              label={`${points360} × 360`}
              size="small"
              sx={{
                bgcolor: "#fef9c3",
                color: "#854d0e",
                fontWeight: 700,
                fontSize: "0.7rem",
                height: 22,
                "& .MuiChip-icon": { color: "#d97706", marginLeft: "6px" },
              }}
            />
          )}
        </Box>

        {/* ── Balance ── */}
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "#4c0519", mb: 0.5 }}
        >
          {anchorPoints.toLocaleString()} AP
        </Typography>

        {/* ── Progress bar ── */}
        <Box sx={{ mb: 0.75 }}>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: "#ffe4e6",
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                background: canConvert
                  ? "linear-gradient(90deg, #f59e0b, #f59e0b)"
                  : "linear-gradient(90deg, #f59e0b, #e11d48)",
              },
            }}
          />
        </Box>

        {/* ── Sub-label ── */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 1.5 }}
        >
          {canConvert ? (
            <Box component="span" sx={{ color: "#d97706", fontWeight: 600 }}>
              Ready to convert! 🎉
            </Box>
          ) : (
            `${pointsToNext} more AP to your next 360 Point`
          )}
        </Typography>

        {/* ── Convert error ── */}
        {convertError && (
          <Typography
            variant="caption"
            sx={{ display: "block", color: "#be123c", mb: 1 }}
          >
            {convertError}
          </Typography>
        )}

        {/* ── Convert button ── */}
        <Button
          fullWidth
          variant={canConvert ? "contained" : "outlined"}
          size="small"
          disabled={!canConvert || isConverting}
          onClick={handleConvert}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.75rem",
            py: 0.75,
            ...(canConvert
              ? {
                  bgcolor: "#f59e0b",
                  color: "#fff",
                  "&:hover": { bgcolor: "#d97706" },
                }
              : {
                  borderColor: "#fecdd3",
                  color: "#9ca3af",
                }),
          }}
        >
          {isConverting
            ? "Converting…"
            : canConvert
            ? "✨ Convert → 360 Point"
            : `${100 - anchorPoints < 0 ? 0 : 100 - anchorPoints} AP needed`}
        </Button>
      </CardContent>
    </Card>
  );
}
