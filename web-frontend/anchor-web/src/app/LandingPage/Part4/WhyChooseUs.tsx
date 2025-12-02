"use client";

import Image from "next/image";
import { Box, Typography } from "@mui/material";
import ScrollReveal from "@/app/Components/Scroll/ScrollReveal";

const features = [
  {
    id: 1,
    title: "Goal-Aligned Planning",
    desc: "Anchor learns your goals and builds a personalized job search path.",
    icon: "/assets/target.png",
    rotate: "14deg",
  },
  {
    id: 2,
    title: "Success Tracking",
    desc: "Visualize your progress, manage incoming offers, and celebrate every milestone.",
    icon: "/assets/trophy.png",
    rotate: "14deg",
  },
  {
    id: 3,
    title: "Career Acceleration",
    desc: "Streamline your workflow to apply faster and land your dream role sooner.",
    icon: "/assets/rocket.png",
    rotate: "14deg",
  },
  {
    id: 4,
    title: "Motivation & Rewards",
    desc: "Earn points, build streaks, and unlock rewards as you stay consistent.",
    icon: "/assets/star.png",
    rotate: "14deg",
  },
];

export default function WhyChooseUs() {
  return (
    <Box
      id="features"
      sx={{
        padding: "7rem 4rem",
        margin: "1rem",
        marginBottom: "1rem",
        borderRadius: "3rem",
        background: "linear-gradient(to right, rgba(209, 51, 51, 0.5), rgba(229, 181, 38, 0.5))",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        position: "relative",
        overflow: "hidden",
        height: { xs: "auto", md: "auto" },
        pt: { xs: "4rem", sm:"0rem",md: "7rem" },
        pl: { xs: "4rem", sm:"0rem",md: "7rem" },
        paddingBottom: { xs: "4rem", md: "10rem" },

        "&::before": {
          content: '""',
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "300px",
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "22px 22px",
          maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 60%, transparent 100%)",
          zIndex: 0,
          pointerEvents: "none",
        },
      }}
    >
      

      {/* TITLE */}
      <ScrollReveal animation="up">
        <Typography
          sx={{
            fontSize: { xs: "2.5rem", sm: "3rem", md: "4rem" },
            fontWeight: "bold",
            color: "black",
            textAlign: "center",

            width: { xs: "100%", md: "50rem" },
            mt: "1rem",
          }}
        >
          Why Choose Anchor?
        </Typography>
      </ScrollReveal>

      {/* SUBTITLE */}
      <ScrollReveal animation="up">
        <Typography
          sx={{
            fontSize: { xs: "1rem", md: "1.2rem" },
            fontWeight: 500,
            color: "grey",
            textAlign: "center",
            width: { xs: "100%", md: "60rem" },
            mb: "2rem",
          }}
        >
          Seamlessly track, organize, and accelerate your job search — all in
          one place.
        </Typography>
      </ScrollReveal>

      {/* GRID */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr",
            md: "repeat(auto-fit, minmax(240px, 1fr))",
          },
          gap: "46px",
          maxWidth: "1100px",
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        {features.map((feature) => (
          <ScrollReveal key={feature.id} animation="up">
            <Box
              sx={{
                position: "relative", // important
                // background: "#f1effe",
                padding: "28px 24px 60px", // extra bottom padding so the icon can hang
                borderRadius: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                height: "340px",
                width: { xs: "100%", md: "265px" },
                textAlign: "left",
                transition: "transform 0.2s",
                border: "1.5px solid rgba(255, 255, 255, 0.7)",
                boxShadow:
                  "inset 0 0 0 1px rgba(255,255,255,0.1), 0 10px 30px rgba(0,0,0,0.1)",

                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              {/* TEXT */}
              <Box>
                <Typography
                  sx={{
                    color: "black",
                    fontSize: { xs: "1.6rem", md: "2rem" },
                    fontWeight: 700,
                    mb: "8px",
                  }}
                >
                  {feature.title}
                </Typography>

                <Typography
                  sx={{
                    color: "grey",
                    fontSize: { xs: "1rem", md: "1.2rem" },
                    lineHeight: 1.5,
                    width: { xs: "100%", md: "15rem" },
                    // fontWeight: "300",
                  }}
                >
                  {feature.desc}
                </Typography>
              </Box>

              {/* ICON FLOATING BELOW CARD */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: "10px", // EXACT LOOK matches screenshot
                  left: "75%",
                  transform: "translateX(-50%)",
                  
                  zIndex: 10,
                }}
              >
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  width={110}
                  height={110}
                  style={{
                    transform: `rotate(${feature.rotate})`,
                  }}
                />
              </Box>
            </Box>
          </ScrollReveal>
        ))}
      </Box>
    </Box>
  );
}
