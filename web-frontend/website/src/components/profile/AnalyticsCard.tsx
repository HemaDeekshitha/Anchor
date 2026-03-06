import { Box, Card, CardContent, Typography } from "@mui/material";
import React from "react";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import Tooltip from "@mui/material/Tooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

type JobPrepMetric = {
  label: string;
  value: string | number;
  lastWeek?: string | number;
  change: number;
};

type AnalyticsCardsProps = {
  jobPrepMetrics: JobPrepMetric[];
  rewards?: {
    apBalance: number;
    apNeeded: number;
    conversions360: number;
  };
  pointsEarned?: number;
  pointsEarnedLastWeek?: number;
};

const STREAK_GOAL = 5;

const tooltipMap: Record<string, string> = {
  "LeetCode Solved": "Number of DSA problems you solved this week.",
  "Tasks Completed": "Tasks completed from your weekly plan.",
  "Applications Sent": "Job applications you submitted this week.",
  "Momentum Streak":
    "Complete all tasks daily to build your streak. Reach 5 consecutive days to unlock a reward.",
  "AP Earned": "Total Anchor Points earned from completing tasks this week.",
  // "Anchor Points":
  //   "Earn Anchor Points (AP) by completing tasks. Every 100 AP can be converted into 1 × 360 reward.",
};

export default function AnalyticsCard({
  jobPrepMetrics,
  rewards,
  pointsEarned = 0,
  pointsEarnedLastWeek = 0,
}: AnalyticsCardsProps) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
      {rewards && (
        <Card
          sx={{
            flex: "1 1 200px",
            borderRadius: 3,
            minWidth: 200,
            border: "1px solid rgb(209,112,51)",
            background: "rgba(209,112,51,0.05)",
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              minHeight: 150,
            }}
          >
            {/* Header */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography
                variant="caption"
                color="text.primary"
                textTransform="uppercase"
                fontWeight={600}
              >
                ⚡ Anchor Points
              </Typography>

              <Tooltip
                title="Earn Anchor Points by completing tasks. Every 100 AP converts to 1 × 360 reward."
                arrow
                placement="top"
              >
                <InfoOutlinedIcon
                  sx={{
                    fontSize: 18,
                    color: "text.secondary",
                    opacity: 0.7,
                    cursor: "pointer",
                    "&:hover": {
                      opacity: 1,
                      color: "rgb(209,112,51)",
                    },
                  }}
                />
              </Tooltip>
            </Box>

            {/* Current AP */}
            <Typography variant="h5" mt={0.5}>
              {rewards.apBalance} AP
            </Typography>

            {/* Next milestone */}

            {/* Total rewards */}
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: "block",
              }}
            >
              360 rewards earned: {rewards.conversions360}
            </Typography>

            {/* Helper message */}
            {/* Weekly comparison */}
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block", mt: 1 }}
            >
              This week
            </Typography>

            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block" }}
            >
              Last week: {pointsEarnedLastWeek}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: "block",
                mt: 1,
              }}
            >
              {rewards.apNeeded} AP to next 360 reward
            </Typography>

            <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
              {pointsEarned >= pointsEarnedLastWeek ? (
                <ArrowUpwardIcon
                  fontSize="small"
                  sx={{ color: "rgb(209,112,51)" }}
                />
              ) : (
                <ArrowDownwardIcon fontSize="small" sx={{ color: "#ef4444" }} />
              )}

              <Typography
                variant="body2"
                sx={{
                  color:
                    pointsEarned >= pointsEarnedLastWeek
                      ? "rgb(209,112,51)"
                      : "#ef4444",
                  fontWeight: 600,
                }}
              >
                {Math.abs(
                  pointsEarnedLastWeek === 0
                    ? pointsEarned === 0
                      ? 0
                      : 100
                    : Math.round(
                        ((pointsEarned - pointsEarnedLastWeek) /
                          pointsEarnedLastWeek) *
                          100
                      )
                )}
                %{" "}
                {pointsEarned >= pointsEarnedLastWeek
                  ? "vs last week"
                  : "drop vs last week"}
              </Typography>
            </Box>

            {/* Progress to reward */}
          </CardContent>
        </Card>
      )}
      {jobPrepMetrics.map((metric) => {
        const isPositive = metric.change >= 0;
        const isStreak = metric.label === "Momentum Streak";
        const streakValue = Number(metric.value?.toString().split(" ")[0] || 0);
        let helperText = "";

        if (metric.label === "LeetCode Solved") {
          helperText = "Solve one more problem to keep your momentum going";
        }

        if (metric.label === "Tasks Completed") {
          const parts = metric.value.toString().split("/");
          const remaining = Number(parts[1]) - Number(parts[0]);
          helperText =
            remaining > 0
              ? `${remaining} tasks left to complete this week's plan`
              : "All tasks completed for this week 🎉";
        }

        if (metric.label === "Applications Sent") {
          const diff = Number(metric.lastWeek || 0) - Number(metric.value);
          helperText =
            diff > 0
              ? `Send ${diff + 1} more applications to beat last week`
              : "Great progress on applications this week";
        }
        return (
          <Card
            key={metric.label}
            sx={{
              flex: "1 1 200px",
              borderRadius: 3,
              minWidth: 200,
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                minHeight: 150,
              }}
            >
              {/* Header */}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography
                  variant="caption"
                  color="text.primary"
                  textTransform="uppercase"
                  fontWeight={600}
                >
                  {metric.label}
                </Typography>

                <Tooltip title={tooltipMap[metric.label]} arrow placement="top">
                  <InfoOutlinedIcon
                    sx={{
                      fontSize: 18,
                      color: "text.secondary",
                      opacity: 0.7,
                      cursor: "pointer",
                      "&:hover": {
                        opacity: 1,
                        color: "rgb(209,112,51)",
                      },
                    }}
                  />
                </Tooltip>
              </Box>

              {/* Main value */}
              <Typography variant="h5" mt={0.5}>
                {metric.value}
              </Typography>

              {/* STREAK UI */}
              {isStreak ? (
                <Box sx={{ mt: "auto" }}>
                  {/* Progress dots */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.2,
                      mb: 1,
                    }}
                  >
                    {[...Array(STREAK_GOAL)].map((_, i) => {
                      const filled = i < streakValue;

                      return (
                        <Box
                          key={i}
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            transition: "all 0.25s ease",
                            bgcolor: filled ? "rgb(209,112,51)" : "#e5e7eb",
                            transform: filled ? "scale(1.1)" : "scale(1)",
                          }}
                        />
                      );
                    })}
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      textAlign: "start",
                      display: "block",
                    }}
                  >
                    {STREAK_GOAL - streakValue > 0
                      ? `${
                          STREAK_GOAL - streakValue
                        } more days to unlock reward`
                      : "Reward unlocked! 🔥"}
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* This week */}

                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", display: "block", mt: 1 }}
                  >
                    This week
                  </Typography>

                  {/* Last week */}
                  {metric.lastWeek !== undefined &&
                    metric.lastWeek !== null && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          display: "block",
                        }}
                      >
                        Last week: {metric.lastWeek}
                      </Typography>
                    )}
                  {helperText && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        display: "block",
                        mt: 1,
                      }}
                    >
                      {helperText}
                    </Typography>
                  )}

                  {/* Change indicator */}
                  <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                    {isPositive ? (
                      <ArrowUpwardIcon
                        fontSize="small"
                        sx={{ color: "rgb(209,112,51)" }}
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
                        color: isPositive ? "rgb(209,112,51)" : "#ef4444",
                        fontWeight: 600,
                      }}
                    >
                      {Math.abs(metric.change)}%{" "}
                      {isPositive ? "vs last week" : "drop vs last week"}
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}
