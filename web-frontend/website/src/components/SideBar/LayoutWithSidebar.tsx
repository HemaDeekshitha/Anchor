"use client";

import React, { useEffect, useState } from "react";
import { Box, IconButton, useMediaQuery, useTheme } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "./Sidebar";
import SessionManager from "../auth/SessionManager";

const LayoutWithSidebar = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarExpanded, setSidebarExpanded] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleToggle = () => setSidebarOpen((prev) => !prev);
  // T: O(1) and S: O(1)

  const handleClose = () => setSidebarOpen(false);
  // T: O(1) and S: O(1)

  const handleSidebarExpandedChange = (expanded: boolean) => {
    setSidebarExpanded(expanded);
  };
  // T: O(1) and S: O(1)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#fff",
        "--anchor-sidebar-width": isSidebarExpanded ? "280px" : "84px",
      }}
    >
      <SessionManager />
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        onClose={handleClose}
        onDesktopExpandedChange={handleSidebarExpandedChange}
      />

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

          bgcolor: "#fff",
        }}
      >
        {isMobile && (
          <IconButton
            onClick={handleToggle}
            sx={{
              mb: 2,
              border: "1px solid #e8ddd0",
              borderRadius: 2,
              color: "#b87444",
              bgcolor: "#ffffff",
              "&:hover": { bgcolor: "#f5ede0", borderColor: "#b87444" },
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
