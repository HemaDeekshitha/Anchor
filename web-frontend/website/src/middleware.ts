import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("access_token")?.value;

  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // 🚫 Not logged in → block protected pages
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 🔁 Logged in → block auth pages
  if (token && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
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
