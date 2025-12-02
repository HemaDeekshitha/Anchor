// "use client";

// import styles from "./Testimonials.module.css";
// import Image from "next/image";
// import ScrollReveal from "@/app/Components/Scroll/ScrollReveal";
// // UPDATE THIS PATH to where you saved the component from the previous step
// import { InfiniteMarquee } from "@/app/Components/InfiniteMarquee"; 

// const testimonials = [
//   {
//     id: 1,
//     name: "Mark Thompson",
//     username: "@Mark Thompson",
//     message:"Job hunt was a stressful mess of spreadsheets. Now everything is organized and clear. Total game-changer!",
//     avatar: "/assets/mark.png",
//   },
//   {
//     id: 2,
//     name: "Alex Kim",
//     username: "@Alex Kim",
//     message:"Anchor cut my application time in half. I stopped wasting time and landed my offer faster than I ever thought.",
//         avatar: "/assets/alex.png",
//   },
//   {
//     id: 3,
//     name: "Sarah Lee",
//     username: "@Sarah Lee",
//     message:"The goal-tracking system is motivating. Building streaks keeps me consistent, even when the search felt overwhelming.",
//         avatar: "/assets/sarah.png",
//   },
//   {
//   id: 4,
//     name: "Sophia Rossi",
//     username: "@Sophia12",
//     message:"Anchor truly anchored my chaotic job search, providing a clear path and eliminating the daily stress. A lifesaver",
//         avatar: "/assets/sophia.png",
//   },
//   {id: 4,
//     name: "Julian Thorne",
//     username: "@Julian@19",
//     message:"The personalized path planning is spot-on. It's like having a dedicated career coach guiding me through every single step.",
//         avatar: "/assets/julian.png",
//   },
  
// ];

// // Helper Component to keep the main logic clean
// const TestimonialCard = ({ user }: { user: typeof testimonials[0] }) => (
//   <div className={styles.card}>
//     <div className={styles.userInfo}>
//       <Image
//         src={user.avatar}
//         alt={user.name}
//         width={48}
//         height={48}
//         className={styles.avatar}
//       />
//       <div>
//         <div className={styles.name}>{user.name}</div>
//         <div className={styles.username}>{user.username}</div>
//       </div>
//       {/* Kept your dismiss class, assuming it styles the 'X' logo or button */}
//       <div className={styles.dismiss}>
//         <Image 
//           src="/assets/an.png" 
//           alt="X Logo" 
//           width={38} 
//           height={38} 
//         />
//       </div>
//     </div>
//     <p className={styles.message}>"{user.message}"</p>
//   </div>
// );

// export default function Testimonials() {
//   return (
//     <div id="testimonials" className={styles.Box4Container}>
//       <ScrollReveal animation="up">
//         <h4 className={styles.header}>Testimonials</h4>
//       </ScrollReveal>
//       <ScrollReveal animation="up">
//         <h1 className={styles.title}>Wall Of Love</h1>
//       </ScrollReveal>
//       <ScrollReveal animation="up">
//         <p className={styles.subtitle}>
//           Here what some of our early users had to say.
//         </p>
//       </ScrollReveal>

//       {/* Replaced styles.scrollContainer with InfiniteMarquee */}
//       <div style={{ marginTop: "2rem", width: "100%" }}>
//         <InfiniteMarquee
//           speed={15} // Adjust speed (lower is faster)
//           direction="left"
//           items={testimonials.map((user) => (
//             <TestimonialCard key={user.id} user={user} />
//           ))}
//         />
//       </div>
//     </div>
//   );
// }
"use client";

import Image from "next/image";
import { Box, Typography } from "@mui/material";
import ScrollReveal from "@/app/Components/Scroll/ScrollReveal";
import { InfiniteMarquee } from "@/app/Components/InfiniteMarquee";

const testimonials = [
  {
    id: 1,
    name: "Mark Thompson",
    username: "@Mark Thompson",
    message:
      "Job hunt was a stressful mess of spreadsheets. Now everything is organized and clear. Total game-changer!",
    avatar: "/assets/mark.png",
  },
  {
    id: 2,
    name: "Alex Kim",
    username: "@Alex Kim",
    message:
      "Anchor cut my application time in half. I stopped wasting time and landed my offer faster than I ever thought.",
    avatar: "/assets/alex.png",
  },
  {
    id: 3,
    name: "Sarah Lee",
    username: "@Sarah Lee",
    message:
      "The goal-tracking system is motivating. Building streaks keeps me consistent, even when the search felt overwhelming.",
    avatar: "/assets/sarah.png",
  },
  {
    id: 4,
    name: "Sophia Rossi",
    username: "@Sophia12",
    message:
      "Anchor truly anchored my chaotic job search, providing a clear path and eliminating the daily stress. A lifesaver!",
    avatar: "/assets/sophia.png",
  },
  {
    id: 5,
    name: "Julian Thorne",
    username: "@Julian@19",
    message:
      "The personalized path planning is spot-on. It's like having a dedicated career coach guiding me through every single step.",
    avatar: "/assets/julian.png",
  },
];

// -------------------------------
// Testimonial Card Component
// -------------------------------
function TestimonialCard({
  user,
}: {
  user: (typeof testimonials)[0];
}) {
  return (
    <Box
      sx={{
        width: { xs: "260px", sm: "300px", md: "350px" },
        minWidth: { xs: "260px", sm: "300px", md: "350px" },
        height: { xs: "auto", md: "210px" },
        padding: { xs: "1rem", md: "1.5rem" },
        borderRadius: "1rem",
        backgroundColor: "#f9fafb",
        border: "1px solid #e5e7eb",
        transition: "all 0.3s ease",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",

        "&:hover": {
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
          borderColor: "rgba(0,0,0,0.1)",
          cursor: "pointer",
          transform: { md: "scale(1.05)" },
          zIndex: 10,
          position: "relative",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          justifyContent: "space-between",
        }}
      >
        <Image
          src={user.avatar}
          alt={user.name}
          width={48}
          height={48}
          style={{ borderRadius: "50%" }}
        />

        <Box sx={{ flexGrow: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "16px", color: "black" }}>
            {user.name}
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "#666" }}>
            {user.username}
          </Typography>
        </Box>

        {/* Dismiss icon */}
        <Image src="/assets/an.png" alt="X" width={38} height={38} />
      </Box>

      <Typography
        sx={{
          color: "black",
          fontSize: "1rem",
          paddingTop: "1rem",
          width: "100%",
        }}
      >
        "{user.message}"
      </Typography>
    </Box>
  );
}

// -------------------------------
// MAIN COMPONENT
// -------------------------------
export default function Testimonials() {
  return (
    <Box
      id="testimonials"
      sx={{
        padding: "7rem 4rem",
        margin: "1rem",
        marginBottom: "3rem",
        borderRadius: "3rem",
        background: "rgb(244, 240, 240)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.4rem",
       height: { xs: "auto", md: "80vh" },
        pt: { xs: "8.5rem", md: "0rem" },

        paddingBottom: { xs: "4rem", md: 0 },
        position: "relative",
        overflow: "hidden",

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
      {/* HEADER */}
      <ScrollReveal animation="up">
        <Box
          sx={{
            background:
              "linear-gradient(to right, #f7f7f7, #E5B526)",
            color: "black",
            p: "0.6rem",
            width: "7rem",
            borderRadius: "2rem",
            textAlign: "center",
            fontWeight: 600,
            mt:"-3.5rem",
            marginBottom: "2rem",
            
          }}
        >
          Testimonials
        </Box>
      </ScrollReveal>

      {/* TITLE */}
      <ScrollReveal animation="up">
        <Typography
          sx={{
            fontSize: { xs: "2.5rem", sm: "3rem", md: "4rem" },
            fontWeight: "bold",
            color: "black",
            textAlign: "center",
            marginBottom: "0.9rem",
            width: { xs: "100%", md: "40rem" },
            mt: "1rem",
          }}
        >
          Wall Of Love
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
          Hear what some of our early users had to say.
        </Typography>
      </ScrollReveal>

      {/* MARQUEE */}
      <Box
        sx={{
          marginTop: "2rem",
          width: "100%",
          px: { xs: "1rem", md: 0 },
          position: "relative",
          zIndex: 5,
        }}
      >
        <InfiniteMarquee
          speed={15}
          direction="left"
          items={testimonials.map((user) => (
            <TestimonialCard key={user.id} user={user} />
          ))}
        />
      </Box>
    </Box>
  );
}
