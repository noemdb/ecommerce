"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types/actions";

export async function purgeCustomerAction(customerId: string): Promise<ActionResult> {
  await requirePermission("customers:write");

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) return { success: false, error: "Cliente no encontrado." };
    if (!customer.isBlocked) {
      return { success: false, error: "El cliente debe estar bloqueado para poder ser purgado." };
    }

    // Anonimización GDPR de órdenes (mantienen montos pero borran datos PII)
    const anonymizedString = `GDPR_DELETED_${customerId.slice(0, 8)}`;
    
    await prisma.$transaction([
      // 1. Anonimizar datos PII de las órdenes asociadas
      prisma.order.updateMany({
        where: { customerId },
        data: {
          customerName: "Usuario Eliminado (GDPR)",
          customerEmail: `${anonymizedString}@deleted.local`,
          customerPhone: "0000000000",
          accountHolder: "Anonimizado",
          referenceNumber: "Anonimizado",
          bankName: "Anonimizado",
          customerId: null // Rompemos el foreign key para poder borrar el cliente
        }
      }),
      // 2. Borrado de reseñas
      prisma.review.deleteMany({
        where: { customerId }
      }),
      // 3. Borrado de bitácora
      prisma.customerAction.deleteMany({
        where: { customerId }
      }),
      // 4. Borrado del perfil central
      prisma.customer.delete({
        where: { id: customerId }
      })
    ]);

    revalidatePath("/admin/clientes");
    
    return { 
      success: true, 
      message: "Datos del cliente purgados y anonimizados permanentemente (GDPR)." 
    };
  } catch (error) {
    console.error("[PURGE_CUSTOMER_ERROR]", error);
    return { success: false, error: "Fallo al ejecutar la purga de datos." };
  }
}
