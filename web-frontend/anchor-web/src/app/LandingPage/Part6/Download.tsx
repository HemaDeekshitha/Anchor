"use client";

import { Box, Typography, Button } from "@mui/material";
import ScrollReveal from "@/app/Components/Scroll/ScrollReveal";
import Lottie from "lottie-react";
import { useRouter } from "next/navigation";

// --- IMPORT THE FILE DIRECTLY ---
// Make sure animation.json is in the same folder as this file!
import animationData from "./purple.json"; 

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
        backgroundColor: "#462b69", // White background
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
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",   // Fill width
          height: "100%",  // Fill height
          zIndex: 0,       // Behind text
          overflow: "hidden", // Cut off edges that spill out
          pointerEvents: "none",
        }}
      >
        <Lottie animationData={animationData} loop={true} style={{ width: "100%", height: "100%" }} />
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
        {/* Pill Tag */}
        <ScrollReveal animation="up">
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(180deg, #ece6f3 0%, rgb(217,212,252) 100%)",
              border: "1px solid rgba(70, 43, 105, 0.1)", // Slight purple border
              padding: "6px 16px",
              borderRadius: "999px",
              fontSize: "0.85rem",
              color: "#462b69",
              marginBottom: "0.5rem",
            }}
          >
            <Box sx={{ width: "6px", height: "6px", backgroundColor: "#462b69", borderRadius: "50%" }} />
            Available on Web & iOS
          </Box>
        </ScrollReveal>

        {/* Heading - DARK PURPLE (Visible on white) */}
        <ScrollReveal animation="up">
          <Typography
            sx={{
              fontSize: "clamp(1.1rem, 2vw, 2rem)",
              fontWeight: 500,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              color: "white", // Dark Text
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
              background: "linear-gradient(180deg, #ece6f3 0%, rgb(217,212,252) 100%)",
              border: "1px solid rgba(255,255,255,0.5)",
              padding: "12px 24px",
              borderRadius: "12px",
              color: "#462b69",
              fontSize: "1rem",
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
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
        <div>hello@anchor.app</div>
        <div>Designed in React</div>
        <div>All rights reserved, ©2025</div>
      </Box>
    </Box>
  );
}