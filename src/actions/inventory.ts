"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types/actions";

export async function adjustStockAction(data: {
  productId: string;
  quantity: number;
  type: "ENTRADA" | "SALIDA" | "AJUSTE";
  reason?: string;
}): Promise<ActionResult> {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    return { success: false, error: "No autorizado" };
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      select: { stock: true },
    });

    if (!product) {
      return { success: false, error: "Producto no encontrado" };
    }

    const stockBefore = product.stock;
    let stockAfter = stockBefore;

    if (data.type === "ENTRADA") {
      stockAfter += data.quantity;
    } else if (data.type === "SALIDA") {
      stockAfter -= data.quantity;
    } else if (data.type === "AJUSTE") {
      stockAfter = data.quantity; // En ajuste manual, la cantidad es el nuevo stock total
    }

    await prisma.$transaction([
      prisma.product.update({
        where: { id: data.productId },
        data: { stock: stockAfter },
      }),
      prisma.inventoryMovement.create({
        data: {
          productId: data.productId,
          type: data.type,
          quantity: data.type === "AJUSTE" ? stockAfter - stockBefore : data.quantity,
          stockBefore,
          stockAfter,
          reason: data.reason,
        },
      }),
    ]);

    revalidatePath("/admin/inventario");
    revalidatePath("/admin/productos");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error adjusting stock:", error);
    return { success: false, error: "Error al ajustar el inventario" };
  }
}

export async function getInventoryMovements(productId?: string) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    throw new Error("No autorizado");
  }

  return prisma.inventoryMovement.findMany({
    where: productId ? { productId } : {},
    include: {
      product: {
        select: { name: true, sku: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
