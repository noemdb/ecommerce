"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types/actions";
import type { OrderStatus } from "@prisma/client";

const VALID_STATUSES: OrderStatus[] = [
  "PENDIENTE",
  "VERIFICANDO",
  "CONFIRMADA",
  "EN_PROCESO",
  "COMPLETADA",
  "CANCELADA",
  "RECHAZADA",
];

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
  note?: string
): Promise<ActionResult> {
  await requirePermission("orders:write");
  const session = await auth();

  if (!VALID_STATUSES.includes(status)) {
    return { success: false, error: "Estado inválido" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status,
          confirmedById:
            status === "CONFIRMADA" ? (session?.user?.id ?? undefined) : undefined,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status,
          note: note || undefined,
          changedAt: new Date(),
        },
      });
    });

    revalidatePath(`/admin/ordenes/${orderId}`);
    revalidatePath("/admin/ordenes");

    return { success: true, message: `Estado actualizado a: ${status}` };
  } catch (error) {
    console.error("[UPDATE_ORDER_STATUS_ERROR]", error);
    return { success: false, error: "Error al actualizar el estado" };
  }
}
