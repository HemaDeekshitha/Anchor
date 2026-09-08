"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { CalendarDays, Check, Map, Target, X } from "lucide-react";
import { apiFetch, requireOk } from "@/lib/auth-client";
import { C } from "@/lib/ui-colors";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type DurationMonths = 1 | 3 | 6;

interface TrackOption {
  durationMonths: DurationMonths;
  questionTarget?: number | null;
  name: string;
  description: string;
  totalWeeks: number;
  defaultDailyQuestions: number;
}

interface RoadmapPhase {
  name: string;
  startWeek: number;
  endWeek: number;
  outcome: string;
  competencies: string[];
}

interface RoadmapWeek {
  week: number;
  phase: string;
  focus: string[];
  milestone: string;
}

interface LearningTrack {
  id: string;
  targetRole: string;
  durationMonths: DurationMonths;
  startDate: string;
  targetDate: string;
  roadmap: {
    totalWeeks: number;
    learningDaysPerWeek: number;
    estimatedQuestionsMin?: number;
    estimatedQuestionsMax?: number;
    phases: RoadmapPhase[];
    weeks: RoadmapWeek[];
  };
}

const durationAccent: Record<DurationMonths, string> = {
  1: "#b87444",
  3: "#2e8b7d",
  6: "#6657a8",
};

function questionRange(duration: DurationMonths) {
  if (duration === 1) return "100 total questions";
  if (duration === 3) return "200–250 total questions";
  return "500 total questions";
}

export default function LearningTrackPanel() {
  const [options, setOptions] = useState<TrackOption[]>([]);
  const [track, setTrack] = useState<LearningTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingDuration, setSavingDuration] = useState<DurationMonths | null>(null);
  const [roadmapOpen, setRoadmapOpen] = useState(false);
  const [changingPlan, setChangingPlan] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const [optionsResponse, currentResponse] = await Promise.all([
        apiFetch(`${API_BASE_URL}/learning-tracks/options`),
        apiFetch(`${API_BASE_URL}/learning-tracks/current`),
      ]);
      await requireOk(optionsResponse, "Unable to load plan options");
      await requireOk(currentResponse, "Unable to load your learning plan");
      const [optionData, currentData] = await Promise.all([
        optionsResponse.json(),
        currentResponse.json(),
      ]);
      setOptions(optionData);
      setTrack(currentData.track ?? null);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Unable to load learning plans"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const choosePlan = async (durationMonths: DurationMonths) => {
    try {
      setError("");
      setSavingDuration(durationMonths);
      const response = await apiFetch(`${API_BASE_URL}/learning-tracks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationMonths }),
      });
      await requireOk(response, "Unable to create your learning plan");
      setTrack(await response.json());
      setChangingPlan(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Unable to create your plan"
      );
    } finally {
      setSavingDuration(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
        <CircularProgress size={28} sx={{ color: "#b87444" }} />
      </Box>
    );
  }

  if (track && !changingPlan) {
    const completedWeeks = Math.max(
      0,
      Math.min(
        track.roadmap.totalWeeks,
        Math.floor(
          (Date.now() - new Date(`${track.startDate}T00:00:00`).getTime()) /
            (7 * 24 * 60 * 60 * 1000)
        )
      )
    );

    return (
      <>
        <Card
          sx={{
            mb: 3,
            borderRadius: 4,
            color: "#fff",
            background: `linear-gradient(120deg, ${durationAccent[track.durationMonths]}, #2c1a0a)`,
            boxShadow: "0 14px 34px rgba(44,26,10,0.16)",
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
                alignItems: { xs: "flex-start", md: "center" },
                flexDirection: { xs: "column", md: "row" },
              }}
            >
              <Box>
                <Chip
                  label={`${track.durationMonths}-month learning track`}
                  size="small"
                  sx={{ mb: 1.5, color: "#fff", bgcolor: "rgba(255,255,255,.16)" }}
                />
                <Typography sx={{ fontSize: "clamp(1.6rem, 2vw, 2rem)", fontWeight: 800 }}>
                  {track.targetRole} Roadmap
                </Typography>
                <Typography sx={{ mt: 0.6, color: "rgba(255,255,255,.78)" }}>
                  Week {Math.min(completedWeeks + 1, track.roadmap.totalWeeks)} of{" "}
                  {track.roadmap.totalWeeks} · daily volume adapts to your performance
                </Typography>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                <Button
                  onClick={() => setRoadmapOpen(true)}
                  startIcon={<Map size={17} />}
                  sx={{ color: "#fff", borderColor: "rgba(255,255,255,.5)" }}
                  variant="outlined"
                >
                  View roadmap
                </Button>
                <Button
                  onClick={() => setChangingPlan(true)}
                  sx={{ bgcolor: "#fff", color: "#111", "&:hover": { bgcolor: "#f3f3f3" } }}
                  variant="contained"
                >
                  Change plan
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        <Dialog
          open={roadmapOpen}
          onClose={() => setRoadmapOpen(false)}
          fullWidth
          maxWidth="md"
          PaperProps={{ sx: { borderRadius: 4 } }}
        >
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography sx={{ fontSize: "clamp(1.5rem,1.8vw,1.9rem)", fontWeight: 800 }}>
                {track.targetRole} roadmap
              </Typography>
              <Typography sx={{ fontSize: 13, color: C.textMuted }}>
                {questionRange(track.durationMonths)} · target {track.targetDate}
              </Typography>
            </Box>
            <Button onClick={() => setRoadmapOpen(false)} aria-label="Close roadmap">
              <X size={20} />
            </Button>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.2}>
              {track.roadmap.phases.map((phase) => (
                <Box key={phase.name}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                    <Typography sx={{ fontWeight: 800 }}>{phase.name}</Typography>
                    <Typography sx={{ color: C.textMuted, fontSize: 13 }}>
                      Weeks {phase.startWeek}–{phase.endWeek}
                    </Typography>
                  </Box>
                  <Typography sx={{ color: C.textSub, fontSize: 14, mt: 0.5 }}>
                    {phase.outcome}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.7, mt: 1 }}>
                    {phase.competencies.map((competency) => (
                      <Chip key={competency} size="small" label={competency} />
                    ))}
                  </Box>
                  <Divider sx={{ mt: 2.2 }} />
                </Box>
              ))}
            </Stack>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ mb: 2.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
          <Typography sx={{ fontSize: "clamp(1.65rem, 1.8vw, 1.9rem)", fontWeight: 800, color: C.textPrimary, fontFamily: "'Playfair Display', serif" }}>
            Choose your interview learning track
          </Typography>
          {track && changingPlan && (
            <Button onClick={() => setChangingPlan(false)}>Keep current plan</Button>
          )}
        </Box>
        <Typography sx={{ color: C.textMuted, mt: 0.5 }}>
          Anchor will create a role-specific roadmap and adapt your daily questions as you progress.
        </Typography>
      </Box>

      {error && (
        <Typography sx={{ color: "#b42318", mb: 2 }}>{error}</Typography>
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "repeat(3, 1fr)" }, gap: 2 }}>
        {options.map((option) => {
          const accent = durationAccent[option.durationMonths];
          const recommended = option.durationMonths === 3;
          return (
            <Card
              key={option.durationMonths}
              sx={{
                borderRadius: 4,
                border: recommended ? `2px solid ${accent}` : `1px solid ${C.divider}`,
                position: "relative",
                overflow: "visible",
              }}
            >
              {recommended && (
                <Chip
                  label="Recommended"
                  size="small"
                  sx={{ position: "absolute", top: -13, right: 18, bgcolor: accent, color: "#fff" }}
                />
              )}
              <CardContent sx={{ p: { xs: 2, small : 2.5, md: 3 , lg:3.5, xl:4 }, }}>
                <Typography sx={{ color: accent, fontWeight: 800, fontSize: 13, letterSpacing: ".08em" }}>
                  {option.durationMonths} MONTH{option.durationMonths > 1 ? "S" : ""}
                </Typography>
                <Typography sx={{ mt: 1, fontSize: 21, fontWeight: 800, color: C.textPrimary }}>
                  {option.name}
                </Typography>
                <Typography sx={{ mt: 1, minHeight: 64, fontSize: 14, color: C.textMuted }}>
                  {option.description}
                </Typography>
                <Stack spacing={1.1} sx={{ my: 2.5 }}>
                  <Typography sx={{ display: "flex", gap: 1, alignItems: "center", fontSize: 14 }}>
                    <CalendarDays size={17} color={accent} /> {option.totalWeeks} structured weeks
                  </Typography>
                  <Typography sx={{ display: "flex", gap: 1, alignItems: "center", fontSize: 14 }}>
                    <Target size={17} color={accent} /> {questionRange(option.durationMonths)}
                  </Typography>
                  <Typography sx={{ display: "flex", gap: 1, alignItems: "center", fontSize: 14 }}>
                    <Check size={17} color={accent} /> Weekly milestones and mock preparation
                  </Typography>
                </Stack>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={savingDuration !== null}
                  onClick={() => void choosePlan(option.durationMonths)}
                  sx={{ bgcolor: accent, "&:hover": { bgcolor: accent, filter: "brightness(.9)" } }}
                >
                  {savingDuration === option.durationMonths ? "Building roadmap…" : "Choose this track"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
