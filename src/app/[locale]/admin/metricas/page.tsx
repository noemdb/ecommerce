import { requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import MetricsCharts from "../../../components/admin/MetricsChartsWrapper";

export default async function MetricasPage() {
  await requirePermission("metrics:view");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [orders, statusCounts] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, total: true, status: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  // Procesa datos para el gráfico de ventas diarias
  const dailyDataMap: Record<string, { date: string; sales: number; count: number }> = {};
  
  orders.forEach((o) => {
    const date = o.createdAt.toLocaleDateString("es-VE", { day: "2-digit", month: "short" });
    if (!dailyDataMap[date]) {
      dailyDataMap[date] = { date, sales: 0, count: 0 };
    }
    dailyDataMap[date].sales += o.total;
    dailyDataMap[date].count += 1;
  });

  const dailyData = Object.values(dailyDataMap);

  // Procesa datos para el gráfico de torta (estados)
  const pieData = statusCounts.map((s) => ({
    name: s.status,
    value: s._count,
  }));

  return (
    <div className="p-8 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Análisis de Datos</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          Rendimiento de los últimos 30 días
        </p>
      </div>

      <MetricsCharts dailyData={dailyData} pieData={pieData} />
    </div>
  );
}
