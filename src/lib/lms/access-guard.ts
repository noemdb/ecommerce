import { prisma } from "@/lib/prisma";
import { UnauthorizedError } from "@/lib/errors";

/**
 * Valida que customerId tenga matrícula activa en courseId.
 * Lanza UnauthorizedError si no — nunca retorna false.
 */
export async function requireCourseEnrollment(
  customerId: string,
  courseId: string,
): Promise<void> {
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { customerId_courseId: { customerId, courseId } },
    select: { id: true },
  });
  if (!enrollment)
    throw new UnauthorizedError("Sin matrícula activa para este curso");
}

/**
 * Valida que el courseId exista y esté publicado.
 */
export async function requirePublishedCourse(courseId: string): Promise<void> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { isPublished: true, isActive: true },
  });
  if (!course || !course.isPublished || !course.isActive) {
    throw new UnauthorizedError("Curso no disponible");
  }
}
