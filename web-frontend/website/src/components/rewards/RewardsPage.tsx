"use client";
import PageContainer from "@/components/PageContainer";
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
import { Zap, Trophy, Flame, CheckCircle, Lock, Star } from "lucide-react";
import { api, PointsSummary, PointsEntry } from "@/lib/api";
import { FONT } from "@/lib/typography";
import { SPACE } from "@/lib/spacing";
import { SIZE } from "@/lib/sizes";
import { C } from "@/lib/ui-colors";

// ── Badge definitions ────────────────────────────────────────────────────────

interface BadgeDef {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  unlocked: (stats: UserStats) => boolean;
  progress: (stats: UserStats) => { value: number; max: number };
}

const BADGES: BadgeDef[] = [
  {
    id: "getting_started",
    emoji: "🌱",
    title: "Getting Started",
    desc: "Complete 5 tasks",
    unlocked: (s) => s.totalTasks >= 5,
    progress: (s) => ({ value: Math.min(s.totalTasks, 5), max: 5 }),
  },
  {
    id: "dedicated",
    emoji: "📚",
    title: "Dedicated",
    desc: "Complete 25 tasks",
    unlocked: (s) => s.totalTasks >= 25,
    progress: (s) => ({ value: Math.min(s.totalTasks, 25), max: 25 }),
  },
  {
    id: "champion",
    emoji: "🏆",
    title: "Champion",
    desc: "Complete 50 tasks",
    unlocked: (s) => s.totalTasks >= 50,
    progress: (s) => ({ value: Math.min(s.totalTasks, 50), max: 50 }),
  },
  {
    id: "warming_up",
    emoji: "🌤️",
    title: "Warming Up",
    desc: "Achieve a 3-day streak",
    unlocked: (s) => s.bestStreak >= 3,
    progress: (s) => ({ value: Math.min(s.bestStreak, 3), max: 3 }),
  },
  {
    id: "week_warrior",
    emoji: "⚔️",
    title: "Week Warrior",
    desc: "Achieve a 7-day streak",
    unlocked: (s) => s.bestStreak >= 7,
    progress: (s) => ({ value: Math.min(s.bestStreak, 7), max: 7 }),
  },
  {
    id: "unbreakable",
    emoji: "💎",
    title: "Unbreakable",
    desc: "Achieve a 30-day streak",
    unlocked: (s) => s.bestStreak >= 30,
    progress: (s) => ({ value: Math.min(s.bestStreak, 30), max: 30 }),
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

interface UserStats {
  totalTasks: number;
  totalApEarned: number;
  currentStreak: number;
  bestStreak: number;
  points360: number;
}

function computeStats(history: PointsEntry[], points360: number): UserStats {
  const taskEntries = history.filter((e) => e.type === "task_earned");
  const totalTasks = taskEntries.length;
  const totalApEarned = taskEntries.reduce((sum, e) => sum + Math.max(0, e.amount), 0);

  const taskDaySet = new Set(
    taskEntries.map((e) => {
      const d = new Date(e.createdAt);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  let currentStreak = 0;
  const now = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (taskDaySet.has(key)) { currentStreak++; } else { break; }
  }

  const sortedDays = Array.from(taskDaySet)
    .map((key) => { const [y, m, day] = key.split("-").map(Number); return new Date(y, m, day).getTime(); })
    .sort((a, b) => a - b);

  let bestStreak = sortedDays.length > 0 ? 1 : 0;
  let run = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const diffDays = (sortedDays[i] - sortedDays[i - 1]) / 86400000;
    if (diffDays === 1) { run++; bestStreak = Math.max(bestStreak, run); } else { run = 1; }
  }

  return { totalTasks, totalApEarned, currentStreak, bestStreak, points360 };
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, sub, gradientFrom, gradientTo,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  gradientFrom: string;
  gradientTo: string;
}) {
  return (
    <Card sx={{
      width: "100%", minWidth: 0, maxWidth: "100%", height: "160px",
      background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
      color: "#fff",
      boxShadow: "0 4px 14px rgba(44,26,10,0.10)",
      border: "none",
      borderRadius: 3,
    }}>
      <CardContent
        sx={{
          padding: { xs: 2, md: 2.3 },
        }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1, opacity: 0.85 }}>
          {icon}
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
            {label}
          </Typography>
        </Box>
        <Typography variant="h5" sx={{ fontSize: { xs: "2rem", md: "1.9rem" }, fontWeight: 800, color: "#fff", fontFamily: "'Playfair Display', serif" }}>
          {value}
        </Typography>
        {sub && (
          <Typography
            sx={{
              fontSize: "0.78rem",
              color: "rgba(255,255,255,0.75)",
              display: "block",
              mt: 0.25,
            }}>
            {sub}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function BadgeCard({ badge, stats }: { badge: BadgeDef; stats: UserStats }) {
  const unlocked = badge.unlocked(stats);
  const { value, max } = badge.progress(stats);
  const pct = Math.round((value / max) * 100);

  return (
    <Card sx={{
      border: unlocked ? `1.5px solid ${C.accent}` : `1px solid ${C.divider}`,
      bgcolor: C.cardBg,
      boxShadow: unlocked ? "0 4px 16px rgba(184,116,68,0.18)" : "none",
      transition: "all 0.25s ease",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: unlocked ? "0 8px 24px rgba(184,116,68,0.25)" : "0 4px 12px rgba(44,26,10,0.08)",
      },
    }}>
      <CardContent sx={{ textAlign: "center", padding: 2, pb: "20px !important" }}>
        <Box sx={{
          width: 50, height: 50, borderRadius: "50%",
          bgcolor: C.surface,
          display: "flex", alignItems: "center", justifyContent: "center",
          mx: "auto", mb: 0.8, fontSize: "1.3rem",
        }}>
          {unlocked ? badge.emoji : <Lock size={20} color="#b8a090" />}
        </Box>

        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: unlocked ? C.accent : C.textMuted, mb: 0.5 }}>
          {badge.title}
        </Typography>
        <Typography variant="caption" sx={{ display: "block", mb: 0.8, lineHeight: 1.4, color: C.textMuted }}>
          {badge.desc}
        </Typography>

        {unlocked ? (
          <Chip
            label="Unlocked"
            size="small"
            icon={<CheckCircle size={11} />}
            sx={{
              bgcolor: C.surface, color: C.accent, fontWeight: 700,
              fontSize: "clamp(10px,0.8vw,12px)", height: 22,
              "& .MuiChip-icon": { color: "#b87444", ml: "5px" },
            }}
          />
        ) : (
          <Box>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{
                height: 5, borderRadius: 3,
                bgcolor: C.divider, mb: 0.5,
                "& .MuiLinearProgress-bar": { borderRadius: 3, bgcolor: "#b87444" },
              }}
            />
            <Typography variant="caption" sx={{ color: C.textMuted, fontSize: "clamp(10px,0.8vw,12px)" }}>
              {value} / {max}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function RewardsPage() {
  const [data, setData] = useState<PointsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConverting, setIsConverting] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);

  const fetchPoints = useCallback(async () => {
    try {
      const result = await api.getMyPoints();
      setData(result);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPoints(); }, [fetchPoints]);

  const handleConvert = async () => {
    setIsConverting(true);
    setConvertError(null);
    try {
      const updated = await api.convertTo360();
      setData((prev) =>
        prev ? {
          ...prev,
          anchorPoints: updated.anchorPoints,
          points360: updated.points360,
          pointsToNextConversion: updated.pointsToNextConversion,
          progressPercent: updated.progressPercent,
          canConvert: updated.canConvert,
        } : null
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Conversion failed.";
      setConvertError(msg);
    } finally {
      setIsConverting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: "#b87444" }} />
      </Box>
    );
  }

  const history = data?.history ?? [];
  const anchorPoints = data?.anchorPoints ?? 0;
  const points360 = data?.points360 ?? history.filter((e) => e.type === "converted_to_360").length;
  const progressPercent = data?.progressPercent ?? 0;
  const pointsToNext = data?.pointsToNextConversion ?? 100;
  const conversionThreshold = anchorPoints + pointsToNext;
  const canConvert = data?.canConvert ?? false;

  const stats = computeStats(history, points360);
  const unlockedBadges = BADGES.filter((b) => b.unlocked(stats)).length;

  return (
    <PageContainer>
        

      {/* ── Hero banner ── */}
      <Box sx={{
        background: "linear-gradient(135deg, #b87444 0%, #a0622e 60%, #2c1a0a 100%)",
        borderRadius: 3,
        px: {
          xs: 2,
          md: 3,
        },
        py: {
          xs: 2,
          md: 3,
        },
        mb: 2.5, color: "#fff",
        position: "relative", overflow: "hidden",
      }}>
        <Box sx={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.06)" }} />
        <Box sx={{ position: "absolute", bottom: -20, right: 80, width: 90, height: 90, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.06)" }} />

        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 0.75 }}>
              <Trophy size={26} color="#f5ede0" fill="#f5ede0" />
              <Typography sx={{ fontSize: { xs: "2rem", md: "2rem" }, fontWeight: 800, color: "#fff", fontFamily: "'Playfair Display', serif" }}>
                Rewards
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontSize: FONT.sm, color: "rgba(255,255,255,0.75)", maxWidth: 420 }}>
              Complete daily tasks to earn Anchor Points. Build streaks, unlock badges, and convert points into 360 Points.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Box sx={{ textAlign: "center", bgcolor: "rgba(255,255,255,0.12)", borderRadius: 2, px: 2, py: 1.1 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#f5ede0", lineHeight: 1 }}>
                {unlockedBadges}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>badges</Typography>
            </Box>
            <Box sx={{ textAlign: "center", bgcolor: "rgba(255,255,255,0.12)", borderRadius: 2, px: 2, py: 1.1 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#f5ede0", lineHeight: 1 }}>
                {stats.currentStreak}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>day streak</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Stat cards ── */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
        width: "100%",
        gap: {xs: 2,md: 3,}, mb: 2,
      }}>
        <StatCard
          icon={<Zap size={15} color="rgba(255,255,255,0.9)" fill="rgba(255,255,255,0.9)" />}
          label="Anchor Points"
          value={`${anchorPoints.toLocaleString()} AP`}
          sub={canConvert ? "Ready to convert! 🎉" : `${pointsToNext} to next 360`}
          gradientFrom="#b87444"
          gradientTo="#a0622e"
        />
        <StatCard
          icon={<Star size={15} color="rgba(255,255,255,0.9)" fill="rgba(255,255,255,0.9)" />}
          label="360 Points"
          value={points360}
          sub={points360 === 1 ? "1 point earned" : points360 > 0 ? `${points360} points earned` : "Convert 100 AP to earn"}
          gradientFrom="#6b4226"
          gradientTo="#2c1a0a"
        />
        <StatCard
          icon={<CheckCircle size={15} color="rgba(255,255,255,0.9)" />}
          label="Tasks Done"
          value={stats.totalTasks}
          sub={`${stats.totalApEarned} AP earned total`}
          gradientFrom="#8a6240"
          gradientTo="#5c3d20"
        />
        <StatCard
          icon={<Flame size={15} color="rgba(255,255,255,0.9)" />}
          label="Current Streak"
          value={`${stats.currentStreak}d`}
          sub={`Best: ${stats.bestStreak} days`}
          gradientFrom="#c4854e"
          gradientTo="#a0622e"
        />
      </Box>

      {/* ── Progress to 360 ── */}
      <Card sx={{
        mb: 2,
        border: canConvert ? `1.5px solid ${C.accent}` : `1px solid ${C.divider}`,
        boxShadow: canConvert ? "0 0 0 3px rgba(184,116,68,0.15)" : "0 1px 4px rgba(44,26,10,0.06)",
        background: C.cardBg,
        borderRadius: 3,
      }}>
        <CardContent sx={{ padding: { xs: 2,sm: 2.5, md: 3,lg: 3.5,xl:4 }, pb: "20px !important" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.25, flexWrap: "wrap", gap: 1 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: C.textPrimary, lineHeight: 1.3, fontFamily: "'Playfair Display', serif" }}>
                Progress to next 360 Point
              </Typography>
              <Typography variant="caption" sx={{ color: C.textMuted }}>
                100 AP = 1 × 360 Point
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: canConvert ? C.accent : C.textMuted }}>
              {canConvert ? "Ready! 🎉" : `${anchorPoints} / ${conversionThreshold} AP`}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              height: 8, borderRadius: 3,
              bgcolor: C.surface, mb: 1.5,
              "& .MuiLinearProgress-bar": {
                borderRadius: 6,
                background: canConvert
                  ? "linear-gradient(90deg, #b87444, #a0622e)"
                  : "linear-gradient(90deg, #b87444, #2c1a0a)",
              },
            }}
          />
          {convertError && (
            <Typography variant="caption" sx={{ color: "#a0622e", display: "block", mb: 1 }}>
              {convertError}
            </Typography>
          )}
          <Button
            variant={canConvert ? "contained" : "outlined"}
            disabled={!canConvert || isConverting}
            onClick={handleConvert}
            sx={{
              textTransform: "none", fontWeight: 700, borderRadius: 3, height: 42, fontSize: FONT.md, px: 3,
              ...(canConvert
                ? { bgcolor: "#b87444", "&:hover": { bgcolor: "#a0622e" }, color: "#fff", boxShadow: "0 4px 12px rgba(184,116,68,0.30)" }
                : { borderColor: C.divider, color: C.textMuted }),
            }}
          >
            {isConverting ? "Converting…" : canConvert ? "✨ Convert 100 AP → 1 × 360 Point" : `Need ${pointsToNext} more AP`}
          </Button>
        </CardContent>
      </Card>

      {/* ── Badges ── */}
      <Card sx={{ mb: 2, boxShadow: "0 1px 4px rgba(44,26,10,0.06)", border: `1px solid ${C.divider}`, background: C.cardBg, borderRadius: 3 }}>
        <CardContent sx={{ padding: { xs: 2,md: 2.5, lg: 3, }}}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: C.textPrimary, fontFamily: "'Playfair Display', serif" }}>
              Badges
            </Typography>
            <Chip
              label={`${unlockedBadges} / ${BADGES.length} unlocked`}
              size="small"
              sx={{
                bgcolor: C.surface,
                color: unlockedBadges > 0 ? C.accent : C.textMuted,
                fontWeight: 600, fontSize: FONT.sm, height: 22,
                border: `1px solid ${C.divider}`,
              }}
            />
          </Box>
          <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)",
            lg: "repeat(6, minmax(140px, 1fr))", },
            gap: 1.2,
          }}>
            {BADGES.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} stats={stats} />
            ))}
          </Box>
        </CardContent>
      </Card>

    </PageContainer>
  );
}
