import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    if (pathname.startsWith("/teacher") && role !== "TEACHER") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (pathname.startsWith("/student") && role !== "STUDENT") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/lessons/:path*",
    "/classes/:path*",
    "/announcements/:path*",
    "/analytics/:path*",
    "/calendar/:path*",
    "/notifications/:path*",
    "/audit-log/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
};
