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
            background: "linear-gradient(to right, #f7f7f7, #E5B526)",
            color: "black",
            p: "0.8rem",
            width: "7rem",
            borderRadius: "2rem",
            textAlign: "center",
            fontWeight: 600,
            position: "relative",
            overflow: "hidden",

            /* GLASS EFFECT */
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",

            /* ALWAYS-RUNNING SHINE */
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: "-150%",
              width: "200%",
              height: "100%",
              background:
                "linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
              opacity: 0.7,
              transform: "skewX(-25deg)",
              animation: "shineMove 2s infinite linear",
            },

            /* KEYFRAMES */
            "@keyframes shineMove": {
              "0%": { left: "-150%" },
              "100%": { left: "150%" },
            },
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
            maxWidth: "50rem",
            marginX: "auto",
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
            maxWidth: "60rem",
            marginX: "auto",
            px: { xs: "1.5rem", md: 0 },
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
