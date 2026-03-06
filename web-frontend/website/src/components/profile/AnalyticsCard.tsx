import { Box, Card, CardContent, Typography } from "@mui/material";
import React from "react";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import Tooltip from "@mui/material/Tooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";

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
const iconMap: Record<string, React.ReactNode> = {
  "LeetCode Solved": (
    <CodeRoundedIcon sx={{ color: "#3b82f6", fontSize: 18, ml: -0.5 }} />
  ),
  "Tasks Completed": (
    <TaskAltRoundedIcon sx={{ color: "#22c55e", fontSize: 18, ml: -0.5 }} />
  ),
  "Applications Sent": (
    <SendRoundedIcon sx={{ color: "#a855f7", fontSize: 18, ml: -0.5 }} />
  ),
  "Momentum Streak": (
    <LocalFireDepartmentRoundedIcon
      sx={{ color: "#f59e0b", fontSize: 18, ml: -0.5 }}
    />
  ),
};

const tooltipMap: Record<string, string> = {
  "LeetCode Solved": "Number of DSA problems you solved this week.",
  "Tasks Completed": "Tasks completed from your weekly plan.",
  "Applications Sent": "Job applications you submitted this week.",
  "Momentum Streak":
    "Complete all tasks daily to build your streak. Reach 5 consecutive days to unlock a reward.",
  "AP Earned": "Total Anchor Points earned from completing tasks this week.",
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
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
            },
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
              <Box display="flex" alignItems="center" gap={0.75}>
                <BoltRoundedIcon
                  sx={{
                    color: "#D17033",
                    fontSize: 20,
                    ml: -0.5,
                  }}
                />

                <Typography
                  variant="caption"
                  color="text.primary"
                  textTransform="uppercase"
                  fontWeight={600}
                  sx={{ lineHeight: 1 }}
                >
                  Anchor Points
                </Typography>
              </Box>

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
            <Typography
              variant="caption"
              sx={{ color: "rgb(209,112,51)", display: "block", mt: 1 }}
            >
              This week
            </Typography>
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
          helperText = "You're on the right track. Keep going!";
        }

        if (metric.label === "Tasks Completed") {
          const parts = metric.value.toString().split("/");
          const remaining = Number(parts[1]) - Number(parts[0]);
          helperText = "Every completed task moves you closer to your goal";
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
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box display="flex" alignItems="center" gap={0.75}>
                    {iconMap[metric.label]}

                    <Typography
                      variant="caption"
                      color="text.primary"
                      textTransform="uppercase"
                      fontWeight={600}
                      sx={{ lineHeight: 1 }}
                    >
                      {metric.label}
                    </Typography>
                  </Box>
                </Box>

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
              <Typography
                variant="caption"
                sx={{ color: "rgb(209,112,51)", display: "block", mt: 1 }}
              >
                This week
              </Typography>
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
                            mt: 2,
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
                      pt: 1,
                      color: "rgb(209,112,51)",
                      textAlign: "start",
                      display: "block",
                      fontWeight: 600,
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
