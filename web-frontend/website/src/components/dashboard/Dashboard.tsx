"use client";
import React, { useState, useEffect } from "react";
import {
  Check,
  ChevronRight,
  LayoutDashboard,
  ListTodo,
  Trophy,
  User,
  Bell,
  Menu,
  Loader2,
} from "lucide-react";
import styles from "./dashboard.module.css";

interface Task {
  id: number;
  title: string;
  status: "pending" | "completed";
  date?: string;
  is_ai_generated?: boolean;
}

const Dashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebarOpen") === "false" ? false : true;
    }
    return true;
  });

  const [hasMounted, setHasMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [smartPlan, setSmartPlan] = useState<Task[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);

  useEffect(() => {
    setHasMounted(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://localhost:3001/dashboard/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "user_test01" }),
      });

      const data = await res.json();

      if (data.tasks) {
        const aiTasks = data.tasks.filter(
          (t: any) => t.is_ai_generated === true,
        );
        const backlog = data.tasks.filter((t: any) => !t.is_ai_generated);
        setSmartPlan(aiTasks);
        setPendingTasks(backlog);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTask = (id: number) => {
    setSmartPlan(
      smartPlan.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "completed" ? "pending" : "completed" }
          : t,
      ),
    );
  };

  const completedCount = smartPlan.filter(
    (t) => t.status === "completed",
  ).length;

  const progress =
    smartPlan.length > 0
      ? Math.round((completedCount / smartPlan.length) * 100)
      : 0;

  const handleSidebarToggle = () => {
    const newState = !isSidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem("sidebarOpen", newState.toString());
  };

  return (
    <div className={styles.container}>
      {/* --- SIDEBAR --- */}
      {hasMounted && (
        <nav
          className={`${styles.sidebar} ${
            !isSidebarOpen ? styles.sidebarCollapsed : ""
          }`}
        >
          <div className={styles.brand}>
            <img
              src="/assets/logo.png"
              alt="Anchor Logo"
              className={styles.brandIcon}
            />
            <span>Anchor</span>
          </div>

          <div className={`${styles.navItem} ${styles.navItemActive}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </div>
          <div className={styles.navItem}>
            <ListTodo size={20} />
            <span>My Plan</span>
          </div>
          <div className={styles.navItem}>
            <Trophy size={20} />
            <span>Rewards</span>
          </div>
          <div className={styles.navItem}>
            <User size={20} />
            <span>Profile</span>
          </div>
        </nav>
      )}

      {/* --- MAIN CONTENT --- */}
      <main className={styles.mainContent}>
        {/* HEADER */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button onClick={handleSidebarToggle} className={styles.menuBtn}>
              <Menu size={20} />
            </button>

            <div className={styles.welcomeText}>
              <h1>Hello, Alex 👋</h1>
              <span className={styles.dateText}>
                {new Date().toDateString()} • "Let's make today count!"
              </span>
            </div>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.notificationBtn}>
              <Bell size={20} color="#be123c" />
            </div>
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80"
              alt="Profile"
              className={styles.avatar}
            />
          </div>
        </header>

        {/* LOADING STATE OR CONTENT */}
        {isLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "50px",
              color: "#be123c",
            }}
          >
            <Loader2 className="animate-spin" size={40} />
            <span style={{ marginLeft: "10px", marginTop: "8px" }}>
              {/* Generating your AI Plan... */}
            </span>
          </div>
        ) : (
          <>
            {/* PROGRESS BAR */}
            <section className={styles.progressCard}>
              <div className={styles.progressHeader}>
                <span>Daily Progress</span>
                <span style={{ color: "#be123c" }}>{progress}%</span>
              </div>
              <div className={styles.progressBarBg}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </section>

            {/* TASKS STACKED VERTICALLY */}
            <div className={styles.gridContainer}>
              {/* SMART PLAN */}
              <section>
                <h2 className={styles.sectionTitle}>
                  Today's Smart Plan
                  <span className={styles.aiBadge}>AI Generated</span>
                </h2>

                <div className={styles.taskList}>
                  {smartPlan.map((task) => (
                    <div
                      key={task.id}
                      className={`${styles.taskCard} ${
                        task.status === "completed" ? styles.completed : ""
                      }`}
                      onClick={() => toggleTask(task.id)}
                    >
                      <div className={styles.taskLeft}>
                        <div className={styles.checkbox}>
                          {task.status === "completed" && (
                            <Check size={14} color="white" />
                          )}
                        </div>
                        <span className={styles.taskTitle}>{task.title}</span>
                      </div>
                      <ChevronRight size={20} color="#fb7185" />
                    </div>
                  ))}
                  {smartPlan.length === 0 && (
                    <p style={{ color: "#888" }}>No plan generated yet.</p>
                  )}
                </div>
              </section>

              {/* PENDING TASKS */}
              <section>
                <h2 className={styles.sectionTitle}>Pending Tasks</h2>

                <div className={styles.taskList}>
                  {pendingTasks.map((task) => (
                    <div key={task.id} className={styles.pendingTaskCard}>
                      <div className={styles.taskLeft}>
                        <div
                          className={styles.checkbox}
                          style={{
                            borderColor: "#ef4444",
                            backgroundColor: "white",
                          }}
                        ></div>

                        <div>
                          <span className={styles.pendingTitle}>
                            {task.title}
                          </span>
                          <span className={styles.pendingDate}>
                            {task.date || "Overdue"}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={20} className={styles.redArrow} />
                    </div>
                  ))}
                  {pendingTasks.length === 0 && (
                    <p style={{ color: "#888" }}>No pending tasks!</p>
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
