"use client";
import React, { useEffect, useState } from "react";
import { Check, ChevronRight, ClipboardCheck, ExternalLink } from "lucide-react";
import styles from "./dashboard.module.css";
import LayoutWithSidebar from "../SideBar/LayoutWithSidebar";
import SubmissionModal from "./SubmissionModal";
import PreviousSubmissionModal from "./PreviousSubmissionModal";
import { api } from "@/lib/api";
import { apiFetch, requireOk } from "@/lib/auth-client";
import LearningTrackPanel from "../learning-plan/LearningTrackPanel";
import { normalizeLeetcodeUrl } from "@/lib/leetcode-url";
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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

function getLeetcodeUrl(task: Task): string | null {
  return normalizeLeetcodeUrl(task.leetcodeUrl);
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
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        const [tasksRes, submissions] = await Promise.all([
          apiFetch(`${API_BASE_URL}/rag/tasks`),
          api.getMySubmissions(),
        ]);
        await requireOk(tasksRes, "Failed to load today's Smart Plan");
        const data = await tasksRes.json();
        setSubmissions(submissions);
        if (data.smartPlan?.tasks) {
          setSmartPlan(data.smartPlan.tasks);
          setUserName(data.smartPlan.userName || "");
        }
        if (data.pendingTasks) {
          const normalizedPendingTasks: Task[] = data.pendingTasks.map((task: any) => ({
            ...task,
            id: Number(task.id),
            taskId: Number(task.taskId ?? task.taskid ?? task.id),
            status: task.status ?? "pending",
          }));
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
        const taskSubmission = submissions.find((s: any) => s.taskId === submissionTaskId);
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

  const completedCount = smartPlan.filter((t) => t.status === "completed").length;
  const progress = smartPlan.length > 0 ? Math.round((completedCount / smartPlan.length) * 100) : 0;

  return (
    <LayoutWithSidebar>
      <div className={styles.dashboardContainer}>
        <LearningTrackPanel />
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
            <Card sx={{
              p: 4, borderRadius: 4, width: 420, textAlign: "center",
              background: "linear-gradient(135deg, #fdfaf7, #ffffff)",
              border: "1px solid #e8ddd0",
              boxShadow: "0 16px 40px rgba(44,26,10,0.08)",
            }}>
              <CardContent>
                <CircularProgress size={48} sx={{ color: "#b87444", mb: 2 }} />
                <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#2c1a0a", mb: 1, fontFamily: "'Playfair Display', serif" }}>
                  Loading today&apos;s Smart Plan
                </Typography>
                <Typography sx={{ fontSize: 14, color: "#8c6a50" }}>
                  Retrieving your saved questions...
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ) : (
          <>
            {/* ── HERO HEADER ── */}
            <Box sx={{
              mb: 5, px:  4, py:  4, borderRadius: 4,
              background: "linear-gradient(135deg, #ffffff, #fdfaf7)",
              border: "1px solid #e8ddd0",
              boxShadow: "0 10px 30px rgba(44,26,10,0.06)",
            }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.8, maxWidth: 520 }}>
                  <Typography sx={{
                    fontSize: "2.4rem", fontWeight: 800, color: "#2c1a0a",
                    lineHeight: 1.2, letterSpacing: "-0.02em",
                    fontFamily: "'Playfair Display', serif",
                  }}>
                    Hello, {userName} 👋
                  </Typography>
                  <Typography sx={{ fontSize: 15, color: "#8c6a50", lineHeight: 1.6 }}>
                    {new Date().toDateString()} • "Keep pushing!"
                  </Typography>
                </Box>

                {/* Status card */}
                <Box sx={{
                  display: "flex", alignItems: "center", gap: 2, p: 2,
                  borderRadius: 3,
                  background: "linear-gradient(135deg, #fdfaf7, #f5ede0)",
                  border: "1px solid #e8ddd0",
                  boxShadow: "0 6px 20px rgba(44,26,10,0.06)",
                }}>
                  <Box sx={{
                    width: 40, height: 40, borderRadius: 2,
                    background: "linear-gradient(135deg, #f5ede0, #e8d4bc)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                  }}>
                    ✦
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#2c1a0a" }}>
                      Smart Plan Ready
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#8c6a50" }}>
                      Your tasks are ready today
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* ── STATS CARDS ── */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 3, mb: 5, alignItems: "stretch" }}>

              {/* Daily Progress */}
              <CardContent sx={{
                px: 4, py: 3, display: "flex", flexDirection: "column", gap: 2.5,
                background: "linear-gradient(135deg, #ffffff, #fdfaf7)",
                border: "1px solid #e8ddd0",
                boxShadow: "0 12px 30px rgba(44,26,10,0.08)",
                borderRadius: 4,
                "&:hover": { transform: "translateY(-4px)", boxShadow: "0 18px 40px rgba(44,26,10,0.12)" },
              }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#b87444", letterSpacing: ".08em" }}>
                  🔥 DAILY PROGRESS
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography sx={{ fontSize: 40, fontWeight: 800, color: "#2c1a0a", lineHeight: 1 }}>
                      {progress}%
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: "#8c6a50", mt: 0.5 }}>
                      {completedCount} / {smartPlan.length} tasks completed
                    </Typography>
                  </Box>
                  <Box sx={{ position: "relative" }}>
                    <CircularProgress variant="determinate" value={100} size={80} thickness={4} sx={{ color: "#f5ede0" }} />
                    <CircularProgress variant="determinate" value={progress} size={80} thickness={4} sx={{ color: "#b87444", position: "absolute", left: 0 }} />
                    <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#2c1a0a" }}>{progress}%</Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>

              {/* Pending Tasks */}
              <Card sx={{
                borderRadius: 4,
                cursor: pendingTasks.length > 0 ? "pointer" : "default",
                background: "linear-gradient(135deg, #ffffff, #fdfaf7)",
                border: "1px solid #e8ddd0",
                boxShadow: "0 12px 30px rgba(44,26,10,0.08)",
                transition: "all .2s ease",
                "&:hover": { transform: "translateY(-4px)", boxShadow: "0 18px 40px rgba(44,26,10,0.12)" },
              }}
                onClick={() => { if (pendingTasks.length > 0) setOpenPendingModal(true); }}
              >
                <CardContent sx={{ px: 4, py:  3, display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#a0622e", letterSpacing: ".08em" }}>
                    🎯 PENDING QUESTIONS
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography sx={{ fontSize: 40, fontWeight: 800, color: "#2c1a0a", lineHeight: 1 }}>
                        {pendingTasks.length}
                      </Typography>
                      <Typography sx={{ fontSize: 14, color: "#8c6a50", mt: 0.5 }}>
                        {pendingTasks.length === 0 ? "No pending questions at the moment" : "Questions waiting in your current plan"}
                      </Typography>
                      {pendingTasks.length > 0 && (
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#b87444", mt: 0.6, display: "flex", alignItems: "center", gap: 0.5 }}>
                          View pending tasks →
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{
                      width: 64, height: 64, borderRadius: 3,
                      background: "linear-gradient(135deg, #f5ede0, #e8d4bc)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <ClipboardCheck size={30} color="#b87444" strokeWidth={2.2} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* ── TASKS SECTION ── */}
            <div className={styles.gridContainer}>
              <section>
                <Box sx={{
                  px: { xs: 2.25, md: 3.5 }, py: { xs: 2.5, md: 3.25 },
                  borderRadius: 4,
                  background: "linear-gradient(145deg, rgba(253,250,247,.92), rgba(245,237,224,.68))",
                  border: "1px solid #e4d5c3",
                  boxShadow: "0 16px 42px rgba(76,48,27,0.07)",
                }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 3, flexWrap: "wrap", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                    <Box sx={{ width: 4, height: 52, borderRadius: 99, bgcolor: "#b87444", mt: 0.2 }} />
                    <Box>
                    <Typography sx={{ fontSize: { xs: 23, md: 27 }, fontWeight: 800, color: "#2c1a0a", letterSpacing: "-0.025em", fontFamily: "'Playfair Display', serif", lineHeight: 1.15 }}>
                      Today&apos;s Smart Plan
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: "#8c6a50", mt: 0.65 }}>
                      Your personalized interview practice, powered by AI.
                    </Typography>
                    </Box>
                  </Box>
                  <Box sx={{
                    px: 1.5, py: 0.75, borderRadius: 999,
                    display: "flex", alignItems: "center", gap: 0.8,
                    background: "rgba(255,255,255,.72)",
                    border: "1px solid #e4d5c3", color: "#6f5542",
                  }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: progress === 100 ? "#5f806c" : "#b87444" }} />
                    <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
                      {completedCount} of {smartPlan.length} complete
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {smartPlan.map((task, index) => (
                    <Card key={task.id} onClick={() => handleTaskClick(task)} sx={{
                      borderRadius: 3.25, cursor: "pointer", transition: "all .2s ease",
                      border: task.status === "completed" ? "1px solid #d8dfd8" : "1px solid #e4d5c3",
                      background: task.status === "completed"
                        ? "linear-gradient(135deg, #f7faf7, #f2f6f2)"
                        : "linear-gradient(135deg, #ffffff, #fdfbf8)",
                      boxShadow: task.status === "completed"
                        ? "0 5px 15px rgba(66,86,70,0.04)"
                        : "0 7px 20px rgba(76,48,27,0.055)",
                      overflow: "hidden",
                      position: "relative",
                      "&::before": {
                        content: '""', position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
                        bgcolor: task.status === "completed" ? "#789080" : "#b87444",
                      },
                      "&:hover": {
                        transform: "translateY(-2px)",
                        borderColor: task.status === "completed" ? "#b9c8bb" : "#c99770",
                        boxShadow: "0 13px 30px rgba(76,48,27,0.10)",
                      },
                    }}>
                      <CardContent sx={{ p: { xs: 2, md: 2.5 }, pl: { xs: 2.4, md: 3 }, "&:last-child": { pb: { xs: 2, md: 2.5 } }, display: "flex", alignItems: "center", justifyContent: "space-between", gap: { xs: 1.25, md: 2.5 } }}>
                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: { xs: 1.4, md: 2 }, flex: 1, minWidth: 0 }}>
                          <Box sx={{
                            width: 36, height: 36, borderRadius: 2.25,
                            border: task.status === "completed" ? "1px solid #789080" : "1px solid #dfc3aa",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: task.status === "completed" ? "#789080" : "#f8efe7",
                            color: task.status === "completed" ? "#fff" : "#a0622e",
                            flexShrink: 0,
                          }}>
                            {task.status === "completed"
                              ? <Check size={18} color="white" strokeWidth={2.5} />
                              : <Typography sx={{ fontSize: 12, fontWeight: 800 }}>{String(index + 1).padStart(2, "0")}</Typography>}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.65, flexWrap: "wrap" }}>
                              <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: task.status === "completed" ? "#657b6b" : "#9b6843", letterSpacing: ".09em", textTransform: "uppercase" }}>
                                {task.category || "Interview Practice"}
                              </Typography>
                              {task.status === "completed" && (
                                <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: "#657b6b", letterSpacing: ".06em", textTransform: "uppercase" }}>
                                  · Completed
                                </Typography>
                              )}
                            </Box>
                            <Typography component="div" sx={{
                              fontSize: { xs: 15, md: 16.5 }, fontWeight: 650,
                              color: task.status === "completed" ? "#627066" : "#2c1a0a",
                              lineHeight: 1.48,
                              wordBreak: "break-word",
                            }}>
                              {task.title}
                              {getLeetcodeUrl(task) && (
                                <Box component="a" href={getLeetcodeUrl(task)!} target="_blank" rel="noopener noreferrer"
                                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                  sx={{
                                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                                    width: 24, height: 24, borderRadius: 1.5,
                                    background: "#f8efe7", border: "1px solid #dfc3aa",
                                    color: "#b87444", textDecoration: "none", flexShrink: 0,
                                    verticalAlign: "middle", ml: 0.75,
                                    "&:hover": { background: "#ead8c7", borderColor: "#b87444" },
                                  }}>
                                  <ExternalLink size={12} strokeWidth={2.5} />
                                </Box>
                              )}
                            </Typography>
                            {task.status !== "completed" && (
                              <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "#9b6843", mt: 0.75, display: "flex", alignItems: "center", gap: 0.55 }}>
                                <Box component="span" sx={{ color: "#c48655" }}>◆</Box> 25 Anchor Points
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.75, md: 1.25 }, flexShrink: 0 }}>
                          {task.difficulty && (
                            <Box sx={{
                              px: 1.15, py: 0.45, fontSize: 10, fontWeight: 800, borderRadius: 99,
                              letterSpacing: ".06em",
                              border: "1px solid",
                              background: task.difficulty === "hard" ? "#f7e9e4" : task.difficulty === "medium" ? "#f8f0df" : "#edf5ef",
                              borderColor: task.difficulty === "hard" ? "#e6c1b4" : task.difficulty === "medium" ? "#e7d3a7" : "#cfe0d3",
                              color: task.difficulty === "hard" ? "#9b503d" : task.difficulty === "medium" ? "#876431" : "#4f775c",
                            }}>
                              {task.difficulty.toUpperCase()}
                            </Box>
                          )}
                          <Box sx={{ width: 30, height: 30, display: "grid", placeItems: "center", borderRadius: "50%", bgcolor: task.status === "completed" ? "#e5ede6" : "#f5e9de" }}>
                            <ChevronRight size={17} color={task.status === "completed" ? "#657b6b" : "#a0622e"} />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
                </Box>
              </section>
            </div>
          </>
        )}

        {/* ── PENDING TASKS MODAL ── */}
        <Modal open={openPendingModal} onClose={() => setOpenPendingModal(false)}
          slotProps={{ backdrop: { sx: { backdropFilter: "blur(6px)", backgroundColor: "rgba(44,26,10,0.2)" } } }}>
          <Box sx={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            width: 640, maxWidth: "92vw", bgcolor: "#ffffff", borderRadius: 4,
            boxShadow: "0 30px 80px rgba(44,26,10,0.16)",
            border: "1px solid #e8ddd0",
            overflow: "hidden", maxHeight: "85vh", display: "flex", flexDirection: "column", pb: 3,
          }}>
            <Box sx={{
              px: 4, py: 2.2, pb: 2.5,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              borderBottom: "1px solid #e8ddd0",
              background: "linear-gradient(135deg, #fdfaf7, #ffffff)",
            }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6 }}>
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#2c1a0a", fontFamily: "'Playfair Display', serif" }}>
                  Pending Questions
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Typography sx={{ fontSize: 13, color: "#8c6a50" }}>
                    Unfinished questions from your current learning plan
                  </Typography>
                  <Box sx={{
                    px: 1.3, py: 0.3, borderRadius: "999px", fontSize: 11, fontWeight: 700,
                    background: "rgba(184,116,68,0.10)", color: "#b87444",
                    border: "1px solid rgba(184,116,68,0.22)",
                    display: "flex", alignItems: "center", justifyContent: "center", minWidth: 36,
                  }}>
                    {pendingTasks.length} pending
                  </Box>
                </Box>
              </Box>
              <IconButton onClick={() => setOpenPendingModal(false)}
                sx={{ color: "#8c6a50", "&:hover": { color: "#b87444", backgroundColor: "rgba(184,116,68,0.08)" } }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box sx={{ overflowY: "auto", px: 2, py: 1 }}>
              <List disablePadding>
                {pendingTasks.map((task, idx) => {
                  const isCompleted = task.status === "completed";
                  return (
                    <React.Fragment key={task.id}>
                      <ListItem disablePadding>
                        <ListItemButton
                          onClick={() => { setOpenPendingModal(false); handleTaskClick(task); }}
                          sx={{
                            py: 1.6, px: 2, gap: 2, borderRadius: 2, transition: "all .15s ease",
                            "&:hover": { backgroundColor: "#fdfaf7", transform: "translateX(3px)" },
                          }}>
                          <Box sx={{
                            width: 20, height: 20, borderRadius: "50%", border: "2px solid #b87444",
                            backgroundColor: isCompleted ? "#d4b898" : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          }}>
                            {isCompleted && <Check size={14} color="white" />}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{
                              fontSize: 16, fontWeight: 500,
                              color: isCompleted ? "#9ca3af" : "#2c1a0a",
                              textDecoration: isCompleted ? "line-through" : "none",
                            }}>
                              {task.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#8c6a50" }}>
                              {task.date || "Overdue"}
                            </Typography>
                          </Box>
                          <ChevronRight size={18} color="#d4b898" />
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

        <SubmissionModal
          open={submissionModalOpen}
          onClose={() => { setSubmissionModalOpen(false); setSelectedTask(null); }}
          task={selectedTask}
          onSuccess={() => { window.location.reload(); }}
        />

        <PreviousSubmissionModal
          open={previousSubmissionModalOpen}
          onClose={() => { setPreviousSubmissionModalOpen(false); setSelectedSubmission(null); }}
          submission={selectedSubmission}
        />
      </div>
    </LayoutWithSidebar>
  );
};

export default Dashboard;
