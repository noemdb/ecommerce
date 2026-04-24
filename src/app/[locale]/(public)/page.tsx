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

  const config = await getSiteConfig();
  const pageSize = config.catalogPageSize || 24;

  const validSorts = ["newest", "featured", "price_asc", "price_desc", "rating"] as const;
  const rawSort = filters.sort || config.catalogDefaultSort || "newest";
  const finalSort = validSorts.includes(rawSort as any) ? rawSort : "newest";

  const orderBy = {
    price_asc: { price: "asc" as const },
    price_desc: { price: "desc" as const },
    newest: { createdAt: "desc" as const },
    featured: { isFeatured: "desc" as const },
    rating: { reviews: { _count: "desc" as const } },
  }[finalSort] ?? { createdAt: "desc" as const };

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
    type: true,
    time: true,
    description: true,
    metaDescription: true,
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
  ] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (filters.page - 1) * pageSize,
      take: pageSize,
      select: productSelect,
    }),
    prisma.product.count({ where }),
    // Hero: productos destacados
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      select: productSelect,
      take: config.heroMaxProducts || 5,
    }),
    // Más vendidos
    prisma.product.findMany({
      where: { isActive: true, isBestSeller: true },
      select: productSelect,
      take: config.featuredBestSellersLimit || 8,
    }),
    // Novedades
    prisma.product.findMany({
      where: { isActive: true, isNew: true },
      select: productSelect,
      take: config.featuredNewArrivalsLimit || 8,
      orderBy: { createdAt: "desc" },
    }),
    // Tendencias
    prisma.product.findMany({
      where: { isActive: true, isMostSearched: true },
      select: productSelect,
      take: config.featuredTrendingLimit || 8,
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
  ]);

  return (
    <>
      {config.showHeroBanner && (
        <HeroBanner products={heroProducts as any} config={config} />
      )}

      {config.showCategoryBar && (
        <CategoryBar categories={categories} activeCategoryId={filters.categoryId} />
      )}

      {config.showSocialProofBanner && (
        <SocialProofBanner totalCustomers={totalCustomers} totalProducts={totalProductsCount} config={config} />
      )}

      <div className="flex flex-col gap-8 md:gap-16">
        {config.showFeaturedBestSellers && (
          <FeaturedSection title={config.featuredBestSellersTitle} subtitle={config.featuredBestSellersSubtitle} products={bestSellers as any} />
        )}

        {config.showFeaturedNewArrivals && (
          <FeaturedSection title={config.featuredNewArrivalsTitle} subtitle="Recién llegados" products={newArrivals as any} badge="NUEVO" />
        )}

        {/* CTA banner: respects both the config flag AND the auth state */}
        {config.showCustomerCTABanner && !isCustomerLoggedIn && (
          <CustomerCTABanner config={config} />
        )}

        {config.showFeaturedTrending && (
          <FeaturedSection title={config.featuredTrendingTitle} subtitle="Lo más buscado ahora" products={trending as any} />
        )}

        {config.showCatalogSection && (
          <section id="catalogo" className="container mx-auto px-4 pt-4 pb-8 md:pt-8 md:pb-16">
            <div className="mb-8 md:mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-2">{config.catalogTitle}</h2>
              <p className="text-neutral-500 dark:text-neutral-400">{config.catalogSubtitle}</p>
            </div>
            {config.catalogShowFilters && (
              <CatalogFilters categories={categories} currentFilters={filters} />
            )}
            <ProductGrid products={products as any} total={total} page={filters.page} pageSize={pageSize} showPagination={config.catalogShowPagination} />
          </section>
        )}
      </div>

      {config.showTrustBadges && <TrustBadges config={config} />}
      {/* WhatsAppFAB ha sido movido al (public)/layout.tsx para que sea global, pero se lo quitamos de aquí */}
    </>
  );
}
