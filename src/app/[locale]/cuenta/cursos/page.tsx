import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CourseCard } from "@/components/lms/customer/CourseCard";
import type { CustomerDashboardCourse } from "@/types/lms";

export default async function CursosPage() {
  const session = await auth();
  if (!session?.user?.customerId) redirect("/login");

  const enrollments = await prisma.courseEnrollment.findMany({
    where: { customerId: session.user.customerId },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: true,
            },
          },
          certificates: {
            where: { customerId: session.user.customerId },
          },
        },
      },
      customer: {
        include: {
          lessonProgress: {
            orderBy: { updatedAt: "desc" },
            take: 1,
            include: { lesson: true },
          },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  const dashboardData: CustomerDashboardCourse[] = enrollments.map((e) => {
    const totalLessons = e.course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    const lastLesson = e.customer.lessonProgress[0]?.lesson || null;
    const certificate = e.course.certificates[0] || null;

    return {
      enrollment: e,
      course: e.course,
      lastLesson,
      totalLessons,
      certificate,
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis Cursos</h1>
        <p className="text-muted-foreground mt-2">
          Continúa donde lo dejaste y revisa tu progreso.
        </p>
      </div>

      {dashboardData.length === 0 ? (
        <div className="text-center py-12 rounded-lg border bg-muted/20">
          <h2 className="text-xl font-semibold">Aún no tienes cursos</h2>
          <p className="text-muted-foreground mt-2">
            Explora nuestro catálogo para matricularte en cursos increíbles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dashboardData.map((data) => (
            <CourseCard key={data.course.id} dashboardData={data} />
          ))}
        </div>
      )}
    </div>
  );
}
