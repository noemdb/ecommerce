"use server";

import { prisma } from "@/lib/prisma";
import { requireCustomerSession } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types/actions";

export async function addReviewAction(
  productId: string,
  rating: number,
  comment: string
): Promise<ActionResult> {
  const session = await requireCustomerSession();
  
  if (!session?.user) {
    return { success: false, error: "Debes iniciar sesión para reseñar." };
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: session.user.id },
      select: { name: true }
    });

    if (!customer) throw new Error("Cliente no encontrado");

    await prisma.review.create({
      data: {
        productId,
        customerId: session.user.id,
        reviewerName: customer.name,
        rating,
        comment,
        status: "PENDING",
      },
    });

    // En v2.1 el rating se actualiza SOLO cuando la reseña es aprobada por un moderador, 
    // no al crearla como pendiente. Ver moderateReviewAction.
    
    // Dejamos registro en la bitácora del cliente
    await prisma.customerAction.create({
      data: {
        customerId: session.user.id,
        action: "UPDATE_PROFILE", 
        description: `Envió una reseña de ${rating} estrellas para un producto.`
      }
    });

    revalidatePath(`/producto/[slug]`, "page");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[ADD_REVIEW_ERROR]", error);
    return { success: false, error: "No se pudo enviar la reseña." };
  }
}
