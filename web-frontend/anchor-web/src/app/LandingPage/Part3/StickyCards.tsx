"use client";

import Image from "next/image";
import styles from "./StickyCards.module.css";

import {IPhoneFrame} from "@/app/Components/IPhoneFrame";

import ScrollReveal from "@/app/Components/Scroll/ScrollReveal";
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

  {
    id: 4,
    image: "/assets/step3.png",
    title: "Get Personalized Insights",
    desc: "Receive smart recommendations to help you optimize spending and reach goals faster.",
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
      Experience personalised insights and effortless financial management.
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
                         style={{ objectFit:"cover" }}
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
