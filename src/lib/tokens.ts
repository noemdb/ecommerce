import { nanoid } from "nanoid";

export function generateVerifyToken() {
  return nanoid(32);
}

export function generateResetToken() {
  return nanoid(32);
}
