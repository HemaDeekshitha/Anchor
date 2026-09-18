"use client";

import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import SessionManager from "../auth/SessionManager";
import AppTopBar from "../layout/AppTopBar";
import CommunityNotificationWatcher from "../community/CommunityNotificationWatcher";
import { AppChromeProvider } from "@/lib/app-chrome";
import { ThemeModeProvider } from "@/lib/theme-mode";

const LayoutWithSidebar = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarExpanded, setSidebarExpanded] = useState(false);

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
    <ThemeModeProvider>
      <AppChromeProvider>
        <Box
          sx={{
            display: "flex",
            height: "100dvh",
            overflow: "hidden",
            bgcolor: "var(--background)",
            "--anchor-sidebar-width": {
              xs: "0px",
              md: isSidebarExpanded ? "280px" : "84px",
            },
          }}
        >
          <SessionManager />
          <CommunityNotificationWatcher />
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            onClose={handleClose}
            onDesktopExpandedChange={handleSidebarExpandedChange}
          />

          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              bgcolor: "var(--background)",
            }}
          >
            <AppTopBar onOpenNavigation={handleToggle} />
            <Box
              aria-hidden
              sx={{
                height: "var(--anchor-topbar-height, 56px)",
                flexShrink: 0,
              }}
            />

            <Box
              component="main"
              sx={{
                flex: 1,
                minWidth: 0,
                minHeight: 0,
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
                mx: "auto",
                px: {
                  xs: 1,
                  sm: 2,
                  md: 4,
                  lg: 5,
                },
                pt: 0,
                pb: 2,
                overflowX: "hidden",
                overflowY: "auto",
                overscrollBehavior: "none",
                bgcolor: "var(--background)",
              }}
            >
              {children}
            </Box>
          </Box>
        </Box>
      </AppChromeProvider>
    </ThemeModeProvider>
  );
};

export default LayoutWithSidebar;
