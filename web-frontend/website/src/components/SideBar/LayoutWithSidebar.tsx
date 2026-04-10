"use client";

import React, { useEffect, useState } from "react";
import { Box, IconButton, useMediaQuery, useTheme } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "./Sidebar";

const drawerWidth = 240;

const LayoutWithSidebar = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleToggle = () => setSidebarOpen((prev) => !prev);
  const handleClose = () => setSidebarOpen(false);

  // Close sidebar on ESC (nice UX touch)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} onClose={handleClose} />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          ml: { xs: 0, md: `${drawerWidth}px` },
          width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
          minWidth: 0,
          boxSizing: "border-box",
          p: { xs: 2, sm: 3 },
          bgcolor: "#fafafa",
          transition: "margin 0.3s ease",
        }}
      >
        {/* Hamburger (Mobile Only) */}
        {isMobile && (
          <IconButton
            onClick={handleToggle}
            sx={{
              mb: 2,
              border: "1px solid #fecdd3",
              borderRadius: 2,
              color: "#881337",
              bgcolor: "white",
              "&:hover": {
                bgcolor: "#ffe4e6",
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {children}
      </Box>
    </Box>
  );
};

export default LayoutWithSidebar;
