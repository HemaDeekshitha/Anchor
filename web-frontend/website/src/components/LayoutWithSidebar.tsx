// components/LayoutWithSidebar.tsx
"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import styles from "./dashboard/dashboard.module.css";

const LayoutWithSidebar = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const state = localStorage.getItem("sidebarOpen");
    setSidebarOpen(state === "false" ? false : true);
  }, []);

  const handleToggle = () => {
    const newState = !isSidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem("sidebarOpen", newState.toString());
  };

  return (
    <div className={styles.container}>
      <Sidebar isSidebarOpen={isSidebarOpen} hasMounted={hasMounted} />
      <main className={styles.mainContent}>
        {/* 🔁 Only retains toggle button; no greeting */}
        <div className={styles.header}>
          <button className={styles.menuBtn} onClick={handleToggle}>
            ☰
          </button>
        </div>

        {children}
      </main>
    </div>
  );
};

export default LayoutWithSidebar;
