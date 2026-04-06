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
import { useRouter } from "next/navigation";

// ===========================================================
// GLOBAL COLOR TOKENS
// ===========================================================
const C = {
  accent: "rgb(209,112,51)",
  accentGold: "#E5B526",
  accentBg: "rgba(209,112,51,0.08)",
  accentBorder: "rgba(209,112,51,0.15)",
  accentFaint: "rgba(209,112,51,0.1)",
  accentHover: "rgba(209,112,51,0.04)",
  accentSelected: "rgba(209,112,51,0.13)",
  accentGrad: "linear-gradient(to right, rgb(209,112,51), #E5B526)",
  dotActive: "rgb(209,112,51)",
  cardBg: "#ffffff",
  divider: "rgba(0,0,0,0.06)",
  textMuted: "black",
  textSub: "rgba(0,0,0,0.5)",
  calDayHover: "rgba(209,112,51,0.07)",
} as const;

// ===========================================================
// Pagination
// ===========================================================
const ROWS_PER_PAGE = 10;

// ===========================================================
// Column definitions
// ===========================================================
const COLUMNS = [
  { key: "title", label: "Task", width: "1fr", align: "left" },
  { key: "category", label: "Category", width: "160px", align: "left" },
  { key: "score", label: "Score", width: "80px", align: "center" },
  { key: "createdAt", label: "Date", width: "130px", align: "center" },
] as const;

type ColKey = (typeof COLUMNS)[number]["key"];
type SortDir = "asc" | "desc";
const GRID_COLS = COLUMNS.map((c) => c.width).join(" ");

// ===========================================================
// Types & helpers
// ===========================================================
type Submission = {
  id: string;
  title: string;
  category: string;
  score?: number | null;
  createdAt: string;
};

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
  for (let i = 0; i < cat.length; i++) {
    hash = cat.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTES[Math.abs(hash) % PALETTES.length];
}

// ===========================================================
// Sortable column header
// ===========================================================
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
          "&:hover": { color: C.textMuted },
        }}
      >
        {col.label}
      </Typography>
      <Box
        className="sort-icon"
        sx={{
          display: "flex",
          alignItems: "center",
          color: active ? C.accent : C.textMuted,
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

// ===========================================================
// Mini Calendar
// ===========================================================
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
          sx={{ color: canNext ? C.accent : C.textMuted }}
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
              color: C.textMuted,
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
          const count = dateMap[key] ?? 0;
          const isToday = key === dateKey(today);
          const isSelected = key === selectedDate;
          const isFuture = date > today;
          const hasData = count > 0;

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
                  ? C.accentFaint
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
                  color: isSelected || isToday ? C.accent : "text.primary",
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
          <Typography sx={{ fontSize: "0.7rem", color: C.textMuted }}>
            Has submissions
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// ===========================================================
// Main component
// ===========================================================
export default function AllSubmissions() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const [sortKey, setSortKey] = useState<ColKey | null>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: ColKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  }

  useEffect(() => {
    fetch("http://localhost:3001/momentum/recent-submissions", {
      credentials: "include",
    })
      .then((r) => r.json())
      .then(setSubmissions)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // Full sorted list (used for total count in pagination)
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

  // Current page slice
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
      <Box
        sx={{
          width: "100%",
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
              border: `1px solid ${C.accentFaint}`,
              overflow: "hidden",
              minHeight: loading ? 500 : "unset",
            }}
          >
            {/* Gradient top bar */}
            <Box sx={{ height: 4, background: C.accentGrad }} />

            {/* GLOBAL LOADER */}
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
                <Typography
                  sx={{ fontSize: "0.85rem", color: "rgba(0,0,0,0.35)" }}
                >
                  Loading submissions...
                </Typography>
              </Box>
            )}

            {/* FULL CONTENT */}
            {!loading && (
              <>
                <CardHeader
                  sx={{
                    px: 3,
                    pt: 2.5,
                    pb: 1,

                    "& .MuiCardHeader-title": {
                      fontWeight: 700,
                      background: C.accentGrad,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      fontSize: "1.15rem",
                    },
                    "& .MuiCardHeader-subheader": { fontSize: "0.85rem" },
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
                        color: C.textMuted,
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
                        flexWrap: "wrap",
                      }}
                    >
                      {/* Column headers */}
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: GRID_COLS,
                          alignItems: "center",
                          px: 3,
                          py: 1.2,
                          bgcolor: "rgba(0,0,0,0.018)",
                          borderBottom: `2px solid ${C.divider}`,
                          position: "sticky",
                          top: 0,
                          zIndex: 1,
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

                      {/* Table body */}
                      <Box
                        sx={{
                          flex: 1,
                          minHeight: 500,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        {/* Error */}
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
                            <Typography variant="body2" color="text.secondary">
                              Could not load submissions. Please try again
                              later.
                            </Typography>
                          </Box>
                        )}

                        {/* Empty */}
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
                              sx={{ fontSize: 40, color: "rgba(0,0,0,0.15)" }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ color: "rgba(0,0,0,0.35)" }}
                            >
                              {selectedDate
                                ? "No submissions on this date"
                                : "No submissions yet"}
                            </Typography>
                          </Box>
                        )}

                        {/* Rows */}
                        {!error && sorted.length > 0 && (
                          <Stack spacing={0} sx={{ flex: 1 }}>
                            {monthKeys.map((month, mIdx) => (
                              <Box key={month}>
                                {/* Month label */}
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
                                    sx={{
                                      fontSize: 11,
                                      color: "rgba(0,0,0,0.3)",
                                    }}
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
                                      color: "rgba(0,0,0,0.35)",
                                    }}
                                  >
                                    {grouped[month].length}
                                  </Typography>
                                </Box>

                                {grouped[month].map((item, idx) => (
                                  <React.Fragment key={item.id}>
                                    <Box
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
                                        "&:hover": { cursor: "pointer" },
                                      }}
                                    >
                                      {/* Task */}
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
                                            pr: 5, // reduce right padding on xs
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
                                            variant="body2"
                                            sx={{
                                              fontWeight: 500,
                                              fontSize: "0.88rem",
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                              whiteSpace: "nowrap",
                                            }}
                                          >
                                            {item.title}
                                          </Typography>
                                        </Box>
                                      </Tooltip>

                                      {/* Category */}
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

                                      {/* Score */}
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          textAlign: "center",
                                          fontWeight: 600,
                                          fontSize: "0.82rem",
                                          color:
                                            item.score != null
                                              ? item.score >= 8
                                                ? "rgb(34,197,94)"
                                                : item.score >= 5
                                                ? "rgb(234,179,8)"
                                                : "rgb(239,68,68)"
                                              : C.textMuted,
                                        }}
                                      >
                                        {item.score != null
                                          ? `${item.score}/10`
                                          : "—"}
                                      </Typography>

                                      {/* Date */}
                                      <Box sx={{ textAlign: "center" }}>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          sx={{
                                            display: "block",
                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          {getTimeAgo(item.createdAt)}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: C.textMuted,
                                            fontSize: "0.7rem",
                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          {formatDate(item.createdAt)}
                                        </Typography>
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

                      {/* PAGINATION BAR */}
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
                          {/* Count label */}
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

                          {/* Page controls */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            {/* Prev */}
                            <IconButton
                              size="small"
                              onClick={() => setPage((p) => p - 1)}
                              disabled={page === 0}
                              sx={{
                                color:
                                  page === 0 ? "rgba(0,0,0,0.26)" : C.accent,
                              }}
                            >
                              <ChevronLeftIcon fontSize="small" />
                            </IconButton>

                            {/* Page pills */}
                            {Array.from({ length: totalPages }).map((_, i) => {
                              // Show first, last, current, and neighbours — ellipsis otherwise
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
                              if (showEllipsisBefore || showEllipsisAfter) {
                                return (
                                  <Typography
                                    key={`ellipsis-${i}`}
                                    sx={{
                                      fontSize: "0.8rem",
                                      color: C.textSub,
                                      px: 0.5,
                                    }}
                                  >
                                    ...
                                  </Typography>
                                );
                              }

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

                            {/* Next */}
                            <IconButton
                              size="small"
                              onClick={() => setPage((p) => p + 1)}
                              disabled={page >= totalPages - 1}
                              sx={{
                                color:
                                  page >= totalPages - 1
                                    ? "rgba(0,0,0,0.26)"
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
                        bgcolor: "rgba(0,0,0,0.012)",
                        gridRow: { xs: 1, lg: "auto" },
                        order: { xs: -1, lg: 0 },
                        // transform: { xs: "scale(0.8)", sm: "scale(1)" },
                        // transformOrigin: "top left",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          color: C.textMuted,
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
                                color: C.textMuted,
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
    </LayoutWithSidebar>
  );
}
