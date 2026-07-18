"use client";

import React from "react";
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
}

const drawerWidth = 280;

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "My Plan", icon: <ListTodo size={22} /> },
    { href: "/rewards", label: "Rewards", icon: <Trophy size={22} /> },
    { href: "/profile", label: "Profile", icon: <User size={22} /> },
    {
      href: "/application-tracker",
      label: "Jobs",
      icon: <BriefcaseBusiness size={22} />,
    },
    { href: "/community", label: "Community", icon: <Users size={22} /> },
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

  const content = (
    <Box
      sx={{
        width: drawerWidth,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        bgcolor: "#ffffff",
        boxSizing: "border-box",
        overflow: "hidden",
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
            gap: 1.5,
            px: 3,
            py: 2.5,
            fontSize: "1.6rem",
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
            sx={{ width: 40, height: 40 }}
          />
          Anchor
        </Box>

        <Divider sx={{ borderColor: "#e8ddd0" }} />

        {/* Navigation */}
        <List
          sx={{
            px: 2,
            mt: 2,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
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
                sx={{
                  borderRadius: 2,
                  py: 1.8,
                  color: active ? "#b87444" : "#8c6a50",
                  bgcolor: active ? "#fdfaf7" : "transparent",
                  border: active
                    ? "1px solid #e8ddd0"
                    : "1px solid transparent",
                  transition: "all 0.15s",
                  "&:hover": {
                    bgcolor: "#fdfaf7",
                    color: "#b87444",
                    border: "1px solid #e8ddd0",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                  {icon}
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    fontWeight: active ? 700 : 500,
                    fontSize: "1rem",
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* BOTTOM: Logout */}
      <Box sx={{ px: 2, pb: 3 }}>
        <Divider sx={{ borderColor: "#e8ddd0", mb: 2 }} />
        <Box
          onClick={handleLogOut}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            py: 1.5,
            borderRadius: 2,
            cursor: "pointer",
            color: "#8c6a50",
            border: "1px solid #e8ddd0",
            "&:hover": {
              bgcolor: "#fdfaf7",
              color: "#b87444",
              borderColor: "#b87444",
            },
            transition: "all 0.15s",
          }}
        >
          <LogOut size={18} />
          <Typography sx={{ fontSize: "0.9rem", fontWeight: 500 }}>
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
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          borderRight: "1px solid #d4b898",
          boxShadow: isMobile ? "4px 0 12px rgba(44,26,10,0.08)" : "none",
          bgcolor: "#ffffff",
          boxSizing: "border-box",
        },
      }}
    >
      {content}
    </Drawer>
  );
};

export default Sidebar;
