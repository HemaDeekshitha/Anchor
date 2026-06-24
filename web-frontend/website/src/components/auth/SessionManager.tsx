"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Typography,
} from "@mui/material";
import {
  apiFetch,
  logoutSession,
  SESSION_CHANNEL,
  SESSION_ENDED_EVENT,
} from "@/lib/auth-client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const IDLE_LIMIT_MS = Number(
  process.env.NEXT_PUBLIC_IDLE_TIMEOUT_MS || 30 * 60 * 1000
);
const WARNING_MS = Number(
  process.env.NEXT_PUBLIC_IDLE_WARNING_MS || 2 * 60 * 1000
);
const ACTIVITY_BROADCAST_THROTTLE_MS = 15_000;

export default function SessionManager() {
  const router = useRouter();
  const [warningOpen, setWarningOpen] = useState(false);
  const [remainingMs, setRemainingMs] = useState(WARNING_MS);
  const lastActivityRef = useRef(Date.now());
  const lastBroadcastRef = useRef(0);
  const warningOpenRef = useRef(false);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const endingRef = useRef(false);

  useEffect(() => {
    warningOpenRef.current = warningOpen;
  }, [warningOpen]);

  const redirectToLogin = useCallback(
    (reason: string) => {
      if (endingRef.current) return;
      endingRef.current = true;
      router.replace(`/login?reason=${encodeURIComponent(reason)}`);
      router.refresh();
    },
    [router]
  );

  const endSession = useCallback(
    async (reason: string) => {
      if (endingRef.current) return;
      endingRef.current = true;
      await logoutSession(reason);
      router.replace(`/login?reason=${encodeURIComponent(reason)}`);
      router.refresh();
    },
    [router]
  );

  const recordActivity = useCallback(() => {
    if (warningOpenRef.current || endingRef.current) return;
    const now = Date.now();
    lastActivityRef.current = now;

    if (now - lastBroadcastRef.current >= ACTIVITY_BROADCAST_THROTTLE_MS) {
      lastBroadcastRef.current = now;
      channelRef.current?.postMessage({ type: "activity", at: now });
      localStorage.setItem("anchor:last-activity", String(now));
    }
  }, []);

  useEffect(() => {
    const storedActivity = Number(localStorage.getItem("anchor:last-activity"));
    if (Number.isFinite(storedActivity) && storedActivity > 0) {
      lastActivityRef.current = Math.max(lastActivityRef.current, storedActivity);
    }

    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(SESSION_CHANNEL);
      channelRef.current = channel;
      channel.onmessage = (event) => {
        if (event.data?.type === "activity" && !warningOpenRef.current) {
          lastActivityRef.current = Math.max(
            lastActivityRef.current,
            Number(event.data.at) || 0
          );
        }
        if (event.data?.type === "logout") {
          redirectToLogin(event.data.reason || "expired");
        }
      };
    }

    const activityEvents: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "scroll",
      "touchstart",
    ];
    activityEvents.forEach((event) =>
      window.addEventListener(event, recordActivity, { passive: true })
    );

    const onVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        Date.now() - lastActivityRef.current < IDLE_LIMIT_MS
      ) {
        recordActivity();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const onSessionEnded = (event: Event) => {
      const reason = (event as CustomEvent<{ reason?: string }>).detail?.reason;
      redirectToLogin(reason || "expired");
    };
    window.addEventListener(SESSION_ENDED_EVENT, onSessionEnded);

    return () => {
      activityEvents.forEach((event) =>
        window.removeEventListener(event, recordActivity)
      );
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener(SESSION_ENDED_EVENT, onSessionEnded);
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, [recordActivity, redirectToLogin]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const idleFor = Date.now() - lastActivityRef.current;
      if (idleFor < IDLE_LIMIT_MS) return;

      const remaining = WARNING_MS - (idleFor - IDLE_LIMIT_MS);
      if (remaining <= 0) {
        window.clearInterval(timer);
        void endSession("inactive");
        return;
      }

      setWarningOpen(true);
      setRemainingMs(remaining);
    }, 1_000);

    return () => window.clearInterval(timer);
  }, [endSession]);

  const staySignedIn = async () => {
    const response = await apiFetch(`${API_BASE_URL}/auth/session`);
    if (!response.ok) {
      await endSession("expired");
      return;
    }

    const now = Date.now();
    lastActivityRef.current = now;
    lastBroadcastRef.current = now;
    localStorage.setItem("anchor:last-activity", String(now));
    channelRef.current?.postMessage({ type: "activity", at: now });
    setWarningOpen(false);
    setRemainingMs(WARNING_MS);
  };

  const seconds = Math.max(0, Math.ceil(remainingMs / 1_000));

  return (
    <Dialog
      open={warningOpen}
      disableEscapeKeyDown
      aria-labelledby="session-warning-title"
      PaperProps={{ sx: { borderRadius: 3, maxWidth: 460 } }}
    >
      <DialogTitle id="session-warning-title" sx={{ fontWeight: 800 }}>
        Are you still there?
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ color: "#6f5542", mb: 2 }}>
          You have been inactive. To protect your account, Anchor will sign you
          out in {seconds} seconds.
        </Typography>
        <Box sx={{ width: "100%" }}>
          <LinearProgress
            variant="determinate"
            value={(remainingMs / WARNING_MS) * 100}
            sx={{ height: 7, borderRadius: 999 }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={() => void endSession("manual")}>Log out</Button>
        <Button variant="contained" onClick={() => void staySignedIn()}>
          Stay signed in
        </Button>
      </DialogActions>
    </Dialog>
  );
}
