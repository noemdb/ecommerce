import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { BookOpen, Users, GraduationCap, TrendingUp, Plus, BarChart2 } from "lucide-react";

export const metadata = { title: "LMS | Admin" };

export default async function LmsAdminDashboard() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin");

  const [totalCourses, totalEnrollments, completedEnrollments, recentEnrollments] = await Promise.all([
    prisma.course.count(),
    prisma.courseEnrollment.count(),
    prisma.courseEnrollment.count({ where: { progress: 100 } }),
    prisma.courseEnrollment.count({
      where: { enrolledAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
    }),
  ]);

  const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

  const stats = [
    { label: "Total Cursos", value: totalCourses, icon: BookOpen, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
    { label: "Alumnos Matriculados", value: totalEnrollments, icon: Users, sub: `+${recentEnrollments} en los últimos 30 días`, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Tasa de Finalización", value: `${completionRate}%`, icon: TrendingUp, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" },
    { label: "Completados", value: completedEnrollments, icon: GraduationCap, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Dashboard LMS</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Gestiona cursos, alumnos y analíticas de aprendizaje.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/lms/analytics"
            className="inline-flex items-center justify-center h-11 px-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold rounded-md hover:opacity-90 transition-opacity gap-2"
          >
            <BarChart2 className="w-4 h-4" />
            <span className="hidden sm:inline">Analíticas</span>
          </Link>
          <Link
            href="/admin/lms/courses/new"
            className="inline-flex items-center justify-center h-11 px-6 rounded-md bg-blue-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-blue-700 transition-colors gap-2 shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Curso</span>
          </Link>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Link href="/admin/lms/courses" className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md p-6 shadow-sm hover:border-blue-500/50 transition-colors flex items-center gap-4">
          <div className="bg-blue-500/10 p-4 rounded-md">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Gestionar Cursos</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Crear, editar y publicar cursos y módulos.</p>
          </div>
        </Link>
        <Link href="/admin/lms/analytics" className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md p-6 shadow-sm hover:border-blue-500/50 transition-colors flex items-center gap-4">
          <div className="bg-purple-500/10 p-4 rounded-md">
            <BarChart2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="font-bold text-neutral-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Ver Analíticas</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Métricas de progreso, finalización y abandono.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
