"use client";
import React from "react";
import styles from "./profile.module.css";
import LayoutWithSidebar from "../SideBar/LayoutWithSidebar";

interface Milestone {
  id: string;
  icon: string;
  text: string;
  completed: boolean;
}

const Profile: React.FC = () => {
  const milestones: Milestone[] = [
    {
      id: "1",
      icon: "🎯",
      text: "Applied to 100 openings in a week",
      completed: true,
    },
    {
      id: "2",
      icon: "💧",
      text: "Practiced DSA 7 days in a row",
      completed: true,
    },
    { id: "3", icon: "⭐", text: "Used AI Coach 5 times", completed: true },
    { id: "4", icon: "🏆", text: "Perfect week streak", completed: false },
  ];

  return (
    <LayoutWithSidebar>
      <div className={styles.profileContainer}>
        <div className={styles.profileHeader}>
          {/* <button className={styles.backButton}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
          </svg>
        </button> */}
        </div>

        <div className={styles.profileCard}>
          <div className={styles.userInfo}>
            <div className={styles.avatarContainer}>
              <div className={styles.avatar}>AD</div>
              <div className={styles.avatarBadge}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                  <path d="M8 0L10.472 5.528L16 8L10.472 10.472L8 16L5.528 10.472L0 8L5.528 5.528L8 0Z" />
                </svg>
              </div>
            </div>
            <div className={styles.userDetails}>
              <h2 className={styles.userName}>Alex Doe</h2>
              <p className={styles.userEmail}>alex.doe@email.com</p>
              <div className={styles.userTags}>
                <span className={`${styles.tag} ${styles.tagClass}`}>
                  🎓 Class of 2024
                </span>
                <span className={`${styles.tag} ${styles.tagStatus}`}>
                  🎯 Actively Applying
                </span>
              </div>
            </div>
          </div>

          <div className={styles.emailSync}>
            <div className={styles.syncLabel}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span>Email Sync</span>
            </div>
            <div className={styles.syncStatus}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="#10b981">
                <path
                  fillRule="evenodd"
                  d="M13.854 3.646a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 11.708-.708L6.5 10.293l6.646-6.647a.5.5 0 01.708 0z"
                />
              </svg>
              <span className={styles.synced}>Synced</span>
            </div>
          </div>
        </div>

        <div className={styles.progressSection}>
          <h3 className={styles.sectionTitle}>Progress Summary</h3>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🔥</div>
              <div className={styles.statValue}>7</div>
              <div className={styles.statLabel}>Day Streak</div>
              <div className={styles.statMeta}>Longest: 12</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>⭐</div>
              <div className={styles.statValue}>2,450</div>
              <div className={styles.statLabel}>Total Points</div>
              <div className={styles.statMeta}>All time</div>
            </div>
          </div>
        </div>

        <div className={styles.milestonesSection}>
          <h3 className={styles.sectionTitle}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Milestones Unlocked
          </h3>

          <div className={styles.milestonesList}>
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className={`${styles.milestoneItem} ${
                  milestone.completed ? styles.completed : styles.locked
                }`}
              >
                <div className={styles.milestoneIcon}>{milestone.icon}</div>
                <div className={styles.milestoneText}>{milestone.text}</div>
                {milestone.completed && (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="#10b981"
                    className={styles.checkIcon}
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.rewardsSection}>
          <h3 className={styles.sectionTitle}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Rewards Earned
          </h3>

          <div className={styles.rewardsGrid}>
            <div className={styles.rewardCard}>
              <div className={styles.rewardIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#ff9a56">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
              <div className={styles.rewardInfo}>
                <div className={styles.rewardTitle}>Boba Token</div>
              </div>
            </div>

            <div className={styles.rewardCard}>
              <div className={styles.rewardIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#ff9a56">
                  <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2M18 20H6V4H13V9H18V20Z" />
                </svg>
              </div>
              <div className={styles.rewardInfo}>
                <div className={styles.rewardTitle}>Resume Review Token</div>
              </div>
            </div>

            <div className={styles.rewardCard}>
              <div className={styles.rewardIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#d1d5db">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
              <div className={styles.rewardInfo}>
                <div className={styles.rewardTitle}>Priority Support</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.activitySection}>
          <h3 className={styles.sectionTitle}>Weekly Activity</h3>

          <div className={styles.activityCard}>
            <div className={styles.activityHeader}>
              <div className={styles.activityIcon}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="#60a5fa">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div className={styles.activityDetails}>
                <div className={styles.activityTitle}>Tasks This Week</div>
                <div className={styles.activitySubtitle}>72% Completed</div>
              </div>
            </div>

            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: "72%" }}
              ></div>
            </div>

            <div className={styles.taskStats}>
              <div className={styles.taskStat}>
                <div
                  className={styles.taskStatValue}
                  style={{ color: "#10b981" }}
                >
                  18
                </div>
                <div className={styles.taskStatLabel}>Completed</div>
              </div>
              <div className={styles.taskStat}>
                <div
                  className={styles.taskStatValue}
                  style={{ color: "#f59e0b" }}
                >
                  5
                </div>
                <div className={styles.taskStatLabel}>Pending</div>
              </div>
              <div className={styles.taskStat}>
                <div
                  className={styles.taskStatValue}
                  style={{ color: "#6b7280" }}
                >
                  2
                </div>
                <div className={styles.taskStatLabel}>Skipped</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.moodSection}>
          <h3 className={styles.sectionTitle}>Mood Tracker</h3>

          <div className={styles.moodCard}>
            <div className={styles.moodIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#10b981">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#10b981"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="9" cy="9" r="1" fill="#10b981" />
                <circle cx="15" cy="9" r="1" fill="#10b981" />
              </svg>
            </div>
            <div className={styles.moodInfo}>
              <div className={styles.moodTitle}>Average Mood This Week</div>
              <div className={styles.moodValue}>😊 Positive</div>
            </div>
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  );
};

export default Profile;
