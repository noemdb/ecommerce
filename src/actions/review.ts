"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types/actions";
import type { ReviewStatus } from "@prisma/client";

export async function moderateReviewAction(
  reviewId: string,
  status: ReviewStatus,
  adminResponse?: string
): Promise<ActionResult> {
  await requirePermission("reviews:moderate");

  try {
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        status,
        adminResponse: adminResponse || undefined,
      },
      select: { productId: true }
    });

    // Recalcular rating considerando SOLO reseñas aprobadas
    const stats = await prisma.review.aggregate({
      where: { productId: updatedReview.productId, status: "APPROVED" },
      _avg: { rating: true },
      _count: true,
    });

    // Actualizar producto (G-10 Rating Promedio Desnormalizado)
    await prisma.product.update({
      where: { id: updatedReview.productId },
      data: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count || 0,
      },
    });

    revalidatePath("/admin/resenas");
    revalidatePath("/producto/[slug]", "page");

    return {
      success: true,
      message:
        status === "APPROVED"
          ? "Reseña aprobada (Promedio actualizado)"
          : status === "REJECTED"
          ? "Reseña rechazada (Promedio actualizado)"
          : "Estado actualizado",
    };
  } catch (error) {
    console.error("[MODERATE_REVIEW_ERROR]", error);
    return { success: false, error: "Error al moderar la reseña" };
  }
}

