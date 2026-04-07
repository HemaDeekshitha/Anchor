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
  notes?: string | null;
  source?: string;
}

const STATUSES = ["Applied", "Interview", "Offer", "Rejected"] as const;
type Status = (typeof STATUSES)[number];

const COLUMNS: {
  status: Status;
  label: string;
  headerClass: string;
  countClass: string;
}[] = [
  { status: "Applied",   label: "Applied",   headerClass: styles.colHeaderApplied,   countClass: styles.colCountApplied   },
  { status: "Interview", label: "Interview", headerClass: styles.colHeaderInterview, countClass: styles.colCountInterview },
  { status: "Offer",     label: "Offer",     headerClass: styles.colHeaderOffer,     countClass: styles.colCountOffer     },
  { status: "Rejected",  label: "Rejected",  headerClass: styles.colHeaderRejected,  countClass: styles.colCountRejected  },
];

// ── Modal state ────────────────────────────────────────────────────────────────
interface ModalState {
  open: boolean;
  mode: "create" | "edit";
  job: JobApplication | null;
}

const emptyForm = () => ({
  company: "",
  role: "",
  status: "Applied" as Status,
  appliedDate: new Date().toISOString().slice(0, 10),
  notes: "",
});

export default function ApplicationTracker() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [oauthMessage, setOauthMessage] = useState("");
  const [view, setView] = useState<"board" | "grid">("board");
  const [modal, setModal] = useState<ModalState>({ open: false, mode: "create", job: null });
  const [form, setForm] = useState(emptyForm());

  // ── API calls ──────────────────────────────────────────────────────────────

  const loadJobs = async () => {
    try {
      setErrorMessage("");
      const res = await fetch(`${API_BASE_URL}/application-tracker/gmail/jobs`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch jobs");
      setJobs(await res.json());
    } catch {
      setJobs([]);
      setErrorMessage("Unable to load jobs right now.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadJobs(); }, []);

  useEffect(() => {
    const gmailStatus = searchParams.get("gmail");
    if (gmailStatus === "connected") { setOauthMessage("Gmail connected successfully."); loadJobs(); return; }
    if (gmailStatus === "failed")    { setOauthMessage("Gmail connection failed. Please try again."); return; }
    setOauthMessage("");
  }, [searchParams]);

  const handleConnectGmail = () => window.open(`${API_BASE_URL}/application-tracker/gmail/connect`, "_self");

  const handleScanGmail = async () => {
    try {
      setIsScanning(true);
      setErrorMessage("");
      const res = await fetch(`${API_BASE_URL}/application-tracker/gmail/scan`, { method: "POST", credentials: "include" });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.message || "Failed to scan Gmail"); }
      await loadJobs();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Gmail scan failed.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm("Remove this job from your tracker?")) return;
    try {
      setDeletingId(jobId);
      const res = await fetch(`${API_BASE_URL}/application-tracker/gmail/jobs/${jobId}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete job");
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch {
      setErrorMessage("Could not delete job. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveModal = async () => {
    if (!form.company.trim() || !form.role.trim()) {
      setErrorMessage("Company and role are required.");
      return;
    }
    setIsSaving(true);
    setErrorMessage("");
    try {
      if (modal.mode === "create") {
        const res = await fetch(`${API_BASE_URL}/application-tracker/gmail/jobs`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ company: form.company, role: form.role, status: form.status, appliedDate: form.appliedDate, notes: form.notes }),
        });
        if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.message || "Failed to add job"); }
        const created: JobApplication = await res.json();
        setJobs((prev) => [created, ...prev]);
      } else if (modal.job) {
        const res = await fetch(`${API_BASE_URL}/application-tracker/gmail/jobs/${modal.job.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: form.status, notes: form.notes }),
        });
        if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.message || "Failed to update job"); }
        const updated: JobApplication = await res.json();
        setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
      }
      closeModal();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Modal helpers ──────────────────────────────────────────────────────────

  const openCreateModal = () => {
    setForm(emptyForm());
    setModal({ open: true, mode: "create", job: null });
  };

  const openEditModal = (job: JobApplication) => {
    setForm({
      company: job.company,
      role: job.role,
      status: (job.status as Status) || "Applied",
      appliedDate: job.appliedDate ? job.appliedDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
      notes: job.notes ?? "",
    });
    setModal({ open: true, mode: "edit", job });
  };

  const closeModal = () => setModal({ open: false, mode: "create", job: null });

  // ── Formatters ─────────────────────────────────────────────────────────────

  const formatDate = (value?: string) => {
    if (!value) return "-";
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toLocaleDateString();
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "interview": return styles.statusInterview;
      case "offer":     return styles.statusOffer;
      case "rejected":  return styles.statusRejected;
      default:          return styles.statusApplied;
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────

  const appliedCount   = jobs.filter((j) => j.status === "Applied").length;
  const interviewCount = jobs.filter((j) => j.status === "Interview").length;
  const offerCount     = jobs.filter((j) => j.status === "Offer").length;
  const rejectedCount  = jobs.filter((j) => j.status === "Rejected").length;
  const responded      = interviewCount + offerCount + rejectedCount;
  const responseRate   = jobs.length > 0 ? Math.round((responded / jobs.length) * 100) : 0;

  // ── Card renderer ──────────────────────────────────────────────────────────

  const renderJobCard = (job: JobApplication) => (
    <article
      key={job.id}
      className={styles.jobCard}
      onClick={() => openEditModal(job)}
      style={{ cursor: "pointer" }}
    >
      <button
        className={styles.deleteButton}
        onClick={(e) => { e.stopPropagation(); handleDeleteJob(job.id); }}
        disabled={deletingId === job.id}
        aria-label="Remove job"
        title="Remove job"
      >
        {deletingId === job.id ? "…" : "×"}
      </button>

      {job.source === "manual" && (
        <span className={styles.manualBadge}>Manual</span>
      )}

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
      {job.notes && (
        <div className={styles.notesSnippet}>
          {job.notes.length > 80 ? job.notes.slice(0, 80) + "…" : job.notes}
        </div>
      )}

      {job.threadId && (
        <a
          className={styles.gmailButton}
          href={`https://mail.google.com/mail/u/0/#inbox/${job.threadId}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="Open in Gmail"
          aria-label="Open email thread in Gmail"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
          </svg>
        </a>
      )}
    </article>
  );

  // ── Views ──────────────────────────────────────────────────────────────────

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
              {colJobs.length === 0 ? <p className={styles.colEmpty}>No jobs here</p> : colJobs.map(renderJobCard)}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderGrid = () => (
    <section className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>All Jobs{jobs.length > 0 ? ` (${jobs.length})` : ""}</h2>
      <div className={styles.jobsGrid}>{jobs.map(renderJobCard)}</div>
    </section>
  );

  // ── Modal ──────────────────────────────────────────────────────────────────

  const renderModal = () => {
    if (!modal.open) return null;
    const isEdit = modal.mode === "edit";
    return (
      <div className={styles.modalOverlay} onClick={closeModal}>
        <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>{isEdit ? "Edit Application" : "Add Job Manually"}</h2>
            <button className={styles.modalClose} onClick={closeModal}>×</button>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Role *</label>
            <input
              className={styles.formInput}
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              placeholder="e.g. Software Engineer"
              disabled={isEdit}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Company *</label>
            <input
              className={styles.formInput}
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              placeholder="e.g. Stripe"
              disabled={isEdit}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Status</label>
              <select
                className={styles.formSelect}
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Status }))}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {!isEdit && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Date Applied</label>
                <input
                  type="date"
                  className={styles.formInput}
                  value={form.appliedDate}
                  onChange={(e) => setForm((f) => ({ ...f, appliedDate: e.target.value }))}
                />
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Notes</label>
            <textarea
              className={styles.formTextarea}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Interview rounds, contacts, salary info, next steps…"
              rows={4}
            />
          </div>

          {errorMessage && <p className={styles.modalError}>{errorMessage}</p>}

          <div className={styles.modalActions}>
            <button className={styles.cancelButton} onClick={closeModal}>Cancel</button>
            <button className={styles.saveButton} onClick={handleSaveModal} disabled={isSaving}>
              {isSaving ? "Saving…" : isEdit ? "Save Changes" : "Add Job"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <LayoutWithSidebar>
      <div className={styles.trackerContainer}>

        <div className={styles.titleRow}>
          <h1 className={styles.pageTitle}>Track your Jobs</h1>
          {!isLoading && jobs.length > 0 && (
            <div className={styles.viewToggle}>
              <button className={`${styles.viewToggleBtn} ${view === "board" ? styles.viewToggleActive : ""}`} onClick={() => setView("board")}>Board</button>
              <button className={`${styles.viewToggleBtn} ${view === "grid" ? styles.viewToggleActive : ""}`} onClick={() => setView("grid")}>Grid</button>
            </div>
          )}
        </div>

        <div className={styles.actionsRow}>
          <button className={styles.connectButton} onClick={handleConnectGmail}>Connect Gmail</button>
          <button className={styles.scanButton} onClick={handleScanGmail} disabled={isScanning}>{isScanning ? "Scanning…" : "Scan Gmail"}</button>
          <button className={styles.addJobButton} onClick={openCreateModal}>+ Add Job</button>
        </div>

        {errorMessage && !modal.open ? <p className={styles.errorMessage}>{errorMessage}</p> : null}
        {oauthMessage ? <p className={styles.oauthMessage}>{oauthMessage}</p> : null}

        {!isLoading && jobs.length > 0 && (
          <div className={styles.statsBar}>
            <div className={styles.statCard}><span className={styles.statValue}>{jobs.length}</span><span className={styles.statLabel}>Total</span></div>
            <div className={`${styles.statCard} ${styles.statApplied}`}><span className={styles.statValue}>{appliedCount}</span><span className={styles.statLabel}>Applied</span></div>
            <div className={`${styles.statCard} ${styles.statInterview}`}><span className={styles.statValue}>{interviewCount}</span><span className={styles.statLabel}>Interview</span></div>
            <div className={`${styles.statCard} ${styles.statOffer}`}><span className={styles.statValue}>{offerCount}</span><span className={styles.statLabel}>Offers</span></div>
            <div className={`${styles.statCard} ${styles.statRejected}`}><span className={styles.statValue}>{rejectedCount}</span><span className={styles.statLabel}>Rejected</span></div>
            <div className={`${styles.statCard} ${styles.statRate}`}><span className={styles.statValue}>{responseRate}%</span><span className={styles.statLabel}>Response Rate</span></div>
          </div>
        )}

        {isLoading ? (
          <p className={styles.emptyState}>Loading jobs…</p>
        ) : jobs.length === 0 ? (
          <section className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>All Jobs</h2>
            <p className={styles.emptyState}>No jobs yet. Connect Gmail to scan or add one manually.</p>
          </section>
        ) : view === "board" ? renderBoard() : renderGrid()}

      </div>

      {renderModal()}
    </LayoutWithSidebar>
  );
}
