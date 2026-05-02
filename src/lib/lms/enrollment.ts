import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";

/**
 * Crea matrículas para todos los items SERVICE de una orden.
 * Idempotente — usa upsert. Ver ADR-003.
 */
export async function autoEnrollCustomerToCourses(
  orderId: string,
): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: { select: { type: true, courseId: true } },
        },
      },
    },
  });

  if (!order) throw new NotFoundError("Orden no encontrada");

  for (const item of order.items) {
    if (item.product.type !== "SERVICE") continue;
    if (!item.product.courseId) continue;

    await prisma.courseEnrollment.upsert({
      where: {
        customerId_courseId: {
          customerId: order.customerId as string,
          courseId: item.product.courseId,
        },
      },
      create: {
        customerId: order.customerId as string,
        courseId: item.product.courseId,
        orderId: order.id,
      },
      update: {}, // No sobreescribir — ver ADR-003
    });
  }
}

/**
 * Recalcula CourseEnrollment.progress desde LessonProgress.
 * Invocar tras add/remove lecciones y tras markLessonComplete.
 */
export async function recalculateCourseProgress(
  customerId: string,
  courseId: string,
): Promise<number> {
  const [totalLessons, completedLessons] = await Promise.all([
    prisma.courseLesson.count({
      where: {
        isPublished: true,
        module: { courseId, isPublished: true },
      },
    }),
    prisma.lessonProgress.count({
      where: {
        customerId,
        completed: true,
        lesson: {
          isPublished: true,
          module: { courseId, isPublished: true },
        },
      },
    }),
  ]);

  const progress =
    totalLessons === 0
      ? 0
      : Math.round((completedLessons / totalLessons) * 100);

  await prisma.courseEnrollment.update({
    where: { customerId_courseId: { customerId, courseId } },
    data: { progress, completedAt: progress === 100 ? new Date() : null },
  });

  return progress;
}
