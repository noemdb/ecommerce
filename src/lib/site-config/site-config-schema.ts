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

  // Branding
  logoUrl: z.string().url("Debe ser una URL válida (ej. https://...)").or(z.literal("")).optional().default(""),
  faviconUrl: z.string().url("Debe ser una URL válida (ej. https://...)").or(z.literal("")).optional().default(""),
  defaultTheme: z.string().default("system"),
  googleAnalyticsId: z.string().optional().default(""),
  metaOgImageUrl: z.string().url("Debe ser una URL válida (ej. https://...)").or(z.literal("")).optional().default(""),

  // Theme colors
  colorBgPrimary: hexColor,
  colorBgSecondary: hexColor,
  colorTextPrimary: hexColor,
  colorTextSecondary: hexColor,
  colorAccentPrimary: hexColor,
  colorAccentSecondary: hexColor,
  colorButtonPrimary: hexColor,
  colorBorder: hexColor,

  // Hero Banner
  heroRotationIntervalMs: z.coerce.number({ invalid_type_error: "Debe ser un número" }).int("Debe ser entero").min(1000, "El mínimo es 1000ms").max(30000, "El máximo es 30000ms").default(5000),
  heroMaxProducts: z.coerce.number({ invalid_type_error: "Debe ser un número" }).int("Debe ser entero").min(1, "Mínimo 1 producto").max(20, "Máximo 20 productos").default(5),
  heroShowProductCard: z.boolean().default(true),
  heroShowUrgencyBar: z.boolean().default(true),
  heroCtaPrimaryLabel: z.string().max(50, "Máximo 50 caracteres").default("Ver producto"),
  heroCtaSecondaryLabel: z.string().max(50, "Máximo 50 caracteres").default("Ver catálogo"),
  heroSubtitle: z.string().max(200, "Máximo 200 caracteres").default(""),

  // Featured Sections
  featuredBestSellersTitle: z.string().max(100, "Máximo 100 caracteres").default("Más Vendidos"),
  featuredBestSellersSubtitle: z.string().max(200, "Máximo 200 caracteres").default("Lo que nuestros clientes eligen"),
  featuredBestSellersLimit: z.coerce.number({ invalid_type_error: "Debe ser un número" }).int("Debe ser entero").min(1, "Mínimo 1").max(20, "Máximo 20").default(8),
  featuredNewArrivalsTitle: z.string().max(100, "Máximo 100 caracteres").default("Novedades"),
  featuredNewArrivalsLimit: z.coerce.number({ invalid_type_error: "Debe ser un número" }).int("Debe ser entero").min(1, "Mínimo 1").max(20, "Máximo 20").default(8),
  featuredTrendingTitle: z.string().max(100, "Máximo 100 caracteres").default("Tendencias"),
  featuredTrendingLimit: z.coerce.number({ invalid_type_error: "Debe ser un número" }).int("Debe ser entero").min(1, "Mínimo 1").max(20, "Máximo 20").default(8),
  featuredShowViewAllLink: z.boolean().default(true),

  // Catalog
  catalogTitle: z.string().max(100, "Máximo 100 caracteres").default("Nuestro Catálogo"),
  catalogSubtitle: z.string().max(200, "Máximo 200 caracteres").default("Encuentra exactamente lo que buscas..."),
  catalogPageSize: z.coerce.number({ invalid_type_error: "Debe ser un número" }).int("Debe ser entero").min(4, "Mínimo 4").max(100, "Máximo 100").default(24),
  catalogDefaultSort: z.enum(["newest", "featured", "price_asc", "price_desc", "rating"]).default("newest"),
  catalogShowFilters: z.boolean().default(true),
  catalogShowPagination: z.boolean().default(true),

  // Social Proof
  socialProofCustomerLabel: z.string().max(50, "Máximo 50 caracteres").default("Clientes"),
  socialProofProductLabel: z.string().max(50, "Máximo 50 caracteres").default("Productos"),
  socialProofThirdStatLabel: z.string().max(50, "Máximo 50 caracteres").default("Seguro"),
  socialProofThirdStatValue: z.string().max(50, "Máximo 50 caracteres").default("100%"),
  socialProofBgColor: hexColor.default("#2563EB"),

  // Trust Badges
  trustBadge1Title: z.string().max(100, "Máximo 100 caracteres").default("Pago seguro"),
  trustBadge1Description: z.string().max(200, "Máximo 200 caracteres").default("Transferencia bancaria protegida"),
  trustBadge2Title: z.string().max(100, "Máximo 100 caracteres").default("Verificación manual"),
  trustBadge2Description: z.string().max(200, "Máximo 200 caracteres").default("Validamos cada comprobante"),
  trustBadge3Title: z.string().max(100, "Máximo 100 caracteres").default("Soporte por WhatsApp"),
  trustBadge3Description: z.string().max(200, "Máximo 200 caracteres").default("Atención personalizada inmediata"),
  trustBadge4Title: z.string().max(100, "Máximo 100 caracteres").default("Productos garantizados"),
  trustBadge4Description: z.string().max(200, "Máximo 200 caracteres").default("Calidad premium asegurada"),

  // WhatsApp FAB
  whatsappNumber: z.string().max(20, "Máximo 20 caracteres").regex(/^[0-9+]*$/, "Solo números y signo + permitidos").optional().default(""),
  whatsappMessage: z.string().max(300, "Máximo 300 caracteres").default("¡Hola! Necesito ayuda con una compra."),
  whatsappFabPosition: z.string().default("bottom-right"),

  // CTA Banner
  ctaBannerTitle: z.string().max(200, "Máximo 200 caracteres").default("Crea tu cuenta y mejora tu experiencia"),
  ctaBannerDescription: z.string().max(500, "Máximo 500 caracteres").default("Lleva un historial de todos tus pedidos..."),
  ctaBannerPrimaryLabel: z.string().max(50, "Máximo 50 caracteres").default("Registrarme"),
  ctaBannerSecondaryLabel: z.string().max(50, "Máximo 50 caracteres").default("Ya tengo cuenta"),

  // Footer
  showFooter: z.boolean().default(true),
  footerCopyright: z.string().max(200, "Máximo 200 caracteres").default("© 2025 Ecommerce Premium"),
  footerShowSocialLinks: z.boolean().default(false),
  footerInstagramUrl: z.string().url("Debe ser una URL válida").or(z.literal("")).optional().default(""),
  footerFacebookUrl: z.string().url("Debe ser una URL válida").or(z.literal("")).optional().default(""),
  footerTiktokUrl: z.string().url("Debe ser una URL válida").or(z.literal("")).optional().default(""),

  // Homepage section visibility
  showHeroBanner: z.boolean().default(true),
  showCategoryBar: z.boolean().default(true),
  showSocialProofBanner: z.boolean().default(true),
  showFeaturedBestSellers: z.boolean().default(true),
  showFeaturedNewArrivals: z.boolean().default(true),
  showCustomerCTABanner: z.boolean().default(true),
  showFeaturedTrending: z.boolean().default(true),
  showCatalogSection: z.boolean().default(true),
  showTrustBadges: z.boolean().default(true),
  showWhatsAppFAB: z.boolean().default(true),
});

export type SiteConfigInput = z.infer<typeof siteConfigSchema>;

// Typed result shape for the Server Action — compatible with useActionState
export type SiteConfigActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> };
