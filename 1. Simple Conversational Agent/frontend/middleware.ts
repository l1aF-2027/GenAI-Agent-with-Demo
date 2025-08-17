import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  // If no token and trying to access protected routes, redirect to signin
  if (
    !token &&
    (request.nextUrl.pathname.startsWith("/chat") ||
      request.nextUrl.pathname.startsWith("/api/chat"))
  ) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/api/chat/:path*"],
};
