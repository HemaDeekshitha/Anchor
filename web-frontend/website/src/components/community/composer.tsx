"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Card,
  Stack,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
  InputAdornment,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Button,
} from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import PollOutlinedIcon from "@mui/icons-material/PollOutlined";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined";
import { CommunityPostRecord, createPost } from "@/lib/community-api";
import { C, COMPOSER_EMOJIS } from "./constants";
import { ComposerMode } from "./Types";

const Composer = ({
  scope,
  communityId,
  onCreated,
}: {
  scope: "global" | "community";
  communityId?: string;
  onCreated: (post: CommunityPostRecord) => Promise<void>;
}) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ComposerMode>("text");
  const [content, setContent] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollDurationDays, setPollDurationDays] = useState(7);
  const [pollAllowsMultiple, setPollAllowsMultiple] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const validPollOptions = pollOptions.filter((option) => option.trim());
  const canSubmit =
    (scope === "global" || Boolean(communityId)) &&
    (mode === "image" || mode === "video"
      ? Boolean(file)
      : Boolean(content.trim())) &&
    (mode !== "poll" || validPollOptions.length >= 2) &&
    (mode === "poll" ? Boolean(content.trim()) : true);

  const handleModeChange = (nextMode: ComposerMode) => {
    if (nextMode !== mode) setFile(null);
    setMode(nextMode);
  };
  // T: O(1) and S: O(1)

  const handleMediaPicker = (resourceType: "image" | "video") => {
    handleModeChange(resourceType);
    setOpen(true);
    setError("");
    window.requestAnimationFrame(() => {
      const input =
        resourceType === "image"
          ? imageInputRef.current
          : videoInputRef.current;
      if (input) {
        input.value = "";
        input.click();
      }
    });
  };
  // T: O(1) and S: O(1)

  const handleMediaSelected = (
    resourceType: "image" | "video",
    selectedFile: File | null
  ) => {
    const maxBytes = resourceType === "video" ? 50_000_000 : 10_000_000;
    if (selectedFile && selectedFile.size > maxBytes) {
      setError(
        `${resourceType === "video" ? "Video" : "Image"} must be smaller than ${
          maxBytes / 1_000_000
        } MB`
      );
      setFile(null);
      return;
    }
    setError("");
    setMode(resourceType);
    setFile(selectedFile);
  };
  // T: O(1) and S: O(1)

  const handleEmojiSelect = (emoji: string) => {
    setContent((current) => `${current}${current ? " " : ""}${emoji}`);
  };
  // T: O(c) and S: O(c), where c is the current post length

  const handleEmojiPickerToggle = () => {
    handleModeChange(mode === "emoji" ? "text" : "emoji");
  };
  // T: O(1) and S: O(1)

  const handleOpen = () => {
    setError("");
    setOpen(true);
  };
  // T: O(1) and S: O(1)

  const resetComposer = () => {
    setContent("");
    setPollOptions(["", ""]);
    setPollDurationDays(7);
    setPollAllowsMultiple(false);
    setFile(null);
    setMode("text");
    setUploadProgress(0);
    setError("");
  };
  // T: O(1) and S: O(1)

  const handleCancel = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    if (submitting) return;
    resetComposer();
    setOpen(false);
  };
  // T: O(1) and S: O(1)

  useEffect(() => {
    if (!open) return;
    const handleDocumentPointerDown = (event: PointerEvent) => {
      if (submitting) return;
      if (
        composerRef.current &&
        !composerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    // T: O(1) and S: O(1)
    document.addEventListener("pointerdown", handleDocumentPointerDown);
    return () =>
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
  }, [open, submitting]);

  const handlePollOptionChange = (index: number, value: string) => {
    setPollOptions((current) =>
      current.map((option, optionIndex) =>
        optionIndex === index ? value : option
      )
    );
  };
  // T: O(p) and S: O(p), where p is the number of poll options

  const handleAddPollOption = () => {
    setPollOptions((current) =>
      current.length < 10 ? [...current, ""] : current
    );
  };
  // T: O(p) and S: O(p), where p is the number of poll options

  const handleRemovePollOption = (index: number) => {
    if (index < 2) return;
    setPollOptions((current) =>
      current.filter((_, optionIndex) => optionIndex !== index)
    );
  };
  // T: O(p) and S: O(p), where p is the number of poll options

  const handleShare = async () => {
    if (!canSubmit) {
      setError(
        scope === "community" && !communityId
          ? "Choose a community before posting."
          : mode === "poll" && validPollOptions.length < 2
          ? "A poll needs at least two options."
          : (mode === "image" || mode === "video") && !file
          ? `Choose a ${mode} to upload.`
          : "Write something before posting."
      );
      return;
    }
    setSubmitting(true);
    setUploadProgress(0);
    setError("");
    try {
      const post = await createPost({
        communityId: scope === "community" ? communityId : null,
        body: content,
        mode: mode === "emoji" ? "text" : mode,
        file,
        onUploadProgress: setUploadProgress,
        pollOptions,
        pollAllowsMultiple,
        pollEndsAt: new Date(
          Date.now() + pollDurationDays * 24 * 60 * 60 * 1_000
        ).toISOString(),
      });
      resetComposer();
      setOpen(false);
      void onCreated(post);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not create post"
      );
    } finally {
      setSubmitting(false);
    }
  };
  // T: O(b + p) and S: O(b + p), where b is media bytes and p is poll options

  const handleCompactShare = (event: React.MouseEvent) => {
    event.stopPropagation();
    void handleShare();
  };
  // T: O(b + p) and S: O(b + p), where b is media bytes and p is poll options

  return (
    <Card
      ref={composerRef}
      onClick={handleOpen}
      elevation={0}
      sx={{
        width: "100%",
        maxHeight: open ? 780 : 58,
        minHeight: open ? 0 : 58,
        p: open ? { xs: 1.5, sm: 1.75 } : 0,
        borderRadius: open ? 4 : 999,
        bgcolor: "#fff",
        border: `1px solid ${open ? C.accentBorder : C.divider}`,
        boxShadow: open
          ? "0 10px 30px rgba(44,26,10,0.12)"
          : "0 3px 14px rgba(44,26,10,0.06)",
        overflow: "hidden",
        transition:
          "max-height 320ms cubic-bezier(0.4, 0, 0.2, 1), border-color 200ms ease, box-shadow 200ms ease",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: open ? "flex-start" : "center",
          gap: open ? 1.2 : 0.5,
          minHeight: open ? 0 : 56,
        }}
      >
        <TextField
          fullWidth
          multiline
          minRows={open ? 4 : 1}
          maxRows={open ? 8 : 1}
          value={content}
          disabled={submitting}
          onFocus={handleOpen}
          onChange={(event) => setContent(event.target.value)}
          inputProps={{ maxLength: mode === "poll" ? 150 : 10_000 }}
          helperText={open && mode === "poll" ? `${content.length}/150` : ""}
          FormHelperTextProps={{
            sx: {
              m: 0,
              mt: 0.25,
              textAlign: "right",
              color: C.textMuted,
              fontSize: "0.7rem",
            },
          }}
          placeholder={
            open
              ? mode === "poll"
                ? "What is the question?"
                : "What do you want to share?"
              : "Start a post"
          }
          variant="standard"
          InputProps={{ disableUnderline: true }}
          sx={{
            minWidth: 0,
            py: open ? 0.3 : 0.25,
            "& .MuiInputBase-root": {
              alignItems: open ? "flex-start" : "center",
              color: "#111",
              fontSize: open ? "1rem" : "0.95rem",
              lineHeight: 1.55,
              border: open ? "1px solid #242424" : "1px solid transparent",
              borderRadius: open ? 2 : 0,
              bgcolor: "#fff",
              px: open ? 1.5 : 2,
              py: open ? 1.1 : 0,
              transition: "font-size 200ms ease",
            },
            "& .MuiInputBase-root.Mui-focused": {
              borderColor: "#111",
            },
            "& textarea::placeholder": {
              color: "rgba(0, 0, 0, 0.62)",
              opacity: 1,
            },
            "& input::placeholder": {
              color: "rgba(0, 0, 0, 0.62)",
              opacity: 1,
            },
          }}
        />

        {!open && (
          <IconButton
            aria-label="Send post"
            onClick={handleCompactShare}
            disabled={!canSubmit || submitting}
            size="small"
            sx={{
              width: 40,
              height: 40,
              minWidth: 40,
              mr: 0.75,
              flexShrink: 0,
              color: "#fff",
              bgcolor: canSubmit ? C.accent : "#e7e4e1",
              "&:hover": { bgcolor: canSubmit ? C.accentDark : "#e7e4e1" },
              "&.Mui-disabled": { color: "#aaa", bgcolor: "#e7e4e1" },
            }}
          >
            <SendRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}

        {open && (
          <IconButton
            aria-label="Cancel post"
            onClick={handleCancel}
            size="small"
            sx={{ color: C.textMuted, flexShrink: 0 }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Box
        aria-hidden={!open}
        sx={{
          pl: 0,
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(10px)",
          pointerEvents: open ? "auto" : "none",
          transition:
            "opacity 180ms ease 80ms, transform 240ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {mode === "poll" && (
          <Stack spacing={1.15} sx={{ mt: 1, maxWidth: 680 }}>
            {pollOptions.map((option, index) => (
              <TextField
                key={`poll-option-${index}`}
                size="small"
                value={option}
                onChange={(event) =>
                  handlePollOptionChange(index, event.target.value)
                }
                placeholder={`Option ${index + 1}`}
                inputProps={{ maxLength: 30 }}
                helperText={`${option.length}/30`}
                FormHelperTextProps={{
                  sx: {
                    m: 0,
                    mt: 0.2,
                    mr: 0.5,
                    textAlign: "right",
                    color: C.textMuted,
                    fontSize: "0.68rem",
                  },
                }}
                InputProps={{
                  endAdornment:
                    index >= 2 ? (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={`Remove option ${index + 1}`}
                          size="small"
                          onClick={() => handleRemovePollOption(index)}
                          sx={{ color: C.textMuted }}
                        >
                          <CloseRoundedIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : undefined,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "#fff",
                    "& fieldset": { borderColor: C.divider },
                  },
                }}
              />
            ))}
            {pollOptions.length < 10 && (
              <Button
                startIcon={<AddRoundedIcon />}
                onClick={handleAddPollOption}
                sx={{
                  alignSelf: "flex-start",
                  color: C.accentDark,
                  textTransform: "none",
                  fontWeight: 700,
                  px: 0.5,
                }}
              >
                Add option
              </Button>
            )}
            <TextField
              select
              size="small"
              label="Poll duration"
              value={pollDurationDays}
              onChange={(event) =>
                setPollDurationDays(Number(event.target.value))
              }
              SelectProps={{ native: true }}
              InputLabelProps={{ shrink: true }}
              sx={{
                maxWidth: 240,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "& fieldset": { borderColor: C.divider },
                },
              }}
            >
              <option value={1}>1 day</option>
              <option value={3}>3 days</option>
              <option value={7}>1 week</option>
              <option value={14}>2 weeks</option>
            </TextField>
            <FormControlLabel
              control={
                <Switch
                  checked={pollAllowsMultiple}
                  onChange={(event) =>
                    setPollAllowsMultiple(event.target.checked)
                  }
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: C.accent },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      bgcolor: C.accent,
                    },
                  }}
                />
              }
              label="Allow people to select multiple options in this poll"
              sx={{
                mt: 0.25,
                "& .MuiFormControlLabel-label": {
                  color: C.textSub,
                  fontSize: "0.78rem",
                },
              }}
            />
          </Stack>
        )}

        {(mode === "image" || mode === "video") && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              mt: 1.5,
              px: 1.5,
              py: 1,
              borderRadius: 2,
              bgcolor: "#fff",
              border: `1px solid ${C.divider}`,
            }}
          >
            <Typography sx={{ color: C.textSub, fontSize: "0.8rem" }}>
              {file
                ? file.name
                : `Choose ${
                    mode === "image" ? "an image" : "a video"
                  } from your device${mode === "video" ? " · max 50 MB" : ""}`}
            </Typography>
            <Button
              size="small"
              variant="text"
              disabled={submitting}
              onClick={() => handleMediaPicker(mode)}
              sx={{
                color: C.accentDark,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              {file ? "Change" : "Browse"}
            </Button>
          </Box>
        )}

        {mode === "emoji" && (
          <Box
            sx={{
              mt: 1,
              p: 0.6,
              display: "flex",
              flexWrap: "wrap",
              gap: 0.25,
              width: "min(100%, 460px)",
              maxHeight: 142,
              overflowY: "auto",
              border: `1px solid ${C.divider}`,
              borderRadius: 2,
              bgcolor: "#fff",
            }}
          >
            {COMPOSER_EMOJIS.map((emoji) => (
              <IconButton
                key={emoji}
                aria-label={`Add ${emoji}`}
                onClick={() => handleEmojiSelect(emoji)}
                size="small"
                sx={{
                  fontSize: "1.2rem",
                  opacity: 1,
                  filter: "none",
                  color: "initial",
                  fontFamily:
                    '"Apple Color Emoji", "Segoe UI Emoji", sans-serif',
                }}
              >
                {emoji}
              </IconButton>
            ))}
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 1.25, py: 0 }}>
            {error}
          </Alert>
        )}

        {submitting && (mode === "image" || mode === "video") && (
          <Alert
            severity="info"
            role="status"
            aria-live="polite"
            sx={{ mt: 1.25, py: 0 }}
          >
            Please wait while we upload your {mode}
            {uploadProgress > 0 ? ` · ${uploadProgress}%` : "…"}
          </Alert>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mt: 1.4,
            pt: 1.1,
            borderTop: `1px solid ${C.divider}`,
          }}
        >
          <Stack direction="row" spacing={0.35}>
            <Tooltip title="Add emoji">
              <IconButton
                aria-label="Add emoji"
                onClick={handleEmojiPickerToggle}
                sx={{
                  color: mode === "emoji" ? C.accentDark : C.textSub,
                  bgcolor: mode === "emoji" ? C.accentFaint : "transparent",
                }}
              >
                <EmojiEmotionsOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Add image">
              <IconButton
                aria-label="Add image"
                onClick={() => handleMediaPicker("image")}
                sx={{
                  color: mode === "image" ? C.accentDark : C.textSub,
                  bgcolor: mode === "image" ? C.accentFaint : "transparent",
                }}
              >
                <ImageOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Add video">
              <IconButton
                aria-label="Add video"
                onClick={() => handleMediaPicker("video")}
                sx={{
                  color: mode === "video" ? C.accentDark : C.textSub,
                  bgcolor: mode === "video" ? C.accentFaint : "transparent",
                }}
              >
                <VideocamOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Create poll">
              <IconButton
                aria-label="Create poll"
                onClick={() => handleModeChange("poll")}
                sx={{
                  color: mode === "poll" ? C.accentDark : C.textSub,
                  bgcolor: mode === "poll" ? C.accentFaint : "transparent",
                }}
              >
                <PollOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          <Button
            variant="contained"
            endIcon={!submitting ? <SendRoundedIcon /> : undefined}
            onClick={handleShare}
            disabled={!canSubmit || submitting}
            sx={{
              minWidth: 104,
              px: 2.4,
              borderRadius: 5,
              bgcolor: C.accent,
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
              "&:hover": { bgcolor: C.accentDark, boxShadow: "none" },
            }}
          >
            {submitting ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : (
              "Post"
            )}
          </Button>
        </Box>
      </Box>
      <input
        ref={imageInputRef}
        hidden
        type="file"
        accept="image/*"
        onChange={(event) =>
          handleMediaSelected("image", event.target.files?.[0] ?? null)
        }
      />
      <input
        ref={videoInputRef}
        hidden
        type="file"
        accept="video/*"
        onChange={(event) =>
          handleMediaSelected("video", event.target.files?.[0] ?? null)
        }
      />
    </Card>
  );
};
// T: O(p) and S: O(p), where p is the number of poll options

export default Composer;
