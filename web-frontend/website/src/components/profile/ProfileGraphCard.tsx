"use client";

import React from "react";
import {
  Box,
  Typography,
  Menu,
  MenuItem,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
} from "recharts";

// ---- Shared color tokens (matches RecentSubmissions) ----
const C = {
  accent: "rgb(209,112,51)",
  accentGold: "#E5B526",
  accentTeal: "#2E9B8F", // complementary third color
  accentBg: "rgba(209,112,51,0.06)",
  accentBorder: "rgba(209,112,51,0.15)",
  accentFaint: "rgba(209,112,51,0.1)",
  accentHover: "rgba(226,114,44,0.06)",
  accentSelected: "rgba(209,112,51,0.12)",
  accentGrad: "linear-gradient(to right, rgb(209,112,51), #E5B526)",
  cardBg: "#ffffff",
  textPrimary: "#000000",
  textSub: "rgba(0,0,0,0.5)",
  textMuted: "rgba(0,0,0,0.35)",
  divider: "rgba(0,0,0,0.06)",
} as const;

// ---------------- PERIODS ----------------
const PERIODS = [
  { label: "This Week", value: "this_week", title: "Weekly Progress" },
  { label: "Last 7 Days", value: "7d", title: "Last 7 Days Progress" },
  { label: "Last Month", value: "last_month", title: "Monthly Progress" },
  { label: "To Date", value: "all", title: "All-Time Progress" },
];

// ---------------- EMPTY STATE MESSAGES ----------------
const EMPTY_STATE_MESSAGES: Record<string, { title: string; sub: string }> = {
  "7d": {
    title: "Nothing logged last week yet",
    sub: "Start today — complete a task, solve a LeetCode problem, or send an application to see your streak come alive.",
  },
  this_week: {
    title: "No activity this week yet",
    sub: "Log something today and your momentum graph will start building.",
  },
  last_month: {
    title: "No data for last month",
    sub: "Once you start tracking, your monthly consistency will show up here.",
  },
  all: {
    title: "You haven't tracked anything yet",
    sub: "Every streak starts with day one. Log your first task, problem, or application to begin.",
  },
};

// ---------------- ACTIVE DOT ----------------
function GlowActiveDot(props: any) {
  const { cx, cy, stroke = C.accent } = props;
  return (
    <g>
      <circle cx={cx} cy={cy} r={14} fill={stroke} opacity={0.1} />
      <circle cx={cx} cy={cy} r={9} fill={stroke} opacity={0.18} />
      <circle
        cx={cx}
        cy={cy}
        r={5.5}
        fill={stroke}
        stroke="#fff"
        strokeWidth={2}
      />
    </g>
  );
}

// ---------------- TOOLTIP ----------------
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <Box
      sx={{
        minWidth: 220,
        maxWidth: 260,
        p: 2,
        borderRadius: 3,
        background: "#fff",
        border: `1px solid ${C.accentBorder}`,
        boxShadow: "0 8px 28px rgba(0,0,0,0.10)",
      }}
    >
      <Typography
        sx={{ color: C.textPrimary, fontWeight: 700, fontSize: 15, mb: 1.25 }}
      >
        {label}
      </Typography>

      <Stack spacing={0.75}>
        {[
          { label: "Tasks", key: "tasks", color: C.accent },
          { label: "Applications", key: "applications", color: C.accentTeal },
        ].map(({ label, key, color }) => (
          <Stack
            key={key}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography sx={{ color, fontSize: 13, fontWeight: 600 }}>
              {label}
            </Typography>
            <Typography sx={{ color: C.textSub, fontSize: 13 }}>
              {data[key]}
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Stack direction="row" spacing={1} mt={1.5} flexWrap="wrap">
        <Chip
          size="small"
          label={`${data.easy} Easy`}
          sx={{
            height: 24,
            color: C.accentGold,
            background: "rgba(229,181,38,0.10)",
            border: `1px solid rgba(229,181,38,0.22)`,
            fontWeight: 600,
          }}
        />
        <Chip
          size="small"
          label={`${data.medium} Medium`}
          sx={{
            height: 24,
            color: C.accent,
            background: C.accentBg,
            border: `1px solid ${C.accentBorder}`,
            fontWeight: 600,
          }}
        />
      </Stack>

      <Typography
        sx={{ mt: 1.5, fontSize: 12, fontWeight: 600, color: C.accent }}
      >
        🔥 +{data.streak} Momentum Streak
      </Typography>
    </Box>
  );
};

// ---------------- EMPTY STATE ----------------
function EmptyState({ period }: { period: string }) {
  const msg = EMPTY_STATE_MESSAGES[period] ?? EMPTY_STATE_MESSAGES["7d"];

  const pills = [
    { label: "Task", color: C.accent, bg: C.accentBg, border: C.accentBorder },
    {
      label: "Application",
      color: C.accentTeal,
      bg: "rgba(46,155,143,0.08)",
      border: "rgba(46,155,143,0.20)",
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
        borderRadius: 3,
        border: `1px dashed ${C.accentBorder}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ghost chart lines */}
      <Box
        component="svg"
        viewBox="0 0 600 260"
        preserveAspectRatio="none"
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.06,
          pointerEvents: "none",
        }}
      >
        <polyline
          points="0,200 80,160 160,180 240,100 320,130 400,80 480,110 600,60"
          fill="none"
          stroke={C.accent}
          strokeWidth="2"
        />
        <polyline
          points="0,220 80,200 160,210 240,160 320,180 400,150 480,160 600,120"
          fill="none"
          stroke={C.accentGold}
          strokeWidth="1.5"
        />
        <polyline
          points="0,240 80,220 160,230 240,190 320,210 400,180 480,200 600,160"
          fill="none"
          stroke={C.accentTeal}
          strokeWidth="1.5"
        />
      </Box>

      {/* Icon */}
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: C.accentBg,
          border: `1px solid ${C.accentBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <BoltRoundedIcon sx={{ color: C.accent, fontSize: 22 }} />
      </Box>

      <Typography
        sx={{
          color: C.textPrimary,
          fontWeight: 600,
          fontSize: 15,
          zIndex: 1,
          textAlign: "center",
        }}
      >
        {msg.title}
      </Typography>

      <Typography
        sx={{
          color: C.textSub,
          fontSize: 13,
          textAlign: "center",
          maxWidth: 320,
          lineHeight: 1.6,
          zIndex: 1,
          px: 2,
        }}
      >
        {msg.sub}
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        sx={{ zIndex: 1, mt: 0.5 }}
        flexWrap="wrap"
        justifyContent="center"
      >
        {pills.map(({ label, color, bg, border }) => (
          <Chip
            key={label}
            size="small"
            label={label}
            sx={{
              height: 24,
              color,
              background: bg,
              border: `1px solid ${border}`,
              fontWeight: 600,
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}

// ---------------- MAIN ----------------
export default function MomentumGraphCard({
  data,
  period,
  setPeriod,
}: {
  data: any[];
  period: string;
  setPeriod: (p: string) => void;
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const selected = PERIODS.find((p) => p.value === period);

  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: 4,
        p: { xs: 2, sm: 3 },
        overflow: "hidden",
        position: "relative",
        background: C.cardBg,
        borderTop: `4px solid ${C.accentBorder}`,

        borderImage: `${C.accentGrad} 1`,
        boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            sx={{
              color: C.accent,
              fontWeight: 700,
              fontSize: { xs: 20, sm: 24 },
              letterSpacing: "-0.02em",
            }}
          >
            {selected?.title}
          </Typography>
          <Typography sx={{ color: C.textSub, fontSize: 13, mt: 0.5 }}>
            Track your consistency across tasks, coding, and applications
          </Typography>
        </Box>

        <Button
          onClick={(e) => setAnchorEl(e.currentTarget)}
          endIcon={<KeyboardArrowDownRoundedIcon sx={{ color: C.textSub }} />}
          sx={{
            alignSelf: { xs: "flex-start", sm: "auto" },
            minWidth: 148,
            justifyContent: "space-between",
            textTransform: "none",
            px: 2.25,
            py: 1.2,
            borderRadius: 2.5,
            color: C.textPrimary,
            fontSize: 14,
            fontWeight: 600,
            background: C.accentBg,
            border: `1px solid ${C.accentBorder}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            "&:hover": {
              background: "rgba(209,112,51,0.10)",
              borderColor: "rgba(209,112,51,0.25)",
            },
          }}
        >
          {selected?.label}
        </Button>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 180,
              borderRadius: 2.5,
              background: "#fff",
              border: `1px solid ${C.accentBorder}`,
              boxShadow: "0 8px 28px rgba(0,0,0,0.10)",
              overflow: "hidden",
            },
          }}
        >
          {PERIODS.map((p) => {
            const isSelected = p.value === period;
            return (
              <MenuItem
                key={p.value}
                onClick={() => {
                  setPeriod(p.value);
                  setAnchorEl(null);
                }}
                sx={{
                  py: 1.2,
                  px: 1.75,
                  color: isSelected ? C.accent : C.textSub,
                  fontSize: 14,
                  fontWeight: isSelected ? 700 : 500,
                  background: isSelected ? C.accentSelected : "transparent",
                  "&:hover": { background: C.accentHover, color: C.accent },
                }}
              >
                {p.label}
              </MenuItem>
            );
          })}
        </Menu>
      </Box>

      {/* GRAPH */}
      <Box sx={{ width: "100%", height: { xs: 230, sm: 280, md: 320 } }}>
        {data.length === 0 ||
        data.every(
          (d) => d.tasks === 0 && d.leetcode === 0 && d.applications === 0
        ) ? (
          <EmptyState period={period} />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 12, right: 24, bottom: 8, left: 8 }}
            >
              <defs>
                <linearGradient
                  id="tasksAreaGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="rgba(209,112,51,0.20)" />
                  <stop offset="65%" stopColor="rgba(209,112,51,0.05)" />
                  <stop offset="100%" stopColor="rgba(209,112,51,0)" />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="4 5"
                stroke={C.divider}
                vertical={true}
                horizontal={true}
              />

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                padding={{ left: 4, right: 8 }}
                tick={{ fill: C.textMuted, fontSize: 12, fontWeight: 500 }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                width={34}
                tick={{ fill: C.textMuted, fontSize: 12, fontWeight: 500 }}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: C.accentBorder,
                  strokeWidth: 1,
                  strokeDasharray: "4 5",
                }}
                wrapperStyle={{ outline: "none" }}
              />

              <Area
                type="monotone"
                dataKey="tasks"
                fill="url(#tasksAreaGradient)"
                stroke="none"
                isAnimationActive
                animationDuration={500}
              />

              <Line
                type="monotone"
                dataKey="tasks"
                stroke={C.accent}
                strokeWidth={3.5}
                strokeLinecap="round"
                dot={{
                  r: 3.2,
                  fill: C.accent,
                  stroke: "rgba(209,112,51,0.3)",
                  strokeWidth: 1.5,
                }}
                activeDot={<GlowActiveDot stroke={C.accent} />}
                isAnimationActive
                animationDuration={550}
              />

              <Line
                type="monotone"
                dataKey="applications"
                stroke={C.accentTeal}
                strokeWidth={2.5}
                strokeLinecap="round"
                dot={{
                  r: 3,
                  fill: C.accentTeal,
                  stroke: "rgba(46,155,143,0.3)",
                  strokeWidth: 1.2,
                }}
                activeDot={<GlowActiveDot stroke={C.accentTeal} />}
                isAnimationActive
                animationDuration={550}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Box>
  );
}
