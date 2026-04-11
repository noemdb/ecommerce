import { SidebarWrapper } from "@/components/admin/SidebarWrapper";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex">
      <SidebarWrapper />
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
