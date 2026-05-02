"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { recalculateCourseProgress } from "@/lib/lms/enrollment";
import { requireCourseEnrollment } from "@/lib/lms/access-guard";
import { MarkLessonCompleteSchema } from "@/lib/lms/schemas/lms.schemas";
import { issueCertificateIfComplete } from "@/lib/lms/certificate";
import type { LmsActionResult } from "@/types/actions";

export async function markLessonComplete(
  input: unknown,
): Promise<LmsActionResult<{ progress: number }>> {
  const session = await auth();
  if (!session?.user?.customerId) return { ok: false, error: "No autenticado" };

  const parsed = MarkLessonCompleteSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.errors[0].message };

  const { lessonId, watchedSec } = parsed.data;
  const customerId = session.user.customerId;

  try {
    const lesson = await prisma.courseLesson.findUnique({
      where: { id: lessonId },
      select: { module: { select: { courseId: true } } },
    });
    if (!lesson) return { ok: false, error: "Lección no encontrada" };

    const courseId = lesson.module.courseId;
    await requireCourseEnrollment(customerId, courseId);

    await prisma.lessonProgress.upsert({
      where: { customerId_lessonId: { customerId, lessonId } },
      create: {
        customerId,
        lessonId,
        completed: true,
        completedAt: new Date(),
        watchedSec: watchedSec ?? 0,
      },
      update: {
        completed: true,
        completedAt: new Date(),
        ...(watchedSec !== undefined && { watchedSec }),
      },
    });

    const progress = await recalculateCourseProgress(customerId, courseId);

    if (progress === 100) {
      await issueCertificateIfComplete(customerId, courseId);
    }

    revalidatePath(`/cuenta/cursos`);
    return { ok: true, data: { progress } };
  } catch (err) {
    console.error("[markLessonComplete]", err);
    return { ok: false, error: "Error al guardar progreso" };
  }
}
