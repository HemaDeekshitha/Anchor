// "use client";

// import Image from "next/image";
// import Header from "./Header/Header";
// import landingStyles from "./LandingPage.module.css";
// import Box2 from "./Part2/Box2";
// import StickyCards from "./Part3/StickyCards";
// import WhyChooseUs from "./Part4/WhyChooseUs";
// import Testimonials from "./Part5/Testimonials";
// import Download from "./Part6/Download";
// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// // Removed unnecessary motion hooks for the stacking effect

// export default function LandingPage() {
//   const router = useRouter();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//     if ("scrollRestoration" in window.history) {
//       window.history.scrollRestoration = "manual";
//     }
//   }, []);

//   const ContactPageHandler = () => {
//     router.replace("/ContactPage");
//   };

//   return (
//     <>
//       <div id="home" className={landingStyles.landingpageContainer}>
//         <Header />

//         <div className={landingStyles.landingpageMain}>
//           <div className={landingStyles.landingpageContent}>
//             <h1 className={landingStyles.title}>
//               <p className={landingStyles.subtitle}>
//                 <span className={landingStyles.titledot}></span>
//                 Your entire job search — organized in one place.
//               </p>
//               Anchor
//               <span className={landingStyles.titleblur}>
//                 - it's the clarity you deserve
//               </span>
//             </h1>

//             <div className={landingStyles.heroVisuals}>
//               <Image
//                 src="/assets/hero1.png"
//                 alt="Main Hero"
//                 width={500}
//                 height={500}
//                 className={landingStyles.mainImage}
//                 priority
//               />
//               <div className={landingStyles.floatIcon1}>
//                 <Image
//                   src="/assets/icon-star.png"
//                   alt=""
//                   width={120}
//                   height={120}
//                 />
//               </div>
//               <div className={landingStyles.floatIcon2}>
//                 <Image
//                   src="/assets/icon-target.png"
//                   alt=""
//                   width={120}
//                   height={120}
//                 />
//               </div>
//               <div className={landingStyles.floatIcon3}>
//                 <Image
//                   src="/assets/icon-trophy.png"
//                   alt=""
//                   width={120}
//                   height={120}
//                 />
//               </div>
//               <div className={landingStyles.floatIcon4}>
//                 <Image
//                   src="/assets/icon-rocket.png"
//                   alt=""
//                   width={120}
//                   height={120}
//                 />
//               </div>
//             </div>

//             <div className={landingStyles.landingpageBtns}>
//               <button
//                 className={landingStyles.primaryBtn}
//                 onClick={ContactPageHandler}
//               >
//                 Get Started
//               </button>
//               <button className={landingStyles.secondaryBtn}>Learn More</button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <Box2 />
//       <StickyCards />
//       <WhyChooseUs />

//       {/* --- STACKING LOGIC START --- */}

//       {/* 1. The Bottom Card (Testimonials)
//           This sticks in place so the next section can slide over it. */}
//       <div
//         style={{
//           position: "sticky",
//           top: 0,
//           // height: '100vh', // Ensures it takes full height while stuck
//           zIndex: 1,
//           display: "flex",
//           alignItems: "center", // Optional: centers content vertically
//           justifyContent: "center",
//         }}
//       >
//         <Testimonials />
//       </div>

//       {/* 2. The Top Card (Download)
//           This slides naturally over the sticky element.
//           IMPORTANT: This component MUST have a solid background color in its CSS,
//           otherwise you will see the Testimonials underneath it. */}
//       <div
//         style={{
//           position: "relative",
//           height: "100vh",
//           zIndex: 20,
//           backgroundColor: "white", // CHANGE THIS to match your app background (e.g., #ffffff or your dark theme color)
//         }}
//       >
//         <Download />
//       </div>

//       {/* --- STACKING LOGIC END --- */}
//     </>
//   );
// }

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
  delay: string;
  rotate: string;
  duration: string;
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
          paddingBottom: "5rem",
          px: "4rem",
          margin: "1rem",
          marginBottom: "4rem",
          borderRadius: "3rem",
          background:
            "linear-gradient(180deg, #ece6f3 0%, rgb(217, 212, 252) 100%)",
          overflow: "visible",
        }}
      >
        <Header />

        {/* MAIN WRAPPER */}
        <Box sx={{ paddingBottom: "5rem" }}>
          <Grid
            container
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
                columnGap: "25rem",
                rowGap: 0,
              },
            }}
          >
            {/* LEFT COLUMN */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  gridColumn: 1,
                  gridRow: 1,
                }}
              >
                {/* SUBTITLE */}
                <Box
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: "bold",
                    mb: "1rem",
                    color: "black",
                    padding: "1rem",
                    backgroundColor: "rgba(250, 248, 248, 0.25)",
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
                      background: "#5b3aff",
                      borderRadius: "50%",
                      animation: "pulse 1.4s ease-in-out infinite",
                    }}
                  />
                  Your entire job search — organized in one place.
                </Box>

                {/* TITLE */}
                <Box
                  sx={{
                    fontSize: { xs: "2.2rem", sm: "2.8rem", md: "4.5rem" },
                    fontWeight: "bold",
                    color: "black",
                    width: { xs: "100%", md: "50rem" },
                    textAlign: { xs: "center", md: "left" },
                    lineHeight: 1.1,
                  }}
                >
                  Anchor{" "}
                  <Box component="span" sx={{ color: "grey" }}>
                    - it's the clarity you deserve
                  </Box>
                </Box>

                {/* BUTTONS */}
                <Box
                  sx={{
                    display: "flex",
                    gap: "2rem",
                    paddingBottom: "4rem",
                    marginTop: "2rem",
                    justifyContent: { xs: "center", md: "flex-start" },
                    flexDirection: { xs: "column", sm: "column", md: "row" },

                    // 🔥 Make container full width on small screens
                    width: { xs: "100%", md: "auto" },
                  }}
                >
                  <Button
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
                      textTransform: "none",
                      "&:hover": {
                        background: "linear-gradient(90deg, #f3d55b, #f1cf4b)",
                        color: "black",
                        width: { xs: "100%", md: "10rm" },
                      },
                    }}
                  >
                    Get Started
                  </Button>

                  <Button
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
                  </Button>
                </Box>
              </Box>
            </Grid>

            {/* RIGHT COLUMN — HERO VISUALS */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: "relative",
                  justifySelf: "center",
                  width: "100%",
                  maxWidth: "600px",
                  height: "500px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "@media (max-width:900px)": {
                    gridColumn: "1 !important",
                    gridRow: "2 !important",
                    height: "auto",
                    mb: "2rem",
                  },
                }}
              >
                {/* MAIN FLOATING IMAGE */}
                <Image
                  src="/assets/hero1.png"
                  alt="Main Hero"
                  width={500}
                  height={500}
                  style={{
                    width: "70%",
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
                    top: { xs: "-30px", md: "8%" },
                    left: { xs: "4%", md: "8%" },
                  }}
                >
                  <FloatingIcon
                    src="/assets/icon-star.png"
                    delay="0s"
                    rotate="-15deg"
                    duration="4s"
                  />
                </Box>

                <Box
                  sx={{
                    position: "absolute",
                    top: { xs: "-30px", md: "10%" },
                    right: { xs: "25%", md: "30%" },
                  }}
                >
                  <FloatingIcon
                    src="/assets/icon-target.png"
                    delay="1s"
                    rotate="15deg"
                    duration="7s"
                  />
                </Box>

                <Box
                  sx={{
                    position: "absolute",
                    bottom: { xs: "2%", md: "35%" },
                    left: { xs: "4%", md: "4%" },
                  }}
                >
                  <FloatingIcon
                    src="/assets/icon-trophy.png"
                    delay="2s"
                    rotate="-30deg"
                    duration="6s"
                  />
                </Box>

                <Box
                  sx={{
                    position: "absolute",
                    bottom: { xs: "5%", md: "35%" },
                    right: { xs: "25%", md: "30%" },
                  }}
                >
                  <FloatingIcon
                    src="/assets/icon-rocket.png"
                    delay="0.5s"
                    rotate="15deg"
                    duration="5.5s"
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
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
  delay,
  rotate,
  duration,
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
        filter:
          "drop-shadow(0px 10px 20px rgba(0,0,0,0.15)) saturate(0.2) brightness(1.1) contrast(0.8)",
        animation: `float ${duration} ease-in-out infinite`,
        animationDelay: delay,
        transform: `rotate(${rotate})`,
      }}
    >
      <img src={src} alt="" className={styles.floatingIcons} />
    </Box>
  );
}
