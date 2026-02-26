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
  Button,
} from "@mui/material";
import { BriefcaseBusiness, ListTodo, LogOut, Trophy, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface SidebarProps {
  isSidebarOpen: boolean;
  onClose: () => void; // needed for overlay close
}

const drawerWidth = 240;

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();

  const handleLogOut = async () => {
    try {
      await fetch("http://localhost:3001/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      router.push("/login");
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
        bgcolor: "#fff",
        justifyContent: "space-between",
        p: 2,
      }}
    >
      <Box
        sx={
          {
            // width: drawerWidth,
            // height: "100%",
            // display: "flex",
            // flexDirection: "column",
            // bgcolor: "#fff",
          }
        }
      >
        {/* Brand */}
        <Box
          component={Link}
          href="/dashboard"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 2,
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "#111827",
            textDecoration: "none",
            "&:hover": {
              color: "#be123c",
            },
          }}
        >
          <Box
            component="img"
            src="/assets/logo.png"
            alt="Anchor Logo"
            sx={{ width: 28, height: 28 }}
          />
          Anchor
        </Box>

        <Divider />

        {/* Navigation */}
        <List sx={{ px: 1, mt: 1 }}>
          <ListItemButton
            component={Link}
            href="/dashboard"
            sx={{
              borderRadius: 2,
              mb: 1,
              color: "#713f12",
              "&:hover": {
                bgcolor: "#fff1f2",
                color: "#be123c",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <ListTodo size={20} />
            </ListItemIcon>
            <ListItemText primary="My Plan" />
          </ListItemButton>

          <ListItemButton
            sx={{
              borderRadius: 2,
              mb: 1,
              color: "#713f12",
              "&:hover": {
                bgcolor: "#fff1f2",
                color: "#be123c",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Trophy size={20} />
            </ListItemIcon>
            <ListItemText primary="Rewards" />
          </ListItemButton>

          <ListItemButton
            component={Link}
            href="/profile"
            sx={{
              borderRadius: 2,
              mb: 1,
              color: "#713f12",
              "&:hover": {
                bgcolor: "#fff1f2",
                color: "#be123c",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <User size={20} />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>

          <ListItemButton
            component={Link}
            href="/application-tracker"
            sx={{
              borderRadius: 2,
              color: "#713f12",
              "&:hover": {
                bgcolor: "#fff1f2",
                color: "#be123c",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <BriefcaseBusiness size={20} />
            </ListItemIcon>
            <ListItemText primary="Track your Jobs" />
          </ListItemButton>
        </List>
      </Box>
      <Box
        component={Button}
        onClick={handleLogOut}
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "center",
          color: "#713f12",
          "&:hover": {
            bgcolor: "transparent",
            color: "#be123c",
          },
        }}
      >
        <LogOut size={20} />
        <Typography
          variant="body2"
          sx={{ ml: 1, fontSize: "1.2rem", textTransform: "none" }}
        >
          Logout
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? isSidebarOpen : true}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          borderRight: "1px solid #eee",
          boxShadow: isMobile ? "4px 0 12px rgba(0,0,0,0.1)" : "none",
        },
      }}
    >
      {content}
    </Drawer>
  );
};

export default Sidebar;
