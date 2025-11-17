"use client";

import { useRef, useEffect, useState } from "react";
import styles from "./ScrollReveal.module.css";

import { ReactNode } from "react";

export default function ScrollReveal({
  children,
  animation = "up",
}: {
  children: ReactNode;
  animation?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // prevent reload animation
        }
      },
      {
        threshold: 0.25, // 25% of the element must be in view
        rootMargin: "0px 0px -100px 0px", // start animation slightly later
      }
    );

    if (ref.current) observer.observe(ref.current);
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles.revealBase} ${
        isVisible ? styles[`reveal_${animation}`] : ""
      }`}
    >
      {children}
    </div>
  );
}
