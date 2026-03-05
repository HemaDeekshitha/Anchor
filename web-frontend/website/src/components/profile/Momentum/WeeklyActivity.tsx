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
  const maxBarValue = Math.max(...weeklyActivity.map((b) => b.value));
  return (
    <>
      <Card sx={{ borderRadius: 3, mt: 1 }}>
        <CardHeader
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
                width: 0, // 👈 remove left axis space
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

                color: " #E5B526",
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
            }}
          />
          <Typography
            variant="caption"
            color="text.primary"
            sx={{ mt: 1, display: "block" }}
          >
            Peak usage on Thursday with {maxBarValue} sessions.
          </Typography>
        </CardContent>
      </Card>
    </>
  );
}
