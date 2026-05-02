import { prisma } from "@/lib/prisma";

export async function getLmsAnalytics() {
  const [totalEnrollments, completedEnrollments, activeStudents] = await Promise.all([
    prisma.courseEnrollment.count(),
    prisma.courseEnrollment.count({ where: { progress: 100 } }),
    // Estudiantes activos (han visto lecciones) en los últimos 30 días
    prisma.customer.count({
      where: {
        lessonProgress: {
          some: {
            updatedAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }
      }
    }),
  ]);

  const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

  // Average progress
  const agg = await prisma.courseEnrollment.aggregate({
    _avg: {
      progress: true,
    }
  });

  const avgProgress = agg._avg.progress ? Math.round(agg._avg.progress) : 0;

  return {
    totalEnrollments,
    completedEnrollments,
    completionRate,
    avgProgress,
    activeStudents,
  };
}
