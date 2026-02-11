"use client";
import React, { useEffect, useState } from "react";
import { Check, ChevronRight, Loader2 } from "lucide-react";
import styles from "./dashboard.module.css";
import LayoutWithSidebar from "../SideBar/LayoutWithSidebar";
import SubmissionModal from "./SubmissionModal";
import PreviousSubmissionModal from "./PreviousSubmissionModal";
import { api } from "@/lib/api";
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
}

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [smartPlan, setSmartPlan] = useState<Task[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [openPendingModal, setOpenPendingModal] = useState(false);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [previousSubmissionModalOpen, setPreviousSubmissionModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      const res = await fetch(`http://localhost:3001/rag/tasks`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (data.smartPlan) {
        setSmartPlan(data.smartPlan);
      }

      if (data.pendingTasks) {
        setPendingTasks(data.pendingTasks);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskClick = async (task: Task) => {
    // If task is completed, show previous submission
    if (task.status === "completed") {
      try {
        // Fetch submissions and find the one for this task
        const submissions = await api.getMySubmissions();
        const taskSubmission = submissions.find((s: any) => s.taskId === task.id);
        
        if (taskSubmission) {
          // Fetch full details
          const fullSubmission = await api.getSubmission(taskSubmission.id);
          setSelectedSubmission(fullSubmission);
          setPreviousSubmissionModalOpen(true);
        }
      } catch (error) {
        console.error("Failed to load submission:", error);
      }
    } else {
      // Task not completed - open submission modal
      setSelectedTask(task);
      setSubmissionModalOpen(true);
    }
  };

  const togglePendingTask = (id: number) => {
    setPendingTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "completed" ? "pending" : "completed" }
          : t
      )
    );
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
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.welcomeText}>
              <h1>Hello, Alex 👋</h1>
              <span className={styles.dateText}>
                {new Date().toDateString()} • "Keep pushing!"
              </span>
            </div>
          </div>
        </header>
        {isLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "50px",
              color: "#be123c",
            }}
          >
            <Loader2 className="animate-spin" size={40} />
            <span style={{ marginLeft: "10px", marginTop: "8px" }}>
              Generating your Daily Plan...
            </span>
          </div>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                gap: 3,
                mb: 4,
                alignItems: "stretch",
                flexDirection: {
                  xs: "column",
                  sm: "row",
                },
              }}
            >
              {/* DAILY PROGRESS CARD */}
              <Card sx={{ flex: 1, minWidth: 0 }}>
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Daily Progress
                    </Typography>
                    <Typography variant="h6">{progress}% completed</Typography>
                  </Box>

                  <Box sx={{ position: "relative", display: "inline-flex" }}>
                    <CircularProgress
                      variant="determinate"
                      value={100}
                      size={72}
                      sx={{ color: "#f3f4f6" }}
                    />
                    <CircularProgress
                      variant="determinate"
                      value={progress}
                      size={72}
                      sx={{
                        color: "#be123c",
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
                      <Typography variant="caption">{progress}%</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* PENDING TASKS CARD */}
              <Card
                sx={{
                  flex: 1,
                  minWidth: 0,
                  cursor: pendingTasks.length > 0 ? "pointer" : "default",
                }}
                onClick={() => {
                  if (pendingTasks.length > 0) {
                    setOpenPendingModal(true);
                  }
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Pending Tasks
                  </Typography>

                  <Typography variant="h6" sx={{ mt: 0.5 }}>
                    {pendingTasks.length === 0
                      ? "No pending tasks 🎉"
                      : `${pendingTasks.length} pending`}
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* TASKS SECTION */}
            <div className={styles.gridContainer}>
              <section>
                <h2 className={styles.sectionTitle}>
                  Today's Smart Plan
                  <span className={styles.aiBadge}>Generated</span>
                </h2>

                <div className={styles.taskList}>
                  {smartPlan.map((task) => (
                    <div
                      key={task.id}
                      className={`${styles.taskCard} ${
                        task.status === "completed" ? styles.completed : ""
                      }`}
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className={styles.taskLeft}>
                        <div className={styles.checkbox}>
                          {task.status === "completed" && (
                            <Check size={14} color="white" />
                          )}
                        </div>
                        <span className={styles.taskTitle}>{task.title}</span>
                      </div>
                      <ChevronRight size={20} color="#fb7185" />
                    </div>
                  ))}
                  {smartPlan.length === 0 && (
                    <p style={{ color: "#888" }}>No plan generated yet.</p>
                  )}
                </div>
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
              width: 600,
              maxWidth: "90vw",
              bgcolor: "#fff",
              borderRadius: 3,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              p: 3,
              maxHeight: "85vh",
              overflowY: "auto",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Pending Tasks
              </Typography>

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

            <List disablePadding>
              {pendingTasks.map((task, idx) => {
                const isCompleted = task.status === "completed";

                return (
                  <React.Fragment key={task.id}>
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() => togglePendingTask(task.id)}
                        sx={{
                          py: 1.5,
                          px: 2,
                          gap: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            border: "2px solid #fca5a5",
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
        </Modal>

        {/* SUBMISSION MODAL (for new submissions) */}
        <SubmissionModal
          open={submissionModalOpen}
          onClose={() => {
            setSubmissionModalOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onSuccess={() => {
            fetchDashboardData(); // Refresh tasks
            setSubmissionModalOpen(false);
            setSelectedTask(null);
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