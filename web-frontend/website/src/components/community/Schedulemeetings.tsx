"use client";

import React from "react";
import { Box, Card, Stack, Avatar, Divider, Typography } from "@mui/material";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import { C, ALL_ID } from "./constants";
import { ScheduledMeeting } from "./Types";
import { useRouter } from "next/navigation";

const ScheduleMeetings = ({
  meetings,
  activeCommunityId,
  activeCommunityName,
}: {
  meetings: ScheduledMeeting[];
  activeCommunityId: string;
  activeCommunityName?: string;
}) => {
  const route = useRouter();
  const isAllView = activeCommunityId === ALL_ID;
  const scopedMeetings = meetings.filter(
    (m) => m.communityId === activeCommunityId
  );

  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 3,
        background: C.cardBg,
        border: `1px solid ${C.divider}`,
        borderTop: `4px solid ${C.accent}`,
        boxShadow: "0 4px 20px rgba(44,26,10,0.07)",
      }}
    >
      <Typography
        sx={{
          fontSize: "1.05rem",
          fontWeight: 700,
          color: C.accent,
          mb: 0.5,
          fontFamily: "'Playfair Display', serif",
        }}
      >
        Schedule a Discussion
      </Typography>

      {isAllView ? (
        <>
          <Typography sx={{ fontSize: "0.82rem", color: C.textSub, mb: 2 }}>
            Scheduling is scoped to a single community&apos;s members. Switch to
            one of your joined communities to book a session.
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              py: 1.2,
              borderRadius: 2,
              border: `1px dashed ${C.divider}`,
              color: C.textMuted,
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            <CalendarMonthRoundedIcon sx={{ fontSize: 18 }} />
            Select a community to schedule
          </Box>
        </>
      ) : (
        <>
          <Typography sx={{ fontSize: "0.82rem", color: C.textSub, mb: 2.5 }}>
            Book time with a member of {activeCommunityName ?? "this community"}{" "}
            — a doubt, a mock interview, or general prep.
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              py: 1.2,
              borderRadius: 2,
              background: C.accentGrad,
              color: "#fff",
              fontSize: "0.88rem",
              fontWeight: 600,
              cursor: "pointer",
              mb: 2.5,
              "&:hover": { opacity: 0.92 },
            }}
            onClick={() => {
              window.open(
                "https://comm360.feeltiptop.com/",
                "_blank",
                "noopener,noreferrer"
              );
            }}
          >
            <CalendarMonthRoundedIcon sx={{ fontSize: 18 }} />
            Schedule via Comm360
          </Box>

          <Typography
            sx={{
              fontSize: "0.75rem",
              color: C.textMuted,
              textTransform: "uppercase",
              letterSpacing: 0.4,
              fontWeight: 600,
              mb: 1.5,
            }}
          >
            Upcoming
          </Typography>

          <Stack spacing={0}>
            {scopedMeetings.length === 0 ? (
              <Typography
                sx={{
                  color: C.textMuted,
                  fontSize: "0.85rem",
                  textAlign: "center",
                  py: 2,
                }}
              >
                No meetings scheduled yet
              </Typography>
            ) : (
              scopedMeetings.map((meeting, idx) => (
                <React.Fragment key={meeting.id}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.3,
                      py: 1.4,
                    }}
                  >
                    <Avatar
                      src={meeting.withAvatar}
                      sx={{
                        width: 34,
                        height: 34,
                        bgcolor: C.accentFaint,
                        color: C.accentDark,
                        fontSize: "0.78rem",
                      }}
                    >
                      {meeting.withName.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: C.textPrimary,
                        }}
                      >
                        {meeting.withName}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: C.textMuted,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {meeting.topic}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.4,
                          color: C.textSub,
                        }}
                      >
                        <AccessTimeRoundedIcon sx={{ fontSize: 13 }} />
                        <Typography sx={{ fontSize: "0.75rem" }}>
                          {meeting.date}, {meeting.time}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.4,
                          justifyContent: "flex-end",
                          mt: 0.3,
                        }}
                      >
                        <VideocamRoundedIcon
                          sx={{ fontSize: 13, color: C.accent }}
                        />
                        <Typography
                          sx={{
                            fontSize: "0.72rem",
                            color: C.accent,
                            fontWeight: 600,
                          }}
                        >
                          {meeting.via}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  {idx < scopedMeetings.length - 1 && (
                    <Divider sx={{ borderColor: C.divider }} />
                  )}
                </React.Fragment>
              ))
            )}
          </Stack>
        </>
      )}
    </Card>
  );
};

export default ScheduleMeetings;
