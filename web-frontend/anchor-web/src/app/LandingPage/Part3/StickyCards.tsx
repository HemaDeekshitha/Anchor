"use client";

import Image from "next/image";
import { Box, Typography } from "@mui/material";
import styles from "./StickyCards.module.css";

import { IPhoneFrame } from "@/app/Components/IPhoneFrame";
import ScrollReveal from "@/app/Components/Scroll/ScrollReveal";

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
      {/* HEADER */}
      {/* HEADER */}
<ScrollReveal animation="up">
  <Box
    sx={{
      background: "linear-gradient(90deg, #fefdff 0%, rgb(227,223,249) 100%)",
      color: "grey",
      padding: "0.8rem",
      width: "7rem",
      borderRadius: "2rem",
      textAlign: "center",
      fontWeight: 600,
      fontSize: "1rem",
      margin: "0 auto",        // ⬅ Center it properly
      display: "flex",
      justifyContent: "center",
    }}
  >
    Get started
  </Box>
</ScrollReveal>

{/* TITLE */}
<ScrollReveal animation="up">
  <Typography
    sx={{
      fontSize: { xs: "2.2rem", md: "4rem" },
      fontWeight: "bold",
      marginTop: "16px",
      color: "black",
      textAlign: "center",
      lineHeight: 1.1,
      maxWidth: "50rem",       // ⬅ same as original CSS
      marginX: "auto",         // ⬅ perfectly centered block
    }}
  >
    How It Works
  </Typography>
</ScrollReveal>

{/* SUBTITLE */}
<ScrollReveal animation="up">
  <Typography
    sx={{
      fontSize: "1rem",
      fontWeight: 500,
      marginBottom: "0rem",
      color: "grey",
      textAlign: "center",
      lineHeight: 1.5,
      maxWidth: "60rem",        // ⬅ match original
      marginX: "auto",
      px: { xs: "1.5rem", md: 0 }, // ⬅ small padding on mobile for breathing room
    }}
  >
    Experience goal-aligned planning and effortless career acceleration.
  </Typography>
</ScrollReveal>


      {/* STICKY CARDS LAYOUT (unchanged CSS) */}
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
                        style={{ objectFit: "contain" }}
                        sizes="(max-width: 768px) 100vw, 280px"
                      />
                    </IPhoneFrame>
                  </div>

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
