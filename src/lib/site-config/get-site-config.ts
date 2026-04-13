// src/lib/site-config/get-site-config.ts
// Reusable server-side helper to read the SiteConfig singleton safely.
// Uses unstable_cache with "site-config" tag for granular revalidation.

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SITE_CONFIG, type SiteConfigData } from "./default-site-config";

/**
 * Returns the SiteConfig singleton (id=1) from the database.
 * If the record does not exist, returns DEFAULT_SITE_CONFIG without crashing.
 * Deduplicated per request using React cache.
 */
export const getSiteConfig = cache(
  async (): Promise<SiteConfigData> => {
    try {
      const config = await prisma.siteConfig.findUnique({ where: { id: 1 } });
      if (!config) return DEFAULT_SITE_CONFIG;

      // Destructure to strip id, createdAt, updatedAt
      const { id: _id, createdAt: _c, updatedAt: _u, ...data } = config;
      return data;
    } catch (error) {
      // During build or before migrations are applied, the table might not exist.
      // We return defaults instead of crashing the build.
      console.warn("⚠️ [getSiteConfig] Failed to fetch config from DB, using defaults:", error instanceof Error ? error.message : error);
      return DEFAULT_SITE_CONFIG;
    }
  }
);
