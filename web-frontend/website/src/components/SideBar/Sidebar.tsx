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
  IconButton,
} from "@mui/material";
import {
  BriefcaseBusiness,
  ListTodo,
  LogOut,
  Trophy,
  User,
  Users,
  X,
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
  const router = useRouter();
  const pathname = usePathname();
  const [desktopExpanded, setDesktopExpanded] = useState(false);
  const drawerWidth = desktopExpanded
    ? expandedDrawerWidth
    : collapsedDrawerWidth;

  const navItems = [
    {
      href: "/dashboard",
      label: "My Plan",
      icon: <ListTodo size={26} />,
    },
    {
      href: "/rewards",
      label: "Rewards",
      icon: <Trophy size={26} />,
    },
    {
      href: "/profile",
      label: "Profile",
      icon: <User size={26} />,
    },
    {
      href: "/application-tracker",
      label: "Jobs",
      icon: <BriefcaseBusiness size={26} />,
    },
    {
      href: "/community?tab=communities",
      label: "Communities",
      icon: <Users size={26} />,
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
    setDesktopExpanded(true);
    onDesktopExpandedChange(true);
  };
  // T: O(1) and S: O(1)

  const handleCollapse = () => {
    setDesktopExpanded(false);
    onDesktopExpandedChange(false);
  };
  // T: O(1) and S: O(1)

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setDesktopExpanded(false);
      onDesktopExpandedChange(false);
    }
  };
  // T: O(1) and S: O(1)

  const handleNavigation = () => {
    onClose();
  };
  // T: O(1) and S: O(1)

  const renderContent = (
    expanded: boolean,
    allowHover: boolean,
    options?: { showCloseButton?: boolean },
  ) => (
    <Box
      onMouseEnter={allowHover ? handleExpand : undefined}
      onMouseLeave={allowHover ? handleCollapse : undefined}
      onFocusCapture={allowHover ? handleExpand : undefined}
      onBlurCapture={allowHover ? handleBlur : undefined}
      sx={{
        width: expanded ? expandedDrawerWidth : collapsedDrawerWidth,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        bgcolor: "var(--anchor-sidebar-bg)",
        color: "var(--anchor-header-text)",
        boxSizing: "border-box",
        overflow: "hidden",
        transition: "width 220ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* TOP: Brand + Nav */}
      <Box>
        {/* Brand */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            px: expanded || options?.showCloseButton ? 2 : 0,
            py: options?.showCloseButton ? 1.5 : 2,
            minHeight: options?.showCloseButton ? 64 : undefined,
          }}
        >
          <Box
            component={Link}
            href="/dashboard"
            onClick={options?.showCloseButton ? onClose : undefined}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: expanded ? "flex-start" : "center",
              gap: expanded ? 1.5 : 0,
              minWidth: 0,
              flex: 1,
              fontSize: {
                xs: "1.35rem",
                md: "1.5rem",
                lg: "1.6rem",
                xl: "1.7rem",
              },
              fontWeight: 700,
              color: "var(--anchor-header-text)",
              textDecoration: "none",
              fontFamily: "'Playfair Display', serif",
              "&:hover": { color: "var(--anchor-header-accent)" },
            }}
          >
            <Box
              component="img"
              src="/assets/Anchor_logo.png"
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
                flexShrink: 0,
              }}
            />
            <Typography
              component="span"
              sx={{
                color: "inherit",
                font: "inherit",
                whiteSpace: "nowrap",
                opacity: expanded ? 1 : 0,
                width: expanded ? "auto" : 0,
                overflow: "hidden",
                transition: "opacity 140ms ease",
              }}
            >
              Anchor
            </Typography>
          </Box>
          {options?.showCloseButton && (
            <IconButton
              aria-label="Close navigation"
              onClick={onClose}
              size="small"
              sx={{
                color: "var(--anchor-header-muted)",
                flexShrink: 0,
                "&:hover": {
                  color: "var(--anchor-header-text)",
                  bgcolor: "var(--anchor-search-bg)",
                },
              }}
            >
              <X size={22} />
            </IconButton>
          )}
        </Box>

        <Divider sx={{ borderColor: "var(--anchor-header-border)" }} />

        {/* Navigation */}
        <List
          sx={{
            px: options?.showCloseButton ? 1.25 : 0,
            mt: 1,
            display: "flex",
            flexDirection: "column",
            gap: 0.2,
          }}
        >
          {navItems.map(({ href, label, icon }) => {
            const pathOnly = href.split("?")[0] || href;
            const active =
              pathOnly === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === pathOnly ||
                  pathname.startsWith(`${pathOnly}/`);
            return (
              <ListItemButton
                key={href}
                component={Link}
                href={href}
                aria-current={active ? "page" : undefined}
                onClick={handleNavigation}
                sx={{
                  borderRadius: options?.showCloseButton ? 2 : 0,
                  justifyContent: "flex-start",
                  px: 0,
                  py: {
                    xs: 1.2,
                    md: 1.4,
                    lg: 1.6,
                  },
                  color: active
                    ? "var(--anchor-header-accent)"
                    : "var(--anchor-header-muted)",
                  bgcolor: active
                    ? "color-mix(in srgb, var(--anchor-header-accent) 14%, transparent)"
                    : "transparent",
                  position: "relative",
                  transition:
                    "background-color 150ms ease, color 150ms ease, padding 220ms ease",
                  "&::before": options?.showCloseButton
                    ? { display: "none" }
                    : {
                        content: '""',
                        position: "absolute",
                        inset: "0 auto 0 0",
                        width: active ? 4 : 3,
                        bgcolor: active
                          ? "var(--anchor-header-accent)"
                          : "transparent",
                      },
                  "&:hover": {
                    bgcolor: active
                      ? "color-mix(in srgb, var(--anchor-header-accent) 18%, transparent)"
                      : "var(--anchor-search-bg)",
                    color: "var(--anchor-header-accent)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    width: options?.showCloseButton ? 52 : collapsedDrawerWidth,
                    minWidth: options?.showCloseButton
                      ? 52
                      : collapsedDrawerWidth,
                    justifyContent: "center",
                    color: "inherit",
                    flexShrink: 0,
                    "& svg": {
                      strokeWidth: active ? 2.5 : 2,
                    },
                  }}
                >
                  {icon}
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  sx={{
                    opacity: expanded ? 1 : 0,
                    width: expanded ? "auto" : 0,
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
        <Divider sx={{ borderColor: "var(--anchor-header-border)", mb: 1 }} />
        <Box
          onClick={handleLogOut}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: expanded ? 1 : 0,
            py: 1.5,
            cursor: "pointer",
            color: "var(--anchor-header-muted)",
            "&:hover": {
              bgcolor: "var(--anchor-search-bg)",
              color: "var(--anchor-header-accent)",
            },
            transition: "all 0.15s",
          }}
        >
          <Box
            sx={{
              width: options?.showCloseButton ? 52 : collapsedDrawerWidth,
              minWidth: options?.showCloseButton ? 52 : collapsedDrawerWidth,
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
              opacity: expanded ? 1 : 0,
              width: expanded ? "auto" : 0,
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
    <>
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0,
          overflow: "hidden",
          alignSelf: "stretch",
        }}
      >
        <Drawer
          variant="permanent"
          open
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            transition: "width 220ms cubic-bezier(0.4, 0, 0.2, 1)",
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: "1px solid var(--anchor-sidebar-border)",
              bgcolor: "var(--anchor-sidebar-bg)",
              boxShadow: "none",
              overflowX: "hidden",
              transition: "width 220ms cubic-bezier(0.4, 0, 0.2, 1)",
            },
          }}
        >
          {renderContent(desktopExpanded, true)}
        </Drawer>
      </Box>
      <Drawer
        variant="temporary"
        open={isSidebarOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
          sx: {
            display: { xs: "block", md: "none" },
            zIndex: 1500,
          },
        }}
        sx={{
          display: { xs: "block", md: "none" },
          width: 0,
          minWidth: 0,
          flexBasis: 0,
          overflow: "visible",
          zIndex: 1500,
          "& .MuiDrawer-paper": {
            width: { xs: "min(280px, 86vw)", sm: expandedDrawerWidth },
            boxSizing: "border-box",
            borderRight: "1px solid var(--anchor-sidebar-border)",
            bgcolor: "var(--anchor-sidebar-bg)",
            boxShadow: "4px 0 12px rgba(44,26,10,0.08)",
            overflowX: "hidden",
            top: 0,
            height: "100dvh",
            pt: "env(safe-area-inset-top)",
            zIndex: 1501,
          },
        }}
      >
        {renderContent(true, false, { showCloseButton: true })}
      </Drawer>
    </>
  );
};

export default Sidebar;
