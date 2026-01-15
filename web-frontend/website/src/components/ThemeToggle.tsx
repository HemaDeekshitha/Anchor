"use client"; // Required for interactivity

import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("system");

  // 1. On load, check if user has a preference saved
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  // 2. Function to toggle between Light and Dark
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);

    // Update HTML and Save to LocalStorage
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle Dark Mode"
      style={{
        position: "fixed" /* Fixes it to the screen */,
        top: "1.5rem",
        right: "1.5rem",
        zIndex: 9999 /* Ensures it sits on top of everything */,
        padding: "0.5rem 1rem",
        borderRadius: "50px",
        border: "1px solid var(--foreground)",
        background: "var(--background)",
        color: "var(--foreground)",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "0.875rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
