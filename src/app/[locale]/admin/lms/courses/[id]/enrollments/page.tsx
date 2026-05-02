import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { EnrollmentTable } from "@/components/lms/admin/EnrollmentTable";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function CourseEnrollmentsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin");

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    select: { title: true, id: true }
  });

  if (!course) notFound();

  const enrollments = await prisma.courseEnrollment.findMany({
    where: { courseId: course.id },
    include: {
      customer: { select: { name: true, email: true } }
    },
    orderBy: { enrolledAt: "desc" }
  });

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/lms/courses"
            className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-neutral-500" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Alumnos Matriculados</h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">Curso: {course.title}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md p-6 shadow-sm overflow-hidden">
        <EnrollmentTable enrollments={enrollments} />
      </div>
    </div>
  );
}
