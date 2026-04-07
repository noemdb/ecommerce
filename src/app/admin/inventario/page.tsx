import { requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Package,
  AlertTriangle,
  TrendingDown,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Inventario | Admin",
  description: "Control de stock y movimientos de inventario",
};

export default async function InventarioPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  await requirePermission("inventory:write");

  const params = await searchParams;
  const filter = params.filter ?? "all"; // all | low | out
  const q = params.q ?? "";

  const where = {
    isActive: true,
    ...(filter === "low"
      ? { stock: { lte: prisma.product.fields.lowStockThreshold, gt: 0 } }
      : filter === "out"
      ? { stock: { lte: 0 } }
      : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { sku: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  // Get all products with stock info
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { sku: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { stock: "asc" },
    select: {
      id: true,
      name: true,
      sku: true,
      stock: true,
      lowStockThreshold: true,
      category: { select: { name: true } },
      images: {
        where: { isPrimary: true },
        select: { url: true, alt: true },
        take: 1,
      },
    },
  });

  // Apply filter manually (Prisma field reference not directly comparable in where)
  const filtered =
    filter === "low"
      ? products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold)
      : filter === "out"
      ? products.filter((p) => p.stock <= 0)
      : products;

  const outOfStock = products.filter((p) => p.stock <= 0).length;
  const lowStock = products.filter(
    (p) => p.stock > 0 && p.stock <= p.lowStockThreshold
  ).length;
  const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Inventario</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          {products.length} SKUs · {totalUnits} unidades totales
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Sin stock",
            value: outOfStock,
            icon: TrendingDown,
            color: "text-red-500",
            bg: "bg-red-500/10",
          },
          {
            label: "Stock bajo",
            value: lowStock,
            icon: AlertTriangle,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
          {
            label: "Unidades totales",
            value: totalUnits,
            icon: BarChart3,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md p-5 flex items-center gap-4"
          >
            <div
              className={cn(
                "w-10 h-10 rounded-md flex items-center justify-center shrink-0",
                stat.bg
              )}
            >
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-neutral-500 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-1">
          {[
            { key: "all", label: "Todos" },
            { key: "low", label: `Stock bajo (${lowStock})` },
            { key: "out", label: `Sin stock (${outOfStock})` },
          ].map((tab) => (
            <Link
              key={tab.key}
              href={`?filter=${tab.key}${q ? `&q=${q}` : ""}`}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap",
                filter === tab.key
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <form method="GET" className="relative max-w-xs flex-1">
          <input type="hidden" name="filter" value={filter} />
          <input
            name="q"
            type="search"
            placeholder="Buscar producto o SKU..."
            defaultValue={q}
            className="h-10 w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
          />
        </form>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-800">
                {["Producto", "SKU", "Categoría", "Stock", "Umbral", "Estado"].map(
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
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-16 text-neutral-400"
                  >
                    <Package className="w-10 h-10 mx-auto mb-3" />
                    No hay productos con estos filtros.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isOut = p.stock <= 0;
                  const isLow = !isOut && p.stock <= p.lowStockThreshold;
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="px-5 py-4 font-semibold max-w-[250px] truncate">
                        <Link
                          href={`/admin/productos/${p.id}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {p.name}
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-lg text-neutral-600 dark:text-neutral-400">
                          {p.sku}
                        </code>
                      </td>
                      <td className="px-5 py-4 text-neutral-500 text-xs">
                        {p.category.name}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "text-lg font-black tabular-nums",
                            isOut
                              ? "text-red-500"
                              : isLow
                              ? "text-amber-500"
                              : "text-neutral-900 dark:text-white"
                          )}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-neutral-400 tabular-nums">
                        {p.lowStockThreshold}
                      </td>
                      <td className="px-5 py-4">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-500/10 px-2.5 py-1 rounded-lg">
                            <TrendingDown className="w-3 h-3" />
                            Sin stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg">
                            <AlertTriangle className="w-3 h-3" />
                            Stock bajo
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                            OK
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
