"use client";

import React from "react";
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { BarChart } from "@mui/x-charts";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import IconButton from "@mui/material/IconButton";
import { keyframes } from "@mui/system";
import { PieChart } from "@mui/x-charts";

const growBar = keyframes`
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
`;

const cards = [
  {
    title: "Completed",
    value: "18",
    color: "#4CAF50",
  },
  {
    title: "Pending",
    value: "5",
    color: "#FFC107",
    bars: [70, 40, 20, 35, 30],
  },
];
export default function WeeklySnapshot() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const completedSeries = [12, 18, 10, 16, 11]; // <- use real data later
  const completedLabels = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const [animatedData, setAnimatedData] = React.useState<number[]>(
    completedSeries.map(() => 0)
  );
  const [pendingAnimated, setPendingAnimated] = React.useState(false);
  const rafRef = React.useRef<number | null>(null);
  const isCancelledRef = React.useRef(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPendingAnimated(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    isCancelledRef.current = false;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animateOneBar = (barIndex: number, durationMs = 300) => {
      return new Promise<void>((resolve) => {
        const start = performance.now();
        const target = completedSeries[barIndex];

        const tick = (now: number) => {
          if (isCancelledRef.current) return;

          const t = Math.min(1, (now - start) / durationMs);
          const eased = easeOutCubic(t);
          const value = target * eased;

          setAnimatedData((prev) => {
            const next = [...prev];
            next[barIndex] = value;
            return next;
          });

          if (t < 1) {
            rafRef.current = requestAnimationFrame(tick);
          } else {
            // snap to exact value at end
            setAnimatedData((prev) => {
              const next = [...prev];
              next[barIndex] = target;
              return next;
            });
            resolve();
          }
        };

        rafRef.current = requestAnimationFrame(tick);
      });
    };

    const run = async () => {
      // reset
      setAnimatedData(completedSeries.map(() => 0));

      for (let i = 0; i < completedSeries.length; i++) {
        await new Promise((r) => setTimeout(r, 180)); // delay between bars
        await animateOneBar(i, 300); // slower growth per bar
      }
    };

    run();

    return () => {
      isCancelledRef.current = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        background: "#f8f9fb",
        borderRadius: 4,
      }}
    >
      {/* Header */}
      <Typography variant="h5" fontWeight={600} mb={3}>
        Weekly Snapshot
      </Typography>

      {/* Cards Row */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
        }}
      >
        {/* First 3 Cards */}
        {cards.map((card, index) => (
          <Paper
            key={index}
            elevation={0}
            sx={{
              flex: 1,
              p: 2,
              borderRadius: 4,
              background: "#ffffff",
              display: "flex",
              flexDirection: "column",
              //   justifyContent: "space-between",
              boxShadow: "0px 10px 30px rgba(0,0,0,0.08)",
              transition: "transform 200ms ease, box-shadow 200ms ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0px 16px 45px rgba(0,0,0,0.12)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CheckCircleRoundedIcon
                  sx={{ color: card.color, fontSize: 20 }}
                />
                <Typography variant="subtitle1" color="text.secondary">
                  {card.title}
                </Typography>
              </Box>

              <IconButton size="small">
                <InfoOutlinedIcon sx={{ fontSize: 18, color: "#9ca3af" }} />
              </IconButton>
            </Box>

            <Typography
              variant="h3"
              fontWeight={700}
              sx={{ color: card.color }}
              //   mt={1}
              //   mb={3}
            >
              {card.value}
            </Typography>

            {/* Mini Bars */}
            {/* Graph */}
            {card.title === "Completed" ? (
              <Box>
                <BarChart
                  height={190}
                  //   animationDuration={800}
                  xAxis={[
                    {
                      scaleType: "band",
                      data: completedLabels,
                      tickLabelStyle: {
                        fontSize: 13,
                        fill: "#9ca3af",
                      },
                    },
                  ]}
                  yAxis={[
                    {
                      width: 0, // 👈 remove left axis space
                    },
                  ]}
                  series={[
                    {
                      data: animatedData,
                      color: card.color,
                      //   barGapRatio: 0.6, // 👈 thinner bars
                    },
                  ]}
                  margin={{
                    top: 10,
                    right: 0,
                    bottom: 35,
                    left: 0,
                  }}
                  slotProps={{
                    bar: {
                      rx: 12,
                    },
                  }}
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

                    "& .MuiBarElement-root": {
                      transformOrigin: "bottom",
                      animation: `${growBar} 0.8s ease-out forwards`,
                    },

                    "& .MuiBarElement-root:nth-of-type(1)": {
                      animationDelay: "0.1s",
                    },
                    "& .MuiBarElement-root:nth-of-type(2)": {
                      animationDelay: "0.25s",
                    },
                    "& .MuiBarElement-root:nth-of-type(3)": {
                      animationDelay: "0.4s",
                    },
                    "& .MuiBarElement-root:nth-of-type(4)": {
                      animationDelay: "0.55s",
                    },
                    "& .MuiBarElement-root:nth-of-type(5)": {
                      animationDelay: "0.7s",
                    },
                  }}
                />
              </Box>
            ) : (
              <Box mt={9}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Workload Distribution
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    height: 14,
                    borderRadius: 7,
                    overflow: "hidden",
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  <Box
                    sx={{
                      width: pendingAnimated ? "40%" : "0%",
                      transition: "width 600ms ease",
                      backgroundColor: "#DC2626",
                    }}
                  />
                  <Box
                    sx={{
                      width: pendingAnimated ? "40%" : "0%",
                      transition: "width 600ms ease 150ms",
                      backgroundColor: "#EF4444 ",
                    }}
                  />
                  <Box
                    sx={{
                      width: pendingAnimated ? "20%" : "0%",
                      transition: "width 600ms ease 300ms",
                      backgroundColor: "#F87171 ",
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 2,
                    fontSize: 13,
                    color: "#9ca3af",
                  }}
                >
                  <span>High (2)</span>
                  <span>Medium (2)</span>
                  <span>Low (1)</span>
                </Box>
              </Box>
            )}
          </Paper>
        ))}

        {/* Focus Alignment Card */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: 3,
            borderRadius: 4,
            background: "#ffffff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="subtitle1" color="text.secondary">
            Focus Alignment
          </Typography>

          <Typography
            variant="h3"
            fontWeight={700}
            sx={{ color: "#1976d2" }}
            mt={1}
            mb={2}
          >
            68%
          </Typography>

          <LinearProgress
            variant="determinate"
            value={68}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: "#e3f2fd",
              "& .MuiLinearProgress-bar": {
                borderRadius: 5,
                backgroundColor: "#1976d2",
              },
            }}
          />
        </Paper>

        {/* AI Mood Tracking Card */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: 3,
            borderRadius: 4,
            background: "#ffffff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="subtitle1" color="text.secondary">
            AI Mood Tracking
          </Typography>

          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ color: "#7B61FF" }}
            mt={1}
          >
            Calm
          </Typography>

          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Based on journal sentiment
          </Typography>

          <Box mt={2}>
            <LinearProgress
              variant="determinate"
              value={78}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: "#ede7f6",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 5,
                  backgroundColor: "#7B61FF",
                },
              }}
            />
          </Box>
        </Paper>
      </Box>

      {/* Weekly Completion */}
      <Paper
        elevation={0}
        sx={{
          mt: 4,
          p: 3,
          borderRadius: 4,
          background: "#ffffff",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={1}
        >
          <Typography variant="subtitle1">
            72% Of Weekly Plan Completed
          </Typography>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={72}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: "#e0e0e0",
            "& .MuiLinearProgress-bar": {
              borderRadius: 5,
              background: "linear-gradient(90deg, #1976d2 0%, #4CAF50 100%)",
            },
          }}
        />
      </Paper>
    </Box>
  );
}
