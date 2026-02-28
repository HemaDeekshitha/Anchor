"use client";

import { useEffect, useState } from "react";
import LayoutWithSidebar from "@/components/SideBar/LayoutWithSidebar";
import styles from "./application-tracker.module.css";

export default function ApplicationTracker() {
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [interviewJobs, setInterviewJobs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("http://localhost:3001/application-tracker/jobs", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch jobs");
        }

        const data = await res.json();

        const normalizeJobs = (items: unknown): string[] => {
          if (!Array.isArray(items)) return [];

          return items
            .map((item) => {
              if (typeof item === "string") return item;
              if (item && typeof item === "object") {
                const record = item as Record<string, unknown>;
                return (
                  (typeof record.title === "string" && record.title) ||
                  (typeof record.role === "string" && record.role) ||
                  (typeof record.company === "string" && record.company) ||
                  ""
                );
              }
              return "";
            })
            .filter((job) => Boolean(job));
        };

        setAppliedJobs(normalizeJobs(data?.appliedJobs ?? data?.applied ?? data?.jobs));
        setInterviewJobs(
          normalizeJobs(data?.interviewJobs ?? data?.interviews ?? data?.pipeline)
        );
      } catch (error) {
        console.error("Failed to load job tracker data:", error);
        setAppliedJobs([]);
        setInterviewJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleConnectGmail = async () => {
    try {
      await fetch("http://localhost:3001/application-tracker/gmail/connect", {
        method: "GET",
        credentials: "include",
      });
    } catch (error) {
      console.error("Gmail connect request failed:", error);
    } finally {
      window.open("http://localhost:3001/application-tracker/gmail/connect", "_self");
    }
  };

  return (
    <LayoutWithSidebar>
      <div className={styles.trackerContainer}>
        <h1 className={styles.pageTitle}>Track your Jobs</h1>

        <button className={styles.connectButton} onClick={handleConnectGmail}>
          Connect with your Gmail
        </button>

        <section className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>Applied Jobs</h2>
          {isLoading ? (
            <p className={styles.emptyState}>Loading jobs...</p>
          ) : appliedJobs.length > 0 ? (
            <ul className={styles.jobsList}>
              {appliedJobs.map((job, index) => (
                <li key={`${job}-${index}`} className={styles.jobItem}>
                  {job}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.emptyState}>No jobs to show yet.</p>
          )}
        </section>

        <section className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>Interview Pipeline</h2>
          {isLoading ? (
            <p className={styles.emptyState}>Loading jobs...</p>
          ) : interviewJobs.length > 0 ? (
            <ul className={styles.jobsList}>
              {interviewJobs.map((job, index) => (
                <li key={`${job}-${index}`} className={styles.jobItem}>
                  {job}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.emptyState}>No interviews to show yet.</p>
          )}
        </section>
      </div>
    </LayoutWithSidebar>
  );
}
