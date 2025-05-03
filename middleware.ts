import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Protected routes that require authentication
const protectedRoutes = ["/dashboard", "/audit"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is protected
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    // Get the token from the cookie
    const token = request.cookies.get("token")?.value

    // If there's no token, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/audit/:path*"],
}
