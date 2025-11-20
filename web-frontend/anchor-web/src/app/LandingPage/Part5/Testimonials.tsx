"use client";

import styles from "./Testimonials.module.css";
import Image from "next/image";
import ScrollReveal from "@/app/Components/Scroll/ScrollReveal";
// UPDATE THIS PATH to where you saved the component from the previous step
import { InfiniteMarquee } from "@/app/Components/InfiniteMarquee"; 

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
  {
  id: 4,
    name: "Sophia Rossi",
    username: "@Sophia12",
    message:
      "Fintro’s AI-driven tips are spot on. It's like having a personal financial advisor in my pocket!",
    avatar: "/assets/sophia.png",
  },
  {id: 4,
    name: "Julian Thorne",
    username: "@Julian@19",
    message:
      "Fintro’s AI-driven tips are spot on. It's like having a personal financial advisor in my pocket!",
    avatar: "/assets/julian.png",
  },
  
];

// Helper Component to keep the main logic clean
const TestimonialCard = ({ user }: { user: typeof testimonials[0] }) => (
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
      {/* Kept your dismiss class, assuming it styles the 'X' logo or button */}
      <div className={styles.dismiss}>
        <Image 
          src="/assets/an.png" 
          alt="X Logo" 
          width={38} 
          height={38} 
        />
      </div>
    </div>
    <p className={styles.message}>"{user.message}"</p>
  </div>
);

export default function Testimonials() {
  return (
    <div id="testimonials" className={styles.Box4Container}>
      <ScrollReveal animation="up">
        <h4 className={styles.header}>Testimonials</h4>
      </ScrollReveal>
      <ScrollReveal animation="up">
        <h1 className={styles.title}>Wall Of Love</h1>
      </ScrollReveal>
      <ScrollReveal animation="up">
        <p className={styles.subtitle}>
          experience a financial app that adapts to your lifestyles and
          preferences
        </p>
      </ScrollReveal>

      {/* Replaced styles.scrollContainer with InfiniteMarquee */}
      <div style={{ marginTop: "2rem", width: "100%" }}>
        <InfiniteMarquee
          speed={15} // Adjust speed (lower is faster)
          direction="left"
          items={testimonials.map((user) => (
            <TestimonialCard key={user.id} user={user} />
          ))}
        />
      </div>
    </div>
  );
}