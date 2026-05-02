import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Plus, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DeleteCourseButton } from "@/components/lms/admin/DeleteCourseButton";

export const metadata = { title: "Cursos LMS | Admin" };

export default async function AdminCoursesPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin");

  const courses = await prisma.course.findMany({
    include: {
      _count: {
        select: { enrollments: true, modules: true }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Cursos LMS</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            {courses.length} curso{courses.length !== 1 ? "s" : ""} en la plataforma
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/lms/courses/new"
            className="inline-flex items-center justify-center h-11 px-6 rounded-md bg-blue-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-blue-700 transition-colors gap-2 shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Curso</span>
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden shadow-sm">
        {courses.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4 text-neutral-400">
            <BookOpen className="w-12 h-12" />
            <p className="font-medium">No hay cursos creados. Crea uno para empezar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-white/5 uppercase tracking-[0.2em] font-black text-[9px] text-neutral-400">
                  <th className="px-5 py-4 text-left">Curso</th>
                  <th className="px-5 py-4 text-left">Estado</th>
                  <th className="px-5 py-4 text-left">Módulos</th>
                  <th className="px-5 py-4 text-left">Alumnos</th>
                  <th className="px-5 py-4 text-left">Creación</th>
                  <th className="px-5 py-4 text-right pr-8 whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {courses.map((course) => (
                  <tr
                    key={course.id}
                    className="group hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">{course.title}</span>
                        <code className="text-[10px] uppercase font-bold bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-neutral-500 w-fit">
                          {course.slug}
                        </code>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "text-[10px] uppercase font-black px-2.5 py-1 rounded-lg",
                          course.isPublished
                            ? "text-emerald-600 bg-emerald-500/10"
                            : "text-neutral-400 bg-neutral-100 dark:bg-neutral-800"
                        )}
                      >
                        {course.isPublished ? "Publicado" : "Borrador"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-neutral-500 font-medium">
                      {course._count.modules}
                    </td>
                    <td className="px-5 py-4 text-neutral-500 font-medium">
                      {course._count.enrollments}
                    </td>
                    <td className="px-5 py-4 text-neutral-500 font-medium">
                      {format(new Date(course.createdAt), "dd MMM yyyy", { locale: es })}
                    </td>
                    <td className="px-5 py-4 text-right pr-8">
                      <div className="flex justify-end gap-2">
                        <Link 
                          href={`/admin/lms/courses/${course.id}`}
                          className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-md transition-colors"
                        >
                          Editar
                        </Link>
                        <Link 
                          href={`/admin/lms/courses/${course.id}/enrollments`}
                          className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-md transition-colors"
                        >
                          Alumnos
                        </Link>
                        <DeleteCourseButton courseId={course.id} courseTitle={course.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
