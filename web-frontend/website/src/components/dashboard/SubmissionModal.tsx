"use client";
import React, { useState } from "react";
import {
  Box,
  Modal,
  Typography,
  TextField,
  Button,
  IconButton,
  Alert,
  Chip,
  LinearProgress,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { api } from "@/lib/api";

interface Task {
  id: number;
  title: string;
  category?: string;
}

interface SubmissionModalProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  onSuccess?: () => void;
}

// Categories that only need 10 characters minimum
const SELF_REPORT_CATEGORIES = [
  'Job Applications',
  'Networking',
  'Resume & LinkedIn',
  'Reflection & Planning',
  'Projects & Portfolio',
  'Interview Practice',
];

export default function SubmissionModal({
  open,
  onClose,
  task,
  onSuccess,
}: SubmissionModalProps) {
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Determine minimum characters based on task category
  const isSelfReport = task?.category && SELF_REPORT_CATEGORIES.includes(task.category);
  const minChars = isSelfReport ? 10 : 50;

  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  const charCount = answer.trim().length;
  const isValid = charCount >= minChars;

  const handleSubmit = async () => {
    if (!task || !isValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await api.submitAnswer({
        taskId: task.id,
        textContent: answer,
      });

      setResult(response);
      // ✅ Don't close or call onSuccess here - let user read feedback
    } catch (err: any) {
      setError(err.message || "Failed to submit answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAnswer("");
    setResult(null);
    setError(null);
    onClose();
  };

  if (!task) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
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
          width: 700,
          maxWidth: "90vw",
          bgcolor: "#fff",
          borderRadius: 3,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          p: 4,
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              Submit Your Answer
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {task.title}
            </Typography>
            {task.category && (
              <Chip 
                label={task.category} 
                size="small" 
                sx={{ mt: 1 }}
                color={isSelfReport ? "default" : "primary"}
              />
            )}
          </Box>

          <IconButton
            onClick={handleClose}
            sx={{
              color: "#9ca3af",
              "&:hover": {
                color: "#be123c",
                backgroundColor: "rgba(190,18,60,0.08)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Show result if submitted */}
        {result ? (
          <Box>
            <Paper
              sx={{
                p: 3,
                mb: 3,
                backgroundColor: result.approved ? "#f0fdf4" : "#fef2f2",
                border: `2px solid ${result.approved ? "#86efac" : "#fca5a5"}`,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Score: {result.score}/10
                </Typography>

                <Chip
                  icon={
                    result.approved ? <CheckCircleIcon /> : <CancelIcon />
                  }
                  label={result.approved ? "Approved" : "Rejected"}
                  color={result.approved ? "success" : "error"}
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              <Typography
                variant="body1"
                sx={{ mb: 2, color: "#374151", lineHeight: 1.6 }}
              >
                {result.feedback}
              </Typography>

              {/* Details */}
              {result.details && !result.details.selfReport && (
                <Box
                  sx={{
                    mt: 2,
                    pt: 2,
                    borderTop: "1px solid #d1d5db",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ display: "block", mb: 1, color: "#6b7280" }}
                  >
                    Analysis Details:
                  </Typography>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {result.details.wordCount && (
                      <Chip
                        label={`${result.details.wordCount} words`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {result.details.passingScore && (
                      <Chip
                        label={`Needed: ${result.details.passingScore}/10`}
                        size="small"
                        variant="outlined"
                        color={result.approved ? "success" : "error"}
                      />
                    )}
                    {result.details.hasSituation && (
                      <Chip
                        label="✓ Has Situation"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                    {result.details.hasTask && (
                      <Chip
                        label="✓ Has Task"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                    {result.details.hasAction && (
                      <Chip
                        label="✓ Has Action"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                    {result.details.hasResult && (
                      <Chip
                        label="✓ Has Result"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              )}
            </Paper>

            {/* ✅ Close button that refreshes data */}
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                if (onSuccess) {
                  onSuccess();  // Refresh dashboard
                }
                handleClose();  // Close modal
              }}
              sx={{
                bgcolor: "#be123c",
                "&:hover": { bgcolor: "#9f1239" },
                textTransform: "none",
                py: 1.5,
              }}
            >
              Close
            </Button>
          </Box>
        ) : (
          <>
            {/* Text Input */}
            <TextField
              multiline
              rows={isSelfReport ? 4 : 12}
              fullWidth
              placeholder={
                isSelfReport 
                  ? "Briefly describe what you did (minimum 10 characters)..."
                  : "Write your detailed answer here (minimum 50 characters)..."
              }
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={isSubmitting}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  fontFamily: "inherit",
                  fontSize: "15px",
                },
              }}
            />

            {/* Character/Word Count */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                {wordCount} words • {charCount} characters
              </Typography>
              <Typography
                variant="caption"
                color={isValid ? "success.main" : "error.main"}
                sx={{ fontWeight: 600 }}
              >
                {isValid 
                  ? "✓ Ready to submit" 
                  : `Minimum ${minChars} characters required`
                }
              </Typography>
            </Box>

            {/* Info Message for Self-Report */}
            {isSelfReport && (
              <Alert severity="info" sx={{ mb: 2 }}>
                This is a self-report task. Just briefly confirm you completed it!
              </Alert>
            )}

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Loading */}
            {isSubmitting && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress />
                <Typography variant="caption" sx={{ display: "block", mt: 1, textAlign: "center" }}>
                  {isSelfReport ? "Submitting..." : "AI is evaluating your answer..."}
                </Typography>
              </Box>
            )}

            {/* Submit Button */}
            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              sx={{
                bgcolor: "#be123c",
                "&:hover": { bgcolor: "#9f1239" },
                "&:disabled": { bgcolor: "#fca5a5", color: "#fff" },
                textTransform: "none",
                py: 1.5,
                fontWeight: 600,
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit Answer"}
            </Button>
          </>
        )}
      </Box>
    </Modal>
  );
}