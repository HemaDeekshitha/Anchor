"use client";

import React from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { C } from "./constants";
import { CommunityPageTab } from "./Types";

const CommunityNavigation = ({
  value,
  onChange,
}: {
  value: CommunityPageTab;
  onChange: (value: CommunityPageTab) => void;
}) => {
  const handleChange = (
    _event: React.SyntheticEvent,
    nextValue: CommunityPageTab
  ) => {
    onChange(nextValue);
  };
  // T: O(1) and S: O(1)

  return (
    <Box
      component="nav"
      aria-label="Community sections"
      sx={{
        bgcolor: "#fff",
        borderBottom: `1px solid ${C.divider}`,
      }}
    >
      <Tabs
        value={value}
        onChange={handleChange}
        variant="fullWidth"
        sx={{
          minHeight: 54,
          "& .MuiTabs-indicator": {
            height: 2,
            bgcolor: C.accent,
          },
          "& .MuiTab-root": {
            minHeight: 54,
            color: "#111",
            textTransform: "none",
            fontSize: { xs: "0.85rem", sm: "0.95rem" },
            fontWeight: 500,
          },
          "& .Mui-selected": {
            color: "#111 !important",
            fontWeight: 700,
          },
        }}
      >
        <Tab value="posts" label="Posts" />
        <Tab value="communities" label="Communities" />
        <Tab value="friends" label="Friends" />
      </Tabs>
    </Box>
  );
};
// T: O(1) and S: O(1)

export default CommunityNavigation;
