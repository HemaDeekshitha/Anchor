"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import styles from "./CardSlideReveal.module.css";

interface CardSlideRevealProps {
  children: ReactNode;
  direction?: "left" | "right";
  delay?: number;
}

export default function CardSlideReveal({
  children,
  direction = "left",
  delay = 0,
}: CardSlideRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.25 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles.wrapper} ${visible ? styles.visible : ""} ${
        direction === "left" ? styles.left : styles.right
      }`}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
