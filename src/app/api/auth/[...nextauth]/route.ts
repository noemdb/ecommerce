import { handlers } from "@/auth";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { GET, POST: AuthPOST } = handlers;

// Inicializamos el rate limiter solo si las variables de entorno están presentes
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const rateLimit =
  redisUrl && redisToken
    ? new Ratelimit({
        redis: new Redis({ url: redisUrl, token: redisToken }),
        limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 intentos por minuto
        analytics: true,
      })
    : null;

export { GET };

export async function POST(req: NextRequest) {
  if (rateLimit) {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    // Aplicamos rate limit primariamente a los endpoints de callback de credentials
    const url = new URL(req.url);
    if (
      url.pathname.includes("/callback/staff-credentials") ||
      url.pathname.includes("/callback/customer-credentials")
    ) {
      const { success, limit, reset, remaining } = await rateLimit.limit(`ratelimit_auth_${ip}`);
      
      if (!success) {
        return new NextResponse(
          JSON.stringify({ error: "Demasiados intentos. Intenta de nuevo más tarde." }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
              "Retry-After": Math.round((reset - Date.now()) / 1000).toString(),
            },
          }
        );
      }
    }
  }

  // Pasamos la solicitud a Auth.js
  return AuthPOST(req);
}
