"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/rbac";
import sanitizeHtml from "sanitize-html";
import type { ProfileFieldType } from "@prisma/client";

// ─── Helpers ───────────────────────────────────────────────────────────────

function sanitizeIfHtml(type: ProfileFieldType, value: string): string {
  if (type !== "HTML") return value;
  return sanitizeHtml(value, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height"],
    },
  });
}

function revalidateNosotros() {
  revalidatePath("/nosotros");
  revalidatePath("/admin/nosotros");
}

// ─── BusinessProfile ──────────────────────────────────────────────────────

export async function updateBusinessProfileAction(data: {
  fullName: string;
  tagline?: string;
  bio?: string;
  avatarUrl?: string;
  resumeUrl?: string;
}) {
  try {
    await requirePermission("products:write");
    await prisma.businessProfile.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });
    revalidateNosotros();
    return { success: true, message: "Perfil actualizado correctamente" };
  } catch (error) {
    console.error("[updateBusinessProfileAction]", error);
    return { success: false, error: "Error al actualizar el perfil" };
  }
}

// ─── ProfileSection ───────────────────────────────────────────────────────

export async function createSectionAction(data: {
  title: string;
  subtitle?: string;
  slug: string;
  icon?: string;
}) {
  try {
    await requirePermission("products:write");
    // Calcular el siguiente orden
    const maxOrder = await prisma.profileSection.aggregate({ _max: { order: true } });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    await prisma.profileSection.create({
      data: { ...data, order: nextOrder, isVisible: true, isPublished: false },
    });
    revalidateNosotros();
    return { success: true, message: "Sección creada correctamente" };
  } catch (error) {
    console.error("[createSectionAction]", error);
    return { success: false, error: "Error al crear la sección" };
  }
}

export async function updateSectionAction(
  id: string,
  data: { title: string; subtitle?: string; icon?: string }
) {
  try {
    await requirePermission("products:write");
    await prisma.profileSection.update({ where: { id }, data });
    revalidateNosotros();
    return { success: true, message: "Sección actualizada" };
  } catch (error) {
    console.error("[updateSectionAction]", error);
    return { success: false, error: "Error al actualizar la sección" };
  }
}

export async function toggleSectionPublishedAction(id: string, isPublished: boolean) {
  try {
    await requirePermission("products:write");
    await prisma.profileSection.update({ where: { id }, data: { isPublished } });
    revalidateNosotros();
    return { success: true };
  } catch (error) {
    console.error("[toggleSectionPublishedAction]", error);
    return { success: false, error: "Error al cambiar el estado" };
  }
}

export async function toggleSectionVisibleAction(id: string, isVisible: boolean) {
  try {
    await requirePermission("products:write");
    await prisma.profileSection.update({ where: { id }, data: { isVisible } });
    revalidateNosotros();
    return { success: true };
  } catch (error) {
    console.error("[toggleSectionVisibleAction]", error);
    return { success: false, error: "Error al cambiar la visibilidad" };
  }
}

/**
 * Actualiza el orden de múltiples secciones en batch.
 * Recibe un array de { id, order } y actualiza cada una.
 */
export async function updateSectionOrderAction(
  sections: { id: string; order: number }[]
) {
  try {
    await requirePermission("products:write");
    await prisma.$transaction(
      sections.map(({ id, order }) =>
        prisma.profileSection.update({ where: { id }, data: { order } })
      )
    );
    revalidateNosotros();
    return { success: true };
  } catch (error) {
    console.error("[updateSectionOrderAction]", error);
    return { success: false, error: "Error al reordenar las secciones" };
  }
}

export async function deleteSectionAction(id: string) {
  try {
    await requirePermission("products:write");
    await prisma.profileSection.delete({ where: { id } });
    revalidateNosotros();
    return { success: true, message: "Sección eliminada" };
  } catch (error) {
    console.error("[deleteSectionAction]", error);
    return { success: false, error: "Error al eliminar la sección" };
  }
}

// ─── ProfileField ─────────────────────────────────────────────────────────

export async function createFieldAction(data: {
  sectionId: string;
  fieldKey: string;
  label: string;
  fieldType: ProfileFieldType;
  value: string;
}) {
  try {
    await requirePermission("products:write");
    const maxOrder = await prisma.profileField.aggregate({
      where: { sectionId: data.sectionId },
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;
    const safeValue = sanitizeIfHtml(data.fieldType, data.value);

    await prisma.profileField.create({
      data: { ...data, value: safeValue, order: nextOrder, isVisible: true },
    });
    revalidateNosotros();
    return { success: true, message: "Campo creado" };
  } catch (error) {
    console.error("[createFieldAction]", error);
    return { success: false, error: "Error al crear el campo" };
  }
}

export async function updateFieldAction(
  id: string,
  data: {
    label: string;
    fieldType: ProfileFieldType;
    value: string;
    fieldKey: string;
  }
) {
  try {
    await requirePermission("products:write");
    const safeValue = sanitizeIfHtml(data.fieldType, data.value);
    await prisma.profileField.update({ where: { id }, data: { ...data, value: safeValue } });
    revalidateNosotros();
    return { success: true, message: "Campo actualizado" };
  } catch (error) {
    console.error("[updateFieldAction]", error);
    return { success: false, error: "Error al actualizar el campo" };
  }
}

export async function toggleFieldVisibleAction(id: string, isVisible: boolean) {
  try {
    await requirePermission("products:write");
    await prisma.profileField.update({ where: { id }, data: { isVisible } });
    revalidateNosotros();
    return { success: true };
  } catch (error) {
    console.error("[toggleFieldVisibleAction]", error);
    return { success: false, error: "Error al cambiar la visibilidad" };
  }
}

export async function updateFieldOrderAction(
  fields: { id: string; order: number }[]
) {
  try {
    await requirePermission("products:write");
    await prisma.$transaction(
      fields.map(({ id, order }) =>
        prisma.profileField.update({ where: { id }, data: { order } })
      )
    );
    revalidateNosotros();
    return { success: true };
  } catch (error) {
    console.error("[updateFieldOrderAction]", error);
    return { success: false, error: "Error al reordenar los campos" };
  }
}

export async function deleteFieldAction(id: string) {
  try {
    await requirePermission("products:write");
    await prisma.profileField.delete({ where: { id } });
    revalidateNosotros();
    return { success: true, message: "Campo eliminado" };
  } catch (error) {
    console.error("[deleteFieldAction]", error);
    return { success: false, error: "Error al eliminar el campo" };
  }
}

// ─── Wizard Actions ───────────────────────────────────────────────────────

export async function createSectionWithFieldsAction(data: {
  section: {
    title: string;
    subtitle?: string;
    slug: string;
    icon?: string;
    isPublished: boolean;
    isVisible: boolean;
  };
  fields: {
    fieldKey: string;
    label: string;
    fieldType: ProfileFieldType;
    value: string;
    isVisible: boolean;
  }[];
}) {
  try {
    await requirePermission("products:write");
    
    const maxOrder = await prisma.profileSection.aggregate({ _max: { order: true } });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    // Utilizamos una transacción para crear la sección y todos sus campos de manera atómica
    await prisma.$transaction(async (tx) => {
      const section = await tx.profileSection.create({
        data: {
          ...data.section,
          order: nextOrder,
        },
      });

      if (data.fields.length > 0) {
        await tx.profileField.createMany({
          data: data.fields.map((field, index) => ({
            ...field,
            sectionId: section.id,
            order: index,
            value: sanitizeIfHtml(field.fieldType, field.value),
          })),
        });
      }
    });

    revalidateNosotros();
    return { success: true, message: "Sección y campos creados correctamente" };
  } catch (error) {
    console.error("[createSectionWithFieldsAction]", error);
    return { success: false, error: "Error al crear la sección con sus campos" };
  }
}
