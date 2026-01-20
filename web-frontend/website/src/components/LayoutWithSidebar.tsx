"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar"; // Path as per your structure
import styles from "./dashboard/dashboard.module.css"; // Using global layout styles

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
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.menuBtn} onClick={handleToggle}>
              ☰
            </button>
            <div className={styles.welcomeText}>
              <h1>Hello, Alex 👋</h1>
              <span className={styles.dateText}>
                {new Date().toDateString()} • "Keep pushing!"
              </span>
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};

export default LayoutWithSidebar;
