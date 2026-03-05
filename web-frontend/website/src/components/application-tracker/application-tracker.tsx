"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import LayoutWithSidebar from "@/components/SideBar/LayoutWithSidebar";
import styles from "./application-tracker.module.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface JobApplication {
  id: string;
  user?: { id?: string };
  company: string;
  role: string;
  status: string;
  threadId?: string | null;
  lastMessageId?: string | null;
  sourceEmail?: string | null;
  appliedDate?: string;
}

const COLUMNS: {
  status: string;
  label: string;
  headerClass: string;
  countClass: string;
}[] = [
  { status: "Applied",   label: "Applied",   headerClass: styles.colHeaderApplied,   countClass: styles.colCountApplied   },
  { status: "Interview", label: "Interview", headerClass: styles.colHeaderInterview, countClass: styles.colCountInterview },
  { status: "Offer",     label: "Offer",     headerClass: styles.colHeaderOffer,     countClass: styles.colCountOffer     },
  { status: "Rejected",  label: "Rejected",  headerClass: styles.colHeaderRejected,  countClass: styles.colCountRejected  },
];

export default function ApplicationTracker() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [oauthMessage, setOauthMessage] = useState("");
  const [view, setView] = useState<"board" | "grid">("board");

  const loadJobs = async () => {
    try {
      setErrorMessage("");
      const res = await fetch(`${API_BASE_URL}/application-tracker/gmail/jobs`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch jobs");

      const jobsData: JobApplication[] = await res.json();
      setJobs(jobsData);
    } catch (error) {
      console.error("Failed to load job tracker data:", error);
      setJobs([]);
      setErrorMessage("Unable to load jobs right now.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    const gmailStatus = searchParams.get("gmail");
    if (gmailStatus === "connected") {
      setOauthMessage("Gmail connected successfully.");
      loadJobs();
      return;
    }
    if (gmailStatus === "failed") {
      setOauthMessage("Gmail connection failed. Please try again.");
      return;
    }
    setOauthMessage("");
  }, [searchParams]);

  const handleConnectGmail = () => {
    window.open(`${API_BASE_URL}/application-tracker/gmail/connect`, "_self");
  };

  const handleScanGmail = async () => {
    try {
      setIsScanning(true);
      setErrorMessage("");

      const res = await fetch(`${API_BASE_URL}/application-tracker/gmail/scan`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.message || "Failed to scan Gmail");
      }

      await loadJobs();
    } catch (error) {
      console.error("Failed to scan gmail:", error);
      const message = error instanceof Error ? error.message : "Gmail scan failed.";
      setErrorMessage(message);
    } finally {
      setIsScanning(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm("Remove this job from your tracker?")) return;

    try {
      setDeletingId(jobId);
      const res = await fetch(
        `${API_BASE_URL}/application-tracker/gmail/jobs/${jobId}`,
        { method: "DELETE", credentials: "include" }
      );

      if (!res.ok) throw new Error("Failed to delete job");

      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (error) {
      console.error("Failed to delete job:", error);
      setErrorMessage("Could not delete job. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString();
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "interview": return styles.statusInterview;
      case "offer":     return styles.statusOffer;
      case "rejected":  return styles.statusRejected;
      default:          return styles.statusApplied;
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const appliedCount   = jobs.filter((j) => j.status === "Applied").length;
  const interviewCount = jobs.filter((j) => j.status === "Interview").length;
  const offerCount     = jobs.filter((j) => j.status === "Offer").length;
  const rejectedCount  = jobs.filter((j) => j.status === "Rejected").length;
  const responded      = interviewCount + offerCount + rejectedCount;
  const responseRate   = jobs.length > 0 ? Math.round((responded / jobs.length) * 100) : 0;

  // ── Card renderer (shared by both views) ──────────────────────────────────────
  const renderJobCard = (job: JobApplication) => (
    <article key={job.id} className={styles.jobCard}>
      <button
        className={styles.deleteButton}
        onClick={() => handleDeleteJob(job.id)}
        disabled={deletingId === job.id}
        aria-label="Remove job"
        title="Remove job"
      >
        {deletingId === job.id ? "…" : "×"}
      </button>

      <h3 className={styles.jobTitle}>{job.role || "Unknown Role"}</h3>

      <span className={`${styles.statusBadge} ${getStatusClass(job.status || "")}`}>
        {job.status || "-"}
      </span>

      <div className={styles.jobField}>
        <span>Company</span>
        <strong>{job.company || "Unknown Company"}</strong>
      </div>
      <div className={styles.jobField}>
        <span>Date Applied</span>
        <strong>{formatDate(job.appliedDate)}</strong>
      </div>
    </article>
  );

  // ── Kanban board ──────────────────────────────────────────────────────────────
  const renderBoard = () => (
    <div className={styles.boardContainer}>
      {COLUMNS.map(({ status, label, headerClass, countClass }) => {
        const colJobs = jobs.filter((j) => (j.status || "Applied") === status);
        return (
          <div key={status} className={styles.boardColumn}>
            <div className={`${styles.colHeader} ${headerClass}`}>
              <span className={styles.colLabel}>{label}</span>
              <span className={`${styles.colCount} ${countClass}`}>{colJobs.length}</span>
            </div>
            <div className={styles.colBody}>
              {colJobs.length === 0 ? (
                <p className={styles.colEmpty}>No jobs here</p>
              ) : (
                colJobs.map(renderJobCard)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── Grid view ─────────────────────────────────────────────────────────────────
  const renderGrid = () => (
    <section className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>
        All Jobs{jobs.length > 0 ? ` (${jobs.length})` : ""}
      </h2>
      <div className={styles.jobsGrid}>{jobs.map(renderJobCard)}</div>
    </section>
  );

  return (
    <LayoutWithSidebar>
      <div className={styles.trackerContainer}>

        {/* ── Title row with view toggle ─────────────────────────────────── */}
        <div className={styles.titleRow}>
          <h1 className={styles.pageTitle}>Track your Jobs</h1>
          {!isLoading && jobs.length > 0 && (
            <div className={styles.viewToggle}>
              <button
                className={`${styles.viewToggleBtn} ${view === "board" ? styles.viewToggleActive : ""}`}
                onClick={() => setView("board")}
              >
                Board
              </button>
              <button
                className={`${styles.viewToggleBtn} ${view === "grid" ? styles.viewToggleActive : ""}`}
                onClick={() => setView("grid")}
              >
                Grid
              </button>
            </div>
          )}
        </div>

        {/* ── Action buttons ─────────────────────────────────────────────── */}
        <div className={styles.actionsRow}>
          <button className={styles.connectButton} onClick={handleConnectGmail}>
            Connect with your Gmail
          </button>
          <button
            className={styles.scanButton}
            onClick={handleScanGmail}
            disabled={isScanning}
          >
            {isScanning ? "Scanning..." : "Scan Gmail"}
          </button>
        </div>

        {errorMessage ? <p className={styles.errorMessage}>{errorMessage}</p> : null}
        {oauthMessage ? <p className={styles.oauthMessage}>{oauthMessage}</p> : null}

        {/* ── Stats bar ──────────────────────────────────────────────────── */}
        {!isLoading && jobs.length > 0 && (
          <div className={styles.statsBar}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{jobs.length}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
            <div className={`${styles.statCard} ${styles.statApplied}`}>
              <span className={styles.statValue}>{appliedCount}</span>
              <span className={styles.statLabel}>Applied</span>
            </div>
            <div className={`${styles.statCard} ${styles.statInterview}`}>
              <span className={styles.statValue}>{interviewCount}</span>
              <span className={styles.statLabel}>Interview</span>
            </div>
            <div className={`${styles.statCard} ${styles.statOffer}`}>
              <span className={styles.statValue}>{offerCount}</span>
              <span className={styles.statLabel}>Offers</span>
            </div>
            <div className={`${styles.statCard} ${styles.statRejected}`}>
              <span className={styles.statValue}>{rejectedCount}</span>
              <span className={styles.statLabel}>Rejected</span>
            </div>
            <div className={`${styles.statCard} ${styles.statRate}`}>
              <span className={styles.statValue}>{responseRate}%</span>
              <span className={styles.statLabel}>Response Rate</span>
            </div>
          </div>
        )}

        {/* ── Main content ───────────────────────────────────────────────── */}
        {isLoading ? (
          <p className={styles.emptyState}>Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <section className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>All Jobs</h2>
            <p className={styles.emptyState}>No jobs to show yet.</p>
          </section>
        ) : view === "board" ? (
          renderBoard()
        ) : (
          renderGrid()
        )}

      </div>
    </LayoutWithSidebar>
  );
}
