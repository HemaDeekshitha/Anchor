import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password"];
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // Has valid access token
  if (accessToken) {
    if (isPublic) return NextResponse.redirect(new URL("/dashboard", req.url));
    return NextResponse.next();
  }

  // No access token but has refresh token — attempt silent refresh
  if (!accessToken && refreshToken && !isPublic) {
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { Cookie: `refresh_token=${refreshToken}` },
      });

      if (refreshRes.ok) {
        const setCookieHeader = refreshRes.headers.get("set-cookie");
        const response = NextResponse.next();
        if (setCookieHeader) {
          // Extract new access_token value from Set-Cookie header
          const match = setCookieHeader.match(/access_token=([^;]+)/);
          if (match) {
            response.cookies.set("access_token", match[1], {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 15 * 60,
            });
          }
        }
        return response;
      }
    } catch {
      // refresh failed, fall through to redirect
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Not logged in → block protected pages
  if (!accessToken && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/profile/:path*",
    "/rewards/:path*",
    "/application-tracker/:path*",
    "/onboarding/:path*",
    "/steps/:path*",
  ],
};
