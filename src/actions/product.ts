"use server";

import { z } from "zod";
import { productSchema, type ProductInput } from "@/lib/validators/product";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/rbac";

export async function createProductAction(data: ProductInput & { images: string[] }) {
  try {
    await requirePermission("products:write");
    const validatedData = productSchema.parse(data);

    const product = await prisma.product.create({
      data: {
        ...validatedData,
        images: {
          create: data.images.map((url, index) => ({
            url,
            isPrimary: index === 0,
            order: index,
          })),
        },
      },
    });

    revalidatePath("/admin/productos");
    return { success: true, message: "Producto creado correctamente", id: product.id };
  } catch (error) {
    console.error("Error creating product:", error);
    if (error instanceof z.ZodError) {
      return { success: false, fieldErrors: error.flatten().fieldErrors };
    }
    return { success: false, error: "Error interno al crear el producto" };
  }
}

export async function updateProductAction(id: string, data: ProductInput & { images: string[] }) {
  try {
    await requirePermission("products:write");
    const validatedData = productSchema.parse(data);

    // Delete existing images and recreate (simple sync for now)
    await prisma.$transaction([
      prisma.productImage.deleteMany({ where: { productId: id } }),
      prisma.product.update({
        where: { id },
        data: {
          ...validatedData,
          images: {
            create: data.images.map((url, index) => ({
              url,
              isPrimary: index === 0,
              order: index,
            })),
          },
        },
      }),
    ]);

    revalidatePath("/admin/productos");
    revalidatePath(`/admin/productos/${id}`);
    return { success: true, message: "Producto actualizado correctamente" };
  } catch (error) {
    console.error("Error updating product:", error);
    if (error instanceof z.ZodError) {
      return { success: false, fieldErrors: error.flatten().fieldErrors };
    }
    return { success: false, error: "Error interno al actualizar el producto" };
  }
}

export async function deleteProductAction(id: string) {
  try {
    await requirePermission("products:write");
    
    // Check if product has orders
    const orderCount = await prisma.orderItem.count({
      where: { productId: id }
    });

    if (orderCount > 0) {
      return { success: false, error: "No se puede eliminar un producto con historial de ventas. Inactívelo en su lugar." };
    }

    await prisma.product.delete({ where: { id } });
    
    revalidatePath("/admin/productos");
    return { success: true, message: "Producto eliminado definitivamente" };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: "Error al intentar eliminar el producto" };
  }
}

export async function toggleProductActiveAction(id: string, isActive: boolean) {
  try {
    await requirePermission("products:write");
    
    await prisma.product.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath("/admin/productos");
    return { success: true, message: isActive ? "Producto activado" : "Producto desactivado" };
  } catch (error) {
    console.error("Error toggling product active:", error);
    return { success: false, error: "Error al cambiar el estado del producto" };
  }
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
