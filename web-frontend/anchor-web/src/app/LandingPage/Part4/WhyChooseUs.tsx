"use client";

import styles from "./WhyChooseUs.module.css";
import Image from "next/image";

import ScrollReveal from "@/app/Components/Scroll/ScrollReveal";

const features = [
  {
    id: 1,
    title: "Goal-Aligned Planning",
    desc: "Anchor learns your goals and builds a personalized job search path.",
    icon: "/assets/icon-star.png",
  },
  {
    id: 2,
    title: "Smart Daily Tasks",
    desc: "Stay organized with a clear, adaptive daily task list.",
    icon: "/assets/icon-target.png",
  },
  {
    id: 3,
    title: "Track Your Progress",
    desc: "See your momentum — streaks, tasks completed, applications tracked.",
    icon: "/assets/icon-.png",
  },
  {
    id: 4,
    title: "Motivation & Rewards",
    desc: "Earn points, build streaks, and unlock rewards as you stay consistent.",
    icon: "/assets/icon-star.png",
  },
];

export default function WhyChooseUs() {
  return (
    <div id="features" className={styles.Box3Container}>
      <ScrollReveal animation="up">
        <h4 className={styles.header}>Features</h4>
      </ScrollReveal>
      <ScrollReveal animation="up">
        <h1 className={styles.title}>Why Choose Fintro?</h1>
      </ScrollReveal>
      <ScrollReveal animation="up">
        <p className={styles.subtitle}>
          Seamlessly track, budget, and manage your money—all in one app.
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
                <Image src={feature.icon} alt={feature.title} width={50} height={50} />
              </div>
            </div>
         </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
