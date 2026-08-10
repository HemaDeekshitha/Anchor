"use client";

import React, { useRef, useState } from "react";
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
  Avatar,
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
  const validPollOptions = pollOptions.filter((option) => option.trim());
  const canSubmit =
    (scope === "global" || Boolean(communityId)) &&
    (mode === "image" || mode === "video"
      ? Boolean(file)
      : Boolean(content.trim())) &&
    (mode !== "poll" || validPollOptions.length >= 2) &&
    (mode === "poll" ? Boolean(content.trim()) : true);

  const handleModeChange = (nextMode: ComposerMode) => {
    setMode((current) => {
      const toggledOff = current === nextMode;
      if (toggledOff || nextMode !== current) setFile(null);
      return toggledOff ? "text" : nextMode;
    });
  };
  // T: O(1) and S: O(1)

  const handleMediaPicker = (resourceType: "image" | "video") => {
    setMode(resourceType);
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

  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 3,
        background: C.cardBg,
        border: `1px solid ${C.divider}`,
        boxShadow: "0 4px 20px rgba(44,26,10,0.06)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        <Avatar
          sx={{
            width: 38,
            height: 38,
            bgcolor: C.accentFaint,
            color: C.accentDark,
            fontSize: "0.9rem",
          }}
        >
          M
        </Avatar>

        <TextField
          fullWidth
          multiline
          minRows={1}
          maxRows={8}
          value={content}
          disabled={submitting}
          onChange={(event) => setContent(event.target.value)}
          inputProps={{ maxLength: mode === "poll" ? 150 : 10_000 }}
          helperText={mode === "poll" ? `${content.length}/150` : ""}
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
            mode === "poll"
              ? "What is the question?"
              : "Share something today..."
          }
          variant="standard"
          InputProps={{ disableUnderline: true }}
          sx={{
            "& .MuiInputBase-root": {
              alignItems: "flex-start",
              color: C.textPrimary,
              fontSize: "0.9rem",
              lineHeight: 1.5,
              bgcolor: C.surface,
              border: `1px solid ${C.divider}`,
              borderRadius: 2,
              px: 2,
              py: 1.2,
            },
            "& .MuiInputBase-root.Mui-focused": {
              borderColor: C.accent,
            },
            "& textarea::placeholder, & input::placeholder": {
              color: C.textMuted,
              opacity: 1,
            },
          }}
        />

        <Box
          onClick={handleShare}
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: canSubmit ? C.accentGrad : C.divider,
            color: "#fff",
            flexShrink: 0,
            cursor: canSubmit && !submitting ? "pointer" : "default",
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? (
            <CircularProgress size={16} sx={{ color: "#fff" }} />
          ) : (
            <SendRoundedIcon sx={{ fontSize: 18 }} />
          )}
        </Box>
      </Box>

      <Stack
        direction="row"
        spacing={1}
        sx={{ mt: 2, flexWrap: "wrap", rowGap: 1 }}
      >
        {[
          {
            label: "Image",
            key: "image" as ComposerMode,
            icon: <ImageOutlinedIcon sx={{ fontSize: 16 }} />,
            onClick: () => handleMediaPicker("image"),
          },
          {
            label: "Video",
            key: "video" as ComposerMode,
            icon: <VideocamOutlinedIcon sx={{ fontSize: 16 }} />,
            onClick: () => handleMediaPicker("video"),
          },
          {
            label: "Poll",
            key: "poll" as ComposerMode,
            icon: <PollOutlinedIcon sx={{ fontSize: 16 }} />,
            onClick: () => handleModeChange("poll"),
          },
          {
            label: "Emoji",
            key: "emoji" as ComposerMode,
            icon: <EmojiEmotionsOutlinedIcon sx={{ fontSize: 16 }} />,
            onClick: () => handleModeChange("emoji"),
          },
        ].map((item) => (
          <Box
            key={item.label}
            onClick={item.onClick}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.6,
              px: 1.5,
              py: 0.6,
              borderRadius: 2,
              border: `1px solid ${mode === item.key ? C.accent : C.divider}`,
              color: mode === item.key ? C.accentDark : C.textSub,
              bgcolor: mode === item.key ? C.accentFaint : "transparent",
              fontSize: "0.8rem",
              cursor: "pointer",
              "&:hover": { background: C.accentHover, color: C.accentDark },
            }}
          >
            {item.icon}
            {item.label}
          </Box>
        ))}
      </Stack>

      {mode === "poll" && (
        <Stack spacing={1.15} sx={{ mt: 2, maxWidth: 680 }}>
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
            mt: 2,
            px: 1.5,
            py: 1,
            borderRadius: 2,
            bgcolor: C.surface,
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
            sx={{ color: C.accentDark, textTransform: "none", fontWeight: 700 }}
          >
            {file ? "Change" : "Browse"}
          </Button>
        </Box>
      )}

      {mode === "emoji" && (
        <Box
          sx={{
            mt: 2,
            p: 0.6,
            display: "flex",
            flexWrap: "wrap",
            gap: 0.25,
            maxHeight: 142,
            overflowY: "auto",
            border: `1px solid ${C.divider}`,
            borderRadius: 2,
            bgcolor: C.surface,
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
                fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", sans-serif',
              }}
            >
              {emoji}
            </IconButton>
          ))}
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 1.5, py: 0 }}>
          {error}
        </Alert>
      )}

      {submitting && (mode === "image" || mode === "video") && (
        <Alert
          severity="info"
          role="status"
          aria-live="polite"
          sx={{ mt: 1.5, py: 0 }}
        >
          Please wait while we upload your {mode}
          {uploadProgress > 0 ? ` · ${uploadProgress}%` : "…"}
        </Alert>
      )}

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
