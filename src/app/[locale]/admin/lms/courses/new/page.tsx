import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CourseWizard } from "@/components/lms/admin/CourseWizard";

export default async function NewCoursePage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin");

  return (
    <div className="flex flex-col gap-8 p-8 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Nuevo Curso</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Crea un nuevo curso para tus alumnos.</p>
        </div>
      </div>
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md p-6 shadow-sm">
        <CourseWizard />
      </div>
    </div>
  );
}
