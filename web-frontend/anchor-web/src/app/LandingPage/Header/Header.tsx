// "use client";

// import { useEffect, useState } from "react";
// import Image from "next/image";
// import styles from "./Header.module.css";

// export default function Header() {
//   const [active, setActive] = useState("home");

//   useEffect(() => {
//     const sections = [
//       { id: "home", label: "Home" },
//       { id: "benefits", label: "Benefits" },
//       { id: "getstarted", label: "Get Started" },
//       { id: "features", label: "Features" },
//       { id: "testimonials", label: "Testimonials" },
//       // { id: "faqs", label: "FAQs" },
//       { id: "download", label: "Download", noHighlight: true },
//     ];

//     const observers: IntersectionObserver[] = [];

//     sections.forEach((section) => {
//       const el = document.getElementById(section.id);
//       if (!el) return;

//       const observer = new IntersectionObserver(
//         ([entry]) => {
//           if (entry.isIntersecting) {
//             if (!section.noHighlight) {
//               setActive(section.id);
//             } else {
//               setActive("");
//             }
//           }
//         },
//         {
//           threshold: 0.5, // when 50% of section is visible
//         }
//       );

//       observer.observe(el);
//       observers.push(observer);
//     });

//     return () => observers.forEach((obs) => obs.disconnect());
//   }, []);

//   return (
//     <div className={styles.header}>
//       <a href="#home" className={styles.logoLink}>
//         <Image
//           src="/assets/anchorLogo.png" // Replace with your logo if different
//           alt="Anchor Logo"
//           width={54}
//           height={54}
//           className={styles.logo}
//           priority
//         />
//       </a>

//       <a href="/LandingPage" className={styles.menuH}>
//         Anchor
//       </a>

//       <div className={styles.menu}>
//         <a
//           href="#benefits"
//           className={`${styles.menuP} ${
//             active === "benefits" ? styles.active : ""
//           }`}
//         >
//           Benefits
//         </a>

//         <a
//           href="#getstarted"
//           className={`${styles.menuP} ${
//             active === "getstarted" ? styles.active : ""
//           }`}
//         >
//           Get Started
//         </a>

//         <a
//           href="#features"
//           className={`${styles.menuP} ${
//             active === "features" ? styles.active : ""
//           }`}
//         >
//           Features
//         </a>

//         <a
//           href="#testimonials"
//           className={`${styles.menuP} ${
//             active === "testimonials" ? styles.active : ""
//           }`}
//         >
//           Testimonials
//         </a>

//         {/* <a

//           className={`${styles.menuP} ${
//             active === "faqs" ? styles.active : ""
//           }`}
//         >
//           FAQs
//         </p> */}
//       </div>

//       <a
//         href="#"
//         target="_blank"
//         rel="noopener noreferrer"
//         className={styles.button}
//       >
//         <Image
//           src="/assets/appstore.svg"
//           alt="Download on the App Store"
//           width={140}
//           height={50}
//           className={styles.appStoreImage}
//           priority
//         />
//       </a>
//     </div>
//   );
// }

"use client";

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import Image from "next/image";
import Button from "@mui/material/Button";
import styles from "./Header.module.css";

export default function Header() {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const sections: { id: string; label: string; hidden?: boolean }[] = [
    { id: "benefits", label: "Benefits" },
    { id: "getstarted", label: "Get Started" },
    { id: "features", label: "Features" },
    { id: "testimonials", label: "Testimonials" },
    // { id: "download", label: "Download" },
    // { id: "download", noHighlight: true, hidden: true },
  ];
  const scrollSections = [
    "home",
    "benefits",
    "getstarted",
    "features",
    "testimonials",
    "download",
  ];

  const [active, setActive] = React.useState("home");

  React.useEffect(() => {
    const observers: IntersectionObserver[] = [];

    scrollSections.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActive(id);
          }
        },
        {
          threshold: 0.1, // when 50% of section is visible
        }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // const drawerContent = (
  //   <Box sx={{ width: 250, pt: 4 }}>
  //     <List>
  //       {sections.map((item) => (
  //         <ListItem key={item.id} disablePadding>
  //           <ListItemButton
  //             component="a"
  //             href={`#${item.id}`}
  //             onClick={() => setMobileOpen(false)}
  //           >
  //             {item.label}
  //           </ListItemButton>
  //         </ListItem>
  //       ))}
  //     </List>
  //   </Box>
  // );
  const drawerContent = (
    <Box
      sx={{
        marginTop: "-6rem",
        width: 220,
        padding: "14rem 2rem",
        display: "flex",
        flexDirection: "column",
        gap: "5rem",
        backgroundColor: "#d8b13dc9",
        height: "100%",
        color: "black",
      }}
    >
      {sections.map((item) =>
        item.hidden ? null : (
          <ListItemButton
            key={item.id}
            component="a"
            href={`#${item.id}`}
            onClick={() => setMobileOpen(false)}
            sx={{
              padding: "0.8rem 1rem",
              borderRadius: "12px",
              background:
                active === item.id ? "rgba(255,255,255,0.15)" : "transparent",
              color: active === item.id ? "black" : "black",
              fontWeight: 600,
              fontSize: "1rem",
              transition: "0.2s ease",
              "&:hover": {
                background:
                  "linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(229, 181, 38, 0.85) 100%)",
                color: "black",
              },
            }}
          >
            {item.label}
          </ListItemButton>
        )
      )}
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={3}
        className={styles.header}
        sx={{
          width: { xs: "85%", md: "70%" },
          left: "50%",
          transform: "translateX(-50%)",
          top: "3rem",
          borderRadius: "2rem",
          // backdropFilter: "blur(15px)",
          // background: "transparent",
          background: "rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(16px)",
          color: "black",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.4)",
          padding: "0.5rem",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* LEFT: Logo + Brand */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <a href="/LandingPage">
              <Image
                src="/assets/anchorLogo.png"
                alt="Anchor Logo"
                width={50}
                height={50}
                style={{
                  borderRadius: "15px",
                  cursor: "pointer",
                }}
              />
            </a>

            <Typography
              variant="h6"
              component="a"
              href="/LandingPage"
              sx={{
                fontWeight: "bold",
                textDecoration: "none",
                color: "black",
                fontSize: { xs: "1.2rem", md: "1.5rem" },
              }}
            >
              Anchor
            </Typography>
          </Box>

          {/* MIDDLE: Desktop Menu */}
          <Box
            sx={{
              display: "flex",
              gap: "20",
              "@media (max-width:1300px)": {
                display: "none",
              },
            }}
          >
            {sections.map((item) => (
              <Typography
                key={item.id}
                component="a"
                href={`#${item.id}`}
                // sx={{
                //   fontWeight: 600,

                //   textDecoration: "none",
                //   padding: "0.6rem 1.2rem",
                //   borderRadius: "1.5rem",
                //   transition: "0.2s",
                //   background:
                //     active === item.id
                //       ? "linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%,    rgba(229, 181, 38, 0.85) 100% )"
                //       : "transparent",
                //   color:
                //     active === item.id
                //       ? "linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%,    rgba(229, 181, 38, 0.85) 100% )"
                //       : "black",
                //   "&:hover": {
                //     background: `
                //       linear-gradient(
                //         180deg,
                //         rgba(255, 255, 255, 0.25) 0%,
                //         rgba(229, 181, 38, 0.85) 100%
                //       )
                //     `,
                //     backdropFilter: "blur(6px)",
                //     WebkitBackdropFilter: "blur(6px)",
                //     color: "black",
                //     transition: "all 0.25s ease",
                //   },
                // }}
                sx={{
                  fontWeight: 600,
                  textDecoration: "none",
                  padding: "0.6rem 1.2rem",
                  borderRadius: "1.5rem",
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.3s ease",

                  background:
                    active === item.id
                      ? "rgba(255,255,255,0.15)"
                      : "transparent",
                  color: "black",

                  backdropFilter: active === item.id ? "blur(10px)" : "none",
                  WebkitBackdropFilter:
                    active === item.id ? "blur(10px)" : "none",

                  "&:hover": {
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(229,181,38,0.85) 100%)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    // color: "white",
                  },

                  // ===================== FILL FOR ACTIVE =====================
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    borderRadius: "1.5rem",
                    background:
                      active === item.id
                        ? "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(229,181,38,0.85) 100%)"
                        : "transparent",
                    // color: active === item.id ? "white" : "black",
                    zIndex: 0,
                    transition: "all 0.3s ease",
                  },

                  "& > *": {
                    position: "relative",
                    zIndex: 2,
                  },

                  // ===================== BORDER ANIMATION ONLY ON HOVER =====================
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "0%",
                    height: "2px",
                    background: "rgb(251, 141, 15)",
                    boxShadow: "0 0 8px rgba(229,181,38,0.8)",
                    transition: "width 0.35s ease",
                    zIndex: 3,
                  },

                  // ===================== SPARKLE ONLY ON HOVER =====================
                  "& .sparkle": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "-120%",
                    width: "120%",
                    height: "100%",
                    background:
                      "linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
                    transform: "skewX(-20deg)",
                    transition: "0.5s",
                    zIndex: 1,
                  },

                  "&:hover .sparkle": {
                    left: "120%",
                  },
                }}
              >
                <span className="sparkle" />
                <span className="bottomBorder" />

                {item.label}
              </Typography>
            ))}
          </Box>

          {/* RIGHT: App Store Button (Desktop Only) */}
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <a href="#" target="_blank">
              <Typography width={140} height={50} />
            </a>
          </Box>

          {/* MOBILE: Hamburger */}
          <IconButton
            // sx={{ display: { xs: "block", md: "none" }, color: "black" }}
            sx={{
              display: "none",
              "@media (max-width:1300px)": {
                display: "block",
              },
            }}
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* MOBILE DRAWER */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        PaperProps={{
          sx: {
            width: "260px",
            backgroundColor:
              "linear-gradient(180deg,rgba(255, 255, 255, 0.25) 0%, rgba(229, 181, 38, 0.85) 100%)",
            borderRadius: "1rem 0 0 1rem",
            paddingTop: "-2rem",
            boxShadow: "0 0 30px rgba(255, 255, 255, 1)",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Add spacing below header */}
      <Toolbar />
    </>
  );
}
