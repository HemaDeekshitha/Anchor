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

export default function ApplicationTracker() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [oauthMessage, setOauthMessage] = useState("");

  const loadJobs = async () => {
    try {
      setErrorMessage("");
      const res = await fetch(`${API_BASE_URL}/application-tracker/gmail/jobs`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch jobs");
      }

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

  const handleConnectGmail = async () => {
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

  const formatDate = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString();
  };

  const renderJobCard = (job: JobApplication) => (
    <article key={job.id} className={styles.jobCard}>
      <h3 className={styles.jobTitle}>{job.role || "Unknown Role"}</h3>
      <div className={styles.jobField}>
        <span>Status</span>
        <strong>{job.status || "-"}</strong>
      </div>
      <div className={styles.jobField}>
        <span>Applied</span>
        <strong>{(job.status || "").toLowerCase() === "applied" ? "Yes" : "No"}</strong>
      </div>
      <div className={styles.jobField}>
        <span>Company</span>
        <strong>{job.company || "Unknown Company"}</strong>
      </div>
      <div className={styles.jobField}>
        <span>Role</span>
        <strong>{job.role || "Unknown Role"}</strong>
      </div>
      <div className={styles.jobField}>
        <span>Date Applied</span>
        <strong>{formatDate(job.appliedDate)}</strong>
      </div>
    </article>
  );

  return (
    <LayoutWithSidebar>
      <div className={styles.trackerContainer}>
        <h1 className={styles.pageTitle}>Track your Jobs</h1>

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

        <section className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>All Jobs</h2>
          {isLoading ? (
            <p className={styles.emptyState}>Loading jobs...</p>
          ) : jobs.length > 0 ? (
            <div className={styles.jobsGrid}>{jobs.map(renderJobCard)}</div>
          ) : (
            <p className={styles.emptyState}>No jobs to show yet.</p>
          )}
        </section>
      </div>
    </LayoutWithSidebar>
  );
}
