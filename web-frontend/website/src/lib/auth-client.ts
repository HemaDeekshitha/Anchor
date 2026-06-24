const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const SESSION_ENDED_EVENT = "anchor:session-ended";
export const SESSION_CHANNEL = "anchor-session";

let refreshPromise: Promise<boolean> | null = null;

function notifySessionEnded(reason: string) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(SESSION_ENDED_EVENT, { detail: { reason } })
  );

  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel(SESSION_CHANNEL);
    channel.postMessage({ type: "logout", reason });
    channel.close();
  }
}

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const requestInit: RequestInit = {
    ...init,
    credentials: "include",
  };

  let response = await fetch(input, requestInit);
  if (response.status !== 401) return response;

  const refreshed = await refreshAccessToken();
  if (!refreshed) {
    notifySessionEnded("expired");
    return response;
  }

  response = await fetch(input, requestInit);
  if (response.status === 401) notifySessionEnded("expired");
  return response;
}

export async function requireOk(
  response: Response,
  fallbackMessage: string
): Promise<Response> {
  if (response.ok) return response;

  const payload = await response.clone().json().catch(() => null);
  const message =
    typeof payload?.message === "string" ? payload.message : fallbackMessage;
  throw new Error(message);
}

export async function logoutSession(reason = "manual") {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } finally {
    notifySessionEnded(reason);
  }
}
