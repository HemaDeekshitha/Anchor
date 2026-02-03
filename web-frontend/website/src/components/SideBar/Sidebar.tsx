// components/Sidebar.tsx
"use client";
import React from "react";
import Link from "next/link";
import { ListTodo, Trophy, User } from "lucide-react";
import styles from "./style.module.css";

interface SidebarProps {
  isSidebarOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen }) => {
  return (
    <nav
      className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ""}`}
    >
      <Link href="/dashboard" className={styles.brand}>
        <img
          src="/assets/logo.png"
          alt="Anchor Logo"
          className={styles.brandIcon}
        />
        <span>Anchor</span>
      </Link>

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
