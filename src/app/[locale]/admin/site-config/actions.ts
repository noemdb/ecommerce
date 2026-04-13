"use server";
// src/app/admin/site-config/actions.ts

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { siteConfigSchema, type SiteConfigActionState } from "@/lib/site-config/site-config-schema";

/**
 * Parses a FormData checkbox field as boolean.
 * Checkboxes only appear in FormData when checked, so absence means false.
 */
function parseBoolean(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

export async function updateSiteConfig(
  _prevState: SiteConfigActionState,
  formData: FormData
): Promise<SiteConfigActionState> {
  // 1. Auth guard — only ADMIN can update site config
  await requirePermission("settings:write");

  // 2. Build raw data object from FormData
  const raw = {
    // General
    appName: formData.get("appName"),
    metadataTitle: formData.get("metadataTitle"),
    metadataDescription: formData.get("metadataDescription"),

    // Branding
    logoUrl: formData.get("logoUrl"),
    faviconUrl: formData.get("faviconUrl"),
    defaultTheme: formData.get("defaultTheme"),
    googleAnalyticsId: formData.get("googleAnalyticsId"),
    metaOgImageUrl: formData.get("metaOgImageUrl"),

    // Theme colors
    colorBgPrimary: formData.get("colorBgPrimary"),
    colorBgSecondary: formData.get("colorBgSecondary"),
    colorTextPrimary: formData.get("colorTextPrimary"),
    colorTextSecondary: formData.get("colorTextSecondary"),
    colorAccentPrimary: formData.get("colorAccentPrimary"),
    colorAccentSecondary: formData.get("colorAccentSecondary"),
    colorButtonPrimary: formData.get("colorButtonPrimary"),
    colorBorder: formData.get("colorBorder"),

    // Hero Banner
    heroRotationIntervalMs: formData.get("heroRotationIntervalMs"),
    heroMaxProducts: formData.get("heroMaxProducts"),
    heroShowProductCard: parseBoolean(formData, "heroShowProductCard"),
    heroShowUrgencyBar: parseBoolean(formData, "heroShowUrgencyBar"),
    heroCtaPrimaryLabel: formData.get("heroCtaPrimaryLabel"),
    heroCtaSecondaryLabel: formData.get("heroCtaSecondaryLabel"),
    heroSubtitle: formData.get("heroSubtitle"),

    // Featured Sections
    featuredBestSellersTitle: formData.get("featuredBestSellersTitle"),
    featuredBestSellersSubtitle: formData.get("featuredBestSellersSubtitle"),
    featuredBestSellersLimit: formData.get("featuredBestSellersLimit"),
    featuredNewArrivalsTitle: formData.get("featuredNewArrivalsTitle"),
    featuredNewArrivalsLimit: formData.get("featuredNewArrivalsLimit"),
    featuredTrendingTitle: formData.get("featuredTrendingTitle"),
    featuredTrendingLimit: formData.get("featuredTrendingLimit"),
    featuredShowViewAllLink: parseBoolean(formData, "featuredShowViewAllLink"),

    // Catalog
    catalogTitle: formData.get("catalogTitle"),
    catalogSubtitle: formData.get("catalogSubtitle"),
    catalogPageSize: formData.get("catalogPageSize"),
    catalogDefaultSort: formData.get("catalogDefaultSort"),
    catalogShowFilters: parseBoolean(formData, "catalogShowFilters"),
    catalogShowPagination: parseBoolean(formData, "catalogShowPagination"),

    // Social Proof
    socialProofCustomerLabel: formData.get("socialProofCustomerLabel"),
    socialProofProductLabel: formData.get("socialProofProductLabel"),
    socialProofThirdStatLabel: formData.get("socialProofThirdStatLabel"),
    socialProofThirdStatValue: formData.get("socialProofThirdStatValue"),
    socialProofBgColor: formData.get("socialProofBgColor"),

    // Trust Badges
    trustBadge1Title: formData.get("trustBadge1Title"),
    trustBadge1Description: formData.get("trustBadge1Description"),
    trustBadge2Title: formData.get("trustBadge2Title"),
    trustBadge2Description: formData.get("trustBadge2Description"),
    trustBadge3Title: formData.get("trustBadge3Title"),
    trustBadge3Description: formData.get("trustBadge3Description"),
    trustBadge4Title: formData.get("trustBadge4Title"),
    trustBadge4Description: formData.get("trustBadge4Description"),

    // WhatsApp FAB
    whatsappNumber: formData.get("whatsappNumber"),
    whatsappMessage: formData.get("whatsappMessage"),
    whatsappFabPosition: formData.get("whatsappFabPosition"),

    // CTA Banner
    ctaBannerTitle: formData.get("ctaBannerTitle"),
    ctaBannerDescription: formData.get("ctaBannerDescription"),
    ctaBannerPrimaryLabel: formData.get("ctaBannerPrimaryLabel"),
    ctaBannerSecondaryLabel: formData.get("ctaBannerSecondaryLabel"),

    // Footer
    showFooter: parseBoolean(formData, "showFooter"),
    footerCopyright: formData.get("footerCopyright"),
    footerShowSocialLinks: parseBoolean(formData, "footerShowSocialLinks"),
    footerInstagramUrl: formData.get("footerInstagramUrl"),
    footerFacebookUrl: formData.get("footerFacebookUrl"),
    footerTiktokUrl: formData.get("footerTiktokUrl"),

    // Homepage section visibility
    showHeroBanner: parseBoolean(formData, "showHeroBanner"),
    showCategoryBar: parseBoolean(formData, "showCategoryBar"),
    showSocialProofBanner: parseBoolean(formData, "showSocialProofBanner"),
    showFeaturedBestSellers: parseBoolean(formData, "showFeaturedBestSellers"),
    showFeaturedNewArrivals: parseBoolean(formData, "showFeaturedNewArrivals"),
    showCustomerCTABanner: parseBoolean(formData, "showCustomerCTABanner"),
    showFeaturedTrending: parseBoolean(formData, "showFeaturedTrending"),
    showCatalogSection: parseBoolean(formData, "showCatalogSection"),
    showTrustBadges: parseBoolean(formData, "showTrustBadges"),
    showWhatsAppFAB: parseBoolean(formData, "showWhatsAppFAB"),
  };

  // 3. Validate with Zod
  const result = siteConfigSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[]>;
    return {
      status: "error",
      message: "Por favor corrige los errores en el formulario.",
      fieldErrors,
    };
  }

  // 4. Persist — upsert ensures singleton is always id=1
  await prisma.siteConfig.upsert({
    where: { id: 1 },
    update: result.data,
    create: { id: 1, ...result.data },
  });

  // 5. Revalidate cache so changes appear immediately
  revalidatePath("/", "layout"); // refreshes layout (metadata + CSS vars)
  revalidatePath("/admin/site-config");

  return { status: "success", message: "Configuración guardada correctamente." };
}
