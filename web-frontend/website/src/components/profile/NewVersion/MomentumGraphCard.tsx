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

// ---------------- PERIODS ----------------
const PERIODS = [
  { label: "Last 7 Days", value: "7d", title: "Last 7 Days Progress" },
  { label: "This Week", value: "this_week", title: "Weekly Progress" },
  { label: "Last Month", value: "last_month", title: "Monthly Progress" },
  { label: "To Date", value: "all", title: "All-Time Progress" },
];

// ---------------- ACTIVE DOT ----------------
function GlowActiveDot(props: any) {
  const { cx, cy, stroke = "#f97316" } = props;

  return (
    <g>
      <circle cx={cx} cy={cy} r={14} fill={stroke} opacity={0.14} />
      <circle cx={cx} cy={cy} r={9} fill={stroke} opacity={0.22} />
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
        background:
          "linear-gradient(180deg, rgba(17,18,28,0.97) 0%, rgba(10,11,18,0.97) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 16px 40px rgba(0,0,0,0.42)",
        backdropFilter: "blur(16px)",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={1.25}
      >
        <Typography sx={{ color: "#f8fafc", fontWeight: 700, fontSize: 15 }}>
          {label}
        </Typography>
      </Stack>

      <Stack spacing={0.75}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography sx={{ color: "#fb923c", fontSize: 13, fontWeight: 600 }}>
            Tasks
          </Typography>
          <Typography sx={{ color: "#e5e7eb", fontSize: 13 }}>
            {data.tasks}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography sx={{ color: "#c084fc", fontSize: 13, fontWeight: 600 }}>
            LeetCode
          </Typography>
          <Typography sx={{ color: "#e5e7eb", fontSize: 13 }}>
            {data.leetcode}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography sx={{ color: "#38bdf8", fontSize: 13, fontWeight: 600 }}>
            Applications
          </Typography>
          <Typography sx={{ color: "#e5e7eb", fontSize: 13 }}>
            {data.applications}
          </Typography>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} mt={1.5} flexWrap="wrap">
        <Chip
          size="small"
          label={`${data.easy} Easy`}
          sx={{
            height: 24,
            color: "#fde68a",
            background: "rgba(245,158,11,0.12)",
            border: "1px solid rgba(245,158,11,0.18)",
            fontWeight: 600,
          }}
        />
        <Chip
          size="small"
          label={`${data.medium} Medium`}
          sx={{
            height: 24,
            color: "#fca5a5",
            background: "rgba(239,68,68,0.10)",
            border: "1px solid rgba(239,68,68,0.16)",
            fontWeight: 600,
          }}
        />
      </Stack>

      <Typography
        sx={{
          mt: 1.5,
          fontSize: 12,
          fontWeight: 600,
          color: "#fb923c",
        }}
      >
        🔥 +{data.streak} Momentum Streak
      </Typography>
    </Box>
  );
};

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
        background: `
          radial-gradient(circle at 18% 24%, rgba(99,102,241,0.16), transparent 32%),
          radial-gradient(circle at 82% 72%, rgba(249,115,22,0.12), transparent 30%),
          linear-gradient(180deg, #0f1020 0%, #06070d 100%)
        `,
        border: "1px solid rgba(255,255,255,0.05)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
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
              color: "#f8fafc",
              fontWeight: 700,
              fontSize: { xs: 20, sm: 24 },
              letterSpacing: "-0.02em",
            }}
          >
            {selected?.title}
          </Typography>

          {/* 🔥 TAGLINE */}
          <Typography
            sx={{
              color: "#9ca3af",
              fontSize: 13,
              mt: 0.5,
            }}
          >
            Track your consistency across tasks, coding, and applications
          </Typography>
        </Box>

        <Button
          onClick={(e) => setAnchorEl(e.currentTarget)}
          endIcon={<KeyboardArrowDownRoundedIcon sx={{ color: "#e5e7eb" }} />}
          sx={{
            alignSelf: { xs: "flex-start", sm: "auto" },
            minWidth: 148,
            justifyContent: "space-between",
            textTransform: "none",
            px: 2.25,
            py: 1.2,
            borderRadius: 2.5,
            color: "#f8fafc",
            fontSize: 14,
            fontWeight: 600,
            background: "rgba(255,255,255,0.045)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            "&:hover": {
              background: "rgba(255,255,255,0.075)",
              borderColor: "rgba(255,255,255,0.12)",
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
              background:
                "linear-gradient(180deg, rgba(20,20,28,0.98) 0%, rgba(12,12,18,0.98) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 18px 45px rgba(0,0,0,0.38)",
              backdropFilter: "blur(12px)",
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
                  color: isSelected ? "#fff" : "#cbd5e1",
                  fontSize: 14,
                  fontWeight: isSelected ? 700 : 500,
                  background: isSelected
                    ? "rgba(255,255,255,0.05)"
                    : "transparent",
                  "&:hover": {
                    background: "rgba(255,255,255,0.06)",
                    color: "#fff",
                  },
                }}
              >
                {p.label}
              </MenuItem>
            );
          })}
        </Menu>
      </Box>

      {/* GRAPH */}
      <Box
        sx={{
          width: "100%",
          height: { xs: 230, sm: 280, md: 320 },
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 12,
              right: 24,
              bottom: 8,
              left: 8,
            }}
          >
            <defs>
              <linearGradient
                id="tasksAreaGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="rgba(249,115,22,0.28)" />
                <stop offset="65%" stopColor="rgba(249,115,22,0.08)" />
                <stop offset="100%" stopColor="rgba(249,115,22,0)" />
              </linearGradient>

              <linearGradient
                id="hoverCursorGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="4 5"
              stroke="rgba(255,255,255,0.045)"
              vertical={true}
              horizontal={true}
            />

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              padding={{ left: 4, right: 8 }}
              tick={{
                fill: "#8f98ab",
                fontSize: 12,
                fontWeight: 500,
              }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              width={34}
              tick={{
                fill: "#8f98ab",
                fontSize: 12,
                fontWeight: 500,
              }}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "rgba(255,255,255,0.16)",
                strokeWidth: 1,
                strokeDasharray: "4 5",
              }}
              wrapperStyle={{
                outline: "none",
              }}
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
              stroke="#ff7a1a"
              strokeWidth={3.5}
              strokeLinecap="round"
              dot={{
                r: 3.2,
                fill: "#ff7a1a",
                stroke: "#ffd8b0",
                strokeWidth: 1.5,
              }}
              activeDot={<GlowActiveDot stroke="#ff7a1a" />}
              isAnimationActive
              animationDuration={550}
              style={{
                filter: "drop-shadow(0 0 8px rgba(249,115,22,0.28))",
              }}
            />

            <Line
              type="monotone"
              dataKey="leetcode"
              stroke="#a855f7"
              strokeWidth={2.5}
              strokeLinecap="round"
              dot={{
                r: 3,
                fill: "#a855f7",
                stroke: "#eadcff",
                strokeWidth: 1.2,
              }}
              activeDot={<GlowActiveDot stroke="#a855f7" />}
              isAnimationActive
              animationDuration={550}
              style={{
                filter: "drop-shadow(0 0 8px rgba(168,85,247,0.22))",
              }}
            />

            <Line
              type="monotone"
              dataKey="applications"
              stroke="#38bdf8"
              strokeWidth={2.5}
              strokeLinecap="round"
              dot={{
                r: 3,
                fill: "#38bdf8",
                stroke: "#d3f1ff",
                strokeWidth: 1.2,
              }}
              activeDot={<GlowActiveDot stroke="#38bdf8" />}
              isAnimationActive
              animationDuration={550}
              style={{
                filter: "drop-shadow(0 0 8px rgba(56,189,248,0.22))",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
