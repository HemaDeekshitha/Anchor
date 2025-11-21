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
    message:"Job hunt was a stressful mess of spreadsheets. Now everything is organized and clear. Total game-changer!",
    avatar: "/assets/mark.png",
  },
  {
    id: 2,
    name: "Alex Kim",
    username: "@Alex Kim",
    message:"Anchor cut my application time in half. I stopped wasting time and landed my offer faster than I ever thought.",
        avatar: "/assets/alex.png",
  },
  {
    id: 3,
    name: "Sarah Lee",
    username: "@Sarah Lee",
    message:"The goal-tracking system is motivating. Building streaks keeps me consistent, even when the search felt overwhelming.",
        avatar: "/assets/sarah.png",
  },
  {
  id: 4,
    name: "Sophia Rossi",
    username: "@Sophia12",
    message:"Anchor truly anchored my chaotic job search, providing a clear path and eliminating the daily stress. A lifesaver",
        avatar: "/assets/sophia.png",
  },
  {id: 4,
    name: "Julian Thorne",
    username: "@Julian@19",
    message:"The personalized path planning is spot-on. It's like having a dedicated career coach guiding me through every single step.",
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
          Here what some of our early users had to say.
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