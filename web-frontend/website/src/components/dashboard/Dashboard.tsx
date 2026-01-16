"use client";

import React, { useState } from "react";
import styles from "./dashboard.module.css";

interface Task {
  id: number;
  title: string;
  isCompleted: boolean;
}

const initialTasks: Task[] = [
  { id: 1, title: "Apply to 2 jobs", isCompleted: false },
  { id: 2, title: "Record 1 behavioral Q", isCompleted: false },
  { id: 3, title: "Practice 1 SQL question", isCompleted: false },
  { id: 4, title: "Save 3 job links", isCompleted: false },
  { id: 5, title: "Research 2 companies", isCompleted: false },
];

export default function Dashboard() {
  const [tasks, setTasks] = useState(initialTasks);
  const [pendingView, setPendingView] = useState<"today" | "previous">("today");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // 1. Calculate stats based on state
  const completedCount = tasks.filter(t => t.isCompleted).length;
  const progressPercentage = (completedCount / tasks.length) * 100;

  // 2. Filter for Pending Tasks (Only show incomplete ones)
  const incompleteTasks = tasks.filter(t => !t.isCompleted);

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
    ));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className={styles.container}>
      
      {/* --- SIDEBAR / HEADER --- */}
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <span className={styles.logoIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"></circle><line x1="12" y1="22" x2="12" y2="8"></line><path d="M5 12H2a10 10 0 0 0 20 0h-3"></path></svg>
          </span>
          <span>Anchor</span>
        </div>

        <button className={styles.hamburgerBtn} onClick={toggleMobileMenu} aria-label="Toggle menu">
          {isMobileMenuOpen ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          )}
        </button>

        <nav className={`${styles.navMenu} ${isMobileMenuOpen ? styles.open : ''}`}>
          <a href="#" className={`${styles.navItem} ${styles.navItemActive}`}>
            <span className={styles.navIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </span>
            Home
          </a>
          <a href="#" className={styles.navItem}>
            <span className={styles.navIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </span>
            Rewards
          </a>
          <a href="#" className={styles.navItem}>
            <span className={styles.navIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            </span>
            Tracker
          </a>
          <a href="#" className={styles.navItem}>
            <span className={styles.navIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></span>
            Account
          </a>
        </nav>

      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className={styles.mainContent}>
        <div className={styles.wrapper}>
          
          <header className={styles.header}>
            <div className={styles.greeting}>
              <h1>Hi Meghana</h1>
              <p className={styles.subGreeting}>Let's make today count!</p>
            </div>
            <div className={styles.profileSection}>
              <div className={styles.streakBadge}>
                <span className={styles.flameIcon}>🔥</span>
                7 day streak
              </div>
            </div>
          </header>

          <section className={styles.progressCard}>
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>Daily Progress</span>
              <span className={styles.statusText}>
                Balanced {completedCount}/{tasks.length}
              </span>
            </div>
            <div className={styles.progressBarContainer}>
              <div 
                className={styles.progressBarFill} 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </section>

          {/* Smart Plan (Source of Truth) */}
          <div className={styles.planSection}>
            <h2 className={styles.planTitle}>
              <span className={styles.planIcon}>⚡</span>
              Today's Smart Plan
            </h2>

            <div className={styles.taskList}>
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`${styles.taskCard} ${task.id === 3 ? styles.activeCard : ''}`} 
                  onClick={() => toggleTask(task.id)}
                >
                  <div className={styles.taskLeft}>
                     <div 
                      className={styles.radioCircle}
                      style={{ 
                        backgroundColor: task.isCompleted ? '#f75252' : 'transparent',
                        borderColor: task.isCompleted ? '#f75252' : '#d1d5db'
                      }}
                     />
                     <span className={styles.taskText}>{task.title}</span>
                  </div>
                  <div className={styles.chevron}>›</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Tasks Section (Reactive UI) */}
          <h3 className={styles.sectionHeading}>Pending Tasks</h3>
          <div className={styles.toggleContainer}>
            <button 
              className={`${styles.toggleButton} ${pendingView === 'today' ? styles.toggleButtonActive : ''}`}
              onClick={() => setPendingView('today')}
            >
              Today
            </button>
            <button 
              className={`${styles.toggleButton} ${pendingView === 'previous' ? styles.toggleButtonActive : ''}`}
              onClick={() => setPendingView('previous')}
            >
              Previous
            </button>
          </div>

          {/* Conditional Rendering: List OR Empty State */}
          {pendingView === 'today' && (
            <>
              {incompleteTasks.length > 0 ? (
                // 3. SHOW TASKS IF INCOMPLETE
                <div className={styles.taskList}>
                  {incompleteTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className={styles.taskCard}
                      onClick={() => toggleTask(task.id)}
                    >
                      <div className={styles.taskLeft}>
                        <div className={styles.radioCircle} /> {/* Empty circle since it's pending */}
                        <span className={styles.taskText}>{task.title}</span>
                      </div>
                      <div className={styles.chevron}>›</div>
                    </div>
                  ))}
                </div>
              ) : (
                // 4. SHOW EMPTY STATE IF ALL DONE
                <div className={styles.emptyStateCard}>
                  <div className={styles.emptyStateText}>
                    All caught up for today! 🎉
                  </div>
                  <div className={styles.emptyStateActions}>
                     <button className={styles.actionButton}>Break into steps?</button>
                     <button className={styles.actionButton}>Skip for now</button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* NEW: PREVIOUS VIEW EMPTY STATE */}
          {pendingView === 'previous' && (
            <div className={styles.emptyStateCard}>
              <div className={styles.emptyStateText}>
                You have no pending tasks
              </div>
            </div>
          )}

          <h3 className={styles.sectionHeading}>Rewards</h3>
          <div className={styles.rewardsCard}>
            <div className={styles.rewardsHeader}>
               <div>
                 <span className={styles.pointsTitle}>Your Points</span>
                 <div className={styles.pointsValue}>0 <span>pts</span></div>
               </div>
               <div className={styles.pointsBadge}>+0 today</div>
            </div>
            <div className={styles.redeemBar}>Redeem Rewards</div>
            <div className={styles.tiersGrid}>
              <div className={styles.tierItem}>
                <div className={styles.tierLock}>🔒</div>
                <div className={styles.tierPoints}>100 pts</div>
              </div>
              <div className={styles.tierItem}>
                <div className={styles.tierLock}>🔒</div>
                <div className={styles.tierPoints}>250 pts</div>
              </div>
              <div className={styles.tierItem}>
                <div className={styles.tierLock}>🔒</div>
                <div className={styles.tierPoints}>500 pts</div>
              </div>
            </div>
          </div>

          <h3 className={styles.sectionHeading}>How are you feeling?</h3>
          <div className={styles.moodGrid}>
            <div className={styles.moodCard}>
              <div className={styles.moodEmoji}>😊</div>
              <div className={styles.moodLabel}>Great</div>
            </div>
            <div className={styles.moodCard}>
              <div className={styles.moodEmoji}>😐</div>
              <div className={styles.moodLabel}>Okay</div>
            </div>
            <div className={styles.moodCard}>
              <div className={styles.moodEmoji}>😫</div>
              <div className={styles.moodLabel}>Tough</div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}