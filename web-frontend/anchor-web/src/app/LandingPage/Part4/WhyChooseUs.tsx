"use client";

import styles from "./WhyChooseUs.module.css";
import Image from "next/image";
import ScrollInViewMotion from "@/app/Components/Scroll/ScrollInViewMotion";

const features = [
  {
    id: 1,
    title: "Smart Spending",
    desc: "Track expenses automatically, identify trends, and make informed decisions.",
    icon: "/assets/icon-spending.png",
  },
  {
    id: 2,
    title: "Personal Insights",
    desc: "Get personalized tips, visualize spending with charts, and track financial goals.",
    icon: "/assets/icon-insights.png",
  },
  {
    id: 3,
    title: "Easy Budgeting",
    desc: "Create custom budgets, monitor spending, and get alerts when limits are near.",
    icon: "/assets/icon-budgeting.png",
  },
  {
    id: 4,
    title: "Bank-Grade Security",
    desc: "Get personalized tips, visualize spending with charts, and track financial goals.",
    icon: "/assets/icon-security.png",
  },
];

export default function WhyChooseUs() {
  return (
    <section id="features" className={styles.section}>
      <div className={styles.heading}>
        <span className={styles.header}>Features</span>
        <h2>Why Choose Fintro?</h2>
        <p className={styles.subtitle}>
          Seamlessly track, budget, and manage your money—all in one app.
        </p>
      </div>

      <div className={styles.grid}>
        {features.map((feature, i) => (
          <ScrollInViewMotion direction="up" delay={i * 150} key={feature.id}>
            <div className={styles.card}>
              <div className={styles.text}>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
              <div className={styles.icon}>
                <Image src={feature.icon} alt={feature.title} width={50} height={50} />
              </div>
            </div>
          </ScrollInViewMotion>
        ))}
      </div>
    </section>
  );
}
