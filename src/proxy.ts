// src/proxy.ts — Next.js 16
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const isAdminRoute =
    pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isCuentaRoute = pathname.startsWith("/cuenta");
  const isAdminLogin = pathname === "/admin/login";

  const role = session?.user?.role;

  // Protection for /admin/* — only ADMIN
  if (isAdminLogin && session && role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  
  if (isAdminRoute && (!session || role !== "ADMIN")) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Protection for /cuenta/* — only CUSTOMER
  if (isCuentaRoute && role !== "CUSTOMER") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/cuenta/:path*"],
};
