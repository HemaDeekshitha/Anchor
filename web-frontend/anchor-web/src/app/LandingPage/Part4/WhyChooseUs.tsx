"use client";

import styles from "./WhyChooseUs.module.css";
import Image from "next/image";

import ScrollReveal from "@/app/Components/Scroll/ScrollReveal";

const features = [
  {
    id: 1,
    title: "Goal-Aligned Planning",
    desc: "Anchor learns your goals and builds a personalized job search path.",
    icon: "/assets/icon-target.png",
    rotate: "-50deg",
  },
  {
    id: 2,
    title: "Success Tracking",
    desc: "Visualize your progress, manage incoming offers, and celebrate every milestone.",
    icon: "/assets/icon-trophy.png",
    rotate: "-4deg",
  },
  {
    id: 3,
    title: "Career Acceleration",
    desc: "Streamline your workflow to apply faster and land your dream role sooner.",
    icon: "/assets/icon-rocket.png",
    rotate: "10deg",
  },
  {
    id: 4,
    title: "Motivation & Rewards",
    desc: "Earn points, build streaks, and unlock rewards as you stay consistent.",
    icon: "/assets/icon-star.png",
    rotate: "30deg",
  },
];

export default function WhyChooseUs() {
  return (
    <div id="features" className={styles.Box3Container}>
      <ScrollReveal animation="up">
        <h4 className={styles.header}>Features</h4>
      </ScrollReveal>
      <ScrollReveal animation="up">
        <h1 className={styles.title}>Why Choose Anchor?</h1>
      </ScrollReveal>
      <ScrollReveal animation="up">
        <p className={styles.subtitle}>
          Seamlessly track, organize, and accelerate your job search —- all in one place.
        </p>
      </ScrollReveal>

      <div className={styles.grid}>
        {features.map((feature) => (
          <ScrollReveal key={feature.id} animation="up">
            <div className={styles.card}>
              <div className={styles.text}>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
              <div className={styles.icon}>
                <Image src={feature.icon} 
                       alt={feature.title} 
                       width={140} 
                       height={140} 
                       style={{ transform: `rotate(${feature.rotate})` }}/>
              </div>
            </div>
         </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
