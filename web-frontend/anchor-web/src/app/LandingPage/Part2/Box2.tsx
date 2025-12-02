// import Image from "next/image";
// import styles from "./Box2.module.css";
// import ScrollReveal from "@/app/Components/Scroll/ScrollReveal";

// export default function Box2() {
//   return (
//     // <ScrollReveal animation="up">
//     <div id="benefits" className={styles.Box2Container}>
//       <ScrollReveal animation="up">
//         <h4 className={styles.header}>Benefits</h4>
//       </ScrollReveal>
//       <ScrollReveal animation="up">
//         <h1 className={styles.title}>Job Search Momentum
// </h1>
//       </ScrollReveal>
//       <ScrollReveal animation="up">
//         <p className={styles.subtitle}>
//           Anchor brings clarity, structure, and daily momentum to your job search.

//         </p>
//       </ScrollReveal>

//       <div className={styles.benefitsContainer}>
//         <ScrollReveal animation="up">
//           <div className={styles.Items}>
//             <div className={styles.ItemBox}>
//               <h2 className={styles.Itemtitle}>Aim High, Stand Out</h2>
//               <p className={styles.Itemsubtitle}>
//                 Target the perfect job and make your application shine.
//               </p>
//             </div>
//             <Image src="/assets/benefits1.png" alt="" width={250} height={250} style = {{borderRadius:"20px"}} />
//           </div>
//         </ScrollReveal>

//         <ScrollReveal animation="up">
//           <div className={styles.Items}>
//             <div className={styles.ItemBox}>
//               <h2 className={styles.Itemtitle}>Win the Offer, Take Off</h2>
//               <p className={styles.Itemsubtitle}>
//                 Secure the reward and launch your career to new heights.
//               </p>
//             </div>
//             <Image src="/assets/b2.png" alt="" width={250} height={250} style = {{borderRadius:"20px"}} />
//           </div>
//         </ScrollReveal>
//       </div>
//     </div>
//     // </ScrollReveal>
//   );
// }
"use client";

import Image from "next/image";
import { Box, Typography } from "@mui/material";
import ScrollReveal from "@/app/Components/Scroll/ScrollReveal";

export default function Box2() {
  return (
    <Box
      id="benefits"
      sx={{
        backgroundColor: "rgb(244, 240, 240)",
        p: "7rem 4rem",
        borderRadius: "3rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
        m: "1rem",
        mb: "4rem",

        "@media (max-width:600px)": {
          px: "2rem",
        },
      }}
    >
      {/* HEADER */}
      <ScrollReveal animation="up">
        <Typography
          sx={{
            background: "linear-gradient(to right, #f7f7f7, #E5B526)",
            color: "black",
            p: "0.8rem",
            width: "7rem",
            borderRadius: "2rem",
            textAlign: "center",
            fontWeight: 600,
          }}
        >
          Benefits
        </Typography>
      </ScrollReveal>

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
          Job Search Momentum
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
          Anchor brings clarity, structure, and daily momentum to your job search.
        </Typography>
      </ScrollReveal>

      {/* BENEFITS GRID */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: "4rem",
          width: "100%",
          maxWidth: "1200px",
        }}
      >
        {/* ITEM 1 */}
        <ScrollReveal animation="up">
          <Box
            sx={{
              background:
                "linear-gradient(to right, #f7f7f7, #E5B526)",
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              gap: "2rem",
              p: "2rem",
              border: "1.5px solid rgba(255,255,255,0.7)",
              borderRadius: "32px",
              boxShadow:
                "inset 0 0 0 1px rgba(255,255,255,0.1), 0 10px 30px rgba(0,0,0,0.1)",
            }}
          >
            {/* TEXT */}
            <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
              <Typography
                sx={{
                  color: "black",
                  fontSize: { xs: "1.5rem", md: "2rem" },
                  fontWeight: 700,
                }}
              >
                Aim High, Stand Out
              </Typography>

              <Typography
                sx={{
                  color: "grey",
                  pt: "1rem",
                  fontSize: { xs: "1rem", md: "1.3rem" },
                  width: { xs: "100%", md: "15rem" },
                  mx: { xs: "auto", md: "0" },
                }}
              >
                Target the perfect job and make your application shine.
              </Typography>
            </Box>

            {/* IMAGE */}
            <Box
              sx={{
                width: { xs: "130px", sm: "180px", md: "250px" },
                flexShrink: 0,
                display: { xs: "none", md: "block" } 
              }}
            >
              <Image
                src="/assets/benefits1.png"
                alt=""
                width={250}
                height={250}
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "20px",
                }}
              />
            </Box>
          </Box>
        </ScrollReveal>

        {/* ITEM 2 */}
        <ScrollReveal animation="up">
          <Box
            sx={{
              background:
                "linear-gradient(to right, #f7f7f7, #E5B526)",
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              gap: "2rem",
              p: "2rem",
              border: "1.5px solid rgba(255,255,255,0.7)",
              borderRadius: "32px",
              boxShadow:
                "inset 0 0 0 1px rgba(255,255,255,0.1), 0 10px 30px rgba(0,0,0,0.1)",
            }}
          >
            {/* TEXT */}
            <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
              <Typography
                sx={{
                  color: "black",
                  fontSize: { xs: "1.5rem", md: "2rem" },
                  fontWeight: 700,
                }}
              >
                Win the Offer, Take Off
              </Typography>

              <Typography
                sx={{
                  color: "grey",
                  pt: "1rem",
                  fontSize: { xs: "1rem", md: "1.3rem" },
                  width: { xs: "100%", md: "15rem" },
                  mx: { xs: "auto", md: "0" },
                }}
              >
                Secure the reward and launch your career to new heights.
              </Typography>
            </Box>

            {/* IMAGE */}
            <Box
              sx={{
                width: { xs: "130px", sm: "180px", md: "250px" },
                flexShrink: 0,
              }}
            >
              <Image
                src="/assets/b2.png"
                alt=""
                width={250}
                height={250}
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "20px",
                }}
              />
            </Box>
          </Box>
        </ScrollReveal>
      </Box>
    </Box>
  );
}
