"use client";
import React from "react";
import {
  Box,
  Modal,
  Typography,
  IconButton,
  Chip,
  Paper,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

interface PreviousSubmissionModalProps {
  open: boolean;
  onClose: () => void;
  submission: any;
}

export default function PreviousSubmissionModal({
  open,
  onClose,
  submission,
}: PreviousSubmissionModalProps) {
  if (!submission) return null;

  // ✅ Use status field from database entity
  const isApproved = submission.status === 'approved';

  return (
    <Modal
      open={open}
      onClose={onClose}
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
              Your Previous Submission
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {submission.task?.title || submission.taskTitle || "Task"}
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
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

        {/* Your Answer */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            backgroundColor: "#f9fafb",
            border: "1px solid #e5e7eb",
          }}
        >
          <Typography
            variant="caption"
            sx={{ display: "block", mb: 1, color: "#6b7280", fontWeight: 600 }}
          >
            YOUR ANSWER:
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
            {submission.text_content}
          </Typography>
        </Paper>

        {/* Evaluation Result */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            backgroundColor: isApproved ? "#f0fdf4" : "#fef2f2",
            border: `2px solid ${isApproved ? "#86efac" : "#fca5a5"}`,
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
              Score: {submission.ai_result.score}/10
            </Typography>

            <Chip
              icon={isApproved ? <CheckCircleIcon /> : <CancelIcon />}
              label={isApproved ? "Approved" : "Rejected"}
              color={isApproved ? "success" : "error"}
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <Typography
            variant="body1"
            sx={{ mb: 2, color: "#374151", lineHeight: 1.6 }}
          >
            {submission.ai_result.feedback}
          </Typography>

          {/* Details */}
          {submission.ai_result.details && !submission.ai_result.details.selfReport && (
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
                {submission.ai_result.details.wordCount && (
                  <Chip
                    label={`${submission.ai_result.details.wordCount} words`}
                    size="small"
                    variant="outlined"
                  />
                )}
                {submission.ai_result.details.passingScore && (
                  <Chip
                    label={`Needed: ${submission.ai_result.details.passingScore}/10`}
                    size="small"
                    variant="outlined"
                    color={isApproved ? "success" : "error"}
                  />
                )}
                {submission.ai_result.details.hasSituation && (
                  <Chip
                    label="✓ Has Situation"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                )}
                {submission.ai_result.details.hasTask && (
                  <Chip
                    label="✓ Has Task"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                )}
                {submission.ai_result.details.hasAction && (
                  <Chip
                    label="✓ Has Action"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                )}
                {submission.ai_result.details.hasResult && (
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

          <Typography
            variant="caption"
            sx={{ display: "block", mt: 2, color: "#6b7280" }}
          >
            Submitted on {new Date(submission.submitted_at).toLocaleString()}
          </Typography>
        </Paper>

        <Button
          fullWidth
          variant="contained"
          onClick={onClose}
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
    </Modal>
  );
}