// src/lib/validators/review.ts
import { z } from "zod";

export const reviewSchema = z.object({
  productId: z.string().min(1),
  reviewerName: z.string().min(2).max(100),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, "Mínimo 10 caracteres").max(1000),
});
export type ReviewInput = z.infer<typeof reviewSchema>;
