// src/app/(public)/page.tsx
import { catalogFiltersSchema } from "@/lib/validators/filters";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { ReviewStatus } from "@prisma/client";
import { getSiteConfig } from "@/lib/site-config/get-site-config";
import { HeroBanner } from "@/components/catalog/HeroBanner";
import { CategoryBar } from "@/components/catalog/CategoryBar";
import { SocialProofBanner } from "@/components/catalog/SocialProofBanner";
import { FeaturedSection } from "@/components/catalog/FeaturedSection";
import { CustomerCTABanner } from "@/components/catalog/CustomerCTABanner";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { TrustBadges } from "@/components/catalog/TrustBadges";
import { WhatsAppFAB } from "@/components/catalog/WhatsAppFAB";

const PAGE_SIZE = 24;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const filters = catalogFiltersSchema.parse(params);
  const session = await auth();
  const isCustomerLoggedIn = session?.user?.role === "CUSTOMER";

  const where = {
    isActive: true,
    ...(filters.categoryId && { categoryId: filters.categoryId }),
    ...(filters.minPrice !== undefined && { price: { gte: filters.minPrice } }),
    ...(filters.maxPrice !== undefined && { price: { lte: filters.maxPrice } }),
    ...(filters.inStock === "true" && { stock: { gt: 0 } }),
  };

  const orderBy = {
    price_asc: { price: "asc" as const },
    price_desc: { price: "desc" as const },
    newest: { createdAt: "desc" as const },
    featured: { isFeatured: "desc" as const },
    rating: { reviews: { _count: "desc" as const } },
  }[filters.sort ?? "newest"] ?? { createdAt: "desc" as const };

  const productSelect = {
    id: true,
    name: true,
    slug: true,
    price: true,
    promoPrice: true,
    stock: true,
    sku: true,
    isFeatured: true,
    isNew: true,
    images: {
      where: { isPrimary: true },
      select: { url: true, alt: true },
      take: 1,
    },
    reviews: {
      where: { status: ReviewStatus.APPROVED },
      select: { rating: true },
    },
  };

  const [
    products,
    total,
    heroProducts,
    bestSellers,
    newArrivals,
    trending,
    categories,
    totalCustomers,
    totalProductsCount,
    siteConfig,
  ] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (filters.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: productSelect,
    }),
    prisma.product.count({ where }),
    // Hero: máx 5 productos destacados con imagen
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      select: productSelect,
      take: 5,
    }),
    // Más vendidos
    prisma.product.findMany({
      where: { isActive: true, isBestSeller: true },
      select: productSelect,
      take: 8,
    }),
    // Novedades
    prisma.product.findMany({
      where: { isActive: true, isNew: true },
      select: productSelect,
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    // Tendencias
    prisma.product.findMany({
      where: { isActive: true, isMostSearched: true },
      select: productSelect,
      take: 8,
    }),
    // Categorías para el CategoryBar
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { order: "asc" },
      select: { id: true, name: true, slug: true, imageUrl: true },
    }),
    // Métricas para SocialProofBanner
    prisma.customer.count(),
    prisma.product.count({ where: { isActive: true } }),
    // Configuración del sitio (visibilidad de secciones)
    getSiteConfig(),
  ]);

  return (
    <>
      {siteConfig.showHeroBanner && (
        <HeroBanner products={heroProducts as any} />
      )}

      {siteConfig.showCategoryBar && (
        <CategoryBar categories={categories} activeCategoryId={filters.categoryId} />
      )}

      {siteConfig.showSocialProofBanner && (
        <SocialProofBanner totalCustomers={totalCustomers} totalProducts={totalProductsCount} />
      )}

      <div className="flex flex-col gap-8 md:gap-16">
        {siteConfig.showFeaturedBestSellers && (
          <FeaturedSection title="Más Vendidos" subtitle="Lo que nuestros clientes eligen" products={bestSellers as any} />
        )}

        {siteConfig.showFeaturedNewArrivals && (
          <FeaturedSection title="Novedades" subtitle="Recién llegados" products={newArrivals as any} badge="NUEVO" />
        )}

        {/* CTA banner: respects both the config flag AND the auth state */}
        {siteConfig.showCustomerCTABanner && !isCustomerLoggedIn && (
          <CustomerCTABanner />
        )}

        {siteConfig.showFeaturedTrending && (
          <FeaturedSection title="Tendencias" subtitle="Lo más buscado ahora" products={trending as any} />
        )}

        {siteConfig.showCatalogSection && (
          <section id="catalogo" className="container mx-auto px-4 pt-4 pb-8 md:pt-8 md:pb-16">
            <div className="mb-8 md:mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Nuestro Catálogo</h2>
              <p className="text-neutral-500 dark:text-neutral-400">Encuentra exactamente lo que buscas en nuestra colección completa.</p>
            </div>
            <CatalogFilters categories={categories} currentFilters={filters} />
            <ProductGrid products={products as any} total={total} page={filters.page} pageSize={PAGE_SIZE} />
          </section>
        )}
      </div>

      {siteConfig.showTrustBadges && <TrustBadges />}
      {siteConfig.showWhatsAppFAB && <WhatsAppFAB />}
    </>
  );
}
