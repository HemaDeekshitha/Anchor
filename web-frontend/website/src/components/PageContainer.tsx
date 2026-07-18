"use client";

import { Box } from "@mui/material";
import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
}

export default function PageContainer({
  children,
}: PageContainerProps) {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1600px",
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      {children}
    </Box>
  );
}