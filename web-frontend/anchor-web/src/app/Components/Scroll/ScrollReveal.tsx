"use client";

import { useRef, useEffect, useState, ReactNode } from "react";
import styles from "./ScrollReveal.module.css";

export default function ScrollReveal({
  children,
  animation = "up",
}: {
  children: ReactNode;
  animation?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);

          // Reset visibility after leaving screen to allow re-animation
        } else {
          setVisible(false);
        }
      },
      {
        threshold: 0.3,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles.revealBase} ${
        visible ? styles[`reveal_${animation}`] : styles.hidden
      }`}
    >
      {children}
    </div>
  );
}
