"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import { Box, Typography, Tooltip } from "@mui/material";

// ─── constants ─────────────────────────────────────────
type DayCell = {
  date: string;
  count: number;
  weekday: number;
  month: number;
};
const MONTHS = [
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

const FILLS = [
  "rgba(255,255,255,0.05)",
  "rgba(34,197,94,0.35)",
  "rgba(34,197,94,0.55)",
  "rgba(34,197,94,0.75)",
  "rgba(34,197,94,1)",
];

const BORDER_COLORS = [
  "rgba(255,255,255,0.08)",
  "rgba(34,197,94,0.3)",
  "rgba(34,197,94,0.5)",
  "rgba(34,197,94,0.75)",
  "rgba(34,197,94,1)",
];

const CELL = 12;
const GAP = 4;

// ─── helpers ─────────────────────────────────────────

function generateDummyData(): Record<string, number> {
  const map: Record<string, number> = {};
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    map[d.toISOString().split("T")[0]] = Math.floor(Math.random() * 5);
  }

  return map;
}

function level(count: number) {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 7) return 3;
  return 4;
}

// ─── 🔥 CONTINUOUS GRID (IMPORTANT FIX) ───────────────

function buildContinuousGrid(data: Record<string, number>): DayCell[][] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: DayCell[] = [];

  const rows: DayCell[][] = Array.from({ length: 7 }, () => []);

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const key = d.toISOString().split("T")[0];

    days.push({
      date: key,
      count: data[key] ?? 0,
      weekday: d.getDay(),
      month: d.getMonth(),
    });
  }

  // group by weekday rows (Sun → Sat)

  days.forEach((day) => {
    rows[day.weekday].push(day);
  });

  return rows;
}

// ─── cell ─────────────────────────────────────────────

function HeatCell({ cell }: any) {
  const l = level(cell.count);

  return (
    <Tooltip title={cell.date}>
      <Box
        sx={{
          width: CELL,
          height: CELL,
          borderRadius: "3px",
          background: FILLS[l],
          border: `1px solid ${BORDER_COLORS[l]}`,
        }}
      />
    </Tooltip>
  );
}

// ─── main ─────────────────────────────────────────────

export default function TaskHeatmap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [visibleCols, setVisibleCols] = useState(30);

  const data = useMemo(generateDummyData, []);
  const rows = useMemo(() => buildContinuousGrid(data), [data]);
  // 👇 responsive columns count
  useEffect(() => {
    function calculate() {
      if (!containerRef.current) return;

      const width = containerRef.current.offsetWidth;

      const colWidth = CELL + GAP;
      const count = Math.floor(width / colWidth);

      setVisibleCols(count);
    }

    calculate();
    window.addEventListener("resize", calculate);
    return () => window.removeEventListener("resize", calculate);
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: 4,
        p: 3,
        background: `
          radial-gradient(circle at 80% 20%, rgba(34,197,94,0.08), transparent 35%),
          radial-gradient(circle at 10% 80%, rgba(16,185,129,0.10), transparent 30%),
          linear-gradient(180deg, #0f172a 0%, #020617 100%)
        `,
      }}
    >
      <Typography sx={{ color: "#fff", fontWeight: 700, mb: 2 }}>
        Task Activity
      </Typography>

      <Box ref={containerRef}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: `${GAP}px` }}>
          {rows.map((row, ri) => (
            <Box key={ri} sx={{ display: "flex", gap: `${GAP}px` }}>
              {row.slice(-visibleCols).map((cell, ci) => (
                <HeatCell key={ci} cell={cell} />
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
