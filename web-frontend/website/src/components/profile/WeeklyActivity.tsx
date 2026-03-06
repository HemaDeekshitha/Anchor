import { Card, CardContent, CardHeader, Chip, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts";
import React from "react";

type SimpleBar = {
  label: string;
  value: number;
};

type WeeklyActivityChartProps = {
  weeklyActivity: SimpleBar[];
};
export default function WeeklyActivity({
  weeklyActivity,
}: WeeklyActivityChartProps) {
  const maxTasks = Math.max(...weeklyActivity.map((d) => d.value), 0);

  const peakDays = weeklyActivity
    .filter((d) => d.value === maxTasks && maxTasks > 0)
    .map((d) => d.label);

  const peakText =
    peakDays.length === 0
      ? "You haven't completed any tasks this week yet."
      : `Peak productivity on ${peakDays.join(
          ", "
        )} — ${maxTasks}/4 tasks completed`;
  const barData = weeklyActivity.map((d) => ({
    value: d.value,
    color:
      d.value === maxTasks && maxTasks > 0
        ? "rgb(209, 112, 51)" // highlight peak days
        : "#E5B526", // normal bars
  }));
  return (
    <>
      <Card sx={{ borderRadius: 3, mt: 1 }}>
        <CardHeader
          sx={{
            "& .MuiCardHeader-title": {
              fontWeight: 700,
              background:
                "linear-gradient(to right, rgb(209, 112, 51), #E5B526)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            },
            "& .MuiCardHeader-subheader": {
              color: "black",
              fontWeight: 500,
              fontSize: "0.9rem",
            },
          }}
          title="Weekly Activity"
          subheader="Tasks completed per day (last 7 days)"
          action={
            <Chip
              label="Last 7 days"
              size="small"
              variant="outlined"
              sx={{
                color: "rgb(209, 112, 51)",
                borderColor: "rgba(209, 112, 51, 0.3)",
                "& .MuiChip-label": { fontWeight: 500 },
              }}
            />
          }
        />
        <CardContent>
          <BarChart
            height={220}
            borderRadius={8}
            yAxis={[
              {
                min: 0,
                max: 4, // max tasks per day
                width: 0,
              },
            ]}
            xAxis={[
              {
                data: weeklyActivity.map((d) => d.label),
                scaleType: "band",
              },
            ]}
            series={[
              {
                data: weeklyActivity.map((d) => d.value),
                label: "Tasks",
                color: "rgb(209,112,51)",
                valueFormatter: (value) => `${value}/4  `,
              },
            ]}
            margin={{ top: 16, right: 12, bottom: 32, left: 40 }}
            sx={{
              width: "100%",

              "& .MuiChartsAxis-line": {
                display: "none",
              },
              "& .MuiChartsAxis-tick": {
                display: "none",
              },
              "& .MuiChartsGrid-line": {
                display: "none",
              },
              "& .MuiChartsContainer-root": {
                "& defs": {
                  "& linearGradient#orangeGradient": {
                    x1: "0%",
                    y1: "0%",
                    x2: "100%",
                    y2: "100%",
                    gradientUnits: "userSpaceOnUse",
                  },
                  "& stop[offset='0%']": {
                    stopColor: "rgb(209, 112, 51)",
                  },
                  "& stop[offset='100%']": {
                    stopColor: "#E5B526",
                  },
                },
              },
              "& .MuiBarElement-root": {
                rx: 6,
              },
            }}
          />
          <Typography
            variant="caption"
            color="rgb(209,112,51)"
            sx={{ mt: 1, display: "block", fontWeight: 500 }}
          >
            {peakText}
          </Typography>
        </CardContent>
      </Card>
    </>
  );
}
