"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

type HistoryTask = {
  taskId: number;
  title: string;
  category: string;
  difficulty: string;
  completionStatus: string;
  score: number | null;
  submittedAt: string | null;
  answer: string | null;
  feedback: string | null;
};

type HistoryDay = {
  date: string;
  completedCount: number;
  totalCount: number;
  dayScore: number | null;
  tasks: HistoryTask[];
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function DifficultyChip({ difficulty }: { difficulty: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    easy:   { bg: "#DCFCE7", color: "#065F46" },
    medium: { bg: "#FEF3C7", color: "#92400E" },
    hard:   { bg: "#FEE2E2", color: "#B91C1C" },
  };
  const style = map[difficulty?.toLowerCase()] ?? {
    bg: "rgba(209,112,51,0.1)",
    color: "rgb(209,112,51)",
  };
  return (
    <Chip
      label={difficulty?.toUpperCase() ?? "—"}
      size="small"
      sx={{ fontWeight: 700, height: 20, fontSize: "0.65rem", bgcolor: style.bg, color: style.color }}
    />
  );
}

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function HistorySection({ createdAt }: { createdAt?: string }) {
  const [history, setHistory] = useState<HistoryDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);

  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  // Earliest month the user can navigate to
  const minDate = useMemo(
    () => (createdAt ? new Date(createdAt) : new Date(today.getFullYear(), today.getMonth(), 1)),
    [createdAt, today]
  );

  useEffect(() => {
    fetch("http://localhost:3001/rag/history?limit=365", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setHistory(data.history ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // Build lookup: date string → HistoryDay
  const historyMap = useMemo(() => {
    const m = new Map<string, HistoryDay>();
    history.forEach((d) => m.set(d.date, d));
    return m;
  }, [history]);

  // Calendar grid for current view month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (Date | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(viewYear, viewMonth, d));
    }
    // Pad to full 7-column rows
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  const canGoPrev = useMemo(
    () => new Date(viewYear, viewMonth, 1) > new Date(minDate.getFullYear(), minDate.getMonth(), 1),
    [viewYear, viewMonth, minDate]
  );
  const canGoNext = useMemo(
    () => new Date(viewYear, viewMonth, 1) < new Date(today.getFullYear(), today.getMonth(), 1),
    [viewYear, viewMonth, today]
  );

  function prevMonth() {
    if (!canGoPrev) return;
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelectedDate(null);
    setExpandedTaskId(null);
  }
  function nextMonth() {
    if (!canGoNext) return;
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelectedDate(null);
    setExpandedTaskId(null);
  }

  function dotColor(day: HistoryDay) {
    if (day.completedCount === day.totalCount) return "rgb(34,197,94)"; // all done → green
    if (day.completedCount > 0) return "rgb(234,179,8)";               // partial → yellow
    return "rgba(209,112,51,0.5)";                                      // assigned → faint orange
  }

  const selectedDay = selectedDate ? historyMap.get(selectedDate) : null;

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        border: "1px solid rgba(209,112,51,0.1)",
        overflow: "hidden",
      }}
    >
      {/* Gradient top bar */}
      <Box sx={{ height: 4, background: "linear-gradient(to right, rgb(209,112,51), #E5B526)" }} />

      <CardHeader
        sx={{
          px: 3, pt: 2.5, pb: 1,
          "& .MuiCardHeader-title": {
            fontWeight: 700,
            background: "linear-gradient(to right, rgb(209,112,51), #E5B526)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          },
          "& .MuiCardHeader-subheader": { fontSize: "0.85rem" },
        }}
        title="Task History"
        subheader="Click any highlighted date to see that day's tasks"
      />

      <Divider sx={{ mx: 3, mb: 0, background: "linear-gradient(to right, rgb(209,112,51), #E5B526)", height: 2 }} />

      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={28} sx={{ color: "rgb(209,112,51)" }} />
          </Box>
        )}

        {!loading && error && (
          <Typography variant="body2" color="text.secondary" sx={{ px: 3, py: 3 }}>
            Could not load history. Please try again later.
          </Typography>
        )}

        {!loading && !error && (
          <>
            {/* ── Month navigation ── */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, pt: 2, pb: 1 }}>
              <IconButton size="small" onClick={prevMonth} disabled={!canGoPrev} sx={{ color: canGoPrev ? "rgb(209,112,51)" : "text.disabled" }}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography fontWeight={700} fontSize={15}>
                {MONTHS[viewMonth]} {viewYear}
              </Typography>
              <IconButton size="small" onClick={nextMonth} disabled={!canGoNext} sx={{ color: canGoNext ? "rgb(209,112,51)" : "text.disabled" }}>
                <ChevronRightIcon />
              </IconButton>
            </Box>

            {/* ── Weekday headers ── */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", px: 2, mb: 0.5 }}>
              {WEEKDAYS.map((wd) => (
                <Typography key={wd} variant="caption" align="center" color="text.secondary" fontWeight={600} sx={{ py: 0.5 }}>
                  {wd}
                </Typography>
              ))}
            </Box>

            {/* ── Calendar grid ── */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", px: 2, pb: 1, gap: "2px" }}>
              {calendarDays.map((date, i) => {
                if (!date) return <Box key={`empty-${i}`} />;

                const key = dayKey(date);
                const dayData = historyMap.get(key);
                const isToday = key === dayKey(today);
                const isSelected = key === selectedDate;
                const isFuture = date > today;

                return (
                  <Box
                    key={key}
                    onClick={() => {
                      if (dayData) setSelectedDate(isSelected ? null : key);
                    }}
                    sx={{
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      aspectRatio: "1",
                      borderRadius: 2,
                      cursor: dayData ? "pointer" : "default",
                      transition: "all 0.15s",
                      bgcolor: isSelected
                        ? "rgba(209,112,51,0.15)"
                        : isToday
                        ? "rgba(209,112,51,0.06)"
                        : "transparent",
                      border: isSelected
                        ? "2px solid rgb(209,112,51)"
                        : isToday
                        ? "2px solid rgba(209,112,51,0.3)"
                        : "2px solid transparent",
                      "&:hover": dayData
                        ? { bgcolor: "rgba(209,112,51,0.1)" }
                        : {},
                      opacity: isFuture ? 0.3 : 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={isToday ? 800 : dayData ? 600 : 400}
                      fontSize={13}
                      color={isSelected ? "rgb(209,112,51)" : isToday ? "rgb(209,112,51)" : "text.primary"}
                    >
                      {date.getDate()}
                    </Typography>
                    {dayData && (
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          bgcolor: dotColor(dayData),
                          mt: 0.3,
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>

            {/* ── Legend ── */}
            <Box sx={{ display: "flex", gap: 2, px: 3, pb: 2, pt: 0.5 }}>
              {[
                { color: "rgb(34,197,94)", label: "All done" },
                { color: "rgb(234,179,8)", label: "Partial" },
                { color: "rgba(209,112,51,0.5)", label: "Assigned" },
              ].map(({ color, label }) => (
                <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: color }} />
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                </Box>
              ))}
            </Box>

            {/* ── Selected day detail ── */}
            {selectedDay && (
              <>
                <Divider sx={{ mx: 3 }} />
                <Box sx={{ px: 3, py: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                    <Typography fontWeight={700} fontSize={14}>
                      {new Date(selectedDate! + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "long", month: "long", day: "numeric", year: "numeric",
                      })}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {selectedDay.completedCount}/{selectedDay.totalCount} completed
                      </Typography>
                      {selectedDay.dayScore != null && (
                        <Chip
                          label={`${selectedDay.dayScore}/10`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            height: 20,
                            bgcolor: selectedDay.dayScore >= 8 ? "#DCFCE7" : selectedDay.dayScore >= 5 ? "#FEF3C7" : "#FEE2E2",
                            color: selectedDay.dayScore >= 8 ? "#065F46" : selectedDay.dayScore >= 5 ? "#92400E" : "#B91C1C",
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  {selectedDay.tasks.map((task) => {
                    const done = task.completionStatus === "completed";
                    const isExpanded = expandedTaskId === task.taskId;
                    const hasAnswer = done && (task.answer || task.feedback);
                    return (
                      <Box
                        key={task.taskId}
                        sx={{
                          borderBottom: "1px solid rgba(0,0,0,0.05)",
                          "&:last-child": { borderBottom: "none" },
                        }}
                      >
                        {/* Task row */}
                        <Box
                          onClick={() => hasAnswer && setExpandedTaskId(isExpanded ? null : task.taskId)}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            py: 1,
                            cursor: hasAnswer ? "pointer" : "default",
                            borderRadius: 1,
                            "&:hover": hasAnswer ? { bgcolor: "rgba(209,112,51,0.04)" } : {},
                          }}
                        >
                          {done ? (
                            <CheckCircleOutlineIcon sx={{ color: "rgb(209,112,51)", fontSize: 18, flexShrink: 0 }} />
                          ) : (
                            <RadioButtonUncheckedIcon sx={{ color: "text.disabled", fontSize: 18, flexShrink: 0 }} />
                          )}
                          <Typography
                            variant="body2"
                            sx={{ flex: 1, color: done ? "text.primary" : "text.secondary", fontWeight: done ? 600 : 400 }}
                          >
                            {task.title}
                          </Typography>
                          <Chip
                            label={task.category?.replace(/_/g, " ")}
                            size="small"
                            sx={{ height: 20, fontSize: "0.65rem", bgcolor: "rgba(209,112,51,0.08)", color: "rgb(209,112,51)", fontWeight: 600 }}
                          />
                          <DifficultyChip difficulty={task.difficulty} />
                          {task.score != null && (
                            <Typography variant="caption" fontWeight={700} sx={{ minWidth: 40, textAlign: "right", color: "rgb(209,112,51)" }}>
                              {task.score}/10
                            </Typography>
                          )}
                          {hasAnswer && (
                            <Typography variant="caption" sx={{ color: "rgb(209,112,51)", fontSize: "0.7rem" }}>
                              {isExpanded ? "▲" : "▼"}
                            </Typography>
                          )}
                        </Box>

                        {/* Expanded answer + feedback */}
                        {isExpanded && (
                          <Box sx={{ pl: 3.5, pr: 1, pb: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
                            {task.answer && (
                              <Box sx={{ bgcolor: "rgba(0,0,0,0.03)", borderRadius: 2, p: 1.5 }}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
                                  YOUR ANSWER
                                </Typography>
                                <Typography variant="body2" sx={{ color: "text.primary", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                                  {task.answer}
                                </Typography>
                              </Box>
                            )}
                            {task.feedback && (
                              <Box sx={{ bgcolor: "rgba(209,112,51,0.06)", borderRadius: 2, p: 1.5, border: "1px solid rgba(209,112,51,0.15)" }}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: "rgb(209,112,51)", display: "block", mb: 0.5 }}>
                                  AI FEEDBACK
                                </Typography>
                                <Typography variant="body2" sx={{ color: "text.primary", lineHeight: 1.6 }}>
                                  {task.feedback}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </>
            )}

            {history.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ px: 3, pb: 3 }}>
                No history yet — complete your first daily plan on the Dashboard!
              </Typography>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
