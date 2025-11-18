"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./Header.module.css";

export default function Header() {
  const [active, setActive] = useState("home");

  useEffect(() => {
    const sections = [
      { id: "home", label: "Home" },
      { id: "benefits", label: "Benefits" },
      { id: "getstarted", label: "Get Started" },
      { id: "features", label: "Features" },
      { id: "testimonials", label: "Testimonials" },
      { id: "faqs", label: "FAQs" },
    ];

    const observers: IntersectionObserver[] = [];

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActive(section.id);
          }
        },
        {
          threshold: 0.5, // when 50% of section is visible
        }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  return (
    <div className={styles.header}>
      <a href="#home" className={styles.menuH}>
        Anchor
      </a>

      <div className={styles.menu}>
        <p
          className={`${styles.menuP} ${
            active === "benefits" ? styles.active : ""
          }`}
        >
          Benefits
        </p>

        <p
          className={`${styles.menuP} ${
            active === "getstarted" ? styles.active : ""
          }`}
        >
          Get Started
        </p>

        <p
          className={`${styles.menuP} ${
            active === "features" ? styles.active : ""
          }`}
        >
          Features
        </p>

        <p
          className={`${styles.menuP} ${
            active === "testimonials" ? styles.active : ""
          }`}
        >
          Testimonials
        </p>

        <p
          className={`${styles.menuP} ${
            active === "faqs" ? styles.active : ""
          }`}
        >
          FAQs
        </p>
      </div>

      <a
        href="#"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.button}
      >
        <Image
          src="/assets/appstore.svg"
          alt="Download on the App Store"
          width={140}
          height={50}
          priority
        />
      </a>
    </div>
  );
}
