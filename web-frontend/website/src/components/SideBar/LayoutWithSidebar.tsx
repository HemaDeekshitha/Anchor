// components/LayoutWithSidebar.tsx
"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import styles from "./style.module.css";

const LayoutWithSidebar = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleToggle = () => setSidebarOpen((prev) => !prev);
  const handleClose = () => setSidebarOpen(false);

  // Optional nice UX: close sidebar on ESC key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} />

      {/* ✅ Overlay (only visible on mobile when sidebar is open) */}
      {isSidebarOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      <main className={styles.mainContent}>
        {/* Hamburger (mobile only via CSS) */}
        <button
          className={styles.menuBtn}
          onClick={handleToggle}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>

        {children}
      </main>
    </div>
  );
};

export default LayoutWithSidebar;
