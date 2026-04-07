import { requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Métricas | Admin",
  description: "Análisis y estadísticas de la tienda",
};

export default async function MetricasPage() {
  await requirePermission("orders:read");

  const [
    totalOrders,
    completedOrders,
    canceledOrders,
    pendingOrders,
    totalRevenue,
    totalCustomers,
    totalProducts,
    totalReviews,
    avgRating,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "COMPLETADA" } }),
    prisma.order.count({ where: { status: "CANCELADA" } }),
    prisma.order.count({ where: { status: "PENDIENTE" } }),
    prisma.order.aggregate({
      where: { status: "COMPLETADA" },
      _sum: { total: true },
    }),
    prisma.customer.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.review.count({ where: { status: "APPROVED" } }),
    prisma.review.aggregate({
      where: { status: "APPROVED" },
      _avg: { rating: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        total: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }).then(async (items) => {
      const productIds = items.map((i) => i.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, sku: true },
      });
      return items.map((item) => ({
        ...item,
        product: products.find((p) => p.id === item.productId),
      }));
    }),
  ]);

  const revenue = totalRevenue._sum.total ?? 0;
  const conversionRate =
    totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : "0";

  const STATUS_COLORS: Record<string, string> = {
    PENDIENTE: "text-amber-600 bg-amber-500/10",
    VERIFICANDO: "text-blue-600 bg-blue-500/10",
    CONFIRMADA: "text-emerald-600 bg-emerald-500/10",
    EN_PROCESO: "text-purple-600 bg-purple-500/10",
    COMPLETADA: "text-green-600 bg-green-500/10",
    CANCELADA: "text-red-600 bg-red-500/10",
  };
  const STATUS_LABELS: Record<string, string> = {
    PENDIENTE: "Pendiente",
    VERIFICANDO: "Verificando",
    CONFIRMADA: "Confirmada",
    EN_PROCESO: "En proceso",
    COMPLETADA: "Completada",
    CANCELADA: "Cancelada",
  };

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Métricas</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          Resumen global del rendimiento de tu tienda
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Ingresos (Completadas)",
            value: `$${revenue.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`,
            icon: TrendingUp,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Total Órdenes",
            value: totalOrders,
            icon: ShoppingBag,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            label: "Clientes",
            value: totalCustomers,
            icon: Users,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
          },
          {
            label: "Conversión",
            value: `${conversionRate}%`,
            icon: CheckCircle2,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-md flex flex-col gap-4"
          >
            <div
              className={cn(
                "w-12 h-12 rounded-md flex items-center justify-center",
                kpi.bg
              )}
            >
              <kpi.icon className={cn("w-6 h-6", kpi.color)} />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {kpi.label}
              </p>
              <p className="text-2xl font-bold">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Completadas", value: completedOrders, icon: CheckCircle2, color: "text-green-500" },
          { label: "Canceladas", value: canceledOrders, icon: XCircle, color: "text-red-500" },
          { label: "Pendientes", value: pendingOrders, icon: Clock, color: "text-amber-500" },
          { label: "Reseñas aprobadas", value: `${totalReviews} (⭐ ${(avgRating._avg.rating ?? 0).toFixed(1)})`, icon: Star, color: "text-yellow-500" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-md flex items-center gap-4"
          >
            <s.icon className={cn("w-5 h-5 shrink-0", s.color)} />
            <div>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-neutral-500 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="font-bold">Órdenes recientes</h3>
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {recentOrders.map((o) => (
              <div key={o.id} className="px-6 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{o.customerName}</p>
                  <p className="text-xs text-neutral-400">{o.orderNumber}</p>
                </div>
                <span
                  className={cn(
                    "text-xs font-bold px-2.5 py-1 rounded-lg shrink-0",
                    STATUS_COLORS[o.status]
                  )}
                >
                  {STATUS_LABELS[o.status]}
                </span>
                <span className="text-sm font-bold shrink-0">
                  ${o.total.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="font-bold">Productos más vendidos</h3>
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {topProducts.map((tp, i) => (
              <div key={tp.productId} className="px-6 py-3 flex items-center gap-4">
                <span className="text-2xl font-black text-neutral-200 dark:text-neutral-700 w-8 shrink-0 tabular-nums">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {tp.product?.name ?? "Desconocido"}
                  </p>
                  <code className="text-xs text-neutral-400">{tp.product?.sku}</code>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold">{tp._sum.quantity}</p>
                  <p className="text-xs text-neutral-400">unidades</p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <div className="px-6 py-12 text-center text-neutral-400 text-sm">
                No hay datos de ventas aún.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
