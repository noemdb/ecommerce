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
  let session = null;
  try {
    session = await auth();
  } catch (authError: any) {
    console.error("[PROXY_AUTH_ERROR] Error fetching session:", authError?.message || authError);
    // Continue even if auth fails, to avoid fatal TypeError during serialization
  }

  const { pathname } = request.nextUrl;
  const role = session?.user?.role;

  try {
    const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
    const isCuentaRoute = pathname.startsWith("/cuenta");
    const isAdminLogin = pathname === "/admin/login";

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
  } catch (flowError) {
    console.error("[PROXY_FLOW_ERROR] Error in route protection logic:", flowError);
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
