"use client";
import React, { useState } from "react";
import {
  Box, Modal, Typography, TextField, Button,
  IconButton, Alert, Chip, LinearProgress, Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { Zap, ExternalLink } from "lucide-react";
import { api, SubmissionResult } from "@/lib/api";
import { normalizeLeetcodeUrl } from "@/lib/leetcode-url";
import { C } from "@/lib/ui-colors";

interface Task {
  id: number;
  title: string;
  category?: string;
  date?: string;
  leetcodeUrl?: string | null;
}

interface SubmissionModalProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  onSuccess?: (result: SubmissionResult) => void;
}

const SELF_REPORT_CATEGORIES = [
  'Job Applications', 'Networking', 'Resume & LinkedIn',
  'Reflection & Planning', 'Projects & Portfolio', 'Interview Practice',
];

function getLeetcodeUrl(task: Task | null): string | null {
  if (!task) return null;
  return normalizeLeetcodeUrl(task.leetcodeUrl);
}

export default function SubmissionModal({ open, onClose, task, onSuccess }: SubmissionModalProps) {
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isSelfReport = task?.category && SELF_REPORT_CATEGORIES.includes(task.category);
  const isLeetcode = Boolean(getLeetcodeUrl(task));
  const minChars = isSelfReport || isLeetcode ? 10 : 50;
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  const charCount = answer.trim().length;
  const isValid = charCount >= minChars;

  const handleSubmit = async () => {
    if (!task || !isValid) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await api.submitAnswer({ taskId: task.id, taskDate: task.date, textContent: answer });
      setResult(response);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAnswer(""); setResult(null); setError(null); onClose();
  };

  if (!task) return null;

  return (
    <Modal open={open} onClose={handleClose}
      slotProps={{ backdrop: { sx: { backdropFilter: "blur(6px)", backgroundColor: "rgba(44,26,10,0.2)" } } }}>
      <Box sx={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: 700, maxWidth: "90vw", bgcolor: C.cardBg, borderRadius: 3,
        boxShadow: "0 20px 60px rgba(44,26,10,0.16)",
        border: `1px solid ${C.divider}`,
        p: 4, maxHeight: "85vh", overflowY: "auto",
      }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: C.textPrimary, fontFamily: "'Playfair Display', serif" }}>
              Submit Your Answer
            </Typography>
            <Typography variant="body2" sx={{ color: C.textMuted, display: "flex", alignItems: "center", gap: 0.5 }}>
              {task.title}
              {getLeetcodeUrl(task) && (
                <Box component="a" href={getLeetcodeUrl(task)!} target="_blank" rel="noopener noreferrer"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  sx={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 20, height: 20, borderRadius: "4px",
                    background: "#f5ede0", border: "1px solid #d4b898",
                    color: "#b87444", textDecoration: "none", flexShrink: 0,
                    "&:hover": { background: "#ecddc8", borderColor: "#b87444" },
                  }}>
                  <ExternalLink size={11} strokeWidth={2.5} />
                </Box>
              )}
            </Typography>
            {task.category && (
              <Chip label={task.category} size="small" sx={{
                mt: 1,
                backgroundColor: "#f5ede0",
                color: "#b87444",
                border: "1px solid #e8ddd0",
                fontWeight: 500,
              }} />
            )}
          </Box>
          <IconButton onClick={handleClose}
            sx={{ color: C.textMuted, "&:hover": { color: "#b87444", backgroundColor: "rgba(184,116,68,0.08)" } }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Result view */}
        {result ? (
          <Box>
            {result.trackCompletion && (
              <Box sx={{
                position: "relative", overflow: "hidden", mb: 3, p: { xs: 2.5, sm: 3.5 },
                textAlign: "center", borderRadius: 3,
                background: "linear-gradient(145deg, #fff8ed, #f4e5d4)",
                border: "1px solid #dfc3a4",
              }}>
                {[{ top: 18, left: "12%" }, { top: 38, right: "13%" }, { bottom: 22, left: "20%" }, { bottom: 30, right: "22%" }].map((position, index) => (
                  <Box key={index} sx={{ position: "absolute", ...position, width: index % 2 ? 8 : 6, height: index % 2 ? 8 : 6, borderRadius: index % 2 ? 1 : "50%", bgcolor: index % 2 ? "#d8a15f" : "#789080", transform: `rotate(${index * 18}deg)` }} />
                ))}
                <Box sx={{
                  width: 88, height: 88, mx: "auto", mb: 1.5, borderRadius: "50%",
                  display: "grid", placeItems: "center", fontSize: 43,
                  background: "linear-gradient(145deg, #f2cf91, #c98a50)",
                  boxShadow: "0 12px 28px rgba(160,98,46,.24)",
                  border: "5px solid rgba(255,255,255,.7)",
                }}>🏆</Box>
                <Typography sx={{ fontFamily: "'Playfair Display', serif", fontSize: 25, fontWeight: 800, color: C.textPrimary }}>
                  Course completed!
                </Typography>
                <Typography sx={{ mt: 0.75, color: "#6f5542", lineHeight: 1.55 }}>
                  You successfully completed the {result.trackCompletion.completedTrack.durationMonths}-month {result.trackCompletion.completedTrack.targetRole} plan with {result.trackCompletion.completedTrack.questionTarget} questions.
                </Typography>
                <Typography sx={{ mt: 1.25, fontWeight: 700, color: "#a0622e" }}>
                  {result.trackCompletion.nextTrack
                    ? `Your ${result.trackCompletion.nextTrack.durationMonths}-month plan is ready and continues from your progress.`
                    : "You completed every Anchor learning plan. Outstanding work!"}
                </Typography>
              </Box>
            )}
            <Paper sx={{
              p: 3, mb: 3,
              backgroundColor: result.approved ? "#f5ede0" : "#fef2f2",
              border: `2px solid ${result.approved ? "#b87444" : "#fca5a5"}`,
              boxShadow: "none",
            }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: C.textPrimary }}>
                  Score: {result.score}/10
                </Typography>
                <Chip
                  icon={result.approved ? <CheckCircleIcon /> : <CancelIcon />}
                  label={result.approved ? "Approved" : "Rejected"}
                  sx={{
                    fontWeight: 600,
                    backgroundColor: result.approved ? "#b87444" : "#fca5a5",
                    color: "#fff",
                    "& .MuiChip-icon": { color: "#fff" },
                  }}
                />
              </Box>
              <Typography variant="body1" sx={{ mb: 2, color: C.textPrimary, lineHeight: 1.6 }}>
                {result.feedback}
              </Typography>

              {result.approved && result.anchorPointsEarned > 0 && (
                <Box sx={{
                  display: "flex", alignItems: "center", gap: 1, mt: 1, mb: 1,
                  px: 2, py: 1, borderRadius: 2,
                  bgcolor: "#fdfaf7", border: "1px solid #e8ddd0",
                }}>
                  <Zap size={16} color="#b87444" fill="#b87444" />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#a0622e" }}>
                    +{result.anchorPointsEarned} Anchor Points earned!
                  </Typography>
                  <Typography variant="caption" sx={{ ml: "auto", color: C.textMuted }}>
                    Total: {result.newAnchorPointsBalance} AP
                  </Typography>
                </Box>
              )}

              {result.details && !result.details.selfReport && (
                <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e8ddd0" }}>
                  <Typography variant="caption" sx={{ display: "block", mb: 1, color: C.textMuted }}>
                    Analysis Details:
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {result.details.wordCount && <Chip label={`${result.details.wordCount} words`} size="small" variant="outlined" sx={{ borderColor: "#e8ddd0", color: C.textMuted }} />}
                    {result.details.passingScore && <Chip label={`Needed: ${result.details.passingScore}/10`} size="small" variant="outlined" sx={{ borderColor: result.approved ? "#b87444" : "#fca5a5", color: result.approved ? "#b87444" : "#ef4444" }} />}
                    {result.details.hasSituation && <Chip label="✓ Has Situation" size="small" sx={{ backgroundColor: "#f5ede0", color: "#b87444" }} />}
                    {result.details.hasTask && <Chip label="✓ Has Task" size="small" sx={{ backgroundColor: "#f5ede0", color: "#b87444" }} />}
                    {result.details.hasAction && <Chip label="✓ Has Action" size="small" sx={{ backgroundColor: "#f5ede0", color: "#b87444" }} />}
                    {result.details.hasResult && <Chip label="✓ Has Result" size="small" sx={{ backgroundColor: "#f5ede0", color: "#b87444" }} />}
                  </Box>
                </Box>
              )}
            </Paper>

            <Button fullWidth variant="contained"
              onClick={() => { if (onSuccess && result) onSuccess(result); handleClose(); }}
              sx={{ bgcolor: "#b87444", "&:hover": { bgcolor: "#a0622e" }, textTransform: "none", py: 1.5, fontWeight: 600 }}>
              Close
            </Button>
          </Box>
        ) : (
          <>
            <TextField multiline rows={isSelfReport ? 4 : 12} fullWidth
              placeholder={isSelfReport
                ? "Briefly describe what you did (minimum 10 characters)..."
                : isLeetcode
                  ? "Paste your solution in any programming language. Anchor will detect the language automatically."
                  : "Write your detailed answer here (minimum 50 characters)..."}
              value={answer} onChange={(e) => setAnswer(e.target.value)} disabled={isSubmitting}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  fontFamily: isLeetcode ? "ui-monospace, SFMono-Regular, Menlo, monospace" : "Inter, sans-serif", fontSize: "15px",
                  "& fieldset": { borderColor: "#e8ddd0" },
                  "&:hover fieldset": { borderColor: "#b87444" },
                  "&.Mui-focused fieldset": { borderColor: "#b87444" },
                },
              }}
            />

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="caption" sx={{ color: C.textMuted }}>
                {wordCount} words • {charCount} characters
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: isValid ? "#b87444" : "#ef4444" }}>
                {isValid ? "✓ Ready to submit" : `Minimum ${minChars} characters required`}
              </Typography>
            </Box>

            {isSelfReport && (
              <Alert severity="info" sx={{ mb: 2, backgroundColor: "#f5ede0", color: C.textPrimary, border: "1px solid #e8ddd0", "& .MuiAlert-icon": { color: "#b87444" } }}>
                This is a self-report task. Just briefly confirm you completed it!
              </Alert>
            )}

            {isLeetcode && (
              <Alert severity="info" sx={{ mb: 2, backgroundColor: "#f5ede0", color: C.textPrimary, border: "1px solid #e8ddd0", "& .MuiAlert-icon": { color: "#b87444" } }}>
                Submit code in any programming language. Explanations are optional and the evaluator will assess correctness, edge cases, and complexity.
              </Alert>
            )}

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {isSubmitting && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress sx={{ "& .MuiLinearProgress-bar": { backgroundColor: "#b87444" }, backgroundColor: "#f5ede0" }} />
                <Typography variant="caption" sx={{ display: "block", mt: 1, textAlign: "center", color: C.textMuted }}>
                  {isSelfReport ? "Submitting..." : "AI is evaluating your answer..."}
                </Typography>
              </Box>
            )}

            <Button fullWidth variant="contained" onClick={handleSubmit} disabled={!isValid || isSubmitting}
              sx={{
                bgcolor: "#b87444", "&:hover": { bgcolor: "#a0622e" },
                "&:disabled": { bgcolor: "#d4b898", color: "#fff" },
                textTransform: "none", py: 1.5, fontWeight: 600,
              }}>
              {isSubmitting ? "Submitting..." : "Submit Answer"}
            </Button>
          </>
        )}
      </Box>
    </Modal>
  );
}
