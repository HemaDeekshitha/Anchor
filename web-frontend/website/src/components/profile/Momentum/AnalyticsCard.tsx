import { Box, Card, CardContent, Typography } from "@mui/material";
import React from "react";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
type JobPrepMetric = {
  label: string;
  value: string;
  change: number;
};
type AnalyticsCardsProps = {
  jobPrepMetrics: JobPrepMetric[];
};

export default function AnalyticsCard({ jobPrepMetrics }: AnalyticsCardsProps) {
  return (
    <>
      {" "}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {jobPrepMetrics.map((metric) => {
          const isPositive = metric.change >= 0;

          return (
            <Card
              key={metric.label}
              sx={{
                flex: "1 1 200px",
                borderRadius: 3,
                minWidth: 200,
              }}
            >
              <CardContent>
                <Typography
                  variant="caption"
                  color="text.primary"
                  textTransform="uppercase"
                >
                  {metric.label}
                </Typography>
                <Typography variant="h5" mt={0.5} mb={1}>
                  {metric.value}
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5}>
                  {isPositive ? (
                    <ArrowUpwardIcon
                      fontSize="small"
                      sx={{ color: "rgb(209, 112, 51)" }}
                    />
                  ) : (
                    <ArrowDownwardIcon
                      fontSize="small"
                      sx={{ color: "#ef4444" }}
                    />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color: isPositive ? "rgb(209, 112, 51)" : "#ef4444",
                      fontWeight: 600,
                    }}
                  >
                    {Math.abs(metric.change)}%{" "}
                    {isPositive ? "vs last week" : "drop vs last week"}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </>
  );
}
