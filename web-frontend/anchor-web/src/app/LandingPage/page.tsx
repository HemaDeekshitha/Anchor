"use client";
import Image from "next/image";
import Header from "./Header/Header";
import { Box, Button, Grid } from "@mui/material";
import Box2 from "./Part2/Box2";
import StickyCards from "./Part3/StickyCards";
import WhyChooseUs from "./Part4/WhyChooseUs";
import Testimonials from "./Part5/Testimonials";
import Download from "./Part6/Download";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from "./LandingPage.module.css";
type FloatingIconProps = {
  src: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  // delay: string;
  rotate: string;
  // duration: string;
  className?: string;
};

const globalStyles = `
@keyframes float {
  0%   { transform: translateY(0px); }
  50%  { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}
`;

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  const ContactPageHandler = () => {
    router.replace("/ContactPage");
  };

  return (
    <>
      {/* MAIN PURPLE CONTAINER */}
      <style>{globalStyles}</style>
      <Box
        id="home"
        sx={{
          paddingTop: "8rem",
          // paddingBottom: "5rem",s
          px: "4rem",
          margin: "1rem",
          marginBottom: "1rem",
          borderRadius: "3rem",
          background: "linear-gradient(to right, rgb(209 51 51), #E5B526)",
          overflow: "visible",
        }}
      >
        <Header />

        {/* MAIN WRAPPER */}
        <Box sx={{ paddingBottom: { xs: "0rem", sm: "5rem", md: "5rem" } }}>
          <Box
            alignItems="center"
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gridTemplateRows: "auto auto auto",
              rowGap: "2rem",
              width: "100%",

              "@media (min-width:1300px)": {
                gridTemplateColumns: "1fr 1fr",
                gridTemplateRows: "auto auto",
                // columnGap: "15rem",
                rowGap: 0,
              },
            }}
          >
            {/* LEFT COLUMN */}
            <Box>
              <Box
                sx={{
                  gridColumn: 1,
                  gridRow: 1,
                }}
              >
                {/* SUBTITLE */}
                <Box
                  sx={{
                    fontSize: "0.9rem",
                    fontWeight: "bold",
                    mb: "1rem",
                    color: "black",
                    padding: "1rem",
                    // backgroundColor: "rgba(250, 248, 248, 0.25)",
                    borderRadius: "1.5rem",
                    width: { xs: "100%", sm: "20rem", md: "25rem" },
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Box
                    sx={{
                      width: "0.8rem",
                      height: "0.8rem",
                      background: "#E5B526",
                      borderRadius: "50%",
                      animation: "pulse 1.4s ease-in-out infinite",
                    }}
                  />
                  Your entire job search — organized in one place.
                </Box>

                {/* TITLE */}
                <Box
                  sx={{
                    fontSize: { xs: "2.5em", sm: "2.8rem", md: "4.5rem" },
                    fontWeight: "bold",
                    color: "black",
                    width: { xs: "100%", md: "50rem" },
                    textAlign: { xs: "center", md: "left" },
                    lineHeight: 1.1,
                  }}
                >
                  Anchor{" "}
                  <Box component="span" sx={{ color: "white" }}>
                    - it's the clarity you deserve
                  </Box>
                </Box>

                {/* BUTTONS */}
                <Box
                  sx={{
                    display: "flex",
                    paddingBottom: "4rem",
                    marginTop: "2rem",
                    justifyContent: { xs: "center", md: "flex-start" },
                    flexDirection: { xs: "column", sm: "column", md: "row" },

                    // 🔥 Make container full width on small screens
                    width: { xs: "100%", md: "auto" },
                    // width: "100%",
                  }}
                >
                  {/* <Button
                    onClick={ContactPageHandler}
                    sx={{
                      backgroundColor: "white",
                      color: "gray",
                      padding: "1rem",
                      borderRadius: "1rem",
                      fontSize: "medium",
                      border: "none",
                      fontWeight: "bold",
                      cursor: "pointer",
                      width: { xs: "100%", md: "10rem" },
                      textTransform: "none",
                      "&:hover": {
                        background: "linear-gradient(90deg, #f3d55b, #f1cf4b)",
                        color: "black",
                      },
                    }}
                  >
                    Get Started
                  </Button> */}

                  <Button
                    onClick={ContactPageHandler}
                    sx={{
                      position: "relative",
                      overflow: "hidden",
                      padding: "1rem",
                      width: { xs: "100%", md: "15rem" },
                      borderRadius: "10rem",
                      fontSize: "medium",
                      fontWeight: "bold",
                      textTransform: "none",
                      cursor: "pointer",

                      // Default glass
                      background: "rgba(255,255,255,0.2)",
                      backdropFilter: "blur(10px)",
                      border: "2px solid rgba(255,255,255,0.3)",
                      color: "white",
                      transition: "border-color 0.3s ease, color 0.3s ease",

                      /* Hover fill layer */
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "linear-gradient(135deg, #f3d55b, #f1cf4b)",
                        transformOrigin: "bottom left",
                        transform: "scale(0)",
                        transition: "transform 0.45s ease-out",
                        zIndex: 0, // always behind text
                      },

                      "&:hover": {
                        borderColor: "white",
                        color: "black",
                      },

                      "&:hover::before": {
                        transform: "scale(1)", // diagonal expansion
                      },

                      // This ensures TEXT stays above the fill always
                      "& .btn-text": {
                        position: "relative",
                        zIndex: 2,
                      },
                    }}
                  >
                    <span className="btn-text">Get Started</span>
                  </Button>

                  {/* <Button
                    sx={{
                      backgroundColor: "black",
                      color: "white",
                      padding: "1rem",
                      borderRadius: "1rem",
                      width: { xs: "100%", md: "10rem" },
                      fontSize: "medium",
                      border: "none",
                      fontWeight: "bold",
                      cursor: "pointer",
                      textTransform: "none",
                      "&:hover": {
                        background: "linear-gradient(90deg, #f3d55b, #f1cf4b)",
                        color: "black",
                      },
                    }}
                  >
                    Learn More
                  </Button> */}
                </Box>
              </Box>
            </Box>

            {/* RIGHT COLUMN — HERO VISUALS */}
            <Box sx={{ display: { xs: "none", md: "block" } }}>
              <Box
                sx={{
                  position: "relative",
                  justifySelf: "center",
                  width: "80%",
                  maxWidth: "600px",
                  height: "500px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* MAIN FLOATING IMAGE */}
                <Image
                  src="/assets/hero1.png"
                  alt="Main Hero"
                  width={600}
                  height={600}
                  style={{
                    width: "80%",
                    height: "auto",
                    objectFit: "contain",
                    borderRadius: "32px",
                    animation: "float 10s ease-in-out infinite",
                    background: "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255, 255, 255, 0.5)",
                    zIndex: 10,
                  }}
                />

                {/* FLOATING ICONS */}
                <Box
                  sx={{
                    position: "absolute",
                    top: { xs: "1%", md: "1%" },
                    left: { xs: "-8%", md: "-8%" },
                    animation: "float 4s ease-in-out infinite"
                  }}
                >
                  <FloatingIcon
                    src="/assets/star.png"
                    // delay="0s"
                    rotate="-15deg"
                    // duration="4s"
                  />
                </Box>

                <Box
                  sx={{
                    position: "absolute",
                    top: { xs: "1%", md: "1%" },
                    right: { xs: "34%", md: "34%" },
                    animation: "float 4s ease-in-out infinite"
                  }}
                >
                  <FloatingIcon
                    src="/assets/target.png"
                    // delay="1s"
                    rotate="15deg"
                    // duration="7s"
                  />
                </Box>

                <Box
                  sx={{
                    position: "absolute",
                    bottom: { xs: "36%", md: "36%" },
                    left: { xs: "-8%", md: "-8%" },
                    animation: "float 4s ease-in-out infinite"
                  }}
                >
                  <FloatingIcon
                    src="/assets/trophy.png"
                    // delay="2s"
                    rotate="-15deg"
                    // duration="6s"
                  />
                </Box>

                <Box
                  sx={{
                    position: "absolute",
                    bottom: { xs: "36%", md: "36%" },
                    right: { xs: "34%", md: "34%" },
                    animation: "float 4s ease-in-out infinite"
                  }}
                >
                  <FloatingIcon
                    src="/assets/rocket.png"
                     className="test-bg"
                    // delay="0.5s"
                    rotate="15deg"
                    // duration="5.5s"
                 
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box2 />
      <StickyCards />
      <WhyChooseUs />

      {/* TESTIMONIALS (Sticky) */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Testimonials />
      </Box>

      {/* DOWNLOAD SECTION */}
      <Box
        sx={{
          position: "relative",
          height: "100vh",
          backgroundColor: "white",
          zIndex: 20,
        }}
      >
        <Download />
      </Box>
    </>
  );
}

/* 🎈 Floating Icon Component with SX animations */
function FloatingIcon({
  src,
  top,
  left,
  right,
  bottom,
  
  rotate,
 
}: FloatingIconProps) {
  return (
    <Box
      className={styles.iconWrapper}
      sx={{
        position: "absolute",
        top,
        left,
        right,
        bottom,
        padding: "10px",
        zIndex: 2,
        fill: "white",
        // filter:
        //   "drop-shadow(0px 10px 20px rgba(0,0,0,0.15)) saturate(0.2) brightness(1.1) contrast(0.8)",
        animation: `float  ease-in-out infinite`,
       
        transform: `rotate(${rotate})`,
      }}
    >
      <img src={src} alt="" className={styles.floatingIcons} />
    </Box>
  );
}
