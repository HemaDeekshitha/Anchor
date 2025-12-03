"use client";

import { Box, Typography, Button } from "@mui/material";
import ScrollReveal from "@/app/Components/Scroll/ScrollReveal";
import Lottie from "lottie-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// --- IMPORT THE FILE DIRECTLY ---
// Make sure animation.json is in the same folder as this file!
import animationData from "./waves.json";

export default function Download() {
  const router = useRouter();

  const goToContact = () => router.replace("/ContactPage");

  return (
    <Box
      id="download"
      component="section"
      sx={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
     background: "linear-gradient(to top, rgba(235, 0, 0, 0.1) 0%, rgba(249, 232, 167, 0.52) 100%)",
     backdropFilter: "blur(10px)",
 
       border: "1.5px solid rgba(255,255,255,0.7)",
              borderRadius: "32px",
              boxShadow:
                "inset 0 0 0 1px rgba(255,255,255,0.1), 0 10px 30px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* --- LOTTIE BACKGROUND --- */}
      {/* zIndex: 0 keeps it BEHIND the text */}
       <Box sx={{ display: { xs: "none", md: "block" } }}>
      <Box
        sx={{
          position: "absolute",
          top: "-5rem",
          right: "35rem",
          width: "120%", // Fill width
          height: "93%", // Fill height
          zIndex: 0, // Behind text
          overflow: "hidden", // Cut off edges that spill out
          pointerEvents: "none",
          rotate:"20deg",
        }}
      >
        <Lottie
          animationData={animationData}
          loop={true}
          style={{ width: "120%", height: "100%" }}
        />
      </Box>
      </Box>

      {/* --- TEXT CONTENT --- */}
      {/* zIndex: 2 keeps it IN FRONT of the animation */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: "800px",
          gap: "2rem",
        }}
      >
        

        {/* Heading - DARK PURPLE (Visible on white) */}
        <ScrollReveal animation="up">
          <Typography
            sx={{
              fontSize: "clamp(1.1rem, 2vw, 2rem)",
              fontWeight: 500,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              color: "grey", // Dark Text
              margin: 0,
            }}
          >
            Curious what true career clarity feels like? Let's finally anchor
            your path to success.
          </Typography>
        </ScrollReveal>

        {/* Button */}
        <ScrollReveal animation="up">
          <Button
            onClick={goToContact}
            sx={{
              background:
                "transparent",
              border: "4px solid rgba(255,255,255,0.5)",
              padding: "12px 24px",
              borderRadius: "12px",
              color: "black",
              fontSize: "1rem",
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "0 9px 40px rgba(0,0,0,0.1)",
              "&:hover": {
                background: "#f3d55b",
                transform: "translateY(-2px)",
              },
            }}
          >
            Join the Waitlist
          </Button>
        </ScrollReveal>
      </Box>

      {/* Footer */}
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
          color: "#462b69", // Dark Text
          zIndex: 10,
          "@media (max-width: 768px)": {
            flexDirection: "column",
            gap: "1rem",
            textAlign: "center",
          },
        }}
      >
 

<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
 
  <Image 
    src="/assets/logo.png"      
    alt="Anchor Logo"
    width={40}            
    height={40}           
    style={{ objectFit: 'contain' }} 
  />
  
  <Typography 
    variant="h5" 
    sx={{ fontWeight: 700, letterSpacing: "-0.5px", color: "black" }}
  >
    Anchor
  </Typography>
</Box>
       <Typography
                   variant="body2"
                   sx={{ color: "#666", fontSize: "0.875rem" }}
                 >
                  <span style={{ color: "black" }}>Tip Top Technologies</span>.
                   Powered by <span style={{ color: "black" }}>Next.js</span>
                 </Typography>
        <div style={{color:"black"}}>All rights reserved, ©2025</div>
      </Box>
    </Box>
  );
}
