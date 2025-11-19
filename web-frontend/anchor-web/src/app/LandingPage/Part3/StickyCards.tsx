"use client";

import Image from "next/image";
import styles from "./StickyCards.module.css";
import CardSlideReveal from "@/app/Components/Scroll/CardSlideReveal";
// import ScrollInViewMotion from "@/app/Components/Scroll/ScrollInViewMotion";
const steps = [
  {
    id: 1,
    image: "/assets/step1.png",
    title: "Create Your Account",
    desc: "Sign up in minutes and start your journey to smarter financial management with Fintro.",
  },
  {
    id: 2,
    image: "/assets/step2.png",
    title: "Link Your Bank Accounts",
    desc: "Securely connect all your bank accounts and credit cards for a complete financial overview.",
  },
  {
    id: 3,
    image: "/assets/step3.png",
    title: "Get Personalized Insights",
    desc: "Receive smart recommendations to help you optimize spending and reach goals faster.",
  },
];

export default function StickyCards() {
  return (
    <section id="getstarted" className={styles.section}>
      <div className={styles.headingGroup}>
        <h4 className={styles.header}>Get started</h4>
        <h1 className={styles.title}>How It Works</h1>
        <p className={styles.subtitle}>
          Experience personalised insights and effortless financial management.
        </p>
      </div>

      <div className={styles.stepsWrapper}>
        {steps.map((step, i) => (
          <div key={step.id} className={styles.stepRow}>
            <CardSlideReveal direction="left" delay={i * 150}>
              <div className={styles.imageBox}>
                <Image
                  src={step.image}
                  alt={step.title}
                  width={300}
                  height={300}
                />
              </div>
            </CardSlideReveal>

            <CardSlideReveal direction="right" delay={i * 150 + 100}>
              <div className={styles.textBox}>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </CardSlideReveal>
            {/* <ScrollInViewMotion direction="left" delay={100}>
  <div className={styles.imageCard}>
    <Image src="/assets/step1.png" alt="Step 1" width={300} height={300} />
  </div>
</ScrollInViewMotion>

<ScrollInViewMotion direction="right" delay={200}>
  <div className={styles.textCard}>
    <h3>Create Your Account</h3>
    <p>Sign up in minutes and manage your job search easily.</p>
  </div>
</ScrollInViewMotion> */}
          </div>
        ))}
      </div>
    </section>
  );
}
