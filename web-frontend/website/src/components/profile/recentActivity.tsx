import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import React from "react";

type Milestone = {
  id: number;
  title: string;
  completed: boolean;
  difficulty?: string;
};
type MilestonesCardProps = {
  milestones: Milestone[];
};

export default function RecentActivity({ milestones }: MilestonesCardProps) {
  const completedCount = milestones.filter((m) => m.completed).length;

  const milestones1 = [
    {
      id: 1,
      title: "Solved 5 LeetCode Mediums",
      difficulty: "medium",
      completed: true,
    },
    {
      id: 2,
      title: "Applied to 10+ roles",
      difficulty: "hard",
      completed: true,
    },
    {
      id: 3,
      title: "React Hooks mastery",
      difficulty: "hard",
      completed: true,
    },
    {
      id: 4,
      title: "System Design basics",
      difficulty: "medium",
      completed: false,
    },
    {
      id: 5,
      title: "Mock behavioral interview",
      difficulty: "medium",
      completed: false,
    },
  ];
  return (
    <>
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 20px 40px rgba(209, 112, 51, 0.15)",
          border: "1px solid rgba(209, 112, 51, 0.1)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(to left, rgb(209, 112, 51), #E5B526)",
          },
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 30px 60px rgba(209, 112, 51, 0.25)",
          },
        }}
      >
        {/* Gradient header bar */}
        <Box
          sx={{
            height: 6,
            background: "linear-gradient(to left, rgb(209, 112, 51), #E5B526)",
            opacity: 0.95,
          }}
        />

        <CardHeader
          sx={{
            px: 3,
            pt: 3,
            "& .MuiCardHeader-title": {
              fontWeight: 700,
              background:
                "linear-gradient(to right, rgb(209, 112, 51), #E5B526)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            },
            "& .MuiCardHeader-subheader": {
              color: "rgb(209, 112, 51)",
              fontWeight: 500,
              fontSize: "0.9rem",
            },
          }}
          title="Weekly Milestones"
          subheader={`${completedCount} of ${5} key achievements this week`}
        />

        <Divider
          sx={{
            mx: 3,
            background: "linear-gradient(to right, rgb(209, 112, 51), #E5B526)",
            height: 2,
          }}
        />

        <CardContent sx={{ p: 0 }}>
          <List disablePadding>
            {milestones.map((milestone, idx) => (
              <Box
                key={milestone.id}
                sx={{
                  animationDelay: `${idx * 100 + 200}ms`,
                  animation: "fadeInUp 0.6s ease-out forwards",
                }}
              >
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    px: 3,
                    py: 2.5,
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "rgba(209, 112, 51, 0.08)",
                      transform: milestone.completed
                        ? "scale(1.02)"
                        : "translateX(6px)",
                    },
                  }}
                >
                  {/* Status icon */}
                  <Box
                    sx={{
                      mr: 2.5,
                      mt: 0.5,
                      width: 40,
                      height: 40,
                      borderRadius: 3,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      fontWeight: 800,
                      transition: "all 0.4s ease",
                      ...(milestone.completed
                        ? {
                            bgcolor: "rgba(209, 112, 51, 0.15)", // ← Light orange tint
                            color: "rgb(209, 112, 51)", // ← Brand color checkmark
                            borderColor: "rgba(209, 112, 51, 0.4)",
                            boxShadow: "0 4px 12px rgba(209, 112, 51, 0.2)",
                            transform: "scale(1.05)",
                          }
                        : {
                            bgcolor: "rgba(209, 112, 51, 0.08)", // ← Very subtle orange
                            color: "rgb(209, 112, 51)",
                            borderColor: "rgba(209, 112, 51, 0.15)",
                            "&:hover": {
                              bgcolor: "rgba(209, 112, 51, 0.12)",
                            },
                          }),
                    }}
                  >
                    {milestone.completed ? "✓" : "○"}
                  </Box>

                  <ListItemText
                    slotProps={{
                      secondary: {
                        component: "div",
                      },
                    }}
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            ...(milestone.completed
                              ? {
                                  color: "rgb(209, 112, 51)",
                                  background:
                                    "linear-gradient(to right, rgb(209, 112, 51), #E5B526)",
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent",
                                  backgroundClip: "text",
                                }
                              : { color: "rgb(209, 112, 51)" }),
                          }}
                        >
                          {milestone.title}
                        </Typography>

                        {/* Difficulty Chip */}
                        {milestone.difficulty && (
                          <Chip
                            label={milestone.difficulty.toUpperCase()}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              height: 22,
                              ...(milestone.difficulty === "hard" && {
                                bgcolor: "#FEE2E2",
                                color: "#B91C1C",
                              }),
                              ...(milestone.difficulty === "medium" && {
                                bgcolor: "#FEF3C7",
                                color: "#92400E",
                              }),
                              ...(milestone.difficulty === "easy" && {
                                bgcolor: "#DCFCE7",
                                color: "#065F46",
                              }),
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box
                        sx={{
                          mt: 0.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 1.2,
                          flexWrap: "wrap",
                        }}
                      >
                        {/* DONE badge */}
                        {milestone.completed && (
                          <Box
                            component="span"
                            sx={{
                              px: 1.5,
                              py: 0.25,
                              bgcolor: "rgba(209, 112, 51, 0.15)",
                              color: "#059669",
                              borderRadius: 1.5,
                              fontSize: "0.7rem",
                              fontWeight: 700,
                            }}
                          >
                            DONE
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {idx < milestones.length - 1 && (
                  <Divider
                    sx={{
                      mx: 3,
                      background:
                        "linear-gradient(to right, transparent, rgba(209, 112, 51, 0.2), transparent)",
                    }}
                  />
                )}
              </Box>
            ))}
          </List>
        </CardContent>
      </Card>
    </>
  );
}
