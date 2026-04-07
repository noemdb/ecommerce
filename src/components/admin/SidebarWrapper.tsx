"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export function SidebarWrapper() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;
  return <AdminSidebar />;
}
