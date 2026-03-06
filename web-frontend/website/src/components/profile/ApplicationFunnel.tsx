import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Typography,
} from "@mui/material";
import React from "react";

type DeadlineGroup = {
  group: string;
  count: number;
  items: string[];
};
type DeadlinesCardProps = {
  deadlinesData: DeadlineGroup[];
};

export default function ApplicationFunnel({
  deadlinesData,
}: DeadlinesCardProps) {
  return (
    <>
      {" "}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 20px 40px rgba(209, 112, 51, 0.15)",
          border: "1px solid rgba(209, 112, 51, 0.1)",
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
          }}
          title="Upcoming Deadlines"
          subheader="Don't miss these important dates"
        />

        <Divider
          sx={{
            mx: 3,
            background: "linear-gradient(to right, rgb(209, 112, 51), #E5B526)",
            height: 2,
          }}
        />

        <CardContent sx={{ px: 3, pb: 3 }}>
          {deadlinesData.map((deadlineGroup, groupIdx) => (
            <Box key={groupIdx} sx={{ mb: 3 }}>
              {/* Group header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1.5,
                }}
              >
                <Chip
                  label={`${deadlineGroup.count}`}
                  size="small"
                  sx={{
                    bgcolor: "rgb(209, 112, 51)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    height: 24,
                    minWidth: 32,
                  }}
                />
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, color: "rgb(209, 112, 51)" }}
                >
                  {deadlineGroup.group}
                </Typography>
              </Box>

              {/* Deadline items */}
              {deadlineGroup.items.map((item, itemIdx) => (
                <Box
                  key={itemIdx}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 2,
                    bgcolor: "rgba(209, 112, 51, 0.05)",
                    borderRadius: 2,
                    border: "1px solid rgba(209, 112, 51, 0.1)",
                    mb: 1.5,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "rgba(209, 112, 51, 0.1)",
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {item}
                  </Typography>
                  <Chip
                    label="URGENT"
                    size="small"
                    sx={{
                      bgcolor: "#fef3c7",
                      color: "rgb(209, 112, 51)",
                      fontWeight: 600,
                      fontSize: "0.65rem",
                    }}
                  />
                </Box>
              ))}
            </Box>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
