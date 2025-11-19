"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CardsProps {
  children: ReactNode;
  delay?: number;
}

export default function Cards({ children, delay = 0 }: CardsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}  // ✨ Slide-up from below
      whileInView={{ opacity: 1, y: 0 }} // ✨ Animate into position
      transition={{
        type: "spring",
        bounce: 0.25,
        duration: 0.8,
        delay: delay / 1000, // ✨ Apply delay in seconds
      }}
      viewport={{ once: true, amount: 0.3 }} // ✨ Triggers when 30% in view
    >
      {children}
    </motion.div>
  );
}
