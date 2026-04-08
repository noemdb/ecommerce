// src/lib/site-config/site-config-schema.ts
// Zod validation schema for SiteConfig updates.
// Used by the Server Action to validate admin form submissions.

import { z } from "zod";

const hexColor = z
  .string()
  .regex(/^#([0-9A-Fa-f]{6})$/, "Debe ser un color hexadecimal válido (ej. #1A2B3C)");

export const siteConfigSchema = z.object({
  // General
  appName: z
    .string()
    .min(1, "El nombre de la app es requerido")
    .max(120, "Máximo 120 caracteres"),
  metadataTitle: z
    .string()
    .min(1, "El título es requerido")
    .max(160, "Máximo 160 caracteres"),
  metadataDescription: z
    .string()
    .min(1, "La descripción es requerida")
    .max(300, "Máximo 300 caracteres"),

  // Theme colors
  colorBgPrimary: hexColor,
  colorBgSecondary: hexColor,
  colorTextPrimary: hexColor,
  colorTextSecondary: hexColor,
  colorAccentPrimary: hexColor,
  colorAccentSecondary: hexColor,
  colorButtonPrimary: hexColor,
  colorBorder: hexColor,

  // Homepage section visibility
  showHeroBanner: z.boolean(),
  showCategoryBar: z.boolean(),
  showSocialProofBanner: z.boolean(),
  showFeaturedBestSellers: z.boolean(),
  showFeaturedNewArrivals: z.boolean(),
  showCustomerCTABanner: z.boolean(),
  showFeaturedTrending: z.boolean(),
  showCatalogSection: z.boolean(),
  showTrustBadges: z.boolean(),
  showWhatsAppFAB: z.boolean(),
});

export type SiteConfigInput = z.infer<typeof siteConfigSchema>;

// Typed result shape for the Server Action — compatible with useActionState
export type SiteConfigActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> };
