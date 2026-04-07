import { z } from "zod";

export const promptSchema = z.object({
  productId: z.string().min(1, "El producto es requerido"),
  prompt: z.string().min(10, "El prompt debe tener al menos 10 caracteres"),
  notes: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type PromptInput = z.infer<typeof promptSchema>;
