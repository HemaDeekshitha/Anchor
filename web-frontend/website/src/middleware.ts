import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password"];
const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";
const SESSION_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

function copyAuthCookies(response: NextResponse, refreshRes: Response) {
  const headers = refreshRes.headers as Headers & {
    getSetCookie?: () => string[];
  };
  const setCookies =
    typeof headers.getSetCookie === "function"
      ? headers.getSetCookie()
      : [headers.get("set-cookie")].filter((value): value is string =>
          Boolean(value)
        );

  for (const header of setCookies) {
    const access = header.match(/access_token=([^;]+)/);
    if (access) {
      response.cookies.set(
        "access_token",
        access[1],
        cookieOptions(SESSION_COOKIE_MAX_AGE)
      );
    }
    const refresh = header.match(/refresh_token=([^;]+)/);
    if (refresh) {
      response.cookies.set(
        "refresh_token",
        refresh[1],
        cookieOptions(SESSION_COOKIE_MAX_AGE)
      );
    }
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const hasSession = Boolean(accessToken || refreshToken);

  if (hasSession && isPublic) {
    if (accessToken) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { Cookie: `refresh_token=${refreshToken}` },
      });

      if (refreshRes.ok) {
        const response = NextResponse.redirect(new URL("/dashboard", req.url));
        copyAuthCookies(response, refreshRes);
        return response;
      }
    } catch {
      // Invalid session — show login instead of looping.
    }
    return NextResponse.next();
  }

  if (accessToken) {
    return NextResponse.next();
  }

  // No access token but still has a session — try silent refresh, then stay
  // logged in so the browser can refresh even if this server-side call fails.
  if (refreshToken && !isPublic) {
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { Cookie: `refresh_token=${refreshToken}` },
      });

      if (refreshRes.ok) {
        const response = NextResponse.next();
        copyAuthCookies(response, refreshRes);
        return response;
      }
    } catch {
      // Keep the refresh cookie; do not bounce to login.
    }
    return NextResponse.next();
  }

  // Not logged in → block protected pages
  if (!hasSession && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/dashboard/:path*",
    "/profile/:path*",
    "/rewards/:path*",
    "/application-tracker/:path*",
    "/onboarding/:path*",
    "/steps/:path*",
    "/community/:path*",
  ],
};
