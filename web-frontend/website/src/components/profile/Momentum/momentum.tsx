// "usse client";
// import LayoutWithSidebar from "@/components/SideBar/LayoutWithSidebar";
// import {
//   Avatar,
//   Box,
//   CircularProgress,
//   Divider,
//   Stack,
//   Typography,
// } from "@mui/material";
// import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
// import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
// import TrendingUpIcon from "@mui/icons-material/TrendingUp";
// import WeeklySnapshot from "./weeklySnapShot";

// export default function Momentum() {
//   return (
//     <LayoutWithSidebar>
//       <Typography variant="h5" gutterBottom>
//         Your Progress
//       </Typography>
//       <Box
//         sx={{
//           position: "relative", // 👈 IMPORTANT
//           display: "flex",
//           flexDirection: "column",
//           justifyContent: "flex-start",
//           p: 3,
//           background: "linear-gradient(to left,rgb(209, 112, 51), #E5B526)",
//           borderRadius: 10,
//           gap: 3,
//         }}
//       >
//         <Box
//           sx={{
//             display: "flex",
//             flexDirection: { xs: "column", lg: "row" },
//             gap: 3,
//             justifyContent: "flex-start",
//           }}
//         >
//           <Box
//             sx={{
//               display: "flex",
//               flexDirection: "row",
//               gap: 3,
//               alignItems: "center",
//             }}
//           >
//             <Avatar
//               alt="User Avatar"
//               src="/assets/images/pro.jpg"
//               sx={{ width: 125, height: 125 }}
//             />

//             <Stack spacing={0}>
//               <Typography variant="h6">John Doe</Typography>
//               <Typography sx={{ fontSize: "0.9rem" }}>
//                 JohnDoe@gmail.com
//               </Typography>
//               <Typography sx={{ fontSize: "0.9rem" }}>
//                 Switching to Product focus SWE
//               </Typography>
//             </Stack>
//           </Box>

//           <Stack
//             direction="row"
//             justifyContent="space-between"
//             sx={{
//               width: "100%",
//             }}
//           >
//             <Box
//               sx={{
//                 position: { xs: "relative", lg: "absolute" },
//                 right: { lg: 40 },
//                 top: { lg: 20 },
//                 mt: { xs: 3, lg: 0 },

//                 backgroundColor: "#ffffff",
//                 borderRadius: 4,
//                 p: 3,
//                 pb: 3,
//                 pr: 1,

//                 mx: { xs: "auto", lg: 0 }, // 👈 THIS centers it

//                 boxShadow: "0px 15px 40px rgba(0,0,0,0.08)",
//                 display: "flex",
//                 flexDirection: "column",
//                 gap: 3,
//                 zIndex: 3,
//               }}
//             >
//               {/* 🔥 Streak */}
//               <Stack direction="row" alignItems="center" spacing={1}>
//                 <LocalFireDepartmentIcon
//                   sx={{ color: "#f97316", fontSize: 24 }}
//                 />
//                 <Typography fontWeight={600} sx={{ fontSize: 16 }}>
//                   7 Day Streak
//                 </Typography>
//               </Stack>

//               {/* 📈 Momentum */}
//               <Stack direction="row" alignItems="center" spacing={1}>
//                 <TrendingUpIcon sx={{ color: "#facc15", fontSize: 24 }} />
//                 <Stack spacing={0}>
//                   <Typography fontWeight={600} sx={{ fontSize: 16 }}>
//                     Momentum
//                   </Typography>
//                   <Typography sx={{ fontSize: 12 }} color="#6b7280">
//                     +12% from last week
//                   </Typography>
//                 </Stack>
//               </Stack>

//               {/* 🎯 Weekly Goal Section */}
//               <Stack
//                 direction="row"
//                 alignItems="start"
//                 justifyContent="space-between"
//                 gap={3}
//               >
//                 {/* Left text */}
//                 <Stack direction="row" spacing={1}>
//                   <CircularProgress
//                     variant="determinate"
//                     value={100}
//                     size={24}
//                     thickness={6}
//                     sx={{
//                       color: "#f59e0b",
//                     }}
//                   />
//                   <Stack>
//                     <Typography fontWeight={600} sx={{ fontSize: 16 }}>
//                       72%
//                     </Typography>
//                     <Typography
//                       fontSize="0.75rem"
//                       sx={{ fontSize: 12 }}
//                       color="#6b7280"
//                     >
//                       Weekly Goal Completion
//                     </Typography>
//                   </Stack>
//                 </Stack>

//                 {/* Right Large Ring */}
//                 <Box
//                   position="relative"
//                   display="inline-flex"
//                   sx={{
//                     mt: -6, // 👈 pull it up to overlap
//                   }}
//                 >
//                   {/* Background Circle */}
//                   <CircularProgress
//                     variant="determinate"
//                     value={100}
//                     size={90}
//                     thickness={4}
//                     sx={{
//                       color: "#f3f4f6", // light gray background ring
//                     }}
//                   />

//                   {/* Progress Ring */}
//                   <CircularProgress
//                     variant="determinate"
//                     value={72} // change this dynamically
//                     size={90}
//                     thickness={4}
//                     sx={{
//                       color: "#f59e0b", // Anchor accent
//                       position: "absolute",
//                       left: 0,
//                     }}
//                   />

//                   {/* Percentage Text */}
//                   <Box
//                     position="absolute"
//                     top={0}
//                     left={0}
//                     bottom={0}
//                     right={0}
//                     display="flex"
//                     alignItems="center"
//                     justifyContent="center"
//                   >
//                     <Typography fontWeight={600} fontSize="0.8rem">
//                       72%
//                     </Typography>
//                   </Box>
//                 </Box>
//               </Stack>
//             </Box>
//           </Stack>
//         </Box>

//         <Box
//           sx={{
//             // mt: 10, // 👈 push it down below overlap
//             // mt: { xs: 2, sm: 2, md: 2, lg: 10 },
//             background:
//               "linear-gradient(to right,rgb(255, 234, 232),transparent)",
//             p: 2,
//             borderRadius: 5,
//             display: "flex",
//             flexDirection: "row",
//             gap: 2,
//             alignItems: "center",
//             justifyContent: "flex-start",
//             // textAlign: "justify",
//           }}
//         >
//           <AutoAwesomeIcon sx={{ color: "#f59e0b", fontSize: 35 }} />
//           <Typography sx={{ width: "50%" }}>
//             You have been consistent this week. Most of your effort went towards
//             learning and applications. Kepp this rythm.
//           </Typography>
//         </Box>
//       </Box>
//       <WeeklySnapshot />
//     </LayoutWithSidebar>
//   );
// }
"use client";

import LayoutWithSidebar from "@/components/SideBar/LayoutWithSidebar";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  Button,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { BarChart } from "@mui/x-charts";

type ActivityItem = {
  id: number;
  title: string;
  description: string;
  timestamp: string;
};

type AnalyticsMetric = {
  label: string;
  value: string | number;
  change: number;
};

type SimpleBar = {
  label: string;
  value: number;
};

const milestones = [
  {
    id: 1,
    title: "Solved 5 LeetCode Mediums",
    progress: "Arrays, Hashing, Sliding Window",
    completed: true,
  },
  {
    id: 2,
    title: "Applied to 10+ roles",
    progress: "Frontend Developer at Stripe, Vercel, Linear",
    completed: true,
  },
  {
    id: 3,
    title: "React Hooks mastery",
    progress: "Completed useEffect, useCallback modules",
    completed: true,
  },
  {
    id: 4,
    title: "System Design basics",
    progress: "2/4 videos • LRU Cache, Rate Limiter",
    completed: false,
  },
  {
    id: 5,
    title: "Mock behavioral interview",
    progress: "Schedule with mentor this Friday",
    completed: false,
  },
];

const metrics: AnalyticsMetric[] = [
  { label: "Total Sessions (30d)", value: 124, change: 12.4 },
  { label: "Avg. Session Length", value: "18m 32s", change: 4.1 },
  { label: "Profile Views", value: 892, change: -3.7 },
  { label: "Actions per Session", value: 6.3, change: 2.2 },
];

const weeklyActivity: SimpleBar[] = [
  { label: "Mon", value: 4 },
  { label: "Tue", value: 7 },
  { label: "Wed", value: 5 },
  { label: "Thu", value: 9 },
  { label: "Fri", value: 6 },
  { label: "Sat", value: 3 },
  { label: "Sun", value: 2 },
];

const jobPrepMetrics = [
  { label: "LeetCode Solved", value: "12", change: 25 },
  { label: "Tasks Completed", value: "18/25", change: 18 },
  { label: "Applications Sent", value: "8", change: 33 },
  { label: "Study Hours", value: "14h 32m", change: 18 },
];

const deadlinesData = [
  {
    group: "TODAY",
    count: 2,
    items: ["LeetCode Contest • 6:00 PM", "Stripe Application • 11:59 PM"],
  },
  {
    group: "TOMORROW",
    count: 3,
    items: [
      "Mock Interview • 2:00 PM",
      "LinkedIn Post • Anytime",
      "Vercel Application • 5:00 PM",
    ],
  },
];

export default function DashboardPage() {
  const maxBarValue = Math.max(...weeklyActivity.map((b) => b.value));

  return (
    <LayoutWithSidebar>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top nav / header */}
        <Box
          component="header"
          sx={{
            px: { xs: 2, md: 3 },
            py: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "background.paper",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            User Dashboard
          </Typography>
        </Box>

        {/* Main content */}
        <Box
          component="main"
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2.5,
            px: { xs: 2, md: 3 },
            py: 3,
          }}
        >
          {/* Left column: profile + activity */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {/* Profile card */}
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 20px 40px rgba(209, 112, 51, 0.15)",
                border: "1px solid rgba(209, 112, 51, 0.1)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  background:
                    "linear-gradient(to left, rgb(209, 112, 51), #E5B526)",
                },
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 30px 60px rgba(209, 112, 51, 0.25)",
                },
              }}
            >
              {/* Decorative top gradient bar */}
              <Box
                sx={{
                  height: 6,
                  background:
                    "linear-gradient(to left, rgb(209, 112, 51), #E5B526)",
                  opacity: 0.9,
                }}
              />

              <CardHeader
                sx={{ px: 3, pt: 3 }}
                avatar={
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor:
                        "linear-gradient(to left, rgb(209, 112, 51), #E5B526)",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "1.25rem",
                      boxShadow: "0 12px 24px rgba(209, 112, 51, 0.3)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: "0 16px 32px rgba(209, 112, 51, 0.4)",
                      },
                    }}
                    src="/assets/images/pro.jpg"
                  >
                    JD
                  </Avatar>
                }
                action={
                  <IconButton
                    aria-label="edit profile"
                    sx={{
                      bgcolor: "rgba(209, 112, 51, 0.1)",
                      color: "rgb(209, 112, 51)",
                      "&:hover": {
                        bgcolor: "rgba(209, 112, 51, 0.2)",
                        transform: "rotate(90deg)",
                      },
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                }
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        background:
                          "linear-gradient(to right, rgb(209, 112, 51), #E5B526)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      John Doe
                    </Typography>
                    <Chip
                      label="Job Seeker"
                      size="small"
                      sx={{
                        bgcolor: "rgba(209, 112, 51, 0.15)",
                        color: "rgb(209, 112, 51)",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                      }}
                    />
                  </Box>
                }
                subheader={
                  <Typography
                    variant="body1"
                    sx={{
                      color: "rgb(209, 112, 51)",
                      fontWeight: 500,
                      mt: 0.5,
                      fontSize: "0.95rem",
                    }}
                  >
                    john.doe@example.com
                  </Typography>
                }
              />

              <CardContent sx={{ px: 3, pb: 3 }}>
                {/* Weekly progress summary */}
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    bgcolor: "rgba(209, 112, 51, 0.08)",
                    borderRadius: 2,
                    border: "1px solid rgba(209, 112, 51, 0.12)",
                    animation: "fadeInUp 0.6s ease-out",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.primary",
                      fontWeight: 500,
                      lineHeight: 1.5,
                    }}
                  >
                    Weekly recap: you moved forward on key skills and stayed
                    aligned with your career goals.
                  </Typography>
                </Box>

                {/* Onboarding data grid */}
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    rowGap: 2.5,
                    columnGap: 4,
                    animation: "fadeInUp 0.8s ease-out 0.2s both",
                  }}
                >
                  <Box sx={{ minWidth: 140 }}>
                    <Typography
                      variant="caption"
                      color="text.e"
                      textTransform="uppercase"
                      sx={{ fontWeight: 500, letterSpacing: 0.5 }}
                    >
                      Current status
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "rgb(209, 112, 51)",
                        mt: 0.5,
                      }}
                    >
                      Actively job searching
                    </Typography>
                  </Box>

                  <Box sx={{ minWidth: 140 }}>
                    <Typography
                      variant="caption"
                      color="text.primary"
                      textTransform="uppercase"
                      sx={{ fontWeight: 500, letterSpacing: 0.5 }}
                    >
                      Target role
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "rgb(209, 112, 51)",
                        mt: 0.5,
                      }}
                    >
                      Frontend / Full‑stack Developer
                    </Typography>
                  </Box>

                  <Box sx={{ minWidth: 160 }}>
                    <Typography
                      variant="caption"
                      color="text.primary"
                      textTransform="uppercase"
                      sx={{ fontWeight: 500, letterSpacing: 0.5 }}
                    >
                      Focus
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: "rgb(209, 112, 51)",
                        mt: 0.5,
                        fontSize: "0.9rem",
                      }}
                    >
                      Find a new job • Prepare for interviews
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Recent activity */}
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
                  background:
                    "linear-gradient(to left, rgb(209, 112, 51), #E5B526)",
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
                  background:
                    "linear-gradient(to left, rgb(209, 112, 51), #E5B526)",
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
                subheader="3 of 5 key achievements this week"
              />

              <Divider
                sx={{
                  mx: 3,
                  background:
                    "linear-gradient(to right, rgb(209, 112, 51), #E5B526)",
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
                                  boxShadow:
                                    "0 4px 12px rgba(209, 112, 51, 0.2)",
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
                          primary={
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 700,
                                ...(milestone.completed
                                  ? {
                                      color: "rgb(209, 112, 51)", // ← Brand orange
                                      background:
                                        "linear-gradient(to right, rgb(209, 112, 51), #E5B526)", // ← Brand gradient
                                      WebkitBackgroundClip: "text",
                                      WebkitTextFillColor: "transparent",
                                      backgroundClip: "text",
                                    }
                                  : { color: "rgb(209, 112, 51)" }),
                              }}
                            >
                              {milestone.title}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="body2"
                              sx={{
                                mt: 0.25,
                                fontWeight: 500,
                                ...(milestone.completed
                                  ? { color: "rgb(209, 112, 51)" }
                                  : { color: "text.primary" }),
                              }}
                            >
                              {milestone.progress}
                              {milestone.completed && (
                                <Box
                                  component="span"
                                  sx={{
                                    ml: 1.5,
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
                            </Typography>
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

            {/* 3. Application Funnel */}
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
                  background:
                    "linear-gradient(to left, rgb(209, 112, 51), #E5B526)",
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
                  background:
                    "linear-gradient(to left, rgb(209, 112, 51), #E5B526)",
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
                  background:
                    "linear-gradient(to right, rgb(209, 112, 51), #E5B526)",
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
          </Box>

          {/* Right column: analytics */}
          <Box
            sx={{
              flex: 1.1,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {/* 2. Today's Priority Task */}
            <Card
              sx={{
                borderRadius: 3,
                bgcolor: "rgba(209, 112, 51, 0.05)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                p: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: " #E5B526",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                    }}
                  >
                    🔥
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ letterSpacing: 0.5 }}
                    >
                      TODAY'S TOP PRIORITY
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, lineHeight: 1.4, mt: 0.5 }}
                    >
                      System Design:{" "}
                      <Box component="span" sx={{ color: "text.primary" }}>
                        LRU Cache
                      </Box>
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  size="medium"
                  sx={{
                    bgcolor: "rgb(209, 112, 51)",
                    "&:hover": { bgcolor: "#e5b526" },
                    fontWeight: 600,
                    textTransform: "none",
                  }}
                >
                  Start Now
                </Button>
              </Box>
            </Card>

            {/* Analytics cards */}
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

            {/* Weekly Activity with MUI X BarChart */}
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
          </Box>
        </Box>
      </Box>
    </LayoutWithSidebar>
  );
}
