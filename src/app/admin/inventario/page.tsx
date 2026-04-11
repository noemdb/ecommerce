import { requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { InventoryManager } from "@/components/admin/InventoryManager";
import { getInventoryMovements } from "@/actions/inventory";

export const metadata = {
  title: "Inventario | Admin",
  description: "Control de stock y movimientos de inventario",
};

export default async function InventarioPage() {
  await requirePermission("inventory:write");

  // Get all active products with stock info
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { stock: "asc" },
    include: {
      category: { select: { name: true } },
    },
  });

  // Get recent movements
  const recentMovements = await getInventoryMovements();

  // Pre-calculate stats for the dashboard
  const outOfStock = products.filter((p) => p.stock <= 0).length;
  const lowStock = products.filter(
    (p) => p.stock > 0 && p.stock <= p.lowStockThreshold
  ).length;
  const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1 font-black uppercase text-neutral-800 dark:text-neutral-100">
          Control de Inventario
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">
          Gestión de existencias y trazabilidad de movimientos.
        </p>
      </div>

      <InventoryManager 
        products={products}
        recentMovements={recentMovements as any}
        outOfStock={outOfStock}
        lowStock={lowStock}
        totalUnits={totalUnits}
      />
    </div>
  );
}
