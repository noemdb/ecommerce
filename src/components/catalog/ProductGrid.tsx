import Link from "next/link";
import { ProductCard } from "./ProductCard";

interface GridProduct {
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
}

interface ProductGridProps {
  products: GridProduct[];
  total: number;
  page: number;
  pageSize: number;
}

export function ProductGrid({ products, total, page, pageSize }: ProductGridProps) {
  const totalPages = Math.ceil(total / pageSize);

  if (products.length === 0) {
    return (
      <div className="py-20 text-center">
        <h3 className="text-xl font-medium text-neutral-600 dark:text-neutral-400">
          No se encontraron productos con los filtros seleccionados
        </h3>
        <Link
          href="/#catalogo"
          className="inline-block mt-4 text-blue-600 hover:underline"
        >
          Limpiar filtros
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] justify-center gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`?page=${page - 1}`}
              className="px-4 py-2 border rounded hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Anterior
            </Link>
          )}
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`?page=${p}`}
                className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${
                  p === page
                    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>

          {page < totalPages && (
            <Link
              href={`?page=${page + 1}`}
              className="px-4 py-2 border rounded hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Siguiente
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
