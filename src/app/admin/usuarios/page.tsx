import { requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { UsersManager } from "@/components/admin/UsersManager";
import { auth } from "@/auth";

export const metadata = {
  title: "Usuarios | Admin",
  description: "Gestión de usuarios y staff administrativo",
};

export default async function UsuariosPage() {
  await requirePermission("users:manage");
  const session = await auth();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { ordersConfirmed: true } } },
  });

  return (
    <div className="p-8">
      <UsersManager 
        users={users as any} 
        currentUserId={session?.user?.id || ""} 
      />
    </div>
  );
}
