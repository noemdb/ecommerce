"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export function SidebarWrapper() {
  const pathname = usePathname();
  if (pathname && pathname.endsWith("/login")) return null;
  return <AdminSidebar />;
}
