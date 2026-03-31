"use client";
import React, { useEffect, useState } from "react";
import { Check, ChevronRight, ClipboardCheck, Loader2 } from "lucide-react";
import styles from "./dashboard.module.css";
import LayoutWithSidebar from "../SideBar/LayoutWithSidebar";
import SubmissionModal from "./SubmissionModal";
import PreviousSubmissionModal from "./PreviousSubmissionModal";
import { api, SubmissionResult } from "@/lib/api";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Modal,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

interface Task {
  id: number;
  title: string;
  status: "pending" | "completed";
  date?: string;
  is_ai_generated?: boolean;
  category?: string;
  taskId?: number;
  priority?: "low" | "medium" | "high";
  difficulty?: "easy" | "medium" | "hard";
  leetcodeUrl?: string | null;
}

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [smartPlan, setSmartPlan] = useState<Task[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [openPendingModal, setOpenPendingModal] = useState(false);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [previousSubmissionModalOpen, setPreviousSubmissionModalOpen] =
    useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);

        const [tasksRes, submissions] = await Promise.all([
          fetch("http://localhost:3001/rag/tasks", {
            credentials: "include",
          }),
          api.getMySubmissions(),
        ]);

        const data = await tasksRes.json();
        setSubmissions(submissions);

        // SMART PLAN
        if (data.smartPlan?.tasks) {
          setSmartPlan(data.smartPlan.tasks);
          setUserName(data.smartPlan.userName || "");
        }

        // PENDING TASKS
        if (data.pendingTasks) {
          const normalizedPendingTasks: Task[] = data.pendingTasks.map(
            (task: any) => ({
              ...task,
              id: Number(task.id),
              taskId: Number(task.taskId ?? task.taskid ?? task.id),
              status: task.status ?? "pending",
            })
          );

          setPendingTasks(normalizedPendingTasks);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleTaskClick = async (task: Task) => {
    const submissionTaskId = task.taskId ?? task.id;
    const taskForSubmission = { ...task, id: submissionTaskId };

    if (task.status === "completed") {
      try {
        const taskSubmission = submissions.find(
          (s: any) => s.taskId === submissionTaskId
        );

        if (taskSubmission) {
          const fullSubmission = await api.getSubmission(taskSubmission.id);
          setSelectedSubmission(fullSubmission);
          setPreviousSubmissionModalOpen(true);
        }
      } catch (error) {
        console.error("Failed to load submission:", error);
      }
    } else {
      setSelectedTask(taskForSubmission);
      setSubmissionModalOpen(true);
    }
  };
  const completedCount = smartPlan.filter(
    (t) => t.status === "completed"
  ).length;
  const progress =
    smartPlan.length > 0
      ? Math.round((completedCount / smartPlan.length) * 100)
      : 0;

  return (
    <LayoutWithSidebar>
      <div className={styles.dashboardContainer}>
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 8,
            }}
          >
            <Card
              sx={{
                p: 4,
                borderRadius: 4,
                width: 420,
                textAlign: "center",
                background: "linear-gradient(135deg,#fff6f6,#fffdfd)",
                border: "1px solid rgba(244,114,182,0.25)",
                boxShadow: "0 16px 40px rgba(190,24,60,0.08)",
              }}
            >
              <CardContent>
                <CircularProgress
                  size={48}
                  sx={{
                    color: "#fb7185",
                    mb: 2,
                  }}
                />

                <Typography
                  sx={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#5b1025",
                    mb: 1,
                  }}
                >
                  Generating your Smart Plan
                </Typography>

                <Typography
                  sx={{
                    fontSize: 14,
                    color: "#8b6b76",
                  }}
                >
                  Analyzing your goals and preparing today's tasks...
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                mb: 5,
                px: 4,
                py: 4,
                borderRadius: 4,
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,245,247,0.9))",
                border: "1px solid rgba(244,114,182,0.25)",
                boxShadow: "0 10px 30px rgba(190,24,60,0.08)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                {/* LEFT SIDE */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.8,
                    maxWidth: 520,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "2.4rem",
                      fontWeight: 800,
                      color: "#5b1025",
                      lineHeight: 1.2,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Hello, {userName} 👋
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 15,
                      color: "#7c2d44",
                      lineHeight: 1.6,
                    }}
                  >
                    {new Date().toDateString()} • "Keep pushing!"
                  </Typography>
                </Box>

                {/* RIGHT SIDE STATUS CARD */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, #fff4f4, #fff9fb)",
                    border: "1px solid rgba(251,191,36,0.25)",
                    boxShadow: "0 6px 20px rgba(190,24,60,0.06)",
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      background: "linear-gradient(135deg, #fff1c2, #ffe0b2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                    }}
                  >
                    ✦
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: 16,
                        color: "#5b1025",
                      }}
                    >
                      Smart Plan Ready
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "#8b6b76",
                      }}
                    >
                      Your tasks are ready today
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, 1fr)",
                },
                gap: 3,
                mb: 5,
                alignItems: "stretch",
              }}
            >
              {/* DAILY PROGRESS CARD */}
              <CardContent
                sx={{
                  px: 4,
                  py: 3,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2.5,
                  background: "linear-gradient(135deg,#ffffff,#fff5f7)",
                  border: "1px solid rgba(244,114,182,0.22)",
                  boxShadow: "0 12px 30px rgba(190,24,60,0.10)",
                  borderRadius: 4,
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 18px 40px rgba(190,24,60,0.15)",
                  },
                }}
              >
                {/* TITLE */}
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#be123c",
                    letterSpacing: ".08em",
                  }}
                >
                  🔥 DAILY PROGRESS
                </Typography>

                {/* MAIN ROW */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {/* LEFT TEXT */}
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 40,
                        fontWeight: 800,
                        color: "#5b1025",
                        lineHeight: 1,
                      }}
                    >
                      {progress}%
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 14,
                        color: "#8b6b76",
                        mt: 0.5,
                      }}
                    >
                      {completedCount} / {smartPlan.length} tasks completed
                    </Typography>
                  </Box>

                  {/* CIRCLE */}
                  <Box sx={{ position: "relative" }}>
                    <CircularProgress
                      variant="determinate"
                      value={100}
                      size={80}
                      thickness={4}
                      sx={{ color: "#fde2e8" }}
                    />

                    <CircularProgress
                      variant="determinate"
                      value={progress}
                      size={80}
                      thickness={4}
                      sx={{
                        color: "#fb7185",
                        position: "absolute",
                        left: 0,
                      }}
                    />

                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: "#7f1d1d",
                        }}
                      >
                        {progress}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>

              {/* PENDING TASKS CARD */}
              <Card
                sx={{
                  borderRadius: 4,
                  cursor: pendingTasks.length > 0 ? "pointer" : "default",
                  background: "linear-gradient(135deg,#ffffff,#fff7ed)",
                  border: "1px solid rgba(251,191,36,0.35)",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                  transition: "all .2s ease",

                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
                  },
                }}
                onClick={() => {
                  if (pendingTasks.length > 0) {
                    setOpenPendingModal(true);
                  }
                }}
              >
                <CardContent
                  sx={{
                    px: 4,
                    py: 3,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2.5,
                  }}
                >
                  {/* TITLE */}
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#d97706",
                      letterSpacing: ".08em",
                    }}
                  >
                    🎯 PENDING TASKS
                  </Typography>

                  {/* MAIN ROW */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {/* NUMBER */}
                    <Box>
                      <Typography
                        sx={{
                          fontSize: 40,
                          fontWeight: 800,
                          color: "#7c2d12",
                          lineHeight: 1,
                        }}
                      >
                        {pendingTasks.length}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 14,
                          color: "#8b6b76",
                          mt: 0.5,
                        }}
                      >
                        {pendingTasks.length === 0
                          ? "No pending tasks at the moment"
                          : "Tasks waiting for your action"}
                      </Typography>
                      {pendingTasks.length > 0 && (
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#d97706",
                            mt: 0.6,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          View pending tasks →
                        </Typography>
                      )}
                    </Box>

                    {/* ICON AREA */}
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        background: "linear-gradient(135deg,#fff1c2,#ffe8b5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 28,
                      }}
                    >
                      <ClipboardCheck
                        size={30}
                        color="#d97706"
                        strokeWidth={2.2}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* TASKS SECTION */}
            <div className={styles.gridContainer}>
              <section>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2.5,
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: "#5b1025",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Today's Smart Plan
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "#8b6b76",
                        mt: 0.3,
                      }}
                    >
                      Focus on these tasks to build your momentum today
                    </Typography>
                  </Box>

                  {/* AI Badge */}
                  <Box
                    sx={{
                      px: 1.6,
                      py: 0.6,
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.8,
                      background: "linear-gradient(135deg,#fff3cd,#fff7e6)",
                      border: "1px solid rgba(251,191,36,0.35)",
                      color: "#92400e",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    }}
                  >
                    ✦ AI Generated
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  {smartPlan.map((task) => (
                    <Card
                      key={task.id}
                      onClick={() => handleTaskClick(task)}
                      sx={{
                        borderRadius: 3,
                        cursor: "pointer",
                        transition: "all .18s ease",
                        border: "1px solid rgba(244,114,182,0.15)",
                        background: "linear-gradient(135deg,#ffffff,#fff9fb)",
                        boxShadow: "0 6px 20px rgba(0,0,0,0.06)",

                        "&:hover": {
                          transform: "translateY(-3px)",
                          boxShadow: "0 14px 34px rgba(0,0,0,0.12)",
                        },

                        ...(task.status === "completed" && {
                          opacity: 0.6,
                        }),
                      }}
                    >
                      <CardContent
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        {/* LEFT SIDE */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          {/* Checkbox */}
                          <Box
                            sx={{
                              width: 26,
                              height: 26,
                              borderRadius: "50%",
                              border: "2px solid #fb7185",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background:
                                task.status === "completed"
                                  ? "#fb7185"
                                  : "transparent",
                            }}
                          >
                            {task.status === "completed" && (
                              <Check size={16} color="white" />
                            )}
                          </Box>

                          {/* Task Text */}
                          <Box>
                            <Typography
                              sx={{
                                fontSize: 16,
                                fontWeight: 600,
                                color:
                                  task.status === "completed"
                                    ? "#9ca3af"
                                    : "#1f2937",
                              }}
                            >
                              {task.title}
                            </Typography>
                            {task.status !== "completed" && (
                              <Typography
                                sx={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: "#c2410c",
                                  mt: 0.4,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.4,
                                }}
                              >
                                ⚡ +25 AP
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        {/* RIGHT SIDE */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          {/* Difficulty Badge */}
                          {task.difficulty && (
                            <Box
                              sx={{
                                px: 1.2,
                                py: 0.3,
                                fontSize: 11,
                                fontWeight: 700,
                                borderRadius: 2,
                                background:
                                  task.difficulty === "hard"
                                    ? "#fee2e2"
                                    : task.difficulty === "medium"
                                    ? "#fef3c7"
                                    : "#dcfce7",
                                color:
                                  task.difficulty === "hard"
                                    ? "#b91c1c"
                                    : task.difficulty === "medium"
                                    ? "#92400e"
                                    : "#065f46",
                              }}
                            >
                              {task.difficulty.toUpperCase()}
                            </Box>
                          )}

                          {/* LeetCode link for DSA tasks */}
                          {task.leetcodeUrl && (
                            <Box
                              component="a"
                              href={task.leetcodeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e: React.MouseEvent) =>
                                e.stopPropagation()
                              }
                              title="Open on LeetCode"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 28,
                                height: 28,
                                borderRadius: "6px",
                                background: "#fff7ed",
                                border: "1px solid #fed7aa",
                                color: "#ea580c",
                                textDecoration: "none",
                                fontSize: 14,
                                flexShrink: 0,
                                "&:hover": {
                                  background: "#ffedd5",
                                  borderColor: "#fb923c",
                                },
                              }}
                            >
                              ↗
                            </Box>
                          )}

                          <ChevronRight size={20} color="#fb7185" />
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </section>
            </div>
          </>
        )}

        {/* PENDING TASKS MODAL */}
        <Modal
          open={openPendingModal}
          onClose={() => setOpenPendingModal(false)}
          slotProps={{
            backdrop: {
              sx: {
                backdropFilter: "blur(6px)",
                backgroundColor: "rgba(0,0,0,0.25)",
              },
            },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 640,
              maxWidth: "92vw",
              bgcolor: "#ffffff",
              borderRadius: 4,
              boxShadow: "0 30px 80px rgba(0,0,0,0.18)",
              border: "1px solid rgba(244,114,182,0.2)",
              overflow: "hidden",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              pb: 3,
            }}
          >
            <Box
              sx={{
                px: 4,
                py: 2.2,
                pb: 2.5,

                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
                background: "linear-gradient(135deg,#fff7f9,#fffdfd)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.6,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#5b1025",
                  }}
                >
                  Pending Tasks
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "#8b6b76",
                    }}
                  >
                    Tasks that still need your attention
                  </Typography>

                  <Box
                    sx={{
                      px: 1.3,
                      py: 0.3,
                      borderRadius: "999px",
                      fontSize: 11,
                      fontWeight: 700,
                      background: "rgba(244,63,94,0.12)",
                      color: "#be123c",
                      border: "1px solid rgba(244,63,94,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 36,
                    }}
                  >
                    {pendingTasks.length} pending
                  </Box>
                </Box>
              </Box>

              <IconButton
                onClick={() => setOpenPendingModal(false)}
                sx={{
                  color: "#9ca3af",
                  "&:hover": {
                    color: "#be123c",
                    backgroundColor: "rgba(190,18,60,0.08)",
                  },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box
              sx={{
                overflowY: "auto",
                px: 2,
                py: 1,
              }}
            >
              <List disablePadding>
                {pendingTasks.map((task, idx) => {
                  const isCompleted = task.status === "completed";

                  return (
                    <React.Fragment key={task.id}>
                      <ListItem disablePadding>
                        <ListItemButton
                          onClick={() => {
                            setOpenPendingModal(false);
                            handleTaskClick(task);
                          }}
                          sx={{
                            py: 1.6,
                            px: 2,
                            gap: 2,
                            borderRadius: 2,
                            transition: "all .15s ease",

                            "&:hover": {
                              backgroundColor: "#fff6f8",
                              transform: "translateX(3px)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              border: "2px solid #fb7185",
                              backgroundColor: isCompleted
                                ? "#fca5a5"
                                : "transparent",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {isCompleted && <Check size={14} color="white" />}
                          </Box>

                          <Box sx={{ flex: 1 }}>
                            <Typography
                              sx={{
                                fontFamily:
                                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontSize: 16,
                                fontWeight: 500,
                                color: isCompleted ? "#9ca3af" : "#111",
                                textDecoration: isCompleted
                                  ? "line-through"
                                  : "none",
                              }}
                            >
                              {task.title}
                            </Typography>

                            <Typography
                              variant="caption"
                              sx={{
                                color: "#9ca3af",
                              }}
                            >
                              {task.date || "Overdue"}
                            </Typography>
                          </Box>

                          <ChevronRight size={18} color="#fca5a5" />
                        </ListItemButton>
                      </ListItem>

                      {idx !== pendingTasks.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })}
              </List>
            </Box>
          </Box>
        </Modal>

        {/* SUBMISSION MODAL (for new submissions) */}
        <SubmissionModal
          open={submissionModalOpen}
          onClose={() => {
            setSubmissionModalOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onSuccess={(result: SubmissionResult) => {
            window.location.reload();
          }}
        />

        {/* PREVIOUS SUBMISSION MODAL (for completed tasks) */}
        <PreviousSubmissionModal
          open={previousSubmissionModalOpen}
          onClose={() => {
            setPreviousSubmissionModalOpen(false);
            setSelectedSubmission(null);
          }}
          submission={selectedSubmission}
        />
      </div>
    </LayoutWithSidebar>
  );
};

export default Dashboard;
