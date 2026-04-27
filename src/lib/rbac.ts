// src/lib/rbac.ts
import { auth } from "@/auth";
import { redirect } from "next/navigation";

type Permission =
  | "orders:read"
  | "orders:write"
  | "products:read"
  | "products:write"
  | "categories:write"
  | "suppliers:write"
  | "inventory:write"
  | "reviews:moderate"
  | "customers:write"
  | "users:manage"
  | "settings:write"
  | "account:read"
  | "metrics:view";

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: [
    "orders:read",
    "orders:write",
    "products:read",
    "products:write",
    "categories:write",
    "suppliers:write",
    "inventory:write",
    "reviews:moderate",
    "customers:write",
    "users:manage",
    "settings:write",
    "metrics:view",
  ],
  STAFF: [
    "orders:read",
    "orders:write",
    "products:read",
    "inventory:write",
    "reviews:moderate",
  ],
  CUSTOMER: ["account:read"],
};

export async function requirePermission(permission: Permission): Promise<void> {
  const session = await auth();
  if (!session?.user) {
    if (permission === "account:read") redirect("/login");
    redirect("/login");
  }
  const role = session.user.role as string;
  const perms = ROLE_PERMISSIONS[role] ?? [];
  if (!perms.includes(permission)) {
    if (role === "CUSTOMER") redirect("/cuenta");
    redirect("/admin");
  }
}

export async function requireCustomerSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CUSTOMER") {
    redirect("/login");
  }
  return session;
}

export async function requireStaffSession() {
  const session = await auth();
  if (!session?.user || session.user.role === "CUSTOMER") {
    redirect("/login");
  }
  return session;
}
