import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function CursosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.customerId) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-theme(spacing.16))]">
      {children}
    </div>
  );
}
