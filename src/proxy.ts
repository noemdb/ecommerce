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
    const isAdminRoute = pathname.includes("/admin");
    const isCuentaRoute = pathname.includes("/cuenta");
    const isLoginRoute = pathname.includes("/login");

    // Redirigir a /admin si ya está logueado como Staff e intenta entrar a /login
    if (isLoginRoute && session && (role === "ADMIN" || role === "STAFF")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Protección para /admin/* — Solo ADMIN o STAFF
    if (isAdminRoute && !isLoginRoute && (!session || (role !== "ADMIN" && role !== "STAFF"))) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Protección para /cuenta/* — Solo CUSTOMER
    if (isCuentaRoute && (!session || role !== "CUSTOMER")) {
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
