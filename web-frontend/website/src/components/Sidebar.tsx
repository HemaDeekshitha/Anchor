// components/Sidebar.tsx
"use client";
import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ListTodo,
  Trophy,
  User,
} from "lucide-react";
import styles from "./dashboard/dashboard.module.css"; // Adjust the path based on your folder structure

interface SidebarProps {
  isSidebarOpen: boolean;
  hasMounted: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, hasMounted }) => {
  if (!hasMounted) return null;

  return (
    <nav
      className={`${styles.sidebar} ${
        !isSidebarOpen ? styles.sidebarCollapsed : ""
      }`}
    >
      <div className={styles.brand}>
        <img src="/assets/logo.png" alt="Anchor Logo" className={styles.brandIcon} />
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
      <Link href="/profile" className={styles.navItem}>
        <User size={20} />
        <span>Profile</span>
      </Link>
    </nav>
  );
};

export default Sidebar;
