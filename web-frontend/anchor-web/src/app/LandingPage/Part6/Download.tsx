// "use client";

// import styles from "./Download.module.css";
// import { useEffect, useState } from "react";
// import ScrollReveal from "@/app/Components/Scroll/ScrollReveal";
// import Lottie from "lottie-react";
// import { useRouter } from "next/navigation";


// export default function Download() {
//   const [animationData, setAnimationData] = useState(null);
// const router = useRouter();
//   useEffect(() => {
//     fetch("/assets/lottie/2.json")
//       .then((res) => res.json())
//       .then(setAnimationData);
//   }, []);
//   const ContactPageHandler = () => {
//     router.replace("/ContactPage");
//   };

//   return (
//     <section id="download" className={styles.section}>
      
//       {/* Lottie background animation */}
//       {animationData && (
//         <div className={styles.lottieBackground}>
//           <Lottie animationData={animationData} loop={true} />
//         </div>
//       )}

//       <div className={styles.contentWrapper}>
//         {/* Pill Tag */}
//         <ScrollReveal animation="up">
          
  
//           <div className={styles.tagContainer}>
//             <span className={styles.dot}></span>
//             <span>Available on Web & iOS</span>
//           </div>
          
//         </ScrollReveal>

//         {/* Main Heading */}
//         <ScrollReveal animation="up">
//           <h2 className={styles.heading}>
//             Curious what true career clarity feels like? Let's finally anchor your path to success.
//           </h2>
//         </ScrollReveal>

//         {/* Subtext */}
//         {/* <ScrollReveal animation="up">
//           <p className={styles.subheading}>
//             Curious what true career clarity feels like? Let's finally anchor your path to success.
//           </p>
//         </ScrollReveal> */}

//         {/* Main CTA Button */}
//         <ScrollReveal animation="up">
//           <button className={styles.ctaButton} onClick={ContactPageHandler}>
//             {/* Keeping your QR code logic, but smaller as an icon */}
//             {/* <Image
//               src="/assets/qr-code.png"
//               alt="QR"
//               width={24}
//               height={24}
//               className={styles.qrIcon}
//             /> */}
//             <span>Join the Waitlist</span>
//           </button>
//         </ScrollReveal>

//         {/* Social Icons / Divider */}
//         {/* <div className={styles.socialRow}>
//            <span className={styles.socialLink}>Instagram</span>
//            <span className={styles.socialLink}>|</span>
//            <span className={styles.socialLink}>Twitter</span>
//            <span className={styles.socialLink}>|</span>
//            <span className={styles.socialLink}>LinkedIn</span>
//         </div> */}
//       </div>

//       {/* Footer Section */}
//       <footer className={styles.footer}>
//         <div>hello@anchor.app</div>
//         <div>Designed in React</div>
//         <div>All rights reserved, ©2025</div>
//       </footer>
//     </section>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import ScrollReveal from "@/app/Components/Scroll/ScrollReveal";
import Lottie from "lottie-react";
import { useRouter } from "next/navigation";

export default function Download() {
  const [animationData, setAnimationData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/assets/lottie/2.json")
      .then((res) => res.json())
      .then(setAnimationData);
  }, []);

  const goToContact = () => router.replace("/ContactPage");

  return (
    <Box
      id="download"
      component="section"
      sx={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#3c245c",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Lottie Background */}
      {animationData && (
        <Box
    sx={{
      position: "absolute",
      left: { xs: "0rem", md: "29rem" },

      width: { xs: "100%", sm: "80%", md: "50%" },
      height: { xs: "40%", sm: "35%", md: "20%" },

      bottom: { xs: "30rem", md: "35rem" },
      top: { xs: "12rem", md: "6rem" },

      zIndex: 0,
      opacity: 1,
      pointerEvents: "none",
    }}
  >
    <Lottie animationData={animationData} loop={true} />
  </Box>
      )}

      {/* CONTENT WRAPPER */}
      <Box
        sx={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: "800px",
          gap: "2rem",
          bottom: { xs: "10rem", md: "-5rem" },
    left: { xs: "0rem", md: "-1.3rem" },
    mt: { xs: "20rem", md: "0rem" }, 
        }}
      >
        {/* TAG */}
        <ScrollReveal animation="up">
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background:
                "linear-gradient(180deg, #ece6f3 0%, rgb(217,212,252) 100%)",
              border: "1px solid rgba(255,255,255,0.15)",
              padding: "6px 16px",
              borderRadius: "999px",
              fontSize: "0.85rem",
              color: "#462b69",
              backdropFilter: "blur(10px)",
              marginBottom: "0.5rem",
            }}
          >
            <Box
              sx={{
                width: "6px",
                height: "6px",
                backgroundColor: "#462b69",
                borderRadius: "50%",
                boxShadow: "0 0 8px rgba(255,182,193,0.6)",
              }}
            />
            Available on Web & iOS
          </Box>
        </ScrollReveal>

        {/* Heading */}
        <ScrollReveal animation="up">
          <Typography
            sx={{
              fontSize: "clamp(1.1rem, 2vw, 2rem)",
              fontWeight: 500,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              background: "linear-gradient(to bottom, #fff, #ccc)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0,
            }}
          >
            Curious what true career clarity feels like? Let's finally anchor
            your path to success.
          </Typography>
        </ScrollReveal>

        {/* CTA Button */}
        <ScrollReveal animation="up">
          <Button
            onClick={goToContact}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              background:
                "linear-gradient(180deg, #ece6f3 0%, rgb(217,212,252) 100%)",
              border: "1px solid rgba(255,255,255,0.15)",
              padding: "12px 12px",
              borderRadius: "12px",
              color: "#462b69",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
              textTransform: "none",
              "&:hover": {
                background: "linear-gradient(90deg, #f3d55b, #f1cf4b)",
                color: "black",
                boxShadow: "0 0 15px rgba(255,255,255,0.1)",
                transform: "translateY(-2px)",
              },
            }}
          >
            Join the Waitlist
          </Button>
        </ScrollReveal>
      </Box>

      {/* FOOTER */}
      <Box
        sx={{
          position: "absolute",
          bottom: "2rem",
          width: "100%",
          maxWidth: "1400px",
          padding: "0 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.8rem",
          color: "white",
          zIndex: 10,

          "@media (max-width: 768px)": {
            flexDirection: "column",
            gap: "1rem",
            textAlign: "center",
            position: "relative",
            marginTop: "4rem",
          },
        }}
      >
        <div>hello@anchor.app</div>
        <div>Designed in React</div>
        <div>All rights reserved, ©2025</div>
      </Box>
    </Box>
  );
}
