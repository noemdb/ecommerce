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

  colorBgPrimary: "#FFFFFF",
  colorBgSecondary: "#F8FAFC",
  colorTextPrimary: "#0F172A",
  colorTextSecondary: "#475569",
  colorAccentPrimary: "#111827",
  colorAccentSecondary: "#6366F1",
  colorButtonPrimary: "#111827",
  colorBorder: "#E2E8F0",

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
