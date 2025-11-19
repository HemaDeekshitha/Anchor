"use client";

import styles from "./Testimonials.module.css";
import Image from "next/image";
import ScrollInViewMotion from "@/app/Components/Scroll/ScrollInViewMotion";

const testimonials = [
  {
    id: 1,
    name: "Mark Thompson",
    username: "@Mark Thompson",
    message:
      "Thanks to Fintro, I've been able to save more money and achieve my financial goals faster than ever.",
    avatar: "/assets/mark.png",
  },
  {
    id: 2,
    name: "Alex Kim",
    username: "@Alex Kim",
    message:
      "Fintro’s AI-driven tips are spot on. It's like having a personal financial advisor in my pocket!",
    avatar: "/assets/alex.png",
  },
  {
    id: 3,
    name: "Sarah Lee",
    username: "@Sarah Lee",
    message:
      "The adaptive budgeting feature is incredible. Fintro makes it so easy to stay on top of my spending!",
    avatar: "/assets/sarah.png",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className={styles.section}>
      <div className={styles.heading}>
        <span className={styles.header}>Testimonials</span>
        <h2>Wall Of Love</h2>
        <p className={styles.subtitle}>Here what some of our early users had to say</p>
      </div>

      <div className={styles.scrollContainer}>
        {testimonials.map((user, i) => (
          <ScrollInViewMotion key={user.id} direction="right" delay={i * 150}>
            <div className={styles.card}>
              <div className={styles.userInfo}>
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={48}
                  height={48}
                  className={styles.avatar}
                />
                <div>
                  <div className={styles.name}>{user.name}</div>
                  <div className={styles.username}>{user.username}</div>
                </div>
                <div className={styles.dismiss}>✖</div>
              </div>
              <p className={styles.message}>"{user.message}"</p>
            </div>
          </ScrollInViewMotion>
        ))}
      </div>
    </section>
  );
}
