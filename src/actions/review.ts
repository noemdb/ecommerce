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
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        status,
        adminResponse: adminResponse || undefined,
      },
    });

    revalidatePath("/admin/resenas");

    return {
      success: true,
      message:
        status === "APPROVED"
          ? "Reseña aprobada"
          : status === "REJECTED"
          ? "Reseña rechazada"
          : "Estado actualizado",
    };
  } catch (error) {
    console.error("[MODERATE_REVIEW_ERROR]", error);
    return { success: false, error: "Error al moderar la reseña" };
  }
}
