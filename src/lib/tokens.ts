import { nanoid } from "nanoid";

export function generateVerifyToken(): { token: string; expires: Date } {
  const token = nanoid(32); // token URL-safe de 32 chars
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
  return { token, expires };
}

export function generateResetToken(): { token: string; expires: Date } {
  const token = nanoid(32);
  const expires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hora
  return { token, expires };
}
