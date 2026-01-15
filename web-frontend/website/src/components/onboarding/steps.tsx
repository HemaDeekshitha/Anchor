"use client";

import React, { useState } from "react";
import styles from "./onboarding.module.css";

// 1. DATA: Define roles. The first one is special (isUpload: true).
const roles = [
  {
    id: "resume-upload",
    title: "Upload Resume",
    isUpload: true, // <--- Special Flag
    icon: (
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
    options: [], // No checklist options needed for this one
  },
  {
    id: "primary-focus",
    title: "Primary Focus",
    icon: (
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
    options: [
      "Find a new job",
      "Switch careers",
      "Get promoted",
      "Learn new skills",
      "Network more",
      "Prepare for interviews",
    ],
  },
  {
    id: "current-status",
    title: "Current Status",
    icon: (
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
        {/* The Gear */}
        <path d="M12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
      </svg>
    ),
    options: [
      "Actively job searching",
      "Passively looking",
      "Recently laid off",
      "Employed, seeking change",
      "Student/Recent graduate",
      "Career break",
    ],
  },
  {
    id: "preferred-role",
    title: "Preferred Role(s)",
    customHeader: "What role are you actively working towards right now?",
    icon: (
      // Briefcase Icon
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
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      </svg>
    ),
    options: [
      "Frontend Developer",
      "Data Analyst",
      "Product Manager",
      "iOS Engineer",
      "AI/ML Engineer",
      "Backend Developer",
      "QA/Test Automation",
      "Full Stack Developer",
    ],
  },
  {
    id: "areas-interest",
    title: "Areas of Interest",
    isInterest: true, // Special flag for input logic
    icon: (
      // Globe Icon
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
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
    ),
    options: [
      "FinTech",
      "HealthTech",
      "EdTech",
      "Cybersecurity",
      "Ecommerce",
      "Entrepreneurship",
    ],
  },
  {
    id: "employment-type",
    title: "Employment Type",
    customHeader: "What kind of work are you looking for?",
    icon: (
      // Clock Icon
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
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    ),
    options: [
      "Full-time",
      "Part-time",
      "Internship / Co-op",
      "Freelance / Contract",
      "Remote only",
      "Hybrid",
      "Onsite",
    ],
  },
];

export default function Steps() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [customInterest, setCustomInterest] = useState("");

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

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Let’s Get to Know You</h2>

      <div className={styles.grid}>
        {roles.map((role) => {
          const isActive = activeId === role.id;
          const roleSelections = selections[role.id] || [];

          return (
            <div
              key={role.id}
              className={`${styles.card} ${isActive ? styles.activeCard : ""}`}
              onClick={() => toggleRole(role.id)}
            >
              {/* Card Header (Visible Pill) */}
              <div className={styles.cardHeader}>
                <div className={styles.iconWrapper}>{role.icon}</div>
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
                        <input type="file" hidden />
                      </label>

                      <div className={styles.divider}>
                        <span>or</span>
                      </div>

                      <textarea
                        className={styles.pasteArea}
                        placeholder="Paste your resume text here..."
                      />

                      <button className={styles.actionButton}>
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
                          const isSelected = roleSelections.includes(option);
                          return (
                            <button
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
                        {"isInterest" in role && (role as any).isInterest && (
                          <input
                            type="text"
                            className={styles.otherInput}
                            placeholder="Other (Type to add...)"
                            value={customInterest}
                            onChange={(e) => setCustomInterest(e.target.value)}
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
    </div>
  );
}
