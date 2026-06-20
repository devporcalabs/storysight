import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Exclude static assets, icons, public files, and main landing page
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/uploads") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("session")?.value;
  const user = token ? await verifyToken(token) : null;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!user || (user.role !== "SUPERADMIN" && user.role !== "TEACHER")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Protect student dashboard and single story details/activities
  // Note: We'll allow browsing the general catalog (/stories) as Guest (preview),
  // but viewing detail or reading/watching/quiz requires registration.
  const isDashboard = pathname.startsWith("/dashboard");
  const isStoryDetailOrActivity = pathname.match(/^\/stories\/[^\/]+/); // matches /stories/[slug], /stories/[slug]/read, etc.
  const isProtectedRoute = isDashboard || isStoryDetailOrActivity;

  if (isProtectedRoute) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // If user is already logged in, redirect away from login/register pages
  if (pathname === "/login" || pathname === "/register") {
    if (user) {
      if (user.role === "SUPERADMIN" || user.role === "TEACHER") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/stories/:path*",
    "/login",
    "/register",
  ],
};
