import { requireCustomerSession } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ShoppingBag, DollarSign, Activity, CalendarDays } from "lucide-react";

export default async function CustomerDashboardPage() {
  const session = await requireCustomerSession();
  const customerId = session.user.id;

  const [
    totalPedidos,
    gastoTotalRes,
    pedidosActivos,
    ultimaCompra,
    comprasRecientes
  ] = await Promise.all([
    prisma.order.count({ where: { customerId } }),
    prisma.order.aggregate({
      where: { customerId, status: "COMPLETADA" },
      _sum: { total: true }
    }),
    prisma.order.count({
      where: {
        customerId,
        status: { in: ["PENDIENTE", "VERIFICANDO", "CONFIRMADA", "EN_PROCESO"] }
      }
    }),
    prisma.order.findFirst({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true, total: true }
    }),
    prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        total: true,
        status: true,
        items: { select: { quantity: true } }
      }
    })
  ]);

  const gastoTotal = gastoTotalRes._sum.total || 0;

  const KPIs = [
    {
      label: "Total de pedidos",
      value: totalPedidos,
      icon: ShoppingBag,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      label: "Gasto total",
      value: `$${gastoTotal.toFixed(2)}`,
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/20"
    },
    {
      label: "Pedidos activos",
      value: pedidosActivos,
      icon: Activity,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-100 dark:bg-orange-900/20"
    },
    {
      label: "Última compra",
      value: ultimaCompra ? new Date(ultimaCompra.createdAt).toLocaleDateString() : "Ninguna",
      icon: CalendarDays,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/20"
    }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Hola, {session.user.name?.split(" ")[0]}
        </h1>
        <p className="text-neutral-500 mt-2">
          Bienvenido a tu panel de cliente. Aquí puedes gestionar tus pedidos y perfil.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {KPIs.map((kpi, index) => (
          <div key={index} className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center gap-4">
            <div className={`p-4 rounded-xl ${kpi.bg}`}>
              <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-sm text-neutral-500 font-medium">{kpi.label}</p>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Compras Recientes</h2>
          <Link href="/cuenta/pedidos" className="text-sm font-semibold text-blue-600 dark:text-blue-500 hover:underline">
            Ver todas
          </Link>
        </div>
        
        {comprasRecientes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Pedido ID</th>
                  <th className="px-6 py-4 font-semibold">Fecha</th>
                  <th className="px-6 py-4 font-semibold">Total</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {comprasRecientes.map((order) => {
                  return (
                    <tr key={order.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">
                        <Link href={`/cuenta/pedidos/${order.id}`} className="hover:underline hover:text-blue-600">
                          #{order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-medium text-neutral-600 dark:text-neutral-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-neutral-900 dark:text-white">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
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
          <div className="p-12 text-center text-neutral-500">
            <ShoppingBag className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
            <p className="text-lg font-medium text-neutral-900 dark:text-white">Aún no tienes compras</p>
            <p>Tus compras recientes aparecerán aquí.</p>
          </div>
        )}
      </div>
    </div>
  );
}
