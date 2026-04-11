import { requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { SuppliersManager } from "@/components/admin/SuppliersManager";

export const metadata = {
  title: "Proveedores | Admin",
  description: "Gestión de proveedores de productos",
};

export default async function ProveedoresPage() {
  await requirePermission("suppliers:write");

  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="p-8">
      <SuppliersManager suppliers={suppliers as any} />
    </div>
  );
}
