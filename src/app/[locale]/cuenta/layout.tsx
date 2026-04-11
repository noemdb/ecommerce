import { CustomerSidebar } from "@/components/cuenta/CustomerSidebar";
import { requireCustomerSession } from "@/lib/rbac";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireCustomerSession();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex">
      <CustomerSidebar />
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
