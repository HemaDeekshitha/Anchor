"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./onboarding.module.css";
import { useRouter, useSearchParams } from "next/navigation";

type OnboardingRole = {
  id: string;
  title: string;
  subtitle: string;
  options: string[];
  isUpload?: boolean;
  isInterest?: boolean;
  customHeader?: string;
};

// ── AI loading steps ─────────────────────────────────────────────────────────
const AI_LOADING_STEPS = [
  { emoji: "📄", text: "Reading your resume…" },
  { emoji: "🔍", text: "Identifying your skills…" },
  { emoji: "📊", text: "Analysing your goals…" },
  { emoji: "🧠", text: "Building your personalised plan…" },
  { emoji: "✨", text: "Running AI analysis…" },
  { emoji: "✅", text: "AI analysis complete!" },
];

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
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#f5ede0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2.5rem",
      }}
    >
      <div style={{ position: "relative", width: 120, height: 120 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "4px solid transparent", borderTopColor: "#b87444", animation: "spin 1s linear infinite" }} />
        <div style={{ position: "absolute", inset: 12, borderRadius: "50%", border: "3px solid transparent", borderBottomColor: "#a0622e", animation: "spin 1.4s linear infinite reverse" }} />
        <div style={{ position: "absolute", inset: 26, borderRadius: "50%", background: "radial-gradient(circle, rgba(184,116,68,0.15), transparent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>
          {current.emoji}
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#2c1a0a", fontSize: "1.25rem", fontWeight: 600, fontFamily: "'Playfair Display', serif", margin: 0 }}>
          {current.text}
        </p>
        <p style={{ color: "#8c6a50", fontSize: "0.85rem", marginTop: "0.5rem", fontFamily: "Inter, sans-serif" }}>
          Please wait while we set everything up for you
        </p>
      </div>

      <div style={{ width: 280, height: 6, background: "#e8ddd0", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(to right, #b87444, #a0622e)", borderRadius: 999, transition: "width 0.3s ease" }} />
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function Steps() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [customInterest, setCustomInterest] = useState<Record<string, string>>({});
  const [roles, setRoles] = useState<OnboardingRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
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
    if (newIndex >= 0 && newIndex < roles.length) {
      setActiveIndex(newIndex);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchOnboardingSteps = async () => {
      try {
        const res = await fetch("http://localhost:3001/onboarding/steps", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch onboarding steps");
        const data = await res.json();
        setRoles(data.steps);
      } catch (error) {
        console.error("Error fetching onboarding steps:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOnboardingSteps();
  }, []);

  const activeRole = roles[activeIndex];
  if (loading || !activeRole) {
    return <div className={styles.loading}>Loading onboarding…</div>;
  }

  const toggleSelection = (option: string) => {
    const roleId = activeRole.id;
    setSelections((prev) => {
      const current = prev[roleId] || [];
      if (current.includes(option)) {
        return { ...prev, [roleId]: current.filter((i) => i !== option) };
      }
      return { ...prev, [roleId]: [...current, option] };
    });
  };

  const updateStepInUrl = (index: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", index.toString());
    router.push(`?${params.toString()}`);
  };

  const handleNext = () => {
    if (activeIndex < roles.length - 1) {
      updateStepInUrl(activeIndex + 1);
    } else {
      submitHandler();
    }
  };

  const handleBack = () => {
    if (activeIndex > 0) {
      updateStepInUrl(activeIndex - 1);
    }
  };

  const submitHandler = (): Promise<void> => {
    if (!resumeFile && !resumeText.trim()) {
      alert("Please upload a resume or paste resume text");
      return Promise.resolve();
    }
    const formData = new FormData();
    if (resumeFile) formData.append("resume", resumeFile);
    if (resumeText.trim()) formData.append("resumeText", resumeText.trim());
    if (profilePhoto) formData.append("profilePhoto", profilePhoto);
    if (location.trim()) formData.append("location", location.trim());
    if (yearsOfExperience) formData.append("yearsOfExperience", yearsOfExperience);

    const mergedAnswers: Record<string, string[]> = { ...selections };
    Object.entries(customInterest).forEach(([roleId, value]) => {
      if (!value.trim()) return;
      mergedAnswers[roleId] = [...(mergedAnswers[roleId] || []), value.trim()];
    });
    formData.append("answers", JSON.stringify(mergedAnswers));

    return fetch("http://localhost:3001/onboarding/answers", {
      method: "POST",
      body: formData,
      credentials: "include",
    })
      .then((res) => { if (!res.ok) throw new Error("Submission failed"); })
      .catch((err) => { console.error("Onboarding submission error:", err); });
  };

  return (
    <div className={styles.splitLayout}>

      {/* ── SIDEBAR ── */}
      <div className={styles.colorPanel}>
        <div className={styles.sidebarLogo}>
          <div className={styles.sidebarLogoIcon}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="13" width="14" height="2.5" rx="1.2" fill="white" />
              <rect x="3" y="8.5" width="14" height="2.5" rx="1.2" fill="white" opacity="0.7" />
              <rect x="3" y="4" width="14" height="2.5" rx="1.2" fill="white" opacity="0.4" />
            </svg>
          </div>
          <span className={styles.sidebarLogoName}>Anchor</span>
        </div>

        <div className={styles.sidebarSteps}>
          <div className={styles.sidebarSectionLabel}>
            Getting Started
          </div>
          <div className={styles.sidebarSectionDesc}>
            Tell us a bit about yourself so we can personalise your experience.
          </div>
          
          {roles.map((role, index) => {
            const isActive = index === activeIndex;
            const isDone = index < activeIndex;
            return (
              <div
                key={role.id}
                className={`${styles.sidebarItem} ${isActive ? styles.sidebarItemActive : ""}`}
                onClick={() => updateStepInUrl(index)}
                style={{ cursor: "pointer" }}
              >
                <div className={`${styles.sidebarNum} ${isActive ? styles.sidebarNumActive : isDone ? styles.sidebarNumDone : ""}`}>
                  {isDone ? (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="2 6 5 9 10 3" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`${styles.sidebarName} ${isActive ? styles.sidebarNameActive : ""}`}>
                  {role.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className={styles.contentPanel}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRole.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className={styles.contentWrapper}
          >
            {/* Header */}
            <div className={styles.stepHeader}>
              <h2 className={styles.serifHeading}>{activeRole.title}</h2>
              <p className={styles.subText}>{activeRole.subtitle}</p>
            </div>

            <div className={styles.divider} />

            {/* Form body */}
            <div className={styles.formBody}>
              {activeRole.isUpload ? (
                /* ── UPLOAD STATE ── */
                <div className={styles.uploadContainer}>

                {/* ── Profile Photo ── */}
                <div className={styles.profileRow}>
                  <label className={styles.inputLabel}>PROFILE PHOTO</label>
                  <label className={styles.profilePhotoLabel}>
                    <div className={styles.profilePhotoCircle}>
                      {profilePhotoPreview ? (
                        <img src={profilePhotoPreview} alt="Profile" className={styles.profilePhotoImg} />
                      ) : (
                        <div className={styles.profilePhotoPlaceholder}>
                          <span style={{ fontSize: "1.6rem" }}>📷</span>
                          <span className={styles.uploadSubText}>Upload photo</span>
                        </div>
                      )}
                    </div>
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
                  </label>
                </div>

                {/* ── Location + Years of Experience ── */}
                <div className={styles.profileFieldsRow}>
                  <div className={styles.profileField}>
                    <label className={styles.inputLabel}>LOCATION</label>
                    <input
                      type="text"
                      className={styles.locationInput}
                      placeholder="e.g. San Francisco, CA"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div className={styles.profileField}>
                    <label className={styles.inputLabel}>YEARS OF EXPERIENCE</label>
                    <div className={styles.yoeChips}>
                      {["0–1 yrs", "1–3 yrs", "3–5 yrs", "5+ yrs"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          className={`${styles.optionChip} ${yearsOfExperience === opt ? styles.selectedChip : ""}`}
                          onClick={() => setYearsOfExperience(opt)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Resume Upload ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <label className={styles.inputLabel}>RESUME</label>
                <label className={styles.uploadLabel}>
                  <div className={styles.uploadBox}>
                    {resumeFile ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "0 2rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "1.8rem" }}>📄</span>
                          <span style={{ fontWeight: 500, color: "#2c1a0a", fontSize: "15px" }}>{resumeFile.name}</span>
                        </div>
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setResumeFile(null); }}
                          style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "1.1rem", color: "#8c6a50", padding: "6px" }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className={styles.uploadBoxInner}>
                        <div className={styles.uploadIcon}>📄</div>
                        <p className={styles.uploadMainText}>Click to Upload or Drag & Drop</p>
                        <p className={styles.uploadSubText}>PDF, DOCX up to 10MB</p>
                      </div>
                    )}
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) setResumeFile(e.target.files[0]);
                      }}
                    />
                  </div>
                </label>
              </div>

                  {/* Paste section */}
                  <div className={styles.pasteSection}>
                    <label className={styles.inputLabel}>OR PASTE TEXT</label>
                    <textarea
                      className={styles.pasteTextarea}
                      placeholder="Paste your resume content here..."
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                /* ── SELECTION STATE ── */
                <div className={styles.selectionContainer}>
                  <label className={styles.inputLabel}>SELECT OPTIONS</label>
                  <div className={styles.optionsGrid}>
                    {activeRole.options.map((option) => {
                      const isSelected = (selections[activeRole.id] || []).includes(option);
                      return (
                        <button
                          key={option}
                          className={`${styles.optionChip} ${isSelected ? styles.selectedChip : ""}`}
                          onClick={() => toggleSelection(option)}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  {(activeRole as any).isInterest && (
                    <input
                      type="text"
                      className={styles.customInput}
                      placeholder="Other (type to add…)"
                      value={customInterest[activeRole.id] || ""}
                      onChange={(e) =>
                        setCustomInterest((prev) => ({ ...prev, [activeRole.id]: e.target.value }))
                      }
                    />
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className={styles.footerNav}>
          <button
            className={styles.backBtn}
            onClick={handleBack}
            style={{ visibility: activeIndex === 0 ? "hidden" : "visible" }}
          >
            ← BACK
          </button>

          {activeIndex === roles.length - 1 ? (
            <button
              className={styles.continueBtn}
              onClick={() => {
                const promise = submitHandler();
                setFetchPromise(promise);
                setShowAILoading(true);
              }}
            >
              FINISH <span className={styles.btnArrow}>→</span>
            </button>
          ) : (
            <button className={styles.continueBtn} onClick={handleNext}>
              CONTINUE <span className={styles.btnArrow}>→</span>
            </button>
          )}
        </div>
      </div>

      {showAILoading && fetchPromise && (
        <AILoadingOverlay fetchPromise={fetchPromise} onDone={() => router.push("/dashboard")} />
      )}
    </div>
  );
}