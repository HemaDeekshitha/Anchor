"use client";

import React, { useEffect, useState } from "react";
import { Box, IconButton, useMediaQuery, useTheme } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "./Sidebar";
import SessionManager from "../auth/SessionManager";

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
      <SessionManager />
      <Sidebar isSidebarOpen={isSidebarOpen} onClose={handleClose} />

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          width: "100%",
          boxSizing: "border-box",

          px: {
            xs: 2,
            sm: 3,
            md: 4,
            lg: 5,
          },
          py: 2,

          overflowX: "hidden",
          overflowY: "auto",

          bgcolor: "#ede8e0",
        }}
      >
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
