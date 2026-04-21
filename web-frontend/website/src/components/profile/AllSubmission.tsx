"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import UnfoldMoreRoundedIcon from "@mui/icons-material/UnfoldMoreRounded";
import Tooltip from "@mui/material/Tooltip";
import LayoutWithSidebar from "../SideBar/LayoutWithSidebar";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
import { useRouter } from "next/navigation";
import SubmissionDetailModal, {
  type Submission,
} from "./Submissiondetailmodal";

const C = {
  accent: "#b87444",
  accentDark: "#a0622e",
  accentBg: "rgba(184,116,68,0.08)",
  accentBorder: "rgba(184,116,68,0.18)",
  accentFaint: "rgba(184,116,68,0.10)",
  accentHover: "rgba(184,116,68,0.04)",
  accentSelected: "rgba(184,116,68,0.13)",
  accentGrad: "linear-gradient(to right, #b87444, #a0622e)",
  dotActive: "#b87444",
  surface: "#fdfaf7",
  divider: "#e8ddd0",
  textPrimary: "#2c1a0a",
  textSub: "#8c6a50",
  textHint: "#b8a090",
  calDayHover: "rgba(184,116,68,0.07)",
} as const;

const ROWS_PER_PAGE = 10;

const COLUMNS = [
  { key: "title", label: "Task", width: "1fr", align: "left" },
  { key: "category", label: "Category", width: "160px", align: "left" },
  { key: "score", label: "Score", width: "80px", align: "center" },
  { key: "createdAt", label: "Date", width: "170px", align: "center" },
] as const;

type ColKey = (typeof COLUMNS)[number]["key"];
type SortDir = "asc" | "desc";
const GRID_COLS = COLUMNS.map((c) => c.width).join(" ");

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function getTimeAgo(ds: string) {
  const diff = Math.floor((Date.now() - new Date(ds).getTime()) / 1000);
  const units = [
    { label: "year", value: 60 * 60 * 24 * 365 },
    { label: "month", value: 60 * 60 * 24 * 30 },
    { label: "week", value: 60 * 60 * 24 * 7 },
    { label: "day", value: 60 * 60 * 24 },
    { label: "hour", value: 60 * 60 },
    { label: "minute", value: 60 },
  ];
  for (const u of units) {
    const n = Math.floor(diff / u.value);
    if (n >= 1) return `${n} ${u.label}${n > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

function formatDate(ds: string) {
  const [year, month, day] = ds.slice(0, 10).split("-");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
}

function groupByMonth(subs: Submission[]) {
  const groups: Record<string, Submission[]> = {};
  for (const s of subs) {
    const label = new Date(s.createdAt).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    if (!groups[label]) groups[label] = [];
    groups[label].push(s);
  }
  return groups;
}

function getCategoryColor(cat: string) {
  const PALETTES = [
    { bg: "#fde8d8", text: "#9a3412", border: "#f4b896" },
    { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
    { bg: "#fce7f3", text: "#9d174d", border: "#f9a8d4" },
    { bg: "#dcfce7", text: "#166534", border: "#86efac" },
    { bg: "#ede9fe", text: "#5b21b6", border: "#c4b5fd" },
    { bg: "#fef9c3", text: "#854d0e", border: "#fde047" },
    { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
    { bg: "#e0f2fe", text: "#075985", border: "#7dd3fc" },
    { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" },
    { bg: "#fdf2f8", text: "#86198f", border: "#f0abfc" },
  ];
  let hash = 0;
  for (let i = 0; i < cat.length; i++)
    hash = cat.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTES[Math.abs(hash) % PALETTES.length];
}

function ColHeader({
  col,
  sortKey,
  sortDir,
  onSort,
}: {
  col: (typeof COLUMNS)[number];
  sortKey: ColKey | null;
  sortDir: SortDir;
  onSort: (k: ColKey) => void;
}) {
  const active = sortKey === col.key;
  return (
    <Box
      onClick={() => onSort(col.key)}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: col.align === "center" ? "center" : "flex-start",
        gap: 0.4,
        cursor: "pointer",
        userSelect: "none",
        "&:hover .sort-icon": { opacity: 1 },
      }}
    >
      <Typography
        sx={{
          py: 1,
          fontSize: "0.9rem",
          fontWeight: 700,
          letterSpacing: "0.07em",
          color: C.accent,
          transition: "color 0.15s",
          "&:hover": { color: C.textPrimary },
        }}
      >
        {col.label}
      </Typography>
      <Box
        className="sort-icon"
        sx={{
          display: "flex",
          alignItems: "center",
          color: active ? C.accent : C.textPrimary,
          opacity: active ? 1 : 0.35,
          transition: "opacity 0.15s",
        }}
      >
        {active && sortDir === "asc" && (
          <KeyboardArrowUpRoundedIcon sx={{ fontSize: 15 }} />
        )}
        {active && sortDir === "desc" && (
          <KeyboardArrowDownRoundedIcon sx={{ fontSize: 15 }} />
        )}
        {!active && <UnfoldMoreRoundedIcon sx={{ fontSize: 15 }} />}
      </Box>
    </Box>
  );
}

function MiniCalendar({
  submissions,
  selectedDate,
  onSelectDate,
}: {
  submissions: Submission[];
  selectedDate: string | null;
  onSelectDate: (d: string | null) => void;
}) {
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const dateMap = useMemo(() => {
    const m: Record<string, number> = {};
    submissions.forEach((s) => {
      const k = s.createdAt.slice(0, 10);
      m[k] = (m[k] ?? 0) + 1;
    });
    return m;
  }, [submissions]);

  const calDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (Date | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++)
      cells.push(new Date(viewYear, viewMonth, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
    onSelectDate(null);
  }
  function nextMonth() {
    const now = new Date();
    if (viewYear === now.getFullYear() && viewMonth === now.getMonth()) return;
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
    onSelectDate(null);
  }
  const canNext = !(
    viewYear === today.getFullYear() && viewMonth === today.getMonth()
  );

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <IconButton size="small" onClick={prevMonth} sx={{ color: C.accent }}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography
          sx={{ fontWeight: 700, fontSize: "0.95rem", color: C.accent }}
        >
          {MONTHS[viewMonth]} {viewYear}
        </Typography>
        <IconButton
          size="small"
          onClick={nextMonth}
          disabled={!canNext}
          sx={{ color: canNext ? C.accent : C.textSub }}
        >
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box
        sx={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", mb: 0.5 }}
      >
        {WEEKDAYS.map((wd) => (
          <Typography
            key={wd}
            align="center"
            sx={{
              fontSize: "0.73rem",
              fontWeight: 700,
              color: C.textSub,
              py: 0.5,
            }}
          >
            {wd}
          </Typography>
        ))}
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: "3px",
        }}
      >
        {calDays.map((date, i) => {
          if (!date) return <Box key={`e-${i}`} />;
          const key = dateKey(date);
          const hasData = (dateMap[key] ?? 0) > 0;
          const isToday = key === dateKey(today);
          const isSelected = key === selectedDate;
          const isFuture = date > today;
          return (
            <Box
              key={key}
              onClick={() => hasData && onSelectDate(isSelected ? null : key)}
              sx={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                aspectRatio: "1",
                borderRadius: "10px",
                cursor: hasData ? "pointer" : "default",
                transition: "all 0.15s",
                bgcolor: isSelected
                  ? C.accentSelected
                  : isToday
                  ? "rgba(184,116,68,0.10)"
                  : "transparent",
                border: isSelected
                  ? `2px solid ${C.accent}`
                  : isToday
                  ? `2px solid ${C.accentBorder}`
                  : "2px solid transparent",
                "&:hover": hasData ? { bgcolor: C.calDayHover } : {},
                opacity: isFuture ? 0.3 : 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.8rem",
                  fontWeight: isToday ? 800 : hasData ? 600 : 400,
                  color: isSelected || isToday ? C.accent : C.textPrimary,
                  lineHeight: 1,
                }}
              >
                {date.getDate()}
              </Typography>
              <Box
                sx={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  mt: "3px",
                  bgcolor: hasData ? C.dotActive : "transparent",
                }}
              />
            </Box>
          );
        })}
      </Box>
      <Box sx={{ display: "flex", gap: 1.5, mt: 1.5, alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: C.dotActive,
            }}
          />
          <Typography sx={{ fontSize: "0.7rem", color: C.textSub }}>
            Has submissions
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function AllSubmissions() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<ColKey | null>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);

  function handleSort(key: ColKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  }

  useEffect(() => {
    fetch(`${API_BASE_URL}/momentum/recent-submissions`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then(setSubmissions)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  /**
   * Called by the modal after a successful save.
   * Updates the matching row in the list in-place — no refresh needed.
   */
  function handleSubmissionUpdate(
    updated: Pick<
      Submission,
      "id" | "score" | "feedback" | "approved" | "answer" | "updatedAt"
    >
  ) {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === updated.id
          ? {
              ...s,
              score: updated.score,
              feedback: updated.feedback,
              approved: updated.approved,
              answer: updated.answer,
              updatedAt: updated.updatedAt,
            }
          : s
      )
    );
    // Keep the open modal in sync too
    setSelectedSubmission((prev) =>
      prev?.id === updated.id
        ? {
            ...prev,
            score: updated.score,
            feedback: updated.feedback,
            approved: updated.approved,
            answer: updated.answer,
            updatedAt: updated.updatedAt,
          }
        : prev
    );
  }

  const sorted = useMemo(() => {
    const base = selectedDate
      ? submissions.filter((s) => s.createdAt.slice(0, 10) === selectedDate)
      : [...submissions];
    if (!sortKey) return base;
    return [...base].sort((a, b) => {
      let av: string | number;
      let bv: string | number;
      if (sortKey === "score") {
        av = a.score ?? -1;
        bv = b.score ?? -1;
      } else if (sortKey === "createdAt") {
        av = new Date(a.createdAt).getTime();
        bv = new Date(b.createdAt).getTime();
      } else {
        av = (a[sortKey] ?? "").toString().toLowerCase();
        bv = (b[sortKey] ?? "").toString().toLowerCase();
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [submissions, selectedDate, sortKey, sortDir]);

  const paginated = useMemo(
    () =>
      sorted.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE),
    [sorted, page]
  );
  const grouped = useMemo(() => groupByMonth(paginated), [paginated]);
  const monthKeys = Object.keys(grouped);
  const totalPages = Math.ceil(sorted.length / ROWS_PER_PAGE);

  return (
    <LayoutWithSidebar>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(44,26,10,0.07)",
              border: `1px solid ${C.accentFaint}`,
              overflow: "hidden",
              minHeight: loading ? 500 : "unset",
              background: "#ffffff",
            }}
          >
            <Box sx={{ height: 4, background: C.accentGrad }} />

            {loading && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 460,
                  gap: 2,
                }}
              >
                <CircularProgress size={36} sx={{ color: C.accent }} />
                <Typography sx={{ fontSize: "0.85rem", color: C.textSub }}>
                  Loading submissions...
                </Typography>
              </Box>
            )}

            {!loading && (
              <>
                <CardHeader
                  sx={{
                    px: 3,
                    pt: 2.5,
                    pb: 1,
                    "& .MuiCardHeader-title": {
                      fontWeight: 700,
                      fontSize: "1.15rem",
                      fontFamily: "'Playfair Display', serif",
                      background: C.accentGrad,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    },
                    "& .MuiCardHeader-subheader": {
                      fontSize: "0.85rem",
                      color: C.textSub,
                    },
                  }}
                  title="All Submissions"
                  subheader={`${submissions.length} total submissions`}
                  action={
                    <Box
                      onClick={() => router.back()}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.4,
                        cursor: "pointer",
                        color: C.textSub,
                        mt: 1.5,
                        mr: 1,
                        transition: "color 0.2s",
                        "&:hover": { color: C.accent },
                      }}
                    >
                      <ArrowBackIosRoundedIcon sx={{ fontSize: 13 }} />
                      <Typography sx={{ fontSize: "1rem" }}>Back</Typography>
                    </Box>
                  }
                />
                <Divider
                  sx={{
                    mx: 3,
                    mb: 0,
                    background: C.accentGrad,
                    height: 2,
                    border: "none",
                  }}
                />

                <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", lg: "1fr 310px" },
                      gridTemplateRows: { xs: "auto auto", lg: "1fr" },
                      minHeight: 480,
                    }}
                  >
                    {/* LEFT — table */}
                    <Box
                      sx={{
                        overflowX: "scroll",
                        borderRight: {
                          xs: "none",
                          lg: `1px solid ${C.divider}`,
                        },
                        borderBottom: {
                          xs: `1px solid ${C.divider}`,
                          lg: "none",
                        },
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: GRID_COLS,
                          alignItems: "center",
                          px: 3,
                          py: 1.2,
                          bgcolor: C.surface,
                          borderBottom: `2px solid ${C.divider}`,
                          position: "sticky",
                          top: 0,
                          zIndex: 1,
                          minWidth: 600,
                        }}
                      >
                        {COLUMNS.map((col) => (
                          <ColHeader
                            key={col.key}
                            col={col}
                            sortKey={sortKey}
                            sortDir={sortDir}
                            onSort={handleSort}
                          />
                        ))}
                      </Box>

                      <Box
                        sx={{
                          flex: 1,
                          minHeight: 500,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        {error && (
                          <Box
                            sx={{
                              flex: 1,
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              minHeight: 500,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ color: C.textSub }}
                            >
                              Could not load submissions. Please try again
                              later.
                            </Typography>
                          </Box>
                        )}
                        {!error && sorted.length === 0 && (
                          <Box
                            sx={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              alignItems: "center",
                              minHeight: 500,
                              gap: 1,
                            }}
                          >
                            <FolderOpenRoundedIcon
                              sx={{ fontSize: 40, color: C.textHint }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ color: C.textSub }}
                            >
                              {selectedDate
                                ? "No submissions on this date"
                                : "No submissions yet"}
                            </Typography>
                          </Box>
                        )}
                        {!error && sorted.length > 0 && (
                          <Stack spacing={0} sx={{ flex: 1 }}>
                            {monthKeys.map((month, mIdx) => (
                              <Box key={month}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.2,
                                    px: 3,
                                    pt: mIdx === 0 ? 1.5 : 1.2,
                                    pb: 0.6,
                                  }}
                                >
                                  <CalendarTodayRoundedIcon
                                    sx={{ fontSize: 11, color: C.textHint }}
                                  />
                                  <Typography
                                    sx={{
                                      fontSize: "0.68rem",
                                      fontWeight: 700,
                                      letterSpacing: "0.08em",
                                      textTransform: "uppercase",
                                      color: C.accent,
                                    }}
                                  >
                                    {month}
                                  </Typography>
                                  <Divider
                                    sx={{ flex: 1, borderColor: C.divider }}
                                  />
                                  <Typography
                                    sx={{
                                      fontSize: "0.72rem",
                                      color: C.textHint,
                                    }}
                                  >
                                    {grouped[month].length}
                                  </Typography>
                                </Box>
                                {grouped[month].map((item, idx) => (
                                  <React.Fragment key={item.id}>
                                    <Box
                                      onClick={() =>
                                        setSelectedSubmission(item)
                                      }
                                      sx={{
                                        display: "grid",
                                        gridTemplateColumns: GRID_COLS,
                                        alignItems: "center",
                                        px: 3,
                                        py: 1.4,
                                        transition: "background 0.15s",
                                        bgcolor:
                                          idx % 2 === 0
                                            ? "transparent"
                                            : C.accentHover,
                                        cursor: "pointer",
                                        "&:hover": {
                                          bgcolor: C.accentBg,
                                          "& .row-title": { color: C.accent },
                                        },
                                        minWidth: 600,
                                      }}
                                    >
                                      <Tooltip
                                        title={item.title}
                                        placement="top-start"
                                        arrow
                                        enterDelay={400}
                                      >
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.2,
                                            pr: 5,
                                            overflow: "hidden",
                                            minWidth: 150,
                                          }}
                                        >
                                          <Box
                                            sx={{
                                              width: 7,
                                              height: 7,
                                              borderRadius: "50%",
                                              flexShrink: 0,
                                              opacity: 0.7,
                                              bgcolor: getCategoryColor(
                                                item.category
                                              ).text,
                                            }}
                                          />
                                          <Typography
                                            className="row-title"
                                            variant="body2"
                                            sx={{
                                              fontWeight: 500,
                                              fontSize: "0.88rem",
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                              whiteSpace: "nowrap",
                                              color: C.textPrimary,
                                              transition: "color 0.15s",
                                            }}
                                          >
                                            {item.title}
                                          </Typography>
                                        </Box>
                                      </Tooltip>
                                      <Box>
                                        {item.category && (
                                          <Chip
                                            label={item.category}
                                            size="small"
                                            sx={{
                                              height: 22,
                                              fontSize: "0.68rem",
                                              fontWeight: 700,
                                              bgcolor: getCategoryColor(
                                                item.category
                                              ).bg,
                                              color: getCategoryColor(
                                                item.category
                                              ).text,
                                              border: `1px solid ${
                                                getCategoryColor(item.category)
                                                  .border
                                              }`,
                                              borderRadius: "60px",
                                              "& .MuiChip-label": { px: 1.2 },
                                            }}
                                          />
                                        )}
                                      </Box>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          textAlign: "center",
                                          fontWeight: 600,
                                          fontSize: "0.82rem",
                                          color:
                                            item.score != null
                                              ? item.score >= 8
                                                ? "#16a34a"
                                                : item.score >= 5
                                                ? "#d97706"
                                                : "#dc2626"
                                              : C.textSub,
                                        }}
                                      >
                                        {item.score != null
                                          ? `${item.score}/10`
                                          : "—"}
                                      </Typography>
                                      <Box sx={{ textAlign: "center" }}>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            display: "block",
                                            whiteSpace: "nowrap",
                                            color: C.textSub,
                                          }}
                                        >
                                          {getTimeAgo(item.createdAt)}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: C.textHint,
                                            fontSize: "0.7rem",
                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          {formatDate(item.createdAt)}
                                        </Typography>
                                        {item.updatedAt &&
                                          item.updatedAt !== item.createdAt && (
                                            <Typography
                                              variant="caption"
                                              sx={{
                                                display: "block",
                                                color: C.textSub,
                                                fontSize: "0.7rem",
                                                whiteSpace: "nowrap",
                                              }}
                                            >
                                              edited{" "}
                                              {getTimeAgo(item.updatedAt)}
                                            </Typography>
                                          )}
                                      </Box>
                                    </Box>
                                    {idx < grouped[month].length - 1 && (
                                      <Divider
                                        sx={{ mx: 3, borderColor: C.divider }}
                                      />
                                    )}
                                  </React.Fragment>
                                ))}
                                {mIdx < monthKeys.length - 1 && (
                                  <Divider
                                    sx={{
                                      mx: 3,
                                      mt: 0.8,
                                      borderColor: C.divider,
                                    }}
                                  />
                                )}
                              </Box>
                            ))}
                          </Stack>
                        )}
                      </Box>

                      {!error && sorted.length > ROWS_PER_PAGE && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            px: 3,
                            py: 1.5,
                            borderTop: `1px solid ${C.divider}`,
                          }}
                        >
                          <Typography
                            sx={{ fontSize: "0.82rem", color: C.textSub }}
                          >
                            {page * ROWS_PER_PAGE + 1}–
                            {Math.min(
                              (page + 1) * ROWS_PER_PAGE,
                              sorted.length
                            )}{" "}
                            of {sorted.length}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => setPage((p) => p - 1)}
                              disabled={page === 0}
                              sx={{ color: page === 0 ? C.textHint : C.accent }}
                            >
                              <ChevronLeftIcon fontSize="small" />
                            </IconButton>
                            {Array.from({ length: totalPages }).map((_, i) => {
                              const show =
                                i === 0 ||
                                i === totalPages - 1 ||
                                Math.abs(i - page) <= 1;
                              const showEllipsisBefore =
                                i === page - 2 && page > 2;
                              const showEllipsisAfter =
                                i === page + 2 && page < totalPages - 3;
                              if (
                                !show &&
                                !showEllipsisBefore &&
                                !showEllipsisAfter
                              )
                                return null;
                              if (showEllipsisBefore || showEllipsisAfter)
                                return (
                                  <Typography
                                    key={`e-${i}`}
                                    sx={{
                                      fontSize: "0.8rem",
                                      color: C.textSub,
                                      px: 0.5,
                                    }}
                                  >
                                    ...
                                  </Typography>
                                );
                              return (
                                <Box
                                  key={i}
                                  onClick={() => setPage(i)}
                                  sx={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: "8px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    fontSize: "0.82rem",
                                    fontWeight: page === i ? 700 : 400,
                                    bgcolor:
                                      page === i ? C.accentBg : "transparent",
                                    color: page === i ? C.accent : C.textSub,
                                    border:
                                      page === i
                                        ? `1px solid ${C.accentBorder}`
                                        : "1px solid transparent",
                                    transition: "all 0.15s",
                                    "&:hover": { bgcolor: C.accentBg },
                                  }}
                                >
                                  {i + 1}
                                </Box>
                              );
                            })}
                            <IconButton
                              size="small"
                              onClick={() => setPage((p) => p + 1)}
                              disabled={page >= totalPages - 1}
                              sx={{
                                color:
                                  page >= totalPages - 1
                                    ? C.textHint
                                    : C.accent,
                              }}
                            >
                              <ChevronRightIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      )}
                    </Box>

                    {/* RIGHT — calendar */}
                    <Box
                      sx={{
                        px: 2.5,
                        pt: { xs: 2.5, lg: 3 },
                        pb: 2.5,
                        bgcolor: C.surface,
                        gridRow: { xs: 1, lg: "auto" },
                        order: { xs: -1, lg: 0 },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          color: C.textSub,
                          mb: 1.5,
                        }}
                      >
                        Browse by Date
                      </Typography>
                      <MiniCalendar
                        submissions={submissions}
                        selectedDate={selectedDate}
                        onSelectDate={(d) => {
                          setSelectedDate(d);
                          setPage(0);
                        }}
                      />
                      {selectedDate && (
                        <Box
                          sx={{
                            mt: 2,
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: C.accentBg,
                            border: `1px solid ${C.accentBorder}`,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                color: C.accent,
                                mb: 0.3,
                              }}
                            >
                              {new Date(
                                selectedDate + "T00:00:00"
                              ).toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                              })}
                            </Typography>
                            <Typography
                              onClick={() => {
                                setSelectedDate(null);
                                setPage(0);
                              }}
                              sx={{
                                fontSize: "0.72rem",
                                color: C.textSub,
                                cursor: "pointer",
                                ml: 1,
                                flexShrink: 0,
                                "&:hover": { color: C.accent },
                              }}
                            >
                              Clear ✕
                            </Typography>
                          </Box>
                          <Typography
                            sx={{ fontSize: "0.78rem", color: C.textSub }}
                          >
                            {sorted.length} submission
                            {sorted.length !== 1 ? "s" : ""}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </>
            )}
          </Card>
        </Box>
      </Box>

      <SubmissionDetailModal
        submission={selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        onUpdate={handleSubmissionUpdate}
      />
    </LayoutWithSidebar>
  );
}
