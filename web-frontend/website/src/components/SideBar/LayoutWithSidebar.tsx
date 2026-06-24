"use client";

import React, { useEffect, useState } from "react";
import { Box, IconButton, useMediaQuery, useTheme } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "./Sidebar";

const drawerWidth = 280;

const LayoutWithSidebar = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleToggle = () => setSidebarOpen((prev) => !prev);
  const handleClose  = () => setSidebarOpen(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#ede8e0" }}>
      <Sidebar isSidebarOpen={isSidebarOpen} onClose={handleClose} />

      <Box component="main" sx={{
        flexGrow: 1,
        p: 3,
        bgcolor: "#ede8e0",
        ml: !isMobile ? `${drawerWidth}px` : 0,
        transition: "margin 0.3s ease",
      }}>
        {isMobile && (
          <IconButton onClick={handleToggle} sx={{
            mb: 2,
            border: "1px solid #e8ddd0",
            borderRadius: 2,
            color: "#b87444",
            bgcolor: "#ffffff",
            "&:hover": { bgcolor: "#f5ede0", borderColor: "#b87444" },
          }}>
            <MenuIcon />
          </IconButton>
        )}

        {children}
      </Box>
    </Box>
  );
};

export default LayoutWithSidebar;