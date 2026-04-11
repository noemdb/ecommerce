// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  RESEND_API_KEY: z.string().startsWith("re_"),
  EMAIL_FROM: z.string().min(5),
  EMAIL_ADMIN: z.string().email(),
  UPLOADTHING_SECRET: z.string().startsWith("sk_"),
  UPLOADTHING_APP_ID: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().min(10),
  WHATSAPP_VERIFY_TOKEN: z.string().optional(),
  WHATSAPP_API_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
});

export const env = envSchema.parse(process.env);
