// src/types/next-auth.d.ts
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string; // "ADMIN" | "STAFF" | "CUSTOMER"
      customerId?: string; // presente cuando role === "CUSTOMER" (= id del Customer)
    } & DefaultSession["user"];
  }
}
