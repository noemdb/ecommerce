"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult } from "@/types/actions";

const categorySchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(80),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  order: z.coerce.number().int().min(0).optional(),
  parentId: z.string().optional().nullable(),
});

export async function createCategoryAction(
  input: unknown
): Promise<ActionResult> {
  await requirePermission("categories:write");

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const { name, slug, description, imageUrl, order, parentId } = parsed.data;

  try {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return {
        success: false,
        error: "Ya existe una categoría con ese slug",
        fieldErrors: { slug: ["Este slug ya está en uso"] },
      };
    }

    await prisma.category.create({
      data: {
        name,
        slug,
        description: description || undefined,
        imageUrl: imageUrl || undefined,
        order: order ?? 0,
        parentId: parentId || undefined,
        isActive: true,
      },
    });

    revalidatePath("/admin/categorias");
    revalidatePath("/");

    return { success: true, message: "Categoría creada correctamente" };
  } catch (error) {
    console.error("[CREATE_CATEGORY_ERROR]", error);
    return { success: false, error: "Error al crear la categoría" };
  }
}

export async function updateCategoryAction(
  id: string,
  input: unknown
): Promise<ActionResult> {
  await requirePermission("categories:write");

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const { name, slug, description, imageUrl, order, parentId } = parsed.data;

  try {
    const existing = await prisma.category.findFirst({
      where: { slug, NOT: { id } },
    });
    if (existing) {
      return {
        success: false,
        error: "Ya existe otra categoría con ese slug",
        fieldErrors: { slug: ["Este slug ya está en uso"] },
      };
    }

    await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || undefined,
        imageUrl: imageUrl || undefined,
        order: order ?? 0,
        parentId: parentId || null,
      },
    });

    revalidatePath("/admin/categorias");
    revalidatePath("/");

    return { success: true, message: "Categoría actualizada correctamente" };
  } catch (error) {
    console.error("[UPDATE_CATEGORY_ERROR]", error);
    return { success: false, error: "Error al actualizar la categoría" };
  }
}

export async function toggleCategoryActiveAction(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  await requirePermission("categories:write");

  try {
    await prisma.category.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath("/admin/categorias");
    revalidatePath("/");

    return {
      success: true,
      message: isActive ? "Categoría activada" : "Categoría desactivada",
    };
  } catch (error) {
    console.error("[TOGGLE_CATEGORY_ERROR]", error);
    return { success: false, error: "Error al cambiar el estado de la categoría" };
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  await requirePermission("categories:write");

  try {
    const hasProducts = await prisma.product.findFirst({
      where: { categoryId: id },
    });

    if (hasProducts) {
      return {
        success: false,
        error:
          "No se puede eliminar: hay productos asociados a esta categoría. Reasígnalos primero.",
      };
    }

    await prisma.category.delete({ where: { id } });

    revalidatePath("/admin/categorias");
    revalidatePath("/");

    return { success: true, message: "Categoría eliminada correctamente" };
  } catch (error) {
    console.error("[DELETE_CATEGORY_ERROR]", error);
    return { success: false, error: "Error al eliminar la categoría" };
  }
}

export async function reorderCategoriesAction(
  items: { id: string; order: number }[]
): Promise<ActionResult> {
  await requirePermission("categories:write");

  try {
    await prisma.$transaction(
      items.map((item) =>
        prisma.category.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    revalidatePath("/admin/categorias");
    revalidatePath("/");

    return { success: true, message: "Orden actualizado correctamente" };
  } catch (error) {
    console.error("[REORDER_CATEGORIES_ERROR]", error);
    return { success: false, error: "Error al actualizar el orden" };
  }
}
