"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronRight, ClipboardCheck, ExternalLink } from "lucide-react";
import styles from "./dashboard.module.css";
import LayoutWithSidebar from "../SideBar/LayoutWithSidebar";
import SubmissionModal from "./SubmissionModal";
import PreviousSubmissionModal from "./PreviousSubmissionModal";
import { api } from "@/lib/api";
import { apiFetch, requireOk } from "@/lib/auth-client";
import { FONT } from "@/lib/typography";
import { SPACE } from "@/lib/spacing";
import { SIZE } from "@/lib/sizes";
import { C } from "@/lib/ui-colors";
import LearningTrackPanel from "../learning-plan/LearningTrackPanel";
import { normalizeLeetcodeUrl } from "@/lib/leetcode-url";
import {
  Alert,
  Box,
  Button,
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
const DAILY_PLAN_TIME_ZONE = "America/Los_Angeles";

function getDailyPlanDate(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DAILY_PLAN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

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
  const [skippedReason, setSkippedReason] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");
  const planDateRef = useRef(getDailyPlanDate());

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError("");
      const [tasksRes, submissions] = await Promise.all([
        apiFetch(`${API_BASE_URL}/rag/tasks`),
        api.getMySubmissions().catch((error) => {
          // Submission history is supplemental; it must never hide today's
          // plan when that separate endpoint is temporarily unavailable.
          console.error("Failed to load submissions:", error);
          return [];
        }),
      ]);
      await requireOk(tasksRes, "Failed to load today's Smart Plan");
      const data = await tasksRes.json();
      setSubmissions(submissions);
      if (data.smartPlan?.tasks) {
        setSmartPlan(data.smartPlan.tasks);
        setUserName(data.smartPlan.userName || "");
      }
      setSkippedReason(data.smartPlan?.skippedReason ?? null);

      if (data.pendingTasks) {
        const normalizedPendingTasks: Task[] = data.pendingTasks.map((task: any) => ({
          ...task,
          id: Number(task.id),
          taskId: Number(task.taskId ?? task.taskid ?? task.id),
          status: task.status ?? "pending",
        }));
        setPendingTasks(normalizedPendingTasks);
      }
      planDateRef.current = getDailyPlanDate();
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Could not load today's Smart Plan",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboardData();

    // Keep an already-open dashboard synced to the Pacific daily boundary.
    // The API creates the new plan on demand if the cron has not reached this
    // user yet.
    const rolloverTimer = window.setInterval(() => {
      const currentPlanDate = getDailyPlanDate();
      if (currentPlanDate !== planDateRef.current) {
        planDateRef.current = currentPlanDate;
        void loadDashboardData();
      }
    }, 30_000);

    return () => window.clearInterval(rolloverTimer);
  }, [loadDashboardData]);

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
        {loadError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={loadDashboardData}>
                Retry
              </Button>
            }
            sx={{ mt: 3, borderRadius: SIZE.radius }}
          >
            {loadError}
          </Alert>
        ) : isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
            <Card sx={{
              padding: SPACE.lg, borderRadius: SIZE.radius, maxWidth: SIZE.cardWidth, width: "100%", textAlign: "center",
              background: C.cardBg,
              border: `1px solid ${C.divider}`,
              boxShadow: "0 16px 40px rgba(44,26,10,0.08)",
            }}>
              <CardContent>
                <CircularProgress size={40} sx={{ color: "#b87444", mb: 2 }} />
                <Typography sx={{ fontSize: FONT.lg, fontWeight: 700, color: C.textPrimary, mb: 1, fontFamily: "'Playfair Display', serif" }}>
                  Loading today&apos;s Smart Plan
                </Typography>
                <Typography sx={{ fontSize: FONT.sm, color: C.textMuted }}>
                  Retrieving your saved questions...
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                mb: SPACE.md,
                pb: SPACE.md,
                borderBottom: `1px solid ${C.divider}`,
              }}
            >
              <Typography
                sx={{
                  fontSize: "clamp(1.25rem, 1.6vw, 1.7rem)",
                  fontWeight: 800,
                  color: C.textPrimary,
                  lineHeight: 1.15,
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Hello,{" "}
                <Box component="span" sx={{ fontWeight: 900 }}>
                  {userName ? userName.split(" ").slice(-2).join(" ") : "there"}
                </Box>{" "}
                👋
              </Typography>
              <Typography
                sx={{ mt: 0.5, fontSize: FONT.md, color: C.textMuted, lineHeight: 1.6 }}
              >
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}{" "}
                • &quot;Keep pushing!&quot;
              </Typography>
            </Box>

            {/* ── STATS CARDS ── */}
            <Box sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr auto 1fr" },
              gap: { xs: 2, md: 3 },
              mb: 2,
              pb: { xs: 2, md: 3 },
              borderBottom: `1px solid ${C.divider}`,
              alignItems: "stretch",
            }}>

              {/* Daily Progress */}
              <CardContent sx={{
                padding: {xs:1.75,md:2}, display: "flex", flexDirection: "column", gap: "clamp(10px,1vw,16px)",
              }}>
                <Typography sx={{ fontSize: FONT.sm, fontWeight: 700, color: "#b87444", letterSpacing: ".08em" }}>
                  DAILY PROGRESS
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography sx={{ fontSize: { xs: "1.5rem", md: "1.7rem" }, fontWeight: 800, color: C.textPrimary, lineHeight: 1 }}>
                      {progress}%
                    </Typography>
                    <Typography sx={{ fontSize: FONT.sm, color: C.textMuted, mt: 0.5 }}>
                      {completedCount} / {smartPlan.length} tasks completed
                    </Typography>
                  </Box>
                  <Box sx={{ position: "relative", width: 54, height: 54, flexShrink: 0 }}>
                    <CircularProgress
                      variant="determinate"
                      value={100}
                      size={54}
                      thickness={4}
                      sx={{ color: "#f5ede0", position: "absolute", inset: 0 }}
                    />
                    <CircularProgress
                      variant="determinate"
                      value={progress}
                      size={54}
                      thickness={4}
                      sx={{ color: "#b87444", position: "absolute", inset: 0 }}
                    />
                    <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.75rem", lineHeight: 1, color: C.textPrimary, fontVariantNumeric: "tabular-nums" }}>
                        {progress}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>

              <Divider
                orientation="vertical"
                flexItem
                sx={{ display: { xs: "none", md: "block" }, borderColor: C.divider }}
              />
              <Divider
                sx={{ display: { xs: "block", md: "none" }, borderColor: C.divider }}
              />

              {/* Pending Tasks */}
              <Card elevation={0} sx={{
                cursor: pendingTasks.length > 0 ? "pointer" : "default",
                bgcolor: "transparent",
                boxShadow: "none",
                border: 0,
                borderRadius: 0,
              }}
                onClick={() => { if (pendingTasks.length > 0) setOpenPendingModal(true); }}
              >
                <CardContent sx={{ padding: {xs:2,md:2.5}, display: "flex", flexDirection: "column", gap: "clamp(10px,1vw,16px)" }}>
                  <Typography sx={{ fontSize: FONT.sm, fontWeight: 700, color: "#a0622e", letterSpacing: ".08em" }}>
                    PENDING QUESTIONS
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography sx={{ fontSize: { xs: "1.8rem", md: "1.85rem" }, fontWeight: 800, color: C.textPrimary, lineHeight: 1 }}>
                        {pendingTasks.length}
                      </Typography>
                      <Typography sx={{ fontSize: FONT.sm, color: C.textMuted, mt: 0.5 }}>
                        {pendingTasks.length === 0 ? "No pending questions at the moment" : "Questions waiting in your current plan"}
                      </Typography>
                      {pendingTasks.length > 0 && (
                        <Typography sx={{ fontSize: FONT.sm, fontWeight: 600, color: "#b87444", mt: 0.6, display: "flex", alignItems: "center", gap: 0.5 }}>
                          View pending tasks →
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{
                      width: 40, height: 40, borderRadius: SIZE.radius,
                      background: C.surface,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <ClipboardCheck size={20} color="#b87444" strokeWidth={2.2} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* ── TASKS SECTION ── */}
            <div className={styles.gridContainer}>
              <section>
                <Box sx={{
                  px: { xs: 2, md: 3}, py: { xs: 2, md: 2.5 },
                  }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb:2, flexWrap: "wrap", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                    <Box>
                    <Typography sx={{ fontSize: { xs: "1.7rem", sm: "1.85rem", md: "2rem" }, fontWeight: 800, color: C.textPrimary, letterSpacing: "-0.025em", fontFamily: "'Playfair Display', serif", lineHeight: 1.15 }}>
                      Today&apos;s Smart Plan
                    </Typography>
                    <Typography sx={{ fontSize: FONT.sm, color: C.textMuted, mt: 0.65 }}>
                      Your personalized interview practice, powered by AI.
                    </Typography>
                    </Box>
                  </Box>
                  <Box sx={{
                    px: 1.5, py: 0.75, borderRadius: 999,
                    display: "flex", alignItems: "center", gap: 0.8,
                    background: C.surface,
                    border: `1px solid ${C.divider}`, color: C.textSub,
                  }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: progress === 100 ? "#5f806c" : "#b87444" }} />
                    <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
                      {completedCount} of {smartPlan.length} complete
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {skippedReason === "missing_role" ? (
                    <Typography sx={{ fontSize: FONT.sm, fontWeight: 700, color: "#b87444", letterSpacing: ".08em", py: 2 }}>
                      Add a preferred role to see your daily tasks.
                    </Typography>
                  ) : (
                    smartPlan.map((task, index) => (
                    <Card key={task.id} onClick={() => handleTaskClick(task)} sx={{
                      borderRadius: SIZE.radius, cursor: "pointer", transition: "all .2s ease",
                      border: task.status === "completed" ? `1px solid ${C.divider}` : `1px solid ${C.divider}`,
                      background: C.cardBg,
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
                      <CardContent sx={{ padding: {xs:1.5,md: 2}, pl: { xs: 2.4, md: 3 }, "&:last-child": { pb: SPACE.md }, display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACE.md }}>
                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: { xs: 1, md: 1.8 }, flex: 1, minWidth: 0 }}>
                          <Box sx={{
                            width: "clamp(36px,2vw,50px)", height: "clamp(36px,2vw,50px)", borderRadius: 2.25,
                            border: task.status === "completed" ? "1px solid #789080" : "1px solid #dfc3aa",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: task.status === "completed" ? "#789080" : C.surface,
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
                              fontSize: { xs: 15, md: 15.5 }, fontWeight: 650,
                              color: task.status === "completed" ? "#627066" : C.textPrimary,
                              lineHeight: 1.48,
                              overflowWrap:"anywhere",
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
                              <Typography sx={{ fontSize: FONT.sm, fontWeight: 700, color: "#9b6843", mt: 0.75, display: "flex", alignItems: "center", gap: 0.55 }}>
                                <Box component="span" sx={{ color: "#c48655" }}>◆</Box> 25 Anchor Points
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.75, md: 1.25 }, flexShrink: 0 }}>
                          {task.difficulty && (
                            <Box sx={{
                              px: 1.15, py: 0.45, fontSize: "clamp(10px,0.8vw,13px)", fontWeight: 800, borderRadius: 99,
                              letterSpacing: ".06em",
                              border: "1px solid",
                              background: task.difficulty === "hard" ? "#f7e9e4" : task.difficulty === "medium" ? "#f8f0df" : "#edf5ef",
                              borderColor: task.difficulty === "hard" ? "#e6c1b4" : task.difficulty === "medium" ? "#e7d3a7" : "#cfe0d3",
                              color: task.difficulty === "hard" ? "#9b503d" : task.difficulty === "medium" ? "#876431" : "#4f775c",
                            }}>
                              {task.difficulty.toUpperCase()}
                            </Box>
                          )}
                          <Box sx={{ width: "clamp(30px,2vw,40px)", height: "clamp(30px,2vw,40px)", display: "grid", placeItems: "center", borderRadius: "50%", bgcolor: task.status === "completed" ? "#e5ede6" : "#f5e9de" }}>
                            <ChevronRight size={17} color={task.status === "completed" ? "#657b6b" : "#a0622e"} />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                    ))
                  )}
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
            width: "clamp(520px,55vw,760px)", maxWidth: "92vw", bgcolor: C.cardBg, borderRadius: 4,
            boxShadow: "0 30px 80px rgba(44,26,10,0.16)",
            border: `1px solid ${C.divider}`,
            overflow: "hidden", maxHeight: "85vh", display: "flex", flexDirection: "column", pb: 3,
          }}>
            <Box sx={{
              paddingInline: SPACE.lg, py: 2.2, pb: 2.5,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              borderBottom: `1px solid ${C.divider}`,
              background: C.cardBg,
            }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6 }}>
                <Typography sx={{ fontSize: FONT.lg, fontWeight: 700, color: C.textPrimary, fontFamily: "'Playfair Display', serif" }}>
                  Pending Questions
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Typography sx={{ fontSize: FONT.sm, color: C.textMuted }}>
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
                sx={{ color: C.textMuted, "&:hover": { color: "#b87444", backgroundColor: "rgba(184,116,68,0.08)" } }}>
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
                            "&:hover": { backgroundColor: C.surface, transform: "translateX(3px)" },
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
                              fontSize: FONT.md, fontWeight: 500,
                              color: isCompleted ? C.textMuted : C.textPrimary,
                              textDecoration: isCompleted ? "line-through" : "none",
                            }}>
                              {task.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: C.textMuted }}>
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
