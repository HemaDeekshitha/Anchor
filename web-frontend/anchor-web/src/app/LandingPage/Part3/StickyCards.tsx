"use client";

import Image from "next/image";
import styles from "./StickyCards.module.css";

import {IPhoneFrame} from "@/app/Components/IPhoneFrame";

import ScrollReveal from "@/app/Components/Scroll/ScrollReveal";
// import ScrollInViewMotion from "@/app/Components/Scroll/ScrollInViewMotion";
const steps = [
  {
    id: 1,
    image: "/assets/s1.png",
    title: "Create Your Account",
    desc: "Sign up in minutes and set your job goals so Anchor can personalize your experience.",
  },
  {
    id: 2,
    image: "/assets/s2.png",
    title: " Get Your Smart Daily Plan",
    desc: "Anchor builds a simple, personalized plan of daily tasks, job applications, interview prep, networking, and skill practice.",
  },
  {
    id: 3,
    image: "/assets/s3.png",
    title: "Track Every Application",
    desc: "See what’s applied, interviewing, pending, and follow-ups without forgetting anything.",
  },

  {
    id: 4,
    image: "/assets/s4.png",
    title: "Earn Rewards & Stay Motivated",
    desc: "Complete tasks, build streaks, earn points, and redeem them for rewards. All while moving closer to your dream job.",
  },


];

export default function StickyCards() {
  return (
<section id="getstarted" className={styles.section}>
 <ScrollReveal animation="up">
  
    <h4 className={styles.header}>Get started</h4>
 </ScrollReveal>
  <ScrollReveal animation="up">

    <h1 className={styles.title}>How It Works</h1>
  </ScrollReveal>
   <ScrollReveal animation="up">

    <p className={styles.subtitle}>
      Experience goal-aligned planning and effortless career acceleration.
    </p>
   </ScrollReveal>


<div className={styles.scrollPadding}>
  <div className={styles.scrollHolder}>
    <div className={styles.stickyOuter}>
      {steps.map((step, i) => (
       <div
  key={step.id}
  className={styles.stickyCard}
  style={{ zIndex: i }}
>
  <div className={styles.cardInner}>
    <div className={styles.imageBox}>
      <IPhoneFrame width="195px">
                       <Image 
                         src={step.image} 
                         alt={step.title}
                         fill 
                         style={{ objectFit:"contain" }}
                         sizes="(max-width: 768px) 100vw, 280px"
                       />
                    </IPhoneFrame>
                  </div>
      {/* <Image src={step.image} width={300} height={300} alt="" /> */}
    

    <div className={styles.textBox}>
      <h3>{step.title}</h3>
      <p>{step.desc}</p>
    </div>
  </div>
</div>

      ))}
    </div>
  </div>
  </div>
</section>




  );
}
