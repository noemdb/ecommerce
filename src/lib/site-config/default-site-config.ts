// src/lib/site-config/default-site-config.ts
// Single source of truth for SiteConfig defaults.
// Used by both the seed and the getSiteConfig() fallback.

import type { SiteConfig } from "@prisma/client";

// Omit DB-managed fields; keep only the business data fields
export type SiteConfigData = Omit<SiteConfig, "id" | "createdAt" | "updatedAt">;

export const DEFAULT_SITE_CONFIG: SiteConfigData = {
  appName: "Ecommerce Premium",
  metadataTitle: "Ecommerce NoDoz",
  metadataDescription: "Ecommerce Premium",

  // Branding
  logoUrl: "",
  faviconUrl: "",
  defaultTheme: "system",
  googleAnalyticsId: "",
  metaOgImageUrl: "",

  colorBgPrimary: "#FFFFFF",
  colorBgSecondary: "#F8FAFC",
  colorTextPrimary: "#0F172A",
  colorTextSecondary: "#475569",
  colorAccentPrimary: "#111827",
  colorAccentSecondary: "#6366F1",
  colorButtonPrimary: "#111827",
  colorBorder: "#E2E8F0",

  // Hero Banner
  heroRotationIntervalMs: 5000,
  heroMaxProducts: 5,
  heroShowProductCard: true,
  heroShowUrgencyBar: true,
  heroCtaPrimaryLabel: "Ver producto",
  heroCtaSecondaryLabel: "Ver catálogo",
  heroSubtitle: "",

  // Featured Sections
  featuredBestSellersTitle: "Más Vendidos",
  featuredBestSellersSubtitle: "Lo que nuestros clientes eligen",
  featuredBestSellersLimit: 8,
  featuredNewArrivalsTitle: "Novedades",
  featuredNewArrivalsLimit: 8,
  featuredTrendingTitle: "Tendencias",
  featuredTrendingLimit: 8,
  featuredShowViewAllLink: true,

  // Catalog
  catalogTitle: "Nuestro Catálogo",
  catalogSubtitle: "Encuentra exactamente lo que buscas...",
  catalogPageSize: 24,
  catalogDefaultSort: "newest",
  catalogShowFilters: true,
  catalogShowPagination: true,

  // Social Proof
  socialProofCustomerLabel: "Clientes",
  socialProofProductLabel: "Productos",
  socialProofThirdStatLabel: "Seguro",
  socialProofThirdStatValue: "100%",
  socialProofBgColor: "#2563EB",

  // Trust Badges
  trustBadge1Title: "Pago seguro",
  trustBadge1Description: "Transferencia bancaria protegida",
  trustBadge2Title: "Verificación manual",
  trustBadge2Description: "Validamos cada comprobante",
  trustBadge3Title: "Soporte por WhatsApp",
  trustBadge3Description: "Atención personalizada inmediata",
  trustBadge4Title: "Productos garantizados",
  trustBadge4Description: "Calidad premium asegurada",

  // WhatsApp FAB
  whatsappNumber: "",
  whatsappMessage: "¡Hola! Necesito ayuda con una compra.",
  whatsappFabPosition: "bottom-right",

  // CTA Banner
  ctaBannerTitle: "Crea tu cuenta y mejora tu experiencia",
  ctaBannerDescription: "Lleva un historial de todos tus pedidos...",
  ctaBannerPrimaryLabel: "Registrarme",
  ctaBannerSecondaryLabel: "Ya tengo cuenta",

  // Footer
  showFooter: true,
  footerCopyright: "© 2025 Ecommerce Premium",
  footerShowSocialLinks: false,
  footerInstagramUrl: "",
  footerFacebookUrl: "",
  footerTiktokUrl: "",

  showHeroBanner: true,
  showCategoryBar: true,
  showSocialProofBanner: true,
  showFeaturedBestSellers: true,
  showFeaturedNewArrivals: true,
  showCustomerCTABanner: true,
  showFeaturedTrending: true,
  showCatalogSection: true,
  showTrustBadges: true,
  showWhatsAppFAB: true,
};
