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
    appName: formData.get("appName"),
    metadataTitle: formData.get("metadataTitle"),
    metadataDescription: formData.get("metadataDescription"),

    colorBgPrimary: formData.get("colorBgPrimary"),
    colorBgSecondary: formData.get("colorBgSecondary"),
    colorTextPrimary: formData.get("colorTextPrimary"),
    colorTextSecondary: formData.get("colorTextSecondary"),
    colorAccentPrimary: formData.get("colorAccentPrimary"),
    colorAccentSecondary: formData.get("colorAccentSecondary"),
    colorButtonPrimary: formData.get("colorButtonPrimary"),
    colorBorder: formData.get("colorBorder"),

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
