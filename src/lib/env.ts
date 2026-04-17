// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  RESEND_API_KEY: z.string().startsWith("re_"),
  EMAIL_FROM: z.string().min(5),
  EMAIL_ADMIN: z.string().email(),
  // UploadThing
  UPLOADTHING_TOKEN: z.string().min(1),
  UPLOADTHING_SECRET: z.string().startsWith("sk_").optional(),
  UPLOADTHING_APP_ID: z.string().min(1).optional(),
  // Public — default to localhost so SSR doesn't crash in dev
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).optional().default("Tienda"),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().min(10).optional().default("0000000000"),
  // WhatsApp (all optional)
  WHATSAPP_VERIFY_TOKEN: z.string().optional(),
  WHATSAPP_API_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
});

export const env = envSchema.parse(process.env);
