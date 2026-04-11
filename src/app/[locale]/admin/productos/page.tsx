import { requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { Plus, Package, Search, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductActions } from "@/components/admin/ProductActions";
import { ProductImageCell } from "@/components/admin/ProductImageCell";
import { ProductFilterBar } from "@/components/admin/ProductFilterBar";
import { ProductSearchBar } from "@/components/admin/ProductSearchBar";
import { TableSortHeader } from "@/components/admin/TableSortHeader";
import { TablePagination } from "@/components/admin/TablePagination";

export const metadata = {
  title: "Productos | Admin",
  description: "Catálogo de productos",
};

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    q?: string; 
    sort?: string; 
    page?: string; 
    category?: string; 
    status?: string 
  }>;
}) {
  await requirePermission("products:read");
  const params = await searchParams;
  
  const q = params.q ?? "";
  const sort = params.sort ?? "createdAt_desc";
  const page = Number(params.page ?? "1");
  const category = params.category ?? "";
  const status = params.status ?? "";
  const pageSize = 10;

  const where: any = {
    AND: [
      q ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { sku: { contains: q, mode: "insensitive" as const } },
        ],
      } : {},
      category ? { categoryId: category } : {},
      status ? { isActive: status === "active" } : {},
    ]
  };

  const [sortField, sortOrder] = sort.split("_");
  const orderBy: any = {};
  
  if (sortField === "category") {
    orderBy.category = { name: sortOrder as "asc" | "desc" };
  } else if (["name", "price", "stock", "sku", "createdAt"].includes(sortField)) {
    orderBy[sortField] = sortOrder as "asc" | "desc";
  } else {
    orderBy.createdAt = "desc";
  }

  const [products, totalCount, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: { select: { id: true, name: true } },
        images: { select: { url: true, isPrimary: true } },
        _count: { select: { variants: true } },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      select: { id: true, name: true },
      where: { isActive: true },
      orderBy: { name: "asc" }
    })
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Productos</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            {products.length} producto{products.length !== 1 ? "s" : ""} en el catálogo
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a 
            href="/api/admin/export/products" 
            target="_blank"
            className="inline-flex items-center justify-center h-11 px-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold rounded-md hover:opacity-90 transition-opacity gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </a>
          <Link
            href="/admin/productos/nuevo"
            className="inline-flex items-center justify-center h-11 px-6 rounded-md bg-blue-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-blue-700 transition-colors gap-2 shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Producto</span>
          </Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
        <ProductSearchBar />
        <ProductFilterBar categories={categories} />
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden shadow-sm">
        {products.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4 text-neutral-400">
            <Package className="w-12 h-12" />
            <p className="font-medium">No hay productos con estos filtros.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-white/5 uppercase tracking-[0.2em] font-black text-[9px] text-neutral-400">
                  <th className="px-5 py-4 text-left">Imagen</th>
                  <th className="px-5 py-4 text-left"><TableSortHeader label="Producto" sortKey="name" /></th>
                  <th className="px-5 py-4 text-left"><TableSortHeader label="SKU" sortKey="sku" /></th>
                  <th className="px-5 py-4 text-left"><TableSortHeader label="Categoría" sortKey="category" /></th>
                  <th className="px-5 py-4 text-left"><TableSortHeader label="Precio" sortKey="price" /></th>
                  <th className="px-5 py-4 text-left"><TableSortHeader label="Stock" sortKey="stock" /></th>
                  <th className="px-5 py-4 text-left">Estado</th>
                  <th className="px-5 py-4 text-right pr-8 whitespace-nowrap">Acciones</th>
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
                    <td className="px-5 py-4">
                      <ProductImageCell 
                        url={p.images.find(img => img.isPrimary)?.url || p.images[0]?.url || null} 
                        name={p.name} 
                      />
                    </td>
                    <td className="px-5 py-4 font-semibold text-neutral-900 dark:text-neutral-100">{p.name}</td>
                    <td className="px-5 py-4">
                      <code className="text-[10px] uppercase font-bold bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-neutral-500">
                        {p.sku}
                      </code>
                    </td>
                    <td className="px-5 py-4 text-neutral-500 text-xs font-medium">{p.category.name}</td>
                    <td className="px-5 py-4 font-black tracking-tighter text-blue-600 dark:text-blue-400 text-base">
                      ${p.price.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 tabular-nums">
                      <span className={cn("inline-flex items-center gap-1.5 font-bold", p.stock <= p.lowStockThreshold ? "text-red-500" : "text-neutral-600 dark:text-neutral-400")}>
                        <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", p.stock <= p.lowStockThreshold ? "bg-red-500 animate-pulse" : "bg-neutral-300 dark:bg-neutral-700")} />
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-lg ${
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
                        product={p}
                        categories={categories}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <TablePagination 
          currentPage={page} 
          totalPages={totalPages} 
          totalItems={totalCount} 
          pageSize={pageSize} 
        />
      </div>
    </div>
  );
}
