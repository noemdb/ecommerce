"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  getProtectedResourceUrl,
  deleteResourceWithFile,
  replaceResourceFile,
} from "@/lib/lms/resource-access";
import {
  CuidSchema,
  FileKeySchema,
  type ProtectedResourceResponse,
} from "@/lib/lms/schemas/lms.schemas";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import type { LmsActionResult } from "@/types/actions";

// ── Acceso a recurso (CUSTOMER) ──────────────────────────────────────────────

export async function requestProtectedLessonResource(
  resourceId: string,
): Promise<LmsActionResult<ProtectedResourceResponse>> {
  const session = await auth();
  if (!session?.user?.customerId) return { ok: false, error: "No autenticado" };

  const parsed = CuidSchema.safeParse(resourceId);
  if (!parsed.success) return { ok: false, error: "resourceId inválido" };

  try {
    const data = await getProtectedResourceUrl(
      parsed.data,
      session.user.customerId,
    );
    return { ok: true, data };
  } catch (err) {
    if (err instanceof UnauthorizedError)
      return { ok: false, error: "Acceso denegado" };
    console.error("[requestProtectedLessonResource]", err);
    return { ok: false, error: "Error interno" };
  }
}

// ── Eliminación de recurso (ADMIN) ───────────────────────────────────────────

export async function deleteLessonResource(
  resourceId: string,
): Promise<LmsActionResult<void>> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN")
    return { ok: false, error: "Sin permisos" };

  const parsed = CuidSchema.safeParse(resourceId);
  if (!parsed.success) return { ok: false, error: "resourceId inválido" };

  try {
    const resource = await prisma.lessonResource.findUnique({
      where: { id: parsed.data },
      include: {
        lesson: { select: { module: { select: { courseId: true } } } },
      },
    });
    if (!resource) return { ok: false, error: "Recurso no encontrado" };

    await deleteResourceWithFile(parsed.data);
    revalidatePath(`/admin/lms/courses/${resource.lesson.module.courseId}`);
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("[deleteLessonResource]", err);
    return { ok: false, error: "Error al eliminar recurso" };
  }
}

// ── Reemplazo de recurso (ADMIN) ─────────────────────────────────────────────

export async function replaceLessonResource(
  resourceId: string,
  newFileKey: string,
): Promise<LmsActionResult<void>> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN")
    return { ok: false, error: "Sin permisos" };

  const parsedId = CuidSchema.safeParse(resourceId);
  const parsedKey = FileKeySchema.safeParse(newFileKey);
  if (!parsedId.success || !parsedKey.success)
    return { ok: false, error: "Parámetros inválidos" };

  try {
    await replaceResourceFile(parsedId.data, parsedKey.data);
    revalidatePath("/admin/lms/courses");
    return { ok: true, data: undefined };
  } catch (err) {
    console.error("[replaceLessonResource]", err);
    return { ok: false, error: "Error al reemplazar recurso" };
  }
}
