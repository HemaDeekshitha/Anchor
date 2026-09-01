"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import InputBase from "@mui/material/InputBase";
import { apiFetch } from "@/lib/auth-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// ── Design tokens ──────────────────────────────────────────────────────────────
const T = {
  border: "#e8ddd0",
  chipBg: "#fdfaf7",
  chipHover: "#f5ede0",
  leftBg: "#f5ede0",
  accent: "#b87444",
  accentDark: "#a0622e",
  text: "#2c1a0a",
  subtext: "#8c6a50",
  muted: "#b8a090",
  white: "#ffffff",
  pageBg: "#ede8e0",
};

type OnboardingRole = {
  id: string;
  title: string;
  subtitle: string;
  options: string[];
  isUpload?: boolean;
  isInterest?: boolean;
  customHeader?: string;
  singleSelect?: boolean;
};

// ── AI loading steps ───────────────────────────────────────────────────────────
const AI_LOADING_STEPS = [
  { emoji: "📄", text: "Reading your resume…" },
  { emoji: "🔍", text: "Identifying your skills…" },
  { emoji: "📊", text: "Analysing your goals…" },
  { emoji: "🧠", text: "Building your personalised plan…" },
  { emoji: "✨", text: "Running AI analysis…" },
  { emoji: "✅", text: "AI analysis complete!" },
];

// ── AI Loading Overlay ─────────────────────────────────────────────────────────
function AILoadingOverlay({
  onDone,
  fetchPromise,
}: {
  onDone: () => void;
  fetchPromise: Promise<void>;
}) {
  const [step, setStep] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const [animDone, setAnimDone] = React.useState(false);
  const [fetchDone, setFetchDone] = React.useState(false);
  const calledDone = React.useRef(false);

  React.useEffect(() => {
    fetchPromise.then(() => setFetchDone(true)).catch(() => setFetchDone(true));
  }, [fetchPromise]);

  React.useEffect(() => {
    if (animDone && fetchDone && !calledDone.current) {
      calledDone.current = true;
      setTimeout(onDone, 500);
    }
  }, [animDone, fetchDone, onDone]);

  React.useEffect(() => {
    const STEP_MS = 1600;
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current >= AI_LOADING_STEPS.length) {
        clearInterval(interval);
        setAnimDone(true);
        return;
      }
      setStep(current);
    }, STEP_MS);
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90 && !fetchDone) return p;
        return Math.min(p + 1, 100);
      });
    }, (STEP_MS * AI_LOADING_STEPS.length) / 100);
    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = AI_LOADING_STEPS[step];
  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: T.chipHover,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2.5rem",
        px: 2,
      }}
    >
      <Box
        sx={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "4px solid transparent",
            borderTopColor: T.accent,
            animation: "spin 1s linear infinite",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 12,
            borderRadius: "50%",
            border: "3px solid transparent",
            borderBottomColor: T.accentDark,
            animation: "spin 1.4s linear infinite reverse",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 26,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(184,116,68,0.15), transparent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
          }}
        >
          {current.emoji}
        </Box>
      </Box>
      <Box sx={{ textAlign: "center" }}>
        <Typography
          sx={{
            color: T.text,
            fontSize: { xs: "1rem", sm: "1.25rem" },
            fontWeight: 600,
            fontFamily: "'Playfair Display', serif",
          }}
        >
          {current.text}
        </Typography>
        <Typography
          sx={{
            color: T.subtext,
            fontSize: "0.85rem",
            mt: "0.5rem",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Please wait while we set everything up for you
        </Typography>
      </Box>
      <Box
        sx={{
          width: "min(280px, 80vw)",
          height: 6,
          background: T.border,
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: `${progress}%`,
            background: `linear-gradient(to right, ${T.accent}, ${T.accentDark})`,
            borderRadius: 999,
            transition: "width 0.3s ease",
          }}
        />
      </Box>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Box>
  );
}

// ── Field label ────────────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      component="label"
      sx={{
        display: "block",
        fontFamily: "Inter, sans-serif",
        fontSize: "0.72rem",
        fontWeight: 600,
        letterSpacing: "0.12em",
        color: T.muted,
        textTransform: "uppercase",
      }}
    >
      {children}
    </Typography>
  );
}

// ── Option chip ────────────────────────────────────────────────────────────────
function Chip({
  label,
  selected,
  onClick,
  index,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  index: number;
}) {
  const [title, detail] = label.split(' — ');
  return (
    <Button
      onClick={onClick}
      disableRipple
      sx={{
        width: "100%",
        minHeight: { xs: 76, sm: 88 },
        p: { xs: "1rem", sm: "1.1rem 1.25rem" },
        background: selected
          ? "linear-gradient(135deg, #f8eee5, #fdfaf7)"
          : "linear-gradient(145deg, #ffffff, #fdfbf8)",
        border: selected ? `2px solid ${T.accent}` : `1px solid ${T.border}`,
        borderRadius: "16px",
        fontFamily: "Inter, sans-serif",
        fontSize: { xs: "0.88rem", sm: "0.95rem" },
        color: T.text,
        fontWeight: selected ? 650 : 500,
        textAlign: "left",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 1.5,
        boxShadow: selected
          ? "0 8px 22px rgba(184,116,68,0.14)"
          : "0 5px 16px rgba(44,26,10,0.035)",
        textTransform: "none",
        lineHeight: 1.4,
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: T.chipHover,
          borderColor: T.accent,
          transform: "translateY(-2px)",
          boxShadow: "0 10px 24px rgba(44,26,10,0.08)",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.35, minWidth: 0 }}>
        <Box sx={{
          width: 34, height: 34, flexShrink: 0, borderRadius: "10px",
          display: "grid", placeItems: "center",
          bgcolor: selected ? T.accent : "#f4ebe2",
          color: selected ? "#fff" : T.accentDark,
          fontSize: 11, fontWeight: 800, letterSpacing: ".04em",
        }}>
          {String(index + 1).padStart(2, "0")}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: { xs: 14, sm: 15 }, fontWeight: 650, color: selected ? T.accentDark : T.text, lineHeight: 1.35 }}>
            {title}
          </Typography>
          {detail && (
            <Typography sx={{ fontSize: 12, color: T.subtext, mt: 0.25, lineHeight: 1.35 }}>
              {detail}
            </Typography>
          )}
        </Box>
      </Box>
      <Box sx={{
        width: 23, height: 23, flexShrink: 0, borderRadius: "50%",
        border: selected ? `1px solid ${T.accent}` : `1px solid ${T.border}`,
        bgcolor: selected ? T.accent : "#fff", color: "#fff",
        display: "grid", placeItems: "center", fontSize: 13, fontWeight: 800,
      }}>
        {selected ? "✓" : ""}
      </Box>
    </Button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function Steps() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeIndex, setActiveIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [customInterest, setCustomInterest] = useState<Record<string, string>>(
    {}
  );
  const [roles, setRoles] = useState<OnboardingRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>("");
  const [location, setLocation] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [showAILoading, setShowAILoading] = useState(false);
  const [fetchPromise, setFetchPromise] = useState<Promise<void> | null>(null);

  useEffect(() => {
    const stepParam = searchParams.get("step");
    const newIndex = stepParam ? parseInt(stepParam) : 0;
    if (newIndex >= 0 && newIndex < roles.length) setActiveIndex(newIndex);
  }, [searchParams, roles.length]);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch(`${API_BASE_URL}/onboarding/steps`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setRoles(data.steps);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const activeRole = roles[activeIndex];

  if (loading || !activeRole) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontFamily: "Inter, sans-serif",
          fontSize: 14,
          color: T.subtext,
          background: T.pageBg,
        }}
      >
        Loading onboarding…
      </Box>
    );
  }

  const toggleSelection = (option: string) => {
    const id = activeRole.id;
    setSelections((prev) => {
      if (activeRole.singleSelect) return { ...prev, [id]: [option] };
      const cur = prev[id] || [];
      return {
        ...prev,
        [id]: cur.includes(option)
          ? cur.filter((i) => i !== option)
          : [...cur, option],
      };
    });
  };

  const updateStepInUrl = (index: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", index.toString());
    router.push(`?${params.toString()}`);
  };

  const handleNext = () => {
    if (activeIndex < roles.length - 1) updateStepInUrl(activeIndex + 1);
    else submitHandler();
  };
  const handleBack = () => {
    if (activeIndex > 0) updateStepInUrl(activeIndex - 1);
  };

  const submitHandler = (): Promise<void> => {
    if (!resumeFile && !resumeText.trim()) {
      setResumeError("Please upload a resume or paste resume text.");
      return Promise.resolve();
    }
    const formData = new FormData();
    if (resumeFile) formData.append("resume", resumeFile);
    if (resumeText.trim()) formData.append("resumeText", resumeText.trim());
    if (profilePhoto) formData.append("profilePhoto", profilePhoto);
    if (location.trim()) formData.append("location", location.trim());
    if (yearsOfExperience)
      formData.append("yearsOfExperience", yearsOfExperience);
    const merged: Record<string, string[]> = { ...selections };
    Object.entries(customInterest).forEach(([roleId, value]) => {
      if (!value.trim()) return;
      merged[roleId] = [...(merged[roleId] || []), value.trim()];
    });
    formData.append("answers", JSON.stringify(merged));
    return apiFetch(`${API_BASE_URL}/onboarding/answers`, {
      method: "POST",
      body: formData,
    })
      .then(async (res) => {
        if (!res.ok) {
          const payload = (await res.json().catch(() => null)) as
            | { message?: string | string[] }
            | null;
          const message = Array.isArray(payload?.message)
            ? payload.message.join(" ")
            : payload?.message;
          throw new Error(message || "Submission failed");
        }
      })
      .catch((err) => {
        console.error(err);
        setResumeError(
          err instanceof Error
            ? err.message
            : "Please upload a valid resume.",
        );
      });
  };

  const pillBtnBase = {
    fontFamily: "Inter, sans-serif",
    fontWeight: 600,
    fontSize: { xs: "0.72rem", sm: "0.78rem" },
    letterSpacing: "0.08em",
    borderRadius: "100px",
    px: { xs: "1.6rem", sm: "2.4rem" },
    py: "0.85rem",
    textTransform: "none" as const,
    backgroundColor: T.accent,
    color: T.white,
    border: "none",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    transition: "transform 0.2s, background-color 0.2s",
  };

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <Box
        sx={{
          position: "fixed",
          inset: 0,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          overflow: "hidden",
          bgcolor: T.pageBg,
          zIndex: 9999,
        }}
      >
        {/* ════════════════════════════════════════════════════════════════════
            SIDEBAR
            • md+  : fixed 280px left column, full height, vertical scroll if needed
            • sm    : full width top strip, horizontal scroll, fixed height ~auto
            • xs    : same as sm but tighter
        ════════════════════════════════════════════════════════════════════ */}
        <Box
          component="nav"
          sx={{
            width: { xs: "100%", md: "35%" },
            minWidth: { md: "35%" },
            height: { xs: "auto", md: "100%" },
            flexShrink: 0,

            // Colours & border
            bgcolor: T.leftBg,
            borderRight: { xs: "none", md: `1px solid ${T.border}` },
            borderBottom: { xs: `1px solid ${T.border}`, md: "none" },

            // Layout
            display: "flex",
            flexDirection: { xs: "row", md: "column" },
            alignItems: "center",
            justifyContent: { xs: "center", md: "flex-start" },
            px: { xs: 2, sm: 3, md: "40px", lg: "56px" },

            py: { xs: "10px", md: "60px" },
            gap: { xs: "6px", md: 0 },

            // Scroll
            overflowX: { xs: "auto", md: "hidden" },
            overflowY: { xs: "hidden", md: "auto" },
          }}
        >
          {/* Logo — desktop only */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: "10px",
              mb: "32px",
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                bgcolor: T.accent,
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <rect
                  x="3"
                  y="13"
                  width="14"
                  height="2.5"
                  rx="1.2"
                  fill="white"
                />
                <rect
                  x="3"
                  y="8.5"
                  width="14"
                  height="2.5"
                  rx="1.2"
                  fill="white"
                  opacity="0.7"
                />
                <rect
                  x="3"
                  y="4"
                  width="14"
                  height="2.5"
                  rx="1.2"
                  fill="white"
                  opacity="0.4"
                />
              </svg>
            </Box>
            <Typography
              sx={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "32px",
                color: T.text,
                fontWeight: 400,
                lineHeight: 1,
              }}
            >
              Anchor
            </Typography>
          </Box>

          {/* Section label + desc — desktop only */}
          <Typography
            sx={{
              display: { xs: "none", md: "block" },
              fontFamily: "Inter, sans-serif",
              fontSize: "0.72rem",
              fontWeight: 600,
              letterSpacing: "0.14em",
              color: T.muted,
              textTransform: "uppercase",
              mb: "8px",
            }}
          >
            Getting Started
          </Typography>
          <Typography
            sx={{
              display: { xs: "none", md: "block" },
              fontFamily: "Inter, sans-serif",
              fontSize: "0.8rem",
              color: T.subtext,
              mb: "20px",
              lineHeight: 1.5,
            }}
          >
            Tell us a bit about yourself so we can personalise your experience.
          </Typography>

          {/* Step items */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "row", md: "column" },
              gap: { xs: "4px", md: "8px" },
              width: { xs: "auto", md: "100%" },
              alignItems: { xs: "center", md: "stretch" },
            }}
          >
            {roles.map((role, index) => {
              const isActive = index === activeIndex;
              const isDone = index < activeIndex;
              return (
                <Box
                  key={role.id}
                  onClick={() => updateStepInUrl(index)}
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    alignItems: "center",
                    gap: { xs: "3px", md: "12px" },
                    px: { xs: "8px", md: "12px" },
                    py: { xs: "6px", md: "10px" },
                    borderRadius: { xs: "8px", md: "12px" },
                    cursor: "pointer",
                    minWidth: { xs: "52px", md: "auto" },
                    bgcolor: isActive ? T.white : "transparent",
                    border: isActive
                      ? `1px solid ${T.border}`
                      : "1px solid transparent",
                    transition: "background 0.2s",
                    flexShrink: 0,
                  }}
                >
                  {/* Number / checkmark bubble */}
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      bgcolor: isActive || isDone ? T.accent : T.border,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: isActive || isDone ? T.white : T.subtext,
                      flexShrink: 0,
                      fontFamily: "Inter, sans-serif",
                      transition: "background 0.2s",
                    }}
                  >
                    {isDone ? (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="white"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="2 6 5 9 10 3" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </Box>

                  {/* Label */}
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: { xs: "9px", md: "13px" },
                      color: isActive ? T.text : T.subtext,
                      fontWeight: isActive ? 600 : 400,
                      lineHeight: 1.3,
                      textAlign: { xs: "center", md: "left" },
                      whiteSpace: { xs: "normal", md: "nowrap" },
                      transition: "color 0.2s",
                    }}
                  >
                    {role.title}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* ════════════════════════════════════════════════════════════════════
            RIGHT PANEL
            Fills remaining space. Scrollable content + sticky footer.
        ════════════════════════════════════════════════════════════════════ */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0, // prevents flex child from overflowing
            display: "flex",
            flexDirection: "column",
            bgcolor: T.white,
            overflow: "hidden", // children control their own scroll
          }}
        >
          {/* Scrollable area */}
          <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRole.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                <Box
                  sx={{
                    px: { xs: "20px", sm: "40px", md: "64px", lg: "80px" },
                    pt: { xs: "28px", sm: "48px", md: "64px" },
                    pb: "32px",
                    maxWidth: "860px", // readable line length on ultrawide
                  }}
                >
                  {/* ── Header ── */}
                  <Typography
                    variant="h2"
                    sx={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.8rem" },
                      fontWeight: 700,
                      color: T.text,
                      m: 0,
                      mb: "6px",
                      lineHeight: 1.15,
                    }}
                  >
                    {activeRole.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                      color: T.subtext,
                      m: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {activeRole.subtitle}
                  </Typography>

                  {/* Divider */}
                  <Box
                    sx={{
                      width: "100%",
                      height: "1px",
                      bgcolor: T.border,
                      my: { xs: "20px", sm: "28px" },
                    }}
                  />

                  {/* ── Form body ── */}
                  {activeRole.isUpload ? (
                    /* ══ UPLOAD STEP ══════════════════════════════════════════ */
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: { xs: "20px", sm: "28px" },
                      }}
                    >
                      {/* Top row: photo | location + yoe */}
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", sm: "140px 1fr" },
                          gap: { xs: "20px", sm: "32px" },
                          alignItems: "start",
                        }}
                      >
                        {/* Photo */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <FieldLabel>Profile Photo</FieldLabel>
                          <Box
                            component="label"
                            sx={{
                              display: "inline-flex",
                              cursor: "pointer",
                              width: "fit-content",
                            }}
                          >
                            <Box
                              sx={{
                                width: { xs: 110, sm: 130 },
                                height: { xs: 110, sm: 130 },
                                borderRadius: "50%",
                                border: `2px dashed ${T.border}`,
                                bgcolor: T.chipHover,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                                transition: "border-color 0.2s",
                                "&:hover": { borderColor: T.accent },
                              }}
                            >
                              {profilePhotoPreview ? (
                                <Box
                                  component="img"
                                  src={profilePhotoPreview}
                                  alt="Profile"
                                  sx={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: "4px",
                                    px: 1,
                                  }}
                                >
                                  <span style={{ fontSize: "1.5rem" }}>📷</span>
                                  <Typography
                                    sx={{
                                      fontSize: "0.75rem",
                                      color: T.subtext,
                                      textAlign: "center",
                                      lineHeight: 1.2,
                                    }}
                                  >
                                    Upload photo
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                            <input
                              type="file"
                              hidden
                              accept="image/*"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (!f) return;
                                setProfilePhoto(f);
                                setProfilePhotoPreview(URL.createObjectURL(f));
                              }}
                            />
                          </Box>
                        </Box>

                        {/* Location + YOE */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "20px",
                          }}
                        >
                          {/* Location */}
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                            }}
                          >
                            <FieldLabel>Location</FieldLabel>
                            <InputBase
                              placeholder="e.g. San Francisco, CA"
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              sx={{
                                width: "100%",
                                maxWidth: { sm: "320px" },
                                px: "1.1rem",
                                py: "0.85rem",
                                bgcolor: T.chipBg,
                                border: `1.5px solid ${T.border}`,
                                borderRadius: "12px",
                                fontFamily: "Inter, sans-serif",
                                fontSize: { xs: "0.9rem", sm: "0.95rem" },
                                color: T.text,
                                "& input::placeholder": { color: T.muted },
                                "&.Mui-focused": { borderColor: T.accent },
                                transition: "border-color 0.2s",
                              }}
                            />
                          </Box>

                          {/* YOE chips */}
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                            }}
                          >
                            <FieldLabel>Years of Experience</FieldLabel>
                            <Box
                              sx={{
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap",
                              }}
                            >
                              {["0–1 yrs", "1–3 yrs", "3–5 yrs", "5+ yrs"].map(
                                (opt) => {
                                  const sel = yearsOfExperience === opt;
                                  return (
                                    <Button
                                      key={opt}
                                      onClick={() => setYearsOfExperience(opt)}
                                      disableRipple
                                      sx={{
                                        flex: "1 1 auto",
                                        minWidth: 0,
                                        py: "0.65rem",
                                        px: "0.5rem",
                                        bgcolor: sel
                                          ? "rgba(184,116,68,0.06)"
                                          : T.chipBg,
                                        border: sel
                                          ? `2px solid ${T.accent}`
                                          : `1.5px solid ${T.border}`,
                                        borderRadius: "12px",
                                        fontFamily: "Inter, sans-serif",
                                        fontSize: {
                                          xs: "0.8rem",
                                          sm: "0.85rem",
                                        },
                                        color: sel ? T.accent : T.text,
                                        fontWeight: sel ? 600 : 400,
                                        textTransform: "none",
                                        boxShadow: sel
                                          ? "0 2px 12px rgba(184,116,68,0.15)"
                                          : "none",
                                        transition:
                                          "border-color 0.18s, background-color 0.18s",
                                        "&:hover": {
                                          bgcolor: T.chipHover,
                                          borderColor: T.accent,
                                        },
                                      }}
                                    >
                                      {opt}
                                    </Button>
                                  );
                                }
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </Box>

                      {/* Resume upload */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <FieldLabel>Resume</FieldLabel>
                        <Box
                          component="label"
                          sx={{
                            display: "block",
                            width: "100%",
                            cursor: "pointer",
                          }}
                        >
                          <Box
                            sx={{
                              width: "100%",
                              py: { xs: "1.2rem", sm: "1.5rem" },
                              border: `1.5px dashed ${T.border}`,
                              borderRadius: "16px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: T.chipHover,
                              transition:
                                "border-color 0.2s, background-color 0.2s",
                              "&:hover": {
                                borderColor: T.accent,
                                bgcolor: "#ecddc8",
                              },
                            }}
                          >
                            {resumeFile ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  width: "100%",
                                  px: { xs: "1rem", sm: "2rem" },
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    minWidth: 0,
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: "1.6rem",
                                      flexShrink: 0,
                                    }}
                                  >
                                    📄
                                  </span>
                                  <Typography
                                    sx={{
                                      fontWeight: 500,
                                      color: T.text,
                                      fontSize: { xs: "13px", sm: "15px" },
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {resumeFile.name}
                                  </Typography>
                                </Box>
                                <Box
                                  component="button"
                                  onClick={(e: React.MouseEvent) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setResumeFile(null);
                                  }}
                                  sx={{
                                    background: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "1.1rem",
                                    color: T.subtext,
                                    p: "6px",
                                    flexShrink: 0,
                                  }}
                                >
                                  ✕
                                </Box>
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: "8px",
                                  textAlign: "center",
                                  px: 2,
                                }}
                              >
                                <Typography sx={{ fontSize: "2rem" }}>
                                  📄
                                </Typography>
                                <Typography
                                  sx={{
                                    fontWeight: 500,
                                    color: T.text,
                                    fontSize: { xs: "14px", sm: "15px" },
                                    m: 0,
                                  }}
                                >
                                  Click to Upload or Drag & Drop
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: "0.82rem",
                                    color: T.subtext,
                                    m: 0,
                                  }}
                                >
                                  PDF or DOCX resume, up to 10MB
                                </Typography>
                              </Box>
                            )}
                            <input
                              type="file"
                              hidden
                              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const extension = file.name
                                    .split(".")
                                    .pop()
                                    ?.toLowerCase();
                                  if (
                                    !["pdf", "docx"].includes(extension ?? "") ||
                                    file.size > 10_000_000
                                  ) {
                                    setResumeFile(null);
                                    setResumeError(
                                      "Please upload only a PDF or DOCX resume smaller than 10 MB.",
                                    );
                                  } else {
                                    setResumeFile(file);
                                    setResumeError("");
                                  }
                                }
                                // Allow selecting the same file again after removal.
                                e.currentTarget.value = "";
                              }}
                            />
                          </Box>
                        </Box>
                      </Box>

                      {resumeError && (
                        <Typography
                          role="alert"
                          sx={{ color: "#b42318", fontSize: "0.82rem" }}
                        >
                          {resumeError}
                        </Typography>
                      )}

                      {/* Paste text */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <FieldLabel>Or Paste Text</FieldLabel>
                        <Box
                          component="textarea"
                          placeholder="Paste your resume content here..."
                          value={resumeText}
                          onChange={(
                            e: React.ChangeEvent<HTMLTextAreaElement>
                          ) => setResumeText(e.target.value)}
                          sx={{
                            width: "100%",
                            minHeight: { xs: "120px", sm: "160px" },
                            boxSizing: "border-box",
                            p: "1rem 1.2rem",
                            bgcolor: T.chipBg,
                            border: `1.5px solid ${T.border}`,
                            borderRadius: "14px",
                            fontFamily: "Inter, sans-serif",
                            fontSize: { xs: "0.9rem", sm: "0.95rem" },
                            color: T.text,
                            resize: "vertical",
                            outline: "none",
                            lineHeight: 1.6,
                            transition: "border-color 0.2s",
                            "&::placeholder": { color: T.muted },
                            "&:focus": { borderColor: T.accent },
                          }}
                        />
                      </Box>
                    </Box>
                  ) : (
                    /* ══ SELECTION STEP ════════════════════════════════════════ */
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "clamp(12px,1vw,24px)",
                      }}
                    >
                      <FieldLabel>Select Options</FieldLabel>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            md: activeRole.id === "learning-plan"
                              ? "repeat(3, minmax(0, 1fr))"
                              : "repeat(2, minmax(0, 1fr))",
                          },
                          gap: "12px",
                        }}
                      >
                        {activeRole.options.map((option, index) => (
                          <Chip
                            key={option}
                            label={option}
                            selected={(
                              selections[activeRole.id] || []
                            ).includes(option)}
                            onClick={() => toggleSelection(option)}
                            index={index}
                          />
                        ))}
                      </Box>
                      {(activeRole as any).isInterest && (
                        <InputBase
                          placeholder="Other (type to add…)"
                          value={customInterest[activeRole.id] || ""}
                          onChange={(e) =>
                            setCustomInterest((prev) => ({
                              ...prev,
                              [activeRole.id]: e.target.value,
                            }))
                          }
                          sx={{
                            width: "100%",
                            px: "1.4rem",
                            py: "0.9rem",
                            bgcolor: T.chipBg,
                            border: customInterest[activeRole.id]
                              ? `2px solid ${T.accent}`
                              : `1.5px dashed ${T.border}`,
                            borderRadius: "12px",
                            fontSize: { xs: "0.88rem", sm: "0.95rem" },
                            color: T.text,
                            fontFamily: "Inter, sans-serif",
                            transition:
                              "border-color 0.2s, background-color 0.2s",
                            "& input::placeholder": { color: T.muted },
                            "&.Mui-focused": {
                              borderColor: T.accent,
                              bgcolor: T.chipHover,
                            },
                          }}
                        />
                      )}
                    </Box>
                  )}
                </Box>
              </motion.div>
            </AnimatePresence>
          </Box>

          {/* ── Sticky footer ─────────────────────────────────────────────── */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: { xs: "20px", sm: "40px", md: "64px", lg: "80px" },
              py: { xs: "14px", sm: "20px" },
              borderTop: `1px solid ${T.border}`,
              bgcolor: T.white,
              flexShrink: 0,
            }}
          >
            <Button
              onClick={handleBack}
              disableRipple
              sx={{
                ...pillBtnBase,
                visibility: activeIndex === 0 ? "hidden" : "visible",
                "&:hover": { bgcolor: T.text },
              }}
            >
              ← BACK
            </Button>

            <Button
              disabled={
                activeRole.isUpload
                  ? !resumeFile && !resumeText.trim()
                  : (selections[activeRole.id] || []).length === 0 &&
                    !customInterest[activeRole.id]?.trim()
              }
              onClick={() => {
                if (activeIndex === roles.length - 1) {
                  const promise = submitHandler();
                  setFetchPromise(promise);
                  setShowAILoading(true);
                } else {
                  handleNext();
                }
              }}
              disableRipple
              sx={{
                ...pillBtnBase,
                "&:hover": {
                  bgcolor: T.accentDark,
                  transform: "translateY(-2px)",
                },
              }}
            >
              {activeIndex === roles.length - 1 ? "FINISH" : "CONTINUE"} →
            </Button>
          </Box>
        </Box>
      </Box>

      {showAILoading && fetchPromise && (
        <AILoadingOverlay
          fetchPromise={fetchPromise}
          onDone={() => router.push("/dashboard")}
        />
      )}
    </>
  );
}
