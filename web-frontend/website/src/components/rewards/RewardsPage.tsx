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
  Divider,
} from "@mui/material";
import { Zap, Trophy, Flame, CheckCircle, Clock, Lock, ChevronDown, ChevronUp, Star } from "lucide-react";
import { api, PointsSummary, PointsEntry } from "@/lib/api";

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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
      flex: 1, minWidth: 0,
      background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
      color: "#fff",
      boxShadow: "0 4px 14px rgba(44,26,10,0.10)",
      border: "none",
    }}>
      <CardContent sx={{ pb: "16px !important" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1, opacity: 0.85 }}>
          {icon}
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
            {label}
          </Typography>
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff", fontFamily: "'Playfair Display', serif" }}>
          {value}
        </Typography>
        {sub && (
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.75)", display: "block", mt: 0.25 }}>
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
      border: unlocked ? "1.5px solid #b87444" : "1px solid #e8ddd0",
      bgcolor: unlocked ? "#fdfaf7" : "#fdfaf7",
      boxShadow: unlocked ? "0 4px 16px rgba(184,116,68,0.18)" : "none",
      transition: "all 0.25s ease",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: unlocked ? "0 8px 24px rgba(184,116,68,0.25)" : "0 4px 12px rgba(44,26,10,0.08)",
      },
    }}>
      <CardContent sx={{ textAlign: "center", py: 2.5, pb: "20px !important" }}>
        <Box sx={{
          width: 52, height: 52, borderRadius: "50%",
          bgcolor: unlocked ? "#f5ede0" : "#f5ede0",
          display: "flex", alignItems: "center", justifyContent: "center",
          mx: "auto", mb: 1.25, fontSize: "1.6rem",
        }}>
          {unlocked ? badge.emoji : <Lock size={20} color="#b8a090" />}
        </Box>

        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: unlocked ? "#b87444" : "#8c6a50", mb: 0.5 }}>
          {badge.title}
        </Typography>
        <Typography variant="caption" sx={{ display: "block", mb: 1.25, lineHeight: 1.4, color: "#8c6a50" }}>
          {badge.desc}
        </Typography>

        {unlocked ? (
          <Chip
            label="Unlocked"
            size="small"
            icon={<CheckCircle size={11} />}
            sx={{
              bgcolor: "#f5ede0", color: "#b87444", fontWeight: 700,
              fontSize: "0.65rem", height: 22,
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
                bgcolor: "#e8ddd0", mb: 0.5,
                "& .MuiLinearProgress-bar": { borderRadius: 3, bgcolor: "#b87444" },
              }}
            />
            <Typography variant="caption" sx={{ color: "#8c6a50", fontSize: "0.65rem" }}>
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
  const [activityOpen, setActivityOpen] = useState(false);

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
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, md: 3 } }}>

      {/* ── Hero banner ── */}
      <Box sx={{
        background: "linear-gradient(135deg, #b87444 0%, #a0622e 60%, #2c1a0a 100%)",
        borderRadius: 3,
        p: { xs: 2.5, md: 4 },
        mb: 3, color: "#fff",
        position: "relative", overflow: "hidden",
      }}>
        <Box sx={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.06)" }} />
        <Box sx={{ position: "absolute", bottom: -20, right: 80, width: 90, height: 90, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.06)" }} />

        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 0.75 }}>
              <Trophy size={26} color="#f5ede0" fill="#f5ede0" />
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff", fontFamily: "'Playfair Display', serif" }}>
                Rewards
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)", maxWidth: 420 }}>
              Complete daily tasks to earn Anchor Points. Build streaks, unlock badges, and convert points into 360 Points.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ textAlign: "center", bgcolor: "rgba(255,255,255,0.12)", borderRadius: 2, px: 2.5, py: 1.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#f5ede0", lineHeight: 1 }}>
                {unlockedBadges}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>badges</Typography>
            </Box>
            <Box sx={{ textAlign: "center", bgcolor: "rgba(255,255,255,0.12)", borderRadius: 2, px: 2.5, py: 1.5 }}>
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
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
        gap: 2, mb: 3,
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
        mb: 3,
        border: canConvert ? "1.5px solid #b87444" : "1px solid #e8ddd0",
        boxShadow: canConvert ? "0 0 0 3px rgba(184,116,68,0.15)" : "0 1px 4px rgba(44,26,10,0.06)",
        background: "#ffffff",
      }}>
        <CardContent sx={{ p: { xs: 2, md: 2.5 }, pb: "20px !important" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.25, flexWrap: "wrap", gap: 1 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#2c1a0a", lineHeight: 1.3, fontFamily: "'Playfair Display', serif" }}>
                Progress to next 360 Point
              </Typography>
              <Typography variant="caption" sx={{ color: "#8c6a50" }}>
                100 AP = 1 × 360 Point
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: canConvert ? "#b87444" : "#8c6a50" }}>
              {canConvert ? "Ready! 🎉" : `${anchorPoints} / ${conversionThreshold} AP`}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              height: 12, borderRadius: 6,
              bgcolor: "#f5ede0", mb: 1.5,
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
              textTransform: "none", fontWeight: 700, borderRadius: 2, px: 3,
              ...(canConvert
                ? { bgcolor: "#b87444", "&:hover": { bgcolor: "#a0622e" }, color: "#fff", boxShadow: "0 4px 12px rgba(184,116,68,0.30)" }
                : { borderColor: "#e8ddd0", color: "#b8a090" }),
            }}
          >
            {isConverting ? "Converting…" : canConvert ? "✨ Convert 100 AP → 1 × 360 Point" : `Need ${pointsToNext} more AP`}
          </Button>
        </CardContent>
      </Card>

      {/* ── Badges ── */}
      <Card sx={{ mb: 3, boxShadow: "0 1px 4px rgba(44,26,10,0.06)", border: "1px solid #e8ddd0", background: "#ffffff" }}>
        <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#2c1a0a", fontFamily: "'Playfair Display', serif" }}>
              Badges
            </Typography>
            <Chip
              label={`${unlockedBadges} / ${BADGES.length} unlocked`}
              size="small"
              sx={{
                bgcolor: unlockedBadges > 0 ? "#f5ede0" : "#f5ede0",
                color: unlockedBadges > 0 ? "#b87444" : "#8c6a50",
                fontWeight: 600, fontSize: "0.7rem", height: 22,
                border: "1px solid #e8ddd0",
              }}
            />
          </Box>
          <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(6, 1fr)" },
            gap: 1.5,
          }}>
            {BADGES.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} stats={stats} />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* ── Recent Activity ── */}
      <Card sx={{ boxShadow: "0 1px 4px rgba(44,26,10,0.06)", border: "1px solid #e8ddd0", background: "#ffffff" }}>
        <CardContent sx={{ p: { xs: 2, md: 2.5 }, pb: activityOpen ? undefined : "16px !important" }}>
          <Box
            onClick={() => setActivityOpen((v) => !v)}
            sx={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              cursor: "pointer", userSelect: "none",
              mb: activityOpen ? 2 : 0,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#2c1a0a", fontFamily: "'Playfair Display', serif" }}>
              Recent Activity
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {history.length > 0 && (
                <Chip
                  label={`${history.length} entries`}
                  size="small"
                  sx={{ fontSize: "0.65rem", height: 20, bgcolor: "#f5ede0", color: "#8c6a50", border: "1px solid #e8ddd0" }}
                />
              )}
              {activityOpen
                ? <ChevronUp size={18} color="#8c6a50" />
                : <ChevronDown size={18} color="#8c6a50" />}
            </Box>
          </Box>

          {activityOpen && history.length === 0 && (
            <Box sx={{ textAlign: "center", py: 5 }}>
              <Typography sx={{ fontSize: "2.5rem", mb: 1 }}>⚡</Typography>
              <Typography variant="body2" sx={{ color: "#8c6a50" }}>No activity yet.</Typography>
              <Typography variant="caption" sx={{ color: "#b8a090" }}>
                Complete tasks to earn Anchor Points!
              </Typography>
            </Box>
          )}

          {activityOpen && history.length > 0 && (() => {
            const earned = history.filter((e) => e.type === "task_earned").slice(0, 20);
            const redeemed = history.filter((e) => e.type === "converted_to_360").slice(0, 20);

            const EntryRow = ({ entry }: { entry: PointsEntry }) => (
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <Box sx={{
                    width: 32, height: 32, borderRadius: "50%",
                    bgcolor: entry.type === "task_earned" ? "#f5ede0" : "#ede8e0",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    {entry.type === "task_earned"
                      ? <Zap size={14} color="#b87444" fill="#b87444" />
                      : <Trophy size={14} color="#8c6a50" />}
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: "block", color: "#2c1a0a", lineHeight: 1.3 }}>
                      {entry.type === "task_earned" ? "Task completed" : "Redeemed"}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                      <Clock size={10} color="#b8a090" />
                      <Typography variant="caption" sx={{ color: "#b8a090", fontSize: "0.65rem" }}>
                        {formatDate(entry.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Chip
                  label={`${entry.amount > 0 ? "+" : ""}${entry.amount} AP`}
                  size="small"
                  sx={{
                    fontWeight: 700, fontSize: "0.7rem", height: 22,
                    bgcolor: entry.amount > 0 ? "#f5ede0" : "#fef2f2",
                    color: entry.amount > 0 ? "#b87444" : "#a0622e",
                    border: `1px solid ${entry.amount > 0 ? "#e8ddd0" : "#fca5a5"}`,
                  }}
                />
              </Box>
            );

            const Column = ({
              title, icon, entries, emptyMsg, accentColor, bgColor,
            }: {
              title: string;
              icon: React.ReactNode;
              entries: PointsEntry[];
              emptyMsg: string;
              accentColor: string;
              bgColor: string;
            }) => (
              <Box sx={{ flex: 1, minWidth: 0, border: "1px solid #e8ddd0", borderRadius: 2, overflow: "hidden" }}>
                <Box sx={{
                  display: "flex", alignItems: "center", gap: 0.75,
                  px: 1.5, py: 1, bgcolor: bgColor, borderBottom: "1px solid #e8ddd0",
                }}>
                  {icon}
                  <Typography variant="caption" sx={{ fontWeight: 700, color: accentColor }}>
                    {title}
                  </Typography>
                  <Chip
                    label={entries.length}
                    size="small"
                    sx={{ ml: "auto", height: 18, fontSize: "0.6rem", bgcolor: "rgba(44,26,10,0.06)", color: accentColor, fontWeight: 700 }}
                  />
                </Box>
                {entries.length === 0 ? (
                  <Box sx={{ py: 3, textAlign: "center" }}>
                    <Typography variant="caption" sx={{ color: "#b8a090" }}>{emptyMsg}</Typography>
                  </Box>
                ) : (
                  <Box sx={{ px: 1.5, maxHeight: 320, overflowY: "auto" }}>
                    {entries.map((entry, i) => (
                      <Box key={entry.id}>
                        <EntryRow entry={entry} />
                        {i < entries.length - 1 && <Divider sx={{ opacity: 0.4, borderColor: "#e8ddd0" }} />}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            );

            return (
              <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                <Column
                  title="Anchor Points Earned"
                  icon={<Zap size={13} color="#b87444" fill="#b87444" />}
                  entries={earned}
                  emptyMsg="No points earned yet"
                  accentColor="#b87444"
                  bgColor="#fdfaf7"
                />
                <Column
                  title="360 Points Redeemed"
                  icon={<Trophy size={13} color="#8c6a50" />}
                  entries={redeemed}
                  emptyMsg="No redemptions yet"
                  accentColor="#8c6a50"
                  bgColor="#fdfaf7"
                />
              </Box>
            );
          })()}
        </CardContent>
      </Card>

    </Box>
  );
}