"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  BriefcaseBusiness,
  ListTodo,
  LogOut,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { logoutSession } from "@/lib/auth-client";

interface SidebarProps {
  isSidebarOpen: boolean;
  onClose: () => void;
  onDesktopExpandedChange: (expanded: boolean) => void;
}

const expandedDrawerWidth = 280;
const collapsedDrawerWidth = 84;

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  onClose,
  onDesktopExpandedChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();
  const pathname = usePathname();
  const [desktopExpanded, setDesktopExpanded] = useState(false);
  const isExpanded = isMobile || desktopExpanded;
  const drawerWidth = isExpanded ? expandedDrawerWidth : collapsedDrawerWidth;

  const navItems = [
    {
      href: "/dashboard",
      label: "My Plan",
      icon: <ListTodo size={isMobile ? 22 : 26} />,
    },
    {
      href: "/rewards",
      label: "Rewards",
      icon: <Trophy size={isMobile ? 22 : 26} />,
    },
    {
      href: "/profile",
      label: "Profile",
      icon: <User size={isMobile ? 22 : 26} />,
    },
    {
      href: "/application-tracker",
      label: "Jobs",
      icon: <BriefcaseBusiness size={isMobile ? 22 : 26} />,
    },
    {
      href: "/community",
      label: "Community",
      icon: <Users size={isMobile ? 22 : 26} />,
    },
  ];

  const handleLogOut = async () => {
    try {
      await logoutSession("manual");
      router.replace("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };
  // T: O(1) and S: O(1)

  const handleExpand = () => {
    if (!isMobile) {
      setDesktopExpanded(true);
      onDesktopExpandedChange(true);
    }
  };
  // T: O(1) and S: O(1)

  const handleCollapse = () => {
    if (!isMobile) {
      setDesktopExpanded(false);
      onDesktopExpandedChange(false);
    }
  };
  // T: O(1) and S: O(1)

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (
      !isMobile &&
      !event.currentTarget.contains(event.relatedTarget as Node | null)
    ) {
      setDesktopExpanded(false);
      onDesktopExpandedChange(false);
    }
  };
  // T: O(1) and S: O(1)

  const handleNavigation = () => {
    if (isMobile) onClose();
  };
  // T: O(1) and S: O(1)

  const content = (
    <Box
      onMouseEnter={handleExpand}
      onMouseLeave={handleCollapse}
      onFocusCapture={handleExpand}
      onBlurCapture={handleBlur}
      sx={{
        width: drawerWidth,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        bgcolor: "#ffffff",
        boxSizing: "border-box",
        overflow: "hidden",
        transition: "width 220ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* TOP: Brand + Nav */}
      <Box>
        {/* Brand */}
        <Box
          component={Link}
          href="/dashboard"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: isExpanded ? "flex-start" : "center",
            gap: isExpanded ? 1.5 : 0,
            px: isExpanded ? 2.5 : 0,
            py: 2,
            fontSize: {
              xs: "1.4rem",
              md: "1.7rem",
              lg: "1.9rem",
              xl: "2.1rem",
            },
            fontWeight: 700,
            color: "#2c1a0a",
            textDecoration: "none",
            fontFamily: "'Playfair Display', serif",
            "&:hover": { color: "#b87444" },
          }}
        >
          <Box
            component="img"
            src="/assets/logo.png"
            alt="Anchor Logo"
            sx={{
              width: {
                xs: 40,
                md: 46,
                lg: 52,
                xl: 58,
              },
              height: {
                xs: 40,
                md: 46,
                lg: 52,
                xl: 58,
              },
            }}
          />
          <Typography
            component="span"
            sx={{
              color: "inherit",
              font: "inherit",
              whiteSpace: "nowrap",
              opacity: isExpanded ? 1 : 0,
              width: isExpanded ? "auto" : 0,
              overflow: "hidden",
              transition: "opacity 140ms ease",
            }}
          >
            Anchor
          </Typography>
        </Box>

        <Divider sx={{ borderColor: "#e8ddd0" }} />

        {/* Navigation */}
        <List
          sx={{
            px: 0,
            mt: 1,
            display: "flex",
            flexDirection: "column",
            gap: 0.2,
          }}
        >
          {navItems.map(({ href, label, icon }) => {
            const active =
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <ListItemButton
                key={href}
                component={Link}
                href={href}
                onClick={handleNavigation}
                sx={{
                  borderRadius: 0,
                  justifyContent: "flex-start",
                  px: 0,
                  py: {
                    xs: 1.2,
                    md: 1.4,
                    lg: 1.6,
                  },
                  color: active ? "#b87444" : "#8c6a50",
                  bgcolor: active ? "#f5ede5" : "transparent",
                  position: "relative",
                  transition:
                    "background-color 150ms ease, color 150ms ease, padding 220ms ease",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: "0 auto 0 0",
                    width: 3,
                    bgcolor: active ? "#b87444" : "transparent",
                  },
                  "&:hover": {
                    bgcolor: "#f5ede5",
                    color: "#b87444",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    width: collapsedDrawerWidth,
                    minWidth: collapsedDrawerWidth,
                    justifyContent: "center",
                    color: "inherit",
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  sx={{
                    opacity: isExpanded ? 1 : 0,
                    width: isExpanded ? "auto" : 0,
                    m: 0,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    transition: "opacity 140ms ease",
                  }}
                  primaryTypographyProps={{
                    fontWeight: active ? 700 : 500,
                    fontSize: {
                      xs: "0.95rem",
                      md: "1rem",
                      lg: "1.08rem",
                      xl: "1.15rem",
                    },
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* BOTTOM: Logout */}
      <Box sx={{ pb: 2 }}>
        <Divider sx={{ borderColor: "#e8ddd0", mb: 1 }} />
        <Box
          onClick={handleLogOut}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: isExpanded ? 1 : 0,
            py: 1.5,
            cursor: "pointer",
            color: "#8c6a50",
            "&:hover": {
              bgcolor: "#f5ede5",
              color: "#b87444",
            },
            transition: "all 0.15s",
          }}
        >
          <Box
            sx={{
              width: collapsedDrawerWidth,
              minWidth: collapsedDrawerWidth,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <LogOut size={18} />
          </Box>
          <Typography
            sx={{
              fontSize: "0.9rem",
              fontWeight: 500,
              whiteSpace: "nowrap",
              opacity: isExpanded ? 1 : 0,
              width: isExpanded ? "auto" : 0,
              overflow: "hidden",
              transition: "opacity 140ms ease",
            }}
          >
            Logout
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? isSidebarOpen : true}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: isMobile ? expandedDrawerWidth : drawerWidth,
        flexShrink: 0,
        transition: "width 220ms cubic-bezier(0.4, 0, 0.2, 1)",
        "& .MuiDrawer-paper": {
          width: isMobile ? expandedDrawerWidth : drawerWidth,
          boxSizing: "border-box",
          borderRight: "1px solid #d4b898",
          bgcolor: "#fff",
          boxShadow: isMobile ? "4px 0 12px rgba(44,26,10,0.08)" : "none",
          overflowX: "hidden",
          transition: "width 220ms cubic-bezier(0.4, 0, 0.2, 1)",
        },
      }}
    >
      {content}
    </Drawer>
  );
};

export default Sidebar;
