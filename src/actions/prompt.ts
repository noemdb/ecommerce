"use server";

import { z } from "zod";
import { promptSchema, type PromptInput } from "@/lib/validators/prompt";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/rbac";

export async function createPromptAction(data: PromptInput) {
  try {
    await requirePermission("products:write");
    const validatedData = promptSchema.parse(data);

    // Get the latest version for this product
    const lastPrompt = await prisma.productPrompt.findFirst({
      where: { productId: validatedData.productId },
      orderBy: { version: "desc" },
    });

    const newVersion = (lastPrompt?.version ?? 0) + 1;

    // Deactivate others if this one is active
    if (validatedData.isActive) {
      await prisma.productPrompt.updateMany({
        where: { productId: validatedData.productId },
        data: { isActive: false },
      });
    }

    const prompt = await prisma.productPrompt.create({
      data: {
        ...validatedData,
        version: newVersion,
      },
    });

    revalidatePath("/admin/prompts");
    revalidatePath(`/admin/productos/${validatedData.productId}`);
    return { success: true, message: "Prompt creado correctamente", id: prompt.id };
  } catch (error) {
    console.error("Error creating prompt:", error);
    if (error instanceof z.ZodError) {
      return { success: false, fieldErrors: error.flatten().fieldErrors };
    }
    return { success: false, error: "Error interno al crear el prompt" };
  }
}

export async function updatePromptAction(id: string, data: Partial<PromptInput>) {
  try {
    await requirePermission("products:write");
    
    // We don't fully validate for Partial, but let's be safe
    const prompt = await prisma.productPrompt.update({
      where: { id },
      data,
      include: { product: true }
    });

    revalidatePath("/admin/prompts");
    revalidatePath(`/admin/productos/${prompt.productId}`);
    return { success: true, message: "Prompt actualizado correctamente" };
  } catch (error) {
    console.error("Error updating prompt:", error);
    return { success: false, error: "Error interno al actualizar el prompt" };
  }
}

export async function togglePromptActiveAction(id: string) {
  try {
    await requirePermission("products:write");
    
    const current = await prisma.productPrompt.findUnique({
      where: { id },
      select: { isActive: true, productId: true }
    });

    if (!current) return { success: false, error: "Prompt no encontrado" };

    const newStatus = !current.isActive;

    // If we're activating, deactivate others
    if (newStatus) {
      await prisma.productPrompt.updateMany({
        where: { productId: current.productId },
        data: { isActive: false },
      });
    }

    await prisma.productPrompt.update({
      where: { id },
      data: { isActive: newStatus },
    });

    revalidatePath("/admin/prompts");
    revalidatePath(`/admin/productos/${current.productId}`);
    return { success: true, message: newStatus ? "Prompt activado" : "Prompt desactivado" };
  } catch (error) {
    console.error("Error toggling prompt active:", error);
    return { success: false, error: "Error al cambiar el estado del prompt" };
  }
}

export async function deletePromptAction(id: string) {
  try {
    await requirePermission("products:write");
    
    const prompt = await prisma.productPrompt.delete({
      where: { id },
      select: { productId: true }
    });
    
    revalidatePath("/admin/prompts");
    revalidatePath(`/admin/productos/${prompt.productId}`);
    return { success: true, message: "Prompt eliminado correctamente" };
  } catch (error) {
    console.error("Error deleting prompt:", error);
    return { success: false, error: "Error al intentar eliminar el prompt" };
  }
}

export async function getPromptsAction() {
  try {
    await requirePermission("products:read");
    const prompts = await prisma.productPrompt.findMany({
      include: {
        product: {
          select: {
            name: true,
            sku: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return { success: true, data: prompts };
  } catch (error) {
    console.error("Error fetching prompts:", error);
    return { success: false, error: "Error al obtener los prompts" };
  }
}
