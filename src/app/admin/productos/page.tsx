import { requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Package, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductActions } from "@/components/admin/ProductActions";

export const metadata = {
  title: "Productos | Admin",
  description: "Catálogo de productos",
};

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requirePermission("products:read");
  const params = await searchParams;
  const q = params.q ?? "";

  const products = await prisma.product.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { sku: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {},
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      _count: { select: { variants: true } },
    },
  });

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Productos</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            {products.length} producto{products.length !== 1 ? "s" : ""} en el catálogo
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-blue-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-blue-700 transition-colors gap-2 shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </Link>
      </div>

      <form method="GET" className="relative max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        <input
          name="q"
          type="search"
          placeholder="Buscar producto o SKU..."
          defaultValue={q}
          className="h-11 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
        />
      </form>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        {products.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4 text-neutral-400">
            <Package className="w-12 h-12" />
            <p className="font-medium">No hay productos con estos filtros.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-white/5">
                  {["Producto", "SKU", "Categoría", "Precio", "Stock", "Estado", "Acciones"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-4 text-left text-xs font-black uppercase tracking-widest text-neutral-400"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className={cn(
                      "group hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors",
                      !p.isActive && "opacity-60 grayscale-[0.5]"
                    )}
                  >
                    <td className="px-5 py-4 font-semibold">{p.name}</td>
                    <td className="px-5 py-4">
                      <code className="text-[10px] uppercase font-bold bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-neutral-500">
                        {p.sku}
                      </code>
                    </td>
                    <td className="px-5 py-4 text-neutral-500 text-xs">{p.category.name}</td>
                    <td className="px-5 py-4 font-bold tabular-nums">
                      ${p.price.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 tabular-nums">
                      <span className={cn(p.stock <= p.lowStockThreshold && "text-red-500 font-bold")}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full ${
                          p.isActive
                            ? "text-emerald-600 bg-emerald-500/10"
                            : "text-neutral-400 bg-neutral-100 dark:bg-neutral-800"
                        }`}
                      >
                        {p.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <ProductActions 
                        productId={p.id} 
                        isActive={p.isActive} 
                        productName={p.name} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
