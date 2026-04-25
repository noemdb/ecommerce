// src/lib/nosotros/get-nosotros.ts
// Helpers server-side para leer el perfil público de /nosotros.
// Usa React cache() para deduplicación por request (mismo patrón que getSiteConfig).

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// ─── Tipos exportados ──────────────────────────────────────────────────────

export type SectionWithFields = Prisma.ProfileSectionGetPayload<{
  include: { fields: true };
}>;

export type BusinessProfileData = Prisma.BusinessProfileGetPayload<
  Record<string, never>
>;

// ─── Slugs conocidos (compile-time safety) ────────────────────────────────

export type KnownSectionSlug =
  | "introduction"
  | "basic-info"
  | "academic-formation"
  | "skills"
  | "work-experience"
  | "certifications"
  | "languages"
  | "contact";

// ─── Queries ──────────────────────────────────────────────────────────────

/**
 * Retorna el BusinessProfile singleton (id=1).
 * Si no existe, retorna un perfil vacío sin crashear.
 */
export const getBusinessProfile = cache(
  async (): Promise<BusinessProfileData | null> => {
    try {
      return await prisma.businessProfile.findUnique({ where: { id: 1 } });
    } catch (error) {
      console.warn("⚠️ [getBusinessProfile] Failed:", error instanceof Error ? error.message : error);
      return null;
    }
  }
);

/**
 * Retorna las secciones publicadas con sus campos visibles, ordenadas.
 */
export const getPublishedSections = cache(
  async (): Promise<SectionWithFields[]> => {
    try {
      return await prisma.profileSection.findMany({
        where: { isPublished: true, isVisible: true },
        include: {
          fields: {
            where: { isVisible: true },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      });
    } catch (error) {
      console.warn("⚠️ [getPublishedSections] Failed:", error instanceof Error ? error.message : error);
      return [];
    }
  }
);

/**
 * Retorna perfil + secciones en paralelo.
 */
export async function getAboutPageData() {
  const [profile, sections] = await Promise.all([
    getBusinessProfile(),
    getPublishedSections(),
  ]);
  return { profile, sections };
}

/**
 * Para el panel admin: retorna TODAS las secciones (publicadas o no) con sus campos.
 */
export const getAllSectionsForAdmin = cache(
  async (): Promise<SectionWithFields[]> => {
    return prisma.profileSection.findMany({
      include: {
        fields: { orderBy: { order: "asc" } },
      },
      orderBy: { order: "asc" },
    });
  }
);
