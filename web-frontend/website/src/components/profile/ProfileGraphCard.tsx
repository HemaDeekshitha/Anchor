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

// ── Anchor palette tokens ────────────────────────────────────────────────────
const C = {
  accent: "#b87444",
  accentDark: "#a0622e",
  accentTeal: "#2E9B8F",
  accentBg: "rgba(184,116,68,0.06)",
  accentBorder: "rgba(184,116,68,0.15)",
  accentFaint: "rgba(184,116,68,0.10)",
  accentHover: "rgba(184,116,68,0.06)",
  accentSelected: "rgba(184,116,68,0.12)",
  accentGrad: "linear-gradient(to right, #b87444, #a0622e)",
  cardBg: "#ffffff",
  surface: "#fdfaf7",
  divider: "#e8ddd0",
  textPrimary: "#2c1a0a",
  textSub: "#8c6a50",
  textMuted: "#b8a090",
} as const;

const PERIODS = [
  { label: "This Week", value: "this_week", title: "Weekly Progress" },
  { label: "Last 7 Days", value: "7d", title: "Last 7 Days Progress" },
  { label: "Last Month", value: "last_month", title: "Monthly Progress" },
  { label: "To Date", value: "all", title: "All-Time Progress" },
];

const EMPTY_STATE_MESSAGES: Record<string, { title: string; sub: string }> = {
  "7d": {
    title: "Nothing logged last week yet",
    sub: "Start today — complete a task, solve a problem, or send an application to see your streak come alive.",
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
        boxShadow: "0 8px 28px rgba(44,26,10,0.10)",
      }}
    >
      <Typography
        sx={{
          color: C.textPrimary,
          fontWeight: 700,
          fontSize: "clamp(15px, 1vw, 18px)",
          mb: 1.25,
          fontFamily: "'Playfair Display', serif",
        }}
      >
        {label}
      </Typography>
      <Stack spacing={0.75}>
        {[
          { label: "Tasks", key: "tasks", color: C.accent },
          // { label: "LeetCode", key: "leetcode", color: C.accentDark },
          { label: "Applications", key: "applications", color: C.accentTeal },
        ].map(({ label, key, color }) => (
          <Stack
            key={key}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography sx={{ color, fontSize: "clamp(13px, 0.85vw, 15px)", fontWeight: 600 }}>
              {label}
            </Typography>
            <Typography sx={{ color: C.textSub, fontSize: "clamp(13px, 0.85vw, 15px)" }}>
              {data[key]}
            </Typography>
          </Stack>
        ))}
      </Stack>
      {/* <Stack direction="row" spacing={1} mt={1.5} flexWrap="wrap">
        <Chip
          size="small"
          label={`${data.easy} Easy`}
          sx={{
            height: 24,
            color: C.accentDark,
            background: "rgba(160,98,46,0.10)",
            border: `1px solid rgba(160,98,46,0.22)`,
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
      </Stack> */}
      <Typography
        sx={{ mt: 1.5, fontSize: "clamp(13px, 0.85vw, 15px)", fontWeight: 600, color: C.accent }}
      >
        🔥 +{data.streak} Momentum Streak
      </Typography>
    </Box>
  );
};

function EmptyState({ period }: { period: string }) {
  const msg = EMPTY_STATE_MESSAGES[period] ?? EMPTY_STATE_MESSAGES["7d"];
  const pills = [
    { label: "Task", color: C.accent, bg: C.accentBg, border: C.accentBorder },
    // {
    //   label: "LeetCode",
    //   color: C.accentDark,
    //   bg: "rgba(160,98,46,0.08)",
    //   border: "rgba(160,98,46,0.20)",
    // },
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
        background: C.surface,
      }}
    >
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
          stroke={C.accentDark}
          strokeWidth="1.5"
        />
        <polyline
          points="0,240 80,220 160,230 240,190 320,210 400,180 480,200 600,160"
          fill="none"
          stroke={C.accentTeal}
          strokeWidth="1.5"
        />
      </Box>

      <Box
        sx={{
          width: "clamp(48px, 3vw, 60px)",
          height: "clamp(48px, 3vw, 60px)",
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
        <BoltRoundedIcon sx={{ color: C.accent, fontSize: "clamp(22px, 1.5vw, 28px)" }} />
      </Box>

      <Typography
        sx={{
          color: C.textPrimary,
          fontWeight: 600,
          fontSize: "clamp(15px, 1.2vw, 20px)",
          zIndex: 1,
          textAlign: "center",
        }}
      >
        {msg.title}
      </Typography>
      <Typography
        sx={{
          color: C.textSub,
          fontSize: "clamp(13px, 0.9vw, 16px)",
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
        // width: "100%",
        borderRadius: "clamp(16px, 1vw, 22px)",
        padding: "clamp(20px, 2vw, 34px)",
        overflow: "hidden",
        position: "relative",
        background: C.cardBg,
        borderTop: `4px solid ${C.accent}`,
        border: `1px solid ${C.divider}`,
        boxShadow: "0 4px 20px rgba(44,26,10,0.07)",
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
              fontSize: "clamp(22px, 1.5vw, 32px)",
              letterSpacing: "-0.02em",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            {selected?.title}
          </Typography>
          <Typography sx={{ color: C.textSub, fontSize: "clamp(13px, 0.9vw, 16px)", mt: 0.5 }}>
            Track your consistency across tasks, coding, and applications
          </Typography>
        </Box>

        <Button
          onClick={(e) => setAnchorEl(e.currentTarget)}
          endIcon={<KeyboardArrowDownRoundedIcon sx={{ color: C.textSub }} />}
          sx={{
            alignSelf: { xs: "flex-start", sm: "auto" },
            minWidth: "clamp(150px, 10vw, 190px)",
            justifyContent: "space-between",
            textTransform: "none",
            paddingInline: "clamp(16px, 1.2vw, 24px)",
            paddingBlock: "clamp(10px, 0.8vw, 14px)",
            borderRadius: 2.5,
            color: C.textPrimary,
            fontSize: "clamp(14px, 0.9vw, 16px)",
            fontWeight: 600,
            background: C.accentBg,
            border: `1px solid ${C.accentBorder}`,
            boxShadow: "0 2px 8px rgba(44,26,10,0.06)",
            "&:hover": {
              background: "rgba(184,116,68,0.10)",
              borderColor: "rgba(184,116,68,0.25)",
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
              boxShadow: "0 8px 28px rgba(44,26,10,0.10)",
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
      <Box sx={{ width: "100%", height: "clamp(260px, 32vw, 430px)" }}>
        {data.length === 0 ||
        data.every(
          (d) =>
            d.tasks === 0 &&
            // d.leetcode === 0 &&
            d.applications === 0
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
                  <stop offset="0%" stopColor="rgba(184,116,68,0.20)" />
                  <stop offset="65%" stopColor="rgba(184,116,68,0.05)" />
                  <stop offset="100%" stopColor="rgba(184,116,68,0)" />
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
                tick={{ fill: C.textMuted, fontSize: 13, fontWeight: 500 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={34}
                tick={{ fill: C.textMuted, fontSize: 13, fontWeight: 500 }}
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
                  stroke: "rgba(184,116,68,0.3)",
                  strokeWidth: 1.5,
                }}
                activeDot={<GlowActiveDot stroke={C.accent} />}
                isAnimationActive
                animationDuration={550}
              />

              {/* <Line
                type="monotone"
                dataKey="leetcode"
                stroke={C.accentDark}
                strokeWidth={2.5}
                strokeLinecap="round"
                dot={{
                  r: 3,
                  fill: C.accentDark,
                  stroke: "rgba(160,98,46,0.3)",
                  strokeWidth: 1.2,
                }}
                activeDot={<GlowActiveDot stroke={C.accentDark} />}
                isAnimationActive
                animationDuration={550}
              /> */}

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
