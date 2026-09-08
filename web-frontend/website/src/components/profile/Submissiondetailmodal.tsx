"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Modal,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { ExternalLink, Pencil, X as XIcon, RotateCcw } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
import { C } from "@/lib/ui-colors";

// ── Types ────────────────────────────────────────────────────────────────────

export type Submission = {
  id: string;
  title: string;
  category: string;
  score?: number | null;
  createdAt: string;
  leetcodeUrl?: string | null;
  answer?: string | null;
  feedback?: string | null;
  approved?: boolean | null;
  updatedAt?: string | null;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const SELF_REPORT_CATEGORIES = [
  "Job Applications",
  "Networking",
  "Resume & LinkedIn",
  "Reflection & Planning",
  "Projects & Portfolio",
  "Interview Practice",
];

function getCategoryColor(cat: string) {
  const PALETTES = [
    { bg: "#fde8d8", text: "#9a3412", border: "#f4b896" },
    { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
    { bg: "#fce7f3", text: "#9d174d", border: "#f9a8d4" },
    { bg: "#dcfce7", text: "#166534", border: "#86efac" },
    { bg: "#ede9fe", text: "#5b21b6", border: "#c4b5fd" },
    { bg: "#fef9c3", text: "#854d0e", border: "#fde047" },
    { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
    { bg: "#e0f2fe", text: "#075985", border: "#7dd3fc" },
    { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" },
    { bg: "#fdf2f8", text: "#86198f", border: "#f0abfc" },
  ];
  let hash = 0;
  for (let i = 0; i < cat.length; i++)
    hash = cat.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTES[Math.abs(hash) % PALETTES.length];
}

function formatDate(ds: string) {
  const [year, month, day] = ds.slice(0, 10).split("-");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
}

function getTimeAgo(ds: string) {
  const diff = Math.floor((Date.now() - new Date(ds).getTime()) / 1000);
  const units = [
    { label: "year", value: 60 * 60 * 24 * 365 },
    { label: "month", value: 60 * 60 * 24 * 30 },
    { label: "week", value: 60 * 60 * 24 * 7 },
    { label: "day", value: 60 * 60 * 24 },
    { label: "hour", value: 60 * 60 },
    { label: "minute", value: 60 },
  ];
  for (const u of units) {
    const n = Math.floor(diff / u.value);
    if (n >= 1) return `${n} ${u.label}${n > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

function getLeetcodeUrl(s: Submission): string | null {
  if (s.leetcodeUrl) return s.leetcodeUrl;
  if (/leetcode/i.test(s.title)) {
    const name = s.title
      .replace(/^leetcode\s*(easy|medium|hard)?\s*:\s*/i, "")
      .trim();
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return `https://leetcode.com/problems/${slug}/`;
  }
  return null;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  submission: Submission | null;
  onClose: () => void;
  /** Called after a successful save so the parent list can update in-place */
  onUpdate?: (
    updated: Pick<
      Submission,
      "id" | "score" | "feedback" | "approved" | "answer" | "updatedAt"
    >
  ) => void;
}

export default function SubmissionDetailModal({
  submission,
  onClose,
  onUpdate,
}: Props) {
  // ── All hooks first ──
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnswer, setEditedAnswer] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [liveScore, setLiveScore] = useState<number | null>(null);
  const [liveFeedback, setLiveFeedback] = useState<string | null>(null);
  const [liveApproved, setLiveApproved] = useState<boolean | null>(null);
  const [liveUpdatedAt, setLiveUpdatedAt] = useState<string | null>(
    submission?.updatedAt ?? null
  );

  useEffect(() => {
    if (!submission) return;
    setIsEditing(false);
    setEditedAnswer(submission.answer ?? "");
    setSaveError(null);
    setLiveScore(submission.score ?? null);
    setLiveFeedback(submission.feedback ?? null);
    setLiveApproved(
      submission.approved ??
        (submission.score != null ? submission.score >= 6 : null)
    );
    setLiveUpdatedAt(submission.updatedAt ?? null);
  }, [submission?.id]);

  // ── Early return after hooks ──
  if (!submission) return null;

  const isSelfReport = SELF_REPORT_CATEGORIES.includes(
    submission.category ?? ""
  );
  const leetcodeUrl = getLeetcodeUrl(submission);
  const catColor = getCategoryColor(submission.category);
  const isDirty = editedAnswer !== (submission.answer ?? "");
  const approved = liveApproved;

  async function handleSave() {
    if (!isDirty || isSaving) return;
    setIsSaving(true);
    setSaveError(null);

    if (submission == null) {
      setSaveError("No submission to update.");
      setIsSaving(false);
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE_URL}/momentum/submissions/${submission.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answer: editedAnswer }),
        }
      );
      if (!res.ok) throw new Error("Failed to save. Please try again.");
      const data = await res.json(); // { score, feedback, approved }

      setLiveScore(data.score);
      setLiveFeedback(data.feedback);
      setLiveApproved(data.approved);
      setIsEditing(false);
      setLiveUpdatedAt(new Date().toISOString());

      // Notify parent so the row in AllSubmissions updates without a refresh
      onUpdate?.({
        id: submission.id,
        score: data.score,
        feedback: data.feedback,
        approved: data.approved,
        answer: editedAnswer,
        updatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      setSaveError(err.message ?? "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      open={!!submission}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(6px)",
            backgroundColor: "rgba(44,26,10,0.2)",
          },
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: 700,
          maxWidth: "90vw",
          bgcolor: C.cardBg,
          borderRadius: 3,
          boxShadow: "0 20px 60px rgba(44,26,10,0.16)",
          border: "1px solid #e8ddd0",
          overflow: "hidden",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Fixed header ── */}
        <Box sx={{ flexShrink: 0 }}>
          <Box sx={{ height: 4, background: C.accentGrad }} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              px: 4,
              pt: 3,
              pb: 2.5,
              borderBottom: `1px solid ${C.divider}`,
              bgcolor: C.cardBg,
            }}
          >
            <Box sx={{ flex: 1, pr: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  color: C.textPrimary,
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Submission Review
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: C.textSub,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                {submission.title}
                {leetcodeUrl && (
                  <Box
                    component="a"
                    href={leetcodeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 20,
                      height: 20,
                      borderRadius: "4px",
                      background: "#f5ede0",
                      border: "1px solid #d4b898",
                      color: C.accent,
                      textDecoration: "none",
                      flexShrink: 0,
                      "&:hover": {
                        background: "#ecddc8",
                        borderColor: C.accent,
                      },
                    }}
                  >
                    <ExternalLink size={11} strokeWidth={2.5} />
                  </Box>
                )}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  mt: 1,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <Chip
                  label={submission.category}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    bgcolor: catColor.bg,
                    color: catColor.text,
                    border: `1px solid ${catColor.border}`,
                    borderRadius: "60px",
                    "& .MuiChip-label": { px: 1.2 },
                  }}
                />
                <Typography sx={{ fontSize: "0.72rem", color: C.textHint }}>
                  {formatDate(submission.createdAt)} ·{" "}
                  {getTimeAgo(submission.createdAt)}
                </Typography>
                {liveUpdatedAt && liveUpdatedAt !== submission.createdAt && (
                  <Typography sx={{ fontSize: "0.72rem", color: C.textHint }}>
                    Edited {getTimeAgo(liveUpdatedAt)} ·{" "}
                    {formatDate(liveUpdatedAt)}
                  </Typography>
                )}
              </Box>
            </Box>
            <IconButton
              onClick={onClose}
              sx={{
                color: C.textSub,
                "&:hover": { color: C.accent, bgcolor: C.accentBg },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* ── Scrollable body ── */}
        <Box sx={{ overflowY: "auto", p: 4, flex: 1 }}>
          {/* Score banner */}
          <Paper
            sx={{
              p: 2.5,
              mb: 3,
              backgroundColor:
                approved === true
                  ? "#f5ede0"
                  : approved === false
                  ? "#fef2f2"
                  : C.surface,
              border: `2px solid ${
                approved === true
                  ? C.accent
                  : approved === false
                  ? "#fca5a5"
                  : C.divider
              }`,
              boxShadow: "none",
              borderRadius: 2,
              transition: "all 0.3s",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: C.textPrimary }}
              >
                Score: {liveScore != null ? `${liveScore}/10` : "—"}
              </Typography>
              {approved !== null && (
                <Chip
                  icon={approved ? <CheckCircleIcon /> : <CancelIcon />}
                  label={approved ? "Approved" : "Rejected"}
                  sx={{
                    fontWeight: 600,
                    backgroundColor: approved ? C.accent : "#fca5a5",
                    color: "#fff",
                    "& .MuiChip-icon": { color: "#fff" },
                  }}
                />
              )}
            </Box>
          </Paper>

          {/* AI Feedback */}
          {liveFeedback && (
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: C.textSub,
                  mb: 1,
                }}
              >
                {isSelfReport ? "Confirmation" : "AI Feedback"}
              </Typography>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: C.surface,
                  border: `1px solid ${C.divider}`,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: C.textPrimary, lineHeight: 1.7 }}
                >
                  {liveFeedback}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Submitted Answer */}
          {submission.answer && (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    color: C.textSub,
                  }}
                >
                  Your Submitted Answer
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {isDirty && (
                    <Tooltip title="Revert to original" placement="top">
                      <Box
                        onClick={() => setEditedAnswer(submission.answer ?? "")}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          cursor: "pointer",
                          px: 1.2,
                          py: 0.4,
                          borderRadius: "6px",
                          color: C.textSub,
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          border: `1px solid ${C.divider}`,
                          bgcolor: C.surface,
                          transition: "all 0.15s",
                          "&:hover": {
                            color: C.accent,
                            borderColor: C.accentBorder,
                            bgcolor: C.accentBg,
                          },
                        }}
                      >
                        <RotateCcw size={11} />
                        <span>Revert</span>
                      </Box>
                    </Tooltip>
                  )}
                  <Tooltip
                    title={isEditing ? "Cancel editing" : "Edit your answer"}
                    placement="top"
                  >
                    <Box
                      onClick={() => {
                        if (isEditing) setEditedAnswer(submission.answer ?? "");
                        setIsEditing((v) => !v);
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        cursor: "pointer",
                        px: 1.2,
                        py: 0.4,
                        borderRadius: "6px",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        transition: "all 0.15s",
                        ...(isEditing
                          ? {
                              color: "#dc2626",
                              border: "1px solid #fca5a5",
                              bgcolor: "#fef2f2",
                              "&:hover": { bgcolor: "#fee2e2" },
                            }
                          : {
                              color: C.accent,
                              border: `1px solid ${C.accentBorder}`,
                              bgcolor: C.accentBg,
                              "&:hover": { bgcolor: "rgba(184,116,68,0.14)" },
                            }),
                      }}
                    >
                      {isEditing ? <XIcon size={11} /> : <Pencil size={11} />}
                      <span>{isEditing ? "Cancel" : "Edit"}</span>
                    </Box>
                  </Tooltip>
                </Box>
              </Box>

              {!isEditing && (
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: C.surface,
                    border: `1px solid ${C.divider}`,
                    fontSize: "0.9rem",
                    color: C.textPrimary,
                    lineHeight: 1.75,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    minHeight: isSelfReport ? 60 : 140,
                    position: "relative",
                    cursor: "text",
                    transition: "border-color 0.15s, background 0.15s",
                    "&:hover": {
                      borderColor: C.accent,
                      bgcolor: "rgba(184,116,68,0.03)",
                    },
                    "&:hover .edit-hint": { opacity: 1 },
                  }}
                >
                  {editedAnswer}
                  <Box
                    className="edit-hint"
                    sx={{
                      position: "absolute",
                      bottom: 10,
                      right: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      opacity: 0,
                      transition: "opacity 0.2s",
                      px: 1,
                      py: 0.3,
                      borderRadius: "6px",
                      bgcolor: C.accentBg,
                      border: `1px solid ${C.accentBorder}`,
                    }}
                  >
                    <Pencil size={9} color={C.accent} />
                    <Typography
                      sx={{
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        color: C.accent,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      Click to edit
                    </Typography>
                  </Box>
                </Box>
              )}

              {isEditing && (
                <Box>
                  <TextField
                    multiline
                    fullWidth
                    autoFocus
                    minRows={isSelfReport ? 3 : 8}
                    value={editedAnswer}
                    onChange={(e) => setEditedAnswer(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.9rem",
                        lineHeight: 1.75,
                        color: C.textPrimary,
                        bgcolor: C.cardBg,
                        "& fieldset": { borderColor: C.accent, borderWidth: 2 },
                        "&:hover fieldset": { borderColor: C.accentDark },
                        "&.Mui-focused fieldset": { borderColor: C.accentDark },
                      },
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 0.8,
                    }}
                  >
                    <Typography sx={{ fontSize: "0.7rem", color: C.textHint }}>
                      {editedAnswer.trim().split(/\s+/).filter(Boolean).length}{" "}
                      words
                    </Typography>
                    {isDirty && (
                      <Typography
                        sx={{
                          fontSize: "0.7rem",
                          color: C.accent,
                          fontWeight: 600,
                        }}
                      >
                        Unsaved changes
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {!submission.answer && !submission.feedback && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography sx={{ color: C.textHint, fontSize: "0.85rem" }}>
                No submission details available.
              </Typography>
            </Box>
          )}
        </Box>

        {/* ── Fixed footer ── */}
        {isEditing && (
          <Box
            sx={{
              flexShrink: 0,
              px: 4,
              py: 2.5,
              borderTop: `1px solid ${C.divider}`,
              bgcolor: C.cardBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              {saveError ? (
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    color: "#dc2626",
                    fontWeight: 600,
                  }}
                >
                  {saveError}
                </Typography>
              ) : (
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    color: isDirty ? C.accent : C.textHint,
                    fontWeight: isDirty ? 600 : 400,
                  }}
                >
                  {isDirty ? "You have unsaved changes" : "No changes made"}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Box
                onClick={() => {
                  if (isSaving) return;
                  setEditedAnswer(submission.answer ?? "");
                  setIsEditing(false);
                  setSaveError(null);
                }}
                sx={{
                  px: 2.5,
                  py: 1,
                  borderRadius: "8px",
                  cursor: isSaving ? "default" : "pointer",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: C.textSub,
                  border: `1px solid ${C.divider}`,
                  bgcolor: C.surface,
                  opacity: isSaving ? 0.5 : 1,
                  transition: "all 0.15s",
                  "&:hover": !isSaving
                    ? { borderColor: C.accent, color: C.accent }
                    : {},
                }}
              >
                Cancel
              </Box>
              <Box
                onClick={handleSave}
                sx={{
                  px: 2.5,
                  py: 1,
                  borderRadius: "8px",
                  cursor: isDirty && !isSaving ? "pointer" : "default",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#fff",
                  background: isDirty && !isSaving ? C.accentGrad : "#d4b898",
                  transition: "all 0.15s",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  opacity: isDirty ? 1 : 0.6,
                  "&:hover":
                    isDirty && !isSaving
                      ? {
                          background: `linear-gradient(to right, ${C.accentDark}, #8a5226)`,
                        }
                      : {},
                }}
              >
                {isSaving && (
                  <CircularProgress size={13} sx={{ color: "#fff" }} />
                )}
                {isSaving ? "Saving..." : "Save Changes"}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Modal>
  );
}
