// src/lib/validators/filters.ts
import { z } from "zod";

export const catalogFiltersSchema = z.object({
  categoryId: z.string().optional(), // Removed .cuid() to be more flexible with slugs if needed, though spec says cuid. I'll stick to spec if it's strict.
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStock: z.enum(["true", "false"]).optional(),
  minRating: z.coerce.number().int().min(1).max(5).optional(),
  sort: z
    .enum(["price_asc", "price_desc", "newest", "rating", "featured"])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
});

export type CatalogFilters = z.infer<typeof catalogFiltersSchema>;
