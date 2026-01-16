"use client";

import React, { JSX, useEffect, useState } from "react";
import styles from "./onboarding.module.css";

type OnboardingRole = {
  id: string;
  title: string;
  options: string[];
  isUpload?: boolean;
  isInterest?: boolean;
  customHeader?: string;
};

// 1. DATA: Define roles. The first one is special (isUpload: true).

const ICON_MAP: Record<string, JSX.Element> = {
  "resume-upload": (
    <svg
      width="24"
      height="24"
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
  ),

  "primary-focus": (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),

  "current-status": (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),

  "preferred-role": (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),

  "areas-interest": (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
  ),

  "employment-type": (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

export default function Steps() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [customInterest, setCustomInterest] = useState("");
  const [roles, setRoles] = useState<OnboardingRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");

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

  const toggleRole = (id: string) => {
    setActiveId(activeId === id ? null : id);
  };

  const toggleSelection = (
    e: React.MouseEvent,
    roleId: string,
    option: string
  ) => {
    e.stopPropagation();
    setSelections((prev) => {
      const currentSelections = prev[roleId] || [];
      if (currentSelections.includes(option)) {
        return {
          ...prev,
          [roleId]: currentSelections.filter((item) => item !== option),
        };
      } else {
        return { ...prev, [roleId]: [...currentSelections, option] };
      }
    });
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
    formData.append(
      "answers",
      JSON.stringify({
        ...selections,
        customInterest: customInterest || null,
      })
    );

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
    <div className={styles.container}>
      <h2 className={styles.heading}>Let’s Get to Know You</h2>

      {!loading ? (
        <form method="post" onSubmit={submitHandler}>
          <div className={styles.grid}>
            {roles.map((role) => {
              const isActive = activeId === role.id;
              const roleSelections = selections[role.id] || [];

              return (
                <div
                  key={role.id}
                  className={`${styles.card} ${
                    isActive ? styles.activeCard : ""
                  }`}
                  onClick={() => toggleRole(role.id)}
                >
                  {/* Card Header (Visible Pill) */}
                  <div className={styles.cardHeader}>
                    <div className={styles.iconWrapper}>
                      {ICON_MAP[role.id] ?? "📌"}
                    </div>
                    <span className={styles.cardTitle}>{role.title}</span>
                    <span className={styles.arrow}>{isActive ? "▲" : "▼"}</span>
                  </div>

                  {/* Expandable Content */}
                  {isActive && (
                    <div
                      className={styles.dropdownContent}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* --- LOGIC SPLIT: IS IT UPLOAD OR CHECKLIST? --- */}

                      {role.isUpload ? (
                        // 1. RENDER UPLOAD UI
                        <div className={styles.uploadUI}>
                          <label className={styles.uploadBox}>
                            <div className={styles.uploadIcon}>📄</div>
                            <span className={styles.uploadText}>
                              Click to Upload or Drag & Drop
                            </span>
                            <span className={styles.uploadSub}>
                              PDF, DOCX up to 10MB
                            </span>
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
                          </label>

                          <div className={styles.divider}>
                            <span>or</span>
                          </div>

                          <textarea
                            className={styles.pasteArea}
                            placeholder="Paste your resume text here..."
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                          />

                          <button type="button" className={styles.actionButton}>
                            Analyze Resume
                          </button>
                        </div>
                      ) : (
                        // 2. RENDER CHECKLIST UI (Standard Roles)
                        <>
                          <p className={styles.dropdownLabel}>
                            Select all that apply
                          </p>
                          <div className={styles.optionList}>
                            {role.options.map((option, index) => {
                              const isSelected =
                                roleSelections.includes(option);
                              return (
                                <button
                                  type="button"
                                  key={index}
                                  className={`${styles.optionBtn} ${
                                    isSelected ? styles.selectedOption : ""
                                  }`}
                                  onClick={(e) =>
                                    toggleSelection(e, role.id, option)
                                  }
                                >
                                  {option}
                                </button>
                              );
                            })}
                            {/* Only show this input if the special flag isInterest is true */}
                            {"isInterest" in role &&
                              (role as any).isInterest && (
                                <input
                                  type="text"
                                  className={styles.otherInput}
                                  placeholder="Other (Type to add...)"
                                  value={customInterest}
                                  onChange={(e) =>
                                    setCustomInterest(e.target.value)
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                />
                              )}
                          </div>
                          {/* <button className={styles.actionButton}>Continue</button> */}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <button type="submit">Submit</button>
        </form>
      ) : (
        <div>Loading onboarding steps...</div>
      )}
    </div>
  );
}
