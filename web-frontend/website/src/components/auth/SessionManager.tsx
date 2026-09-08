"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  keepSessionAlive,
  SESSION_CHANNEL,
  SESSION_ENDED_EVENT,
} from "@/lib/auth-client";

const KEEP_ALIVE_MS = 10 * 60 * 1000;

export default function SessionManager() {
  const router = useRouter();
  const endingRef = useRef(false);

  const redirectToLogin = useCallback(
    (reason: string) => {
      if (endingRef.current) return;
      endingRef.current = true;
      router.replace(`/login?reason=${encodeURIComponent(reason)}`);
      router.refresh();
    },
    [router]
  );

  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel(SESSION_CHANNEL);
      channel.onmessage = (event) => {
        if (event.data?.type === "logout") {
          redirectToLogin(event.data.reason || "expired");
        }
      };
    }

    const onSessionEnded = (event: Event) => {
      const reason = (event as CustomEvent<{ reason?: string }>).detail?.reason;
      redirectToLogin(reason || "expired");
    };
    window.addEventListener(SESSION_ENDED_EVENT, onSessionEnded);

    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") {
        void keepSessionAlive();
      }
    };

    void keepSessionAlive();
    const timer = window.setInterval(refreshIfVisible, KEEP_ALIVE_MS);
    document.addEventListener("visibilitychange", refreshIfVisible);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshIfVisible);
      window.removeEventListener(SESSION_ENDED_EVENT, onSessionEnded);
      channel?.close();
    };
  }, [redirectToLogin]);

  return null;
}
