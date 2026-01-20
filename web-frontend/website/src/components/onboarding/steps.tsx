"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./onboarding.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
// --- DATA ---
// const roles = [
//   {
//     id: "resume-upload",
//     title: "Upload Resume",
//     subtitle: "Let's start with the basics.",
//     isUpload: true,
//     options: [],
//   },
//   {
//     id: "primary-focus",
//     title: "Primary Focus",
//     subtitle: "Define the visual language of your future project.",
//     options: [
//       "Find a new job",
//       "Switch careers",
//       "Get promoted",
//       "Learn new skills",
//       "Network more",
//     ],
//   },
//   {
//     id: "current-status",
//     title: "Current Status",
//     subtitle: "Where do you currently stand?",
//     options: [
//       "Actively job searching",
//       "Passively looking",
//       "Recently laid off",
//       "Employed, seeking change",
//       "Student/Recent graduate",
//       "Career break",
//     ],
//   },
//   {
//     id: "preferred-role",
//     title: "Preferred Role(s)",
//     subtitle: "What position are you aiming for?",
//     options: [
//       "Frontend Developer",
//       "Data Analyst",
//       "Product Manager",
//       "iOS Engineer",
//       "Backend Developer",
//       "Full Stack Developer",
//     ],
//   },
//   {
//     id: "areas-interest",
//     title: "Areas of Interest",
//     subtitle: "Which industries excite you?",
//     isInterest: true,
//     options: ["FinTech", "HealthTech", "EdTech", "Cybersecurity", "Ecommerce"],
//   },
//   {
//     id: "employment-type",
//     title: "Employment Type",
//     subtitle: "How do you want to work?",
//     options: [
//       "Full-time",
//       "Part-time",
//       "Internship / Co-op",
//       "Freelance / Contract",
//       "Remote only",
//     ],
//   },
// ];

type OnboardingRole = {
  id: string;
  title: string;
  subtitle: string;
  options: string[];
  isUpload?: boolean;
  isInterest?: boolean;
  customHeader?: string;
};

// --- ICON RENDERING HELPER ---
const renderIcon = (id: string) => {
  switch (id) {
    case "resume-upload":
      return (
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      );
    case "primary-focus":
      return (
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case "current-status":
      return (
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* The Gear */}
          <path d="M12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
        </svg>
      );
    case "preferred-role":
      return (
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
      );
    case "areas-interest":
      return (
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      );
    case "employment-type":
      return (
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      );
    default:
      return null;
  }
};

export default function Steps() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [customInterest, setCustomInterest] = useState<Record<string, string>>(
    {},
  );
  const [roles, setRoles] = useState<OnboardingRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const userId = "user_123";

  // --- GLOBAL THEME LOGIC ---
  useEffect(() => {
    const stepParam = searchParams.get("step");
    const newIndex = stepParam ? parseInt(stepParam) : 0;

    // Safety check to ensure index is valid
    if (newIndex >= 0 && newIndex < roles.length) {
      setActiveIndex(newIndex);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchOnboardingSteps = async () => {
      try {
        const res = await fetch("http://localhost:3001/onboarding/steps");

        if (!res.ok) {
          throw new Error("Failed to fetch onboarding steps");
        }

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
      // Instead of setActiveIndex, we update URL
      updateStepInUrl(activeIndex + 1);
    } else {
      submitHandler();
      // alert("All steps completed!");
    }
  };

  const handleBack = () => {
    if (activeIndex > 0) {
      // Instead of setActiveIndex, we update URL
      updateStepInUrl(activeIndex - 1);
    }
  };

  const submitHandler = async () => {
    // e.preventDefault();

    // Require at least one resume input
    if (!resumeFile && !resumeText.trim()) {
      alert("Please upload a resume or paste resume text");
      return;
    }

    const formData = new FormData();

    // 📎 Resume file (optional)
    if (resumeFile) {
      formData.append("resume", resumeFile);
    }

    // 📝 Resume text (optional)
    if (resumeText.trim()) {
      formData.append("resumeText", resumeText.trim());
    }

    // 🧠 Onboarding answers
    // formData.append(
    //   "answers",
    //   JSON.stringify({
    //     ...selections,
    //     customInterest: customInterest,
    //   }),
    // );
    const mergedAnswers: Record<string, string[]> = { ...selections };

    // merge "Other" input into same role array
    Object.entries(customInterest).forEach(([roleId, value]) => {
      if (!value.trim()) return;

      mergedAnswers[roleId] = [...(mergedAnswers[roleId] || []), value.trim()];
    });

    formData.append("answers", JSON.stringify(mergedAnswers));
    formData.append("userId", userId);

    try {
      const res = await fetch("http://localhost:3001/onboarding/answers", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Submission failed");
      }

      alert("Onboarding submitted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to submit onboarding data");
    }
  };

  return (
    <div className={styles.splitLayout}>
      {/* LEFT PANEL: ICON DISPLAY */}
      <div className={styles.colorPanel}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`icon-${activeRole.id}`}
            initial={{ opacity: 0, scale: 0.9 }}
            /* Set to 0.4 so it is VISIBLE but not overwhelming */
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className={styles.iconWrapper}
          >
            {renderIcon(activeRole.id)}
          </motion.div>
        </AnimatePresence>

        <div className={styles.panelText}>
          <span>
            0{activeIndex + 1} / {roles.length} &nbsp;—&nbsp; STEPS
          </span>
        </div>
      </div>

      {/* RIGHT PANEL: CONTENT */}
      <div className={styles.contentPanel}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRole.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={styles.contentWrapper}
          >
            {/* STEP HEADER */}
            <div className={styles.stepHeader}>
              <h2 className={styles.serifHeading}>{activeRole.title}</h2>
              <p className={styles.subText}>{activeRole.subtitle}</p>
            </div>

            <div className={styles.divider} />

            {/* FORM BODY */}
            <div className={styles.formBody}>
              {activeRole.isUpload ? (
                /* UPLOAD STATE */
                <div className={styles.uploadContainer}>
                  {/* <label className={styles.inputLabel}>YOUR RESUME</label> */}
                  <label>
                    <div className={styles.uploadBox}>
                      {resumeFile ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            padding: "0 1rem",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <span style={{ fontSize: "1.5rem" }}>📄</span>
                            <span style={{ fontWeight: 500 }}>
                              {resumeFile.name}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault(); // Prevent opening file dialog
                              e.stopPropagation();
                              setResumeFile(null);
                            }}
                            style={{
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "1.2rem",
                              color: "currentColor",
                              padding: "5px",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        // Standard View when no file is uploaded
                        <>
                          <div className={styles.uploadIcon}>📄</div>
                          <p className={styles.uploadMainText}>
                            Click to Upload or Drag & Drop
                          </p>
                          <p className={styles.uploadSubText}>
                            PDF, DOCX up to 10MB
                          </p>
                        </>
                      )}
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setResumeFile(e.target.files[0]);
                          }
                        }}
                      />
                    </div>
                  </label>

                  <label
                    className={styles.inputLabel}
                    style={{ marginTop: "2rem", display: "block" }}
                  >
                    OR PASTE TEXT
                  </label>
                  <textarea
                    className={
                      styles.optionChip
                    } /* Reuses your existing card styling */
                    style={{
                      minHeight: "150px",
                      resize: "vertical",
                      cursor: "text",
                      fontFamily: "inherit",
                      lineHeight: "1.5",
                    }}
                    placeholder="Paste your resume content here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                </div>
              ) : (
                /* SELECTION STATE */
                <div className={styles.selectionContainer}>
                  <label className={styles.inputLabel}>SELECT OPTIONS</label>
                  <div className={styles.optionsGrid}>
                    {activeRole.options.map((option) => {
                      const isSelected = (
                        selections[activeRole.id] || []
                      ).includes(option);
                      return (
                        <button
                          key={option}
                          className={`${styles.optionChip} ${
                            isSelected ? styles.selectedChip : ""
                          }`}
                          onClick={() => toggleSelection(option)}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  {/* CUSTOM INPUT */}
                  {(activeRole as any).isInterest && (
                    <input
                      type="text"
                      className={styles.customInput}
                      placeholder="Other (Type to add...)"
                      value={customInterest[activeRole.id] || ""}
                      onChange={(e) =>
                        setCustomInterest((prev) => ({
                          ...prev,
                          [activeRole.id]: e.target.value,
                        }))
                      }
                    />
                  )}
                </div>
              )}
            </div>

            {/* FOOTER NAV */}
          </motion.div>
        </AnimatePresence>
        <div className={styles.footerNav}>
          <button
            className={styles.backBtn}
            onClick={handleBack}
            style={{ visibility: activeIndex === 0 ? "hidden" : "visible" }}
          >
            ← BACK
          </button>

          {activeIndex === roles.length - 1 ? (
            <Link href="/dashboard" className={styles.continueBtn}>
              FINISH <span className={styles.btnArrow}>→</span>
            </Link>
          ) : (
            <button className={styles.continueBtn} onClick={handleNext}>
              CONTINUE <span className={styles.btnArrow}>→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
