"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  CreateCourseSchema,
  UpdateCourseSchema,
  CreateModuleSchema,
  UpdateModuleSchema,
  ReorderModulesSchema,
  CreateLessonSchema,
  UpdateLessonSchema,
} from "@/lib/lms/schemas/lms.schemas";
import type { LmsActionResult } from "@/types/actions";

function requireAdmin(role?: string): LmsActionResult<never> | null {
  if (role !== "ADMIN")
    return { ok: false, error: "Sin permisos de administrador" };
  return null;
}

// ── Course ────────────────────────────────────────────────────────────────────

export async function createCourse(
  input: unknown,
): Promise<LmsActionResult<{ id: string }>> {
  const session = await auth();
  const guard = requireAdmin(session?.user?.role);
  if (guard) return guard;

  const parsed = CreateCourseSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.errors[0].message };

  try {
    const course = await prisma.course.create({ data: parsed.data });
    revalidatePath("/admin/lms/courses");
    return { ok: true, data: { id: course.id } };
  } catch (err: any) {
    if (err.code === "P2002") return { ok: false, error: "El slug ya existe" };
    console.error("[createCourse]", err);
    return { ok: false, error: "Error al crear curso" };
  }
}

export async function updateCourse(
  input: unknown,
): Promise<LmsActionResult<void>> {
  const session = await auth();
  const guard = requireAdmin(session?.user?.role);
  if (guard) return guard;

  const parsed = UpdateCourseSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.errors[0].message };

  const { id, ...data } = parsed.data;
  try {
    await prisma.course.update({ where: { id }, data });
    revalidatePath("/admin/lms/courses");
    revalidatePath(`/admin/lms/courses/${id}`);
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("[updateCourse]", err);
    return { ok: false, error: "Error al actualizar curso" };
  }
}

export async function publishCourse(
  courseId: string,
): Promise<LmsActionResult<void>> {
  const session = await auth();
  const guard = requireAdmin(session?.user?.role);
  if (guard) return guard;

  try {
    await prisma.course.update({
      where: { id: courseId },
      data: { isPublished: true },
    });
    revalidatePath("/admin/lms/courses");
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("[publishCourse]", err);
    return { ok: false, error: "Error al publicar curso" };
  }
}

// ── Module ────────────────────────────────────────────────────────────────────

export async function createModule(
  input: unknown,
): Promise<LmsActionResult<{ id: string }>> {
  const session = await auth();
  const guard = requireAdmin(session?.user?.role);
  if (guard) return guard;

  const parsed = CreateModuleSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.errors[0].message };

  try {
    const module = await prisma.courseModule.create({ data: parsed.data });
    revalidatePath(`/admin/lms/courses/${parsed.data.courseId}`);
    return { ok: true, data: { id: module.id } };
  } catch (err) {
    console.error("[createModule]", err);
    return { ok: false, error: "Error al crear módulo" };
  }
}

export async function updateModule(
  input: unknown,
): Promise<LmsActionResult<void>> {
  const session = await auth();
  const guard = requireAdmin(session?.user?.role);
  if (guard) return guard;

  const parsed = UpdateModuleSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.errors[0].message };

  const { id, ...data } = parsed.data;
  try {
    const updated = await prisma.courseModule.update({ where: { id }, data });
    revalidatePath(`/admin/lms/courses/${updated.courseId}`);
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("[updateModule]", err);
    return { ok: false, error: "Error al actualizar módulo" };
  }
}

export async function reorderModules(
  input: unknown,
): Promise<LmsActionResult<void>> {
  const session = await auth();
  const guard = requireAdmin(session?.user?.role);
  if (guard) return guard;

  const parsed = ReorderModulesSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: "Datos de reordenamiento inválidos" };

  const { courseId, order } = parsed.data;

  try {
    await prisma.$transaction(
      order.map(({ id, position }) =>
        prisma.courseModule.update({ where: { id }, data: { position } }),
      ),
    );
    revalidatePath(`/admin/lms/courses/${courseId}`);
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("[reorderModules]", err);
    return { ok: false, error: "Error al reordenar módulos" };
  }
}

// ── Lesson ────────────────────────────────────────────────────────────────────

export async function createLesson(
  input: unknown,
): Promise<LmsActionResult<{ id: string }>> {
  const session = await auth();
  const guard = requireAdmin(session?.user?.role);
  if (guard) return guard;

  const parsed = CreateLessonSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.errors[0].message };

  try {
    const lesson = await prisma.courseLesson.create({ data: parsed.data });
    return { ok: true, data: { id: lesson.id } };
  } catch (err: any) {
    if (err.code === "P2002")
      return { ok: false, error: "El slug ya existe en este módulo" };
    return { ok: false, error: "Error al crear lección" };
  }
}

export async function updateLesson(
  input: unknown,
): Promise<LmsActionResult<void>> {
  const session = await auth();
  const guard = requireAdmin(session?.user?.role);
  if (guard) return guard;

  const parsed = UpdateLessonSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.errors[0].message };

  const { id, ...data } = parsed.data;
  try {
    await prisma.courseLesson.update({ where: { id }, data });
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("[updateLesson]", err);
    return { ok: false, error: "Error al actualizar lección" };
  }
}

export async function importCoursesFromJson(
  jsonData: string,
): Promise<LmsActionResult<{ count: number }>> {
  const session = await auth();
  const guard = requireAdmin(session?.user?.role);
  if (guard) return guard;

  try {
    const data = JSON.parse(jsonData);
    if (!data.courses || !Array.isArray(data.courses)) {
      return { ok: false, error: "Formato JSON inválido" };
    }

    let importedCount = 0;

    for (const courseData of data.courses) {
      await prisma.$transaction(async (tx) => {
        const { modules, ...courseFields } = courseData;

        await tx.course.create({
          data: {
            ...courseFields,
            modules: {
              create:
                modules?.map((moduleData: any) => {
                  const { lessons, ...moduleFields } = moduleData;
                  return {
                    ...moduleFields,
                    lessons: {
                      create:
                        lessons?.map((lessonData: any) => {
                          const { resources, ...lessonFields } = lessonData;
                          return {
                            ...lessonFields,
                            resources: {
                              create:
                                resources?.map((resourceData: any) => ({
                                  title: resourceData.title,
                                  fileType: resourceData.fileType,
                                  fileKey:
                                    resourceData.fileKey ||
                                    `seed-${Math.random().toString(36).substring(7)}`,
                                  mimeType:
                                    resourceData.mimeType ||
                                    "application/octet-stream",
                                  fileSize: resourceData.fileSize || 0,
                                  durationSec: resourceData.durationSec,
                                  sortOrder: resourceData.sortOrder || 0,
                                })) || [],
                            },
                          };
                        }) || [],
                    },
                  };
                }) || [],
            },
          },
        });
      });
      importedCount++;
    }

    revalidatePath("/admin/lms/courses");
    return { ok: true, data: { count: importedCount } };
  } catch (err: any) {
    console.error("[importCoursesFromJson]", err);
    if (err.code === "P2002")
      return { ok: false, error: "Error: Un slug ya existe en la base de datos" };
    return { ok: false, error: "Error durante la importación" };
  }
}

export async function deleteCourse(
  courseId: string,
): Promise<LmsActionResult<void>> {
  const session = await auth();
  const guard = requireAdmin(session?.user?.role);
  if (guard) return guard;

  try {
    await prisma.course.delete({ where: { id: courseId } });
    revalidatePath("/admin/lms/courses");
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("[deleteCourse]", err);
    return { ok: false, error: "Error al eliminar el curso" };
  }
}
