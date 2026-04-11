import { requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import {
  Users,
  Search,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Download,
} from "lucide-react";
import { PurgeCustomerButton } from "@/components/admin/PurgeCustomerButton";

export const metadata = {
  title: "Clientes | Admin",
  description: "Gestión de clientes registrados",
};

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; blocked?: string }>;
}) {
  await requirePermission("customers:write");

  const params = await searchParams;
  const q = params.q ?? "";
  const page = parseInt(params.page ?? "1") || 1;
  const blocked = params.blocked === "true" ? true : params.blocked === "false" ? false : undefined;
  const pageSize = 25;

  const where = {
    ...(blocked !== undefined ? { isBlocked: blocked } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
            { phone: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: { select: { orders: true } },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Clientes</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            {total} cliente{total !== 1 ? "s" : ""} registrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <a 
          href="/api/admin/export/customers" 
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold rounded-md hover:opacity-90 transition-opacity"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </a>
      </div>

      {/* Search form */}
      <form method="GET" className="relative max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        <input
          name="q"
          type="search"
          placeholder="Buscar por nombre, email o teléfono..."
          defaultValue={q}
          className="h-11 w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
        />
      </form>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden">
        {customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-neutral-400">
            <Users className="w-12 h-12" />
            <p className="font-medium">No hay clientes con estos filtros.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800">
                  {["Cliente", "Email", "Teléfono", "Órdenes", "Verificado", "Estado", "Registro", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-4 text-left text-xs font-black uppercase tracking-widest text-neutral-400 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    className="group hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="px-5 py-4 font-semibold">{c.name}</td>
                    <td className="px-5 py-4 text-neutral-500 text-xs">{c.email}</td>
                    <td className="px-5 py-4 text-neutral-500 text-xs">{c.phone ?? "—"}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg px-2.5 py-1">
                        <ShoppingBag className="w-3 h-3" />
                        {c._count.orders}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {c.isEmailVerified ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-neutral-300 dark:text-neutral-600" />
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {c.isBlocked ? (
                        <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-500/10 px-2.5 py-1 rounded-lg">
                          Bloqueado
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                          Activo
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-neutral-400 whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString("es-VE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/clientes/${c.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Ver
                        </Link>
                        {c.isBlocked && <PurgeCustomerButton customerId={c.id} />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-neutral-500">
            Página {page} de {totalPages} · {total} clientes
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`?q=${q}&page=${page - 1}`}
                className="px-4 h-9 rounded-md border border-neutral-200 dark:border-neutral-800 flex items-center text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                ← Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`?q=${q}&page=${page + 1}`}
                className="px-4 h-9 rounded-md border border-neutral-200 dark:border-neutral-800 flex items-center text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Siguiente →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
