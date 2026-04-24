import { Link } from "@/i18n/navigation";
import { ProductCard } from "./ProductCard";

interface FeaturedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  promoPrice: number | null;
  images: { url: string; alt: string | null }[];
  isNew?: boolean;
  stock: number;
  sku: string;
  reviews?: { rating: number }[];
  type?: "PRODUCT" | "SERVICE" | string;
  time?: number | null;
}

interface FeaturedSectionProps {
  title: string;
  subtitle?: string;
  products: FeaturedProduct[];
  badge?: string;
}

export function FeaturedSection({ title, subtitle, products, badge }: FeaturedSectionProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-8 md:py-16 border-b border-neutral-200 dark:border-neutral-900 last:border-0">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-10 gap-3 md:gap-4">
          <div>
            {subtitle && (
              <span className="text-blue-600 dark:text-blue-500 font-semibold tracking-wider uppercase text-sm mb-2 block">
                {subtitle}
              </span>
            )}
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              {title}
            </h2>
          </div>
          <Link
            href={`/#catalogo`}
            className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors flex items-center gap-1 group"
          >
            Ver catálogo completo
            <span className="group-hover:translate-x-1 transition-transform" aria-hidden>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] justify-center gap-4 md:gap-6">
          {products.slice(0, 10).map((product) => (
            <ProductCard key={product.id} product={product} badge={badge} />
          ))}
        </div>
      </div>
    </section>
  );
}
