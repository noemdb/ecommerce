// src/proxy.ts — Next.js 16
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // 1. Handle i18n first (redirection, cookies)
  const response = intlMiddleware(request);

  // If i18n middleware wants to redirect, return it immediately
  if (response.status >= 300 && response.status < 400) {
    return response;
  }

  // 2. Handle Auth/Protection
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

  return response; // Return the i18n response (with locale headers/cookies)
}

export const config = {
  // Match both localized paths and i18n patterns
  matcher: [
    "/admin/:path*", 
    "/cuenta/:path*",
    "/", 
    "/(en|es)/:path*", 
    "/((?!api|_next|_vercel|.*\\..*).*)"
  ],
};
