// src/lib/validators/category.ts
import { z } from "zod";
import { optionalStringNullable } from "@/lib/validators/utils";

export const categorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  parentId: optionalStringNullable,
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});
export type CategoryInput = z.infer<typeof categorySchema>;
