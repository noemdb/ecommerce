import { requireCustomerSession } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { ShoppingBag } from "lucide-react";
import type { OrderStatus } from "@prisma/client";

const ORDER_STATUSES: { label: string; value: OrderStatus | "ALL" }[] = [
  { label: "Todos", value: "ALL" },
  { label: "Pendientes", value: "PENDIENTE" },
  { label: "Verificando", value: "VERIFICANDO" },
  { label: "En Proceso", value: "EN_PROCESO" },
  { label: "Completados", value: "COMPLETADA" },
  { label: "Cancelados", value: "CANCELADA" }
];

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await requireCustomerSession();
  const customerId = session.user.id;
  const params = await searchParams;
  const statusFilterParam = params.status;
  const isValidStatus = statusFilterParam && ORDER_STATUSES.some(s => s.value === statusFilterParam && statusFilterParam !== "ALL");
  const statusFilter = isValidStatus ? (statusFilterParam as OrderStatus) : undefined;

  const whereClause = {
    customerId,
    ...(statusFilter ? { status: statusFilter } : {})
  };

  const pedidos = await prisma.order.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      createdAt: true,
      total: true,
      status: true,
      items: {
        select: {
          product: { select: { name: true } },
          quantity: true
        }
      }
    }
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Mis Pedidos
          </h1>
          <p className="text-neutral-500 mt-2">
            Revisa el historial y estado de todas tus compras.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-2">
        {ORDER_STATUSES.map((status) => {
          const isActive = statusFilter === status.value || (!statusFilter && status.value === "ALL");
          return (
            <Link
              key={status.value}
              href={status.value === "ALL" ? "/cuenta/pedidos" : `/cuenta/pedidos?status=${status.value}`}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
              }`}
            >
              {status.label}
            </Link>
          );
        })}
      </div>

      {/* Lista de Pedidos */}
      <div className="bg-white dark:bg-neutral-900 rounded-md border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        {pedidos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Pedido ID</th>
                  <th className="px-6 py-4 font-semibold">Fecha</th>
                  <th className="px-6 py-4 font-semibold">Resumen</th>
                  <th className="px-6 py-4 font-semibold">Total</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {pedidos.map((order) => {
                  const itemCount = order.items.reduce((acc, item) => acc + item.quantity, 0);
                  const itemsPreview = order.items.map(i => i.product.name).join(", ");
                  return (
                    <tr key={order.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">
                        <Link href={`/cuenta/pedidos/${order.id}`} className="hover:underline hover:text-blue-600">
                          #{order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-neutral-900 dark:text-white font-medium">
                          {itemCount} {itemCount === 1 ? "artículo" : "artículos"}
                        </div>
                        <div className="text-xs text-neutral-500 truncate max-w-[200px]" title={itemsPreview}>
                          {itemsPreview}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-neutral-900 dark:text-white">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center focus:outline-none flex flex-col items-center">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">No se encontraron pedidos</h3>
            <p className="text-neutral-500 max-w-sm mb-6">
              {statusFilterParam && statusFilterParam !== "ALL"
                ? `No tienes pedidos con el estado ${statusFilterParam}.`
                : "Aún no has realizado ninguna compra en nuestra tienda."}
            </p>
            {(!statusFilterParam || statusFilterParam === "ALL") && (
              <Link href="/catalogo" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors">
                Explorar productos
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
