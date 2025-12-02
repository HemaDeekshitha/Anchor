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
            fontSize: { xs: "1rem", md: "1.2rem" },
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

                  <Box
  sx={{
    // --- 1. Visual Styles (Glassmorphism) ---
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: { xs: '5%', md: '5%', lg: '5%', xl:'5%' },

    // --- 2. Flexbox Setup ---
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',

    // --- 3. Responsive Layout (The "Styles" Logic) ---
    
    // Width: Full on mobile, 80% on tablet, auto (flex-share) on desktop
    width: { xs: '100%', md: '80%', lg: 'auto' },

    // Flex: Grow to fill space only on desktop
    flex: { lg: 1 },

    // Height: Auto on mobile so text fits, 40vh fixed on desktop
    height: { xs: '30vh',md:"45vh",lg: '50vh', xl:'30vh' },

    // Alignment: Center text on mobile/tablet, Left on desktop
    textAlign: { xs: 'center', lg: 'left' },
    alignItems: { xs: 'center', lg: 'flex-start' },

    // Spacing: (MUI scale: 1 = 8px)
    p: { xs: 2.5, md: 4, lg: 5 , xl: 6},     // Padding: 20px -> 32px -> 40px
    mt: { xs: 4.5, lg: 0, xl: 0 },           // Margin Top: 20px on mobile, 0 on desktop
    mx: { xs: 0, md: 'auto', lg: 0 }  // Centered horizontally on tablet
  }}
>
 {/* Title (H3) */}
<Typography 
  component="h3" 
  sx={{
    fontWeight: 700,
    color: '#000',
    mb: '20px',       // corresponds to margin-bottom: 20px
    lineHeight: 1.1,
    
    // Responsive Font Size
    // 1.8rem on Mobile (so it fits), 2.5rem on Desktop (your requested size)
    fontSize: { xs: '1.2rem', md: '2rem' } 
  }}
>
  {step.title}
</Typography>

{/* Description (P) */}
<Typography 
  component="p" 
  sx={{
     // Your requested size
      
    color: '#666',
    lineHeight: 1.6,
    fontSize: { xs: '1rem', md: '2rem', xl: '1.5rem' } 
  }}
>
  {step.desc}
</Typography>
</Box>
                    
                  </div>
                </div>
             
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
