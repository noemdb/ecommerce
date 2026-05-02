import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getLmsAnalytics } from "@/lib/lms/analytics";
import { ProgressAnalytics } from "@/components/lms/admin/ProgressAnalytics";
import { prisma } from "@/lib/prisma";
import { TrendingUp, Activity, Users, BookOpen } from "lucide-react";

export const metadata = { title: "Analíticas LMS | Admin" };

export default async function AnalyticsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin");

  const analytics = await getLmsAnalytics();

  const rawProgress = await prisma.courseEnrollment.groupBy({
    by: ['progress'],
    _count: { id: true },
  });

  const ranges = {
    "0%": 0,
    "1-25%": 0,
    "26-50%": 0,
    "51-75%": 0,
    "76-99%": 0,
    "100%": 0,
  };

  rawProgress.forEach((item) => {
    const p = item.progress;
    if (p === 0) ranges["0%"] += item._count.id;
    else if (p <= 25) ranges["1-25%"] += item._count.id;
    else if (p <= 50) ranges["26-50%"] += item._count.id;
    else if (p <= 75) ranges["51-75%"] += item._count.id;
    else if (p < 100) ranges["76-99%"] += item._count.id;
    else ranges["100%"] += item._count.id;
  });

  const chartData = Object.entries(ranges).map(([range, count]) => ({ range, count }));

  const stats = [
    { label: "Tasa de Finalización", value: `${analytics.completionRate}%`, icon: TrendingUp, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" },
    { label: "Progreso Promedio", value: `${analytics.avgProgress}%`, icon: Activity, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
    { label: "Estudiantes Activos", value: analytics.activeStudents, sub: "En los últimos 30 días", icon: Users, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Total Matrículas", value: analytics.totalEnrollments, icon: BookOpen, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Analíticas LMS</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Métricas de rendimiento de tus cursos y estudiantes.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md p-6 shadow-sm flex items-start gap-4">
            <div className={`${stat.bg} p-3 rounded-md shrink-0`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs uppercase font-black tracking-widest text-neutral-400">{stat.label}</p>
              <p className="text-3xl font-black tracking-tighter text-neutral-900 dark:text-white mt-1">{stat.value}</p>
              {stat.sub && <p className="text-xs text-neutral-400 mt-1">{stat.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Distribución de Progreso</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Cantidad de alumnos por rango de avance general.</p>
        </div>
        <ProgressAnalytics data={chartData} />
      </div>
    </div>
  );
}
