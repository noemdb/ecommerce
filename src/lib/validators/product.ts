// src/lib/validators/product.ts
import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Nombre requerido").max(200),
  slug: z.string().min(2, "Slug requerido").regex(/^[a-z0-9-]+$/, "Slug inválido (solo minúsculas, números y guiones)"),
  description: z.string().min(10, "Descripción requerida"),
  price: z.coerce.number().positive("Precio debe ser positivo"),
  promoPrice: z.coerce.number().positive().optional().nullable(),
  sku: z.string().min(1, "SKU requerido").max(50),
  categoryId: z.string().min(1, "Categoría inválida"),
  supplierId: z.string().optional().nullable(),
  stock: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isMostSearched: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isActive: z.boolean().default(true),
  metaTitle: z.string().max(60).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
});
export type ProductInput = z.infer<typeof productSchema>;

export const productVariantSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
  sku: z.string().min(1),
  price: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0),
});
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
