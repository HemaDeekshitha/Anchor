"use client";

import React, { useEffect, useState } from "react";
import { Box, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import SessionManager from "../auth/SessionManager";

const LayoutWithSidebar = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarExpanded, setSidebarExpanded] = useState(false);
  const [showCommunityToggle, setShowCommunityToggle] = useState(true);
  const pathname = usePathname();
  const isCommunityPage = pathname?.startsWith("/community") ?? false;

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

  useEffect(() => {
    const handleCommunityChrome = (event: Event) => {
      const detail = (event as CustomEvent<{ visible?: boolean }>).detail;
      setShowCommunityToggle(detail?.visible !== false);
    };
    window.addEventListener("anchor:community-chrome", handleCommunityChrome);
    return () =>
      window.removeEventListener(
        "anchor:community-chrome",
        handleCommunityChrome,
      );
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
        <IconButton
          aria-label="Open navigation"
          onClick={handleToggle}
          sx={{
            display: { xs: "inline-flex", md: "none" },
            position: isCommunityPage ? "fixed" : "static",
            top: isCommunityPage ? 4 : "auto",
            left: isCommunityPage ? 16 : "auto",
            zIndex: isCommunityPage ? 1200 : "auto",
            mb: isCommunityPage ? 0 : 2,
            border: "1px solid #e8ddd0",
            borderRadius: 2,
            color: "#b87444",
            bgcolor: "#ffffff",
            opacity: !isCommunityPage || showCommunityToggle ? 1 : 0,
            transform:
              !isCommunityPage || showCommunityToggle
                ? "translateY(0)"
                : "translateY(-120%)",
            pointerEvents:
              !isCommunityPage || showCommunityToggle ? "auto" : "none",
            transition: "opacity 180ms ease, transform 180ms ease",
            "&:hover": { bgcolor: "#f5ede0", borderColor: "#b87444" },
          }}
        >
          <MenuIcon />
        </IconButton>

        {children}
      </Box>
    </Box>
  );
};

export default LayoutWithSidebar;
