"usse client";
import LayoutWithSidebar from "@/components/SideBar/LayoutWithSidebar";
import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WeeklySnapshot from "./weeklySnapShot";

export default function Momentum() {
  return (
    <LayoutWithSidebar>
      <Typography variant="h5" gutterBottom>
        Your Progress
      </Typography>
      <Box
        sx={{
          position: "relative", // 👈 IMPORTANT
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          p: 3,
          background: "linear-gradient(to left,rgb(209, 112, 51), #E5B526)",
          borderRadius: 10,
          gap: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            gap: 3,
            justifyContent: "flex-start",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 3,
              alignItems: "center",
            }}
          >
            <Avatar
              alt="User Avatar"
              src="/assets/images/pro.jpg"
              sx={{ width: 125, height: 125 }}
            />

            <Stack spacing={0}>
              <Typography variant="h6">John Doe</Typography>
              <Typography sx={{ fontSize: "0.9rem" }}>
                JohnDoe@gmail.com
              </Typography>
              <Typography sx={{ fontSize: "0.9rem" }}>
                Switching to Product focus SWE
              </Typography>
            </Stack>
          </Box>

          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{
              width: "100%",
            }}
          >
            <Box
              sx={{
                position: { xs: "relative", lg: "absolute" },
                right: { lg: 40 },
                top: { lg: 20 },
                mt: { xs: 3, lg: 0 },

                backgroundColor: "#ffffff",
                borderRadius: 4,
                p: 3,
                pb: 3,
                pr: 1,

                mx: { xs: "auto", lg: 0 }, // 👈 THIS centers it

                boxShadow: "0px 15px 40px rgba(0,0,0,0.08)",
                display: "flex",
                flexDirection: "column",
                gap: 3,
                zIndex: 3,
              }}
            >
              {/* 🔥 Streak */}
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocalFireDepartmentIcon
                  sx={{ color: "#f97316", fontSize: 24 }}
                />
                <Typography fontWeight={600} sx={{ fontSize: 16 }}>
                  7 Day Streak
                </Typography>
              </Stack>

              {/* 📈 Momentum */}
              <Stack direction="row" alignItems="center" spacing={1}>
                <TrendingUpIcon sx={{ color: "#facc15", fontSize: 24 }} />
                <Stack spacing={0}>
                  <Typography fontWeight={600} sx={{ fontSize: 16 }}>
                    Momentum
                  </Typography>
                  <Typography sx={{ fontSize: 12 }} color="#6b7280">
                    +12% from last week
                  </Typography>
                </Stack>
              </Stack>

              {/* 🎯 Weekly Goal Section */}
              <Stack
                direction="row"
                alignItems="start"
                justifyContent="space-between"
                gap={3}
              >
                {/* Left text */}
                <Stack direction="row" spacing={1}>
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={24}
                    thickness={6}
                    sx={{
                      color: "#f59e0b",
                    }}
                  />
                  <Stack>
                    <Typography fontWeight={600} sx={{ fontSize: 16 }}>
                      72%
                    </Typography>
                    <Typography
                      fontSize="0.75rem"
                      sx={{ fontSize: 12 }}
                      color="#6b7280"
                    >
                      Weekly Goal Completion
                    </Typography>
                  </Stack>
                </Stack>

                {/* Right Large Ring */}
                <Box
                  position="relative"
                  display="inline-flex"
                  sx={{
                    mt: -6, // 👈 pull it up to overlap
                  }}
                >
                  {/* Background Circle */}
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={90}
                    thickness={4}
                    sx={{
                      color: "#f3f4f6", // light gray background ring
                    }}
                  />

                  {/* Progress Ring */}
                  <CircularProgress
                    variant="determinate"
                    value={72} // change this dynamically
                    size={90}
                    thickness={4}
                    sx={{
                      color: "#f59e0b", // Anchor accent
                      position: "absolute",
                      left: 0,
                    }}
                  />

                  {/* Percentage Text */}
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    bottom={0}
                    right={0}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Typography fontWeight={600} fontSize="0.8rem">
                      72%
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            // mt: 10, // 👈 push it down below overlap
            // mt: { xs: 2, sm: 2, md: 2, lg: 10 },
            background:
              "linear-gradient(to right,rgb(255, 234, 232),transparent)",
            p: 2,
            borderRadius: 5,
            display: "flex",
            flexDirection: "row",
            gap: 2,
            alignItems: "center",
            justifyContent: "flex-start",
            // textAlign: "justify",
          }}
        >
          <AutoAwesomeIcon sx={{ color: "#f59e0b", fontSize: 35 }} />
          <Typography sx={{ width: "50%" }}>
            You have been consistent this week. Most of your effort went towards
            learning and applications. Kepp this rythm.
          </Typography>
        </Box>
      </Box>
      <WeeklySnapshot />
    </LayoutWithSidebar>
  );
}
