"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useCallback } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  TruckIcon,
  Eye,
  RefreshCw,
  BadgeCheck,
  Hourglass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@prisma/client";

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
  status: OrderStatus;
  bankName: string;
  referenceNumber: string;
  createdAt: Date;
  _count: { items: number };
};

interface OrdersTableProps {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
  statusCounts: Record<string, number>;
  currentStatus: OrderStatus | undefined;
  query: string;
}

const STATUS_META: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  PENDIENTE: { label: "Pendiente", color: "text-amber-600 bg-amber-500/10", icon: Clock },
  VERIFICANDO: { label: "Verificando", color: "text-blue-600 bg-blue-500/10", icon: Hourglass },
  CONFIRMADA: { label: "Confirmada", color: "text-emerald-600 bg-emerald-500/10", icon: BadgeCheck },
  EN_PROCESO: { label: "En proceso", color: "text-purple-600 bg-purple-500/10", icon: RefreshCw },
  COMPLETADA: { label: "Completada", color: "text-green-600 bg-green-500/10", icon: CheckCircle2 },
  CANCELADA: { label: "Cancelada", color: "text-red-600 bg-red-500/10", icon: XCircle },
  RECHAZADA: { label: "Rechazada", color: "text-red-600 bg-red-500/10", icon: XCircle },
};

const STATUS_TABS: Array<{ status: OrderStatus | undefined; label: string }> = [
  { status: undefined, label: "Todas" },
  { status: "PENDIENTE", label: "Pendientes" },
  { status: "VERIFICANDO", label: "Verificando" },
  { status: "CONFIRMADA", label: "Confirmadas" },
  { status: "EN_PROCESO", label: "En proceso" },
  { status: "COMPLETADA", label: "Completadas" },
  { status: "CANCELADA", label: "Canceladas" },
  { status: "RECHAZADA", label: "Rechazadas" },
];

export function OrdersTable({
  orders,
  total,
  page,
  pageSize,
  statusCounts,
  currentStatus,
  query,
}: OrdersTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const setParam = useCallback(
    (key: string, value: string | undefined) => {
      const sp = new URLSearchParams(searchParams.toString());
      if (value) {
        sp.set(key, value);
      } else {
        sp.delete(key);
      }
      if (key !== "page") sp.delete("page");
      startTransition(() => router.push(`${pathname}?${sp.toString()}`));
    },
    [pathname, router, searchParams]
  );

  const totalPages = Math.ceil(total / pageSize);
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Órdenes</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            {total} pedido{total !== 1 ? "s" : ""} en total
          </p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const count = tab.status ? (statusCounts[tab.status] ?? 0) : total;
          const isActive = currentStatus === tab.status;
          return (
            <button
              key={tab.label}
              onClick={() => setParam("status", tab.status)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all shrink-0",
                isActive
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "text-xs rounded-lg px-1.5 py-0.5 min-w-[20px] text-center",
                  isActive
                    ? "bg-white/20 dark:bg-black/20"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        <input
          type="search"
          placeholder="Buscar por Nº orden, cliente..."
          defaultValue={query}
          className="h-11 w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
          onKeyDown={(e) => {
            if (e.key === "Enter")
              setParam("q", (e.target as HTMLInputElement).value || undefined);
          }}
        />
      </div>

      {/* Table */}
      <div
        className={cn(
          "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden transition-opacity",
          isPending && "opacity-60"
        )}
      >
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-neutral-400">
            <ShoppingBag className="w-12 h-12" />
            <p className="font-medium">No hay órdenes con estos filtros.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800">
                  {["Nº Orden", "Cliente", "Banco / Ref.", "Artículos", "Total", "Estado", "Fecha", ""].map(
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
                {orders.map((order) => {
                  const s = STATUS_META[order.status];
                  const Icon = s.icon;
                  return (
                    <tr
                      key={order.id}
                      className="group hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <code className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                          {order.orderNumber}
                        </code>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold truncate max-w-[160px]">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-neutral-400 truncate max-w-[160px]">
                          {order.customerEmail}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs font-medium">{order.bankName}</p>
                        <code className="text-xs text-neutral-400">
                          {order.referenceNumber}
                        </code>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-bold">
                          {order._count.items}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold tabular-nums">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold",
                            s.color
                          )}
                        >
                          <Icon className="w-3 h-3" />
                          {s.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-neutral-400 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("es-VE", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/ordenes/${order.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-neutral-500">
            {from}–{to} de {total}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1 || isPending}
              onClick={() => setParam("page", String(page - 1))}
              className="w-9 h-9 rounded-md border border-neutral-200 dark:border-neutral-800 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages || isPending}
              onClick={() => setParam("page", String(page + 1))}
              className="w-9 h-9 rounded-md border border-neutral-200 dark:border-neutral-800 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
