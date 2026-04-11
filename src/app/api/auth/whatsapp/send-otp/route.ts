import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const rateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const { success } = await rateLimit.limit(`whatsapp-otp_${ip}`);

    if (!success) {
      return new NextResponse(JSON.stringify({ error: "Demasiados intentos. Intenta más tarde." }), { status: 429 });
    }
    const { phone } = await req.json();

    if (!phone) {
      return new NextResponse(JSON.stringify({ error: "Teléfono requerido" }), { status: 400 });
    }

    // Normalizar teléfono
    const cleanPhone = phone.replace(/\\D/g, "");

    const customer = await prisma.customer.findFirst({
      where: { phone: { endsWith: cleanPhone } },
    });

    if (!customer) {
      return new NextResponse(JSON.stringify({ error: "Cliente no encontrado" }), { status: 404 });
    }
    
    // Generar PIN de 6 dígitos
    const pin = crypto.randomInt(100000, 999999).toString();
    const pinHash = await bcrypt.hash(pin, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    // Limpiar tokens anteriores
    await prisma.oTPToken.deleteMany({
      where: { customerId: customer.id }
    });

    // Guardar nuevo Token
    await prisma.oTPToken.create({
      data: {
        customerId: customer.id,
        phone: cleanPhone,
        pinHash,
        expiresAt
      }
    });

    // Despachar a Meta Graph API
    const WHATSAPP_TOKEN = process.env.WHATSAPP_API_TOKEN;
    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
      // Estamos en Dev, simular envío
      console.log(`[DEV MODE] WhatsApp OTP for ${cleanPhone} is: ${pin}`);
      return new NextResponse(JSON.stringify({ success: true, devMode: true }), { status: 200 });
    }

    const payload = {
      messaging_product: "whatsapp",
      to: cleanPhone,
      type: "template",
      template: {
        name: "auth_otp", // Nombre de la plantilla aprobada en Meta
        language: { code: "es" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: pin }
            ]
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [
              { type: "text", text: pin }
            ]
          }
        ]
      }
    };

    const response = await fetch(`https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[WHATSAPP_API_ERROR]", errorData);
      return new NextResponse(JSON.stringify({ error: "Error enviando WhatsApp" }), { status: 500 });
    }

    return new NextResponse(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("[SEND_OTP_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
