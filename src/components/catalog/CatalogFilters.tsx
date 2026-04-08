"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { CatalogFilters as IFilters } from "@/lib/validators/filters";
import { SlidersHorizontal, ArrowDownWideNarrow } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface CatalogFiltersProps {
  categories: Category[];
  currentFilters: IFilters;
}

export function CatalogFilters({ categories, currentFilters }: CatalogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      // Reset page when filter changes (except for pagination itself)
      if (name !== 'page') {
        params.set("page", "1");
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (name: string, value: string) => {
    router.push(`/?${createQueryString(name, value)}#catalogo`, { scroll: false });
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 py-6 mb-8 border-b border-neutral-100 dark:border-neutral-800" id="catalogo">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="w-4 h-4 text-neutral-500" />
        <span className="text-sm font-semibold uppercase tracking-wider text-neutral-500">Filtrar por</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:flex items-center gap-4 w-full md:w-auto">
        {/* Sort */}
        <div className="flex items-center gap-2 w-full md:w-auto lg:min-w-[200px] bg-neutral-50 dark:bg-neutral-900 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <ArrowDownWideNarrow className="w-4 h-4 text-neutral-400 shrink-0" />
          <select
            value={currentFilters.sort || ""}
            onChange={(e) => handleFilterChange("sort", e.target.value)}
            className="w-full bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
          >
            <option value="">Ordenar productos</option>
            <option value="featured">Destacados</option>
            <option value="newest">Más recientes</option>
            <option value="price_asc">Precio: Menor a Mayor</option>
            <option value="price_desc">Precio: Mayor a Menor</option>
            <option value="rating">Mejor valorados</option>
          </select>
        </div>

        {/* Stock Filter */}
        <div className="flex items-center justify-center sm:justify-end md:justify-start gap-4 h-full">
          <label className="flex items-center gap-3 cursor-pointer group bg-neutral-50 dark:bg-neutral-900 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 w-full sm:w-auto">
            <input
              type="checkbox"
              checked={currentFilters.inStock === "true"}
              onChange={(e) => handleFilterChange("inStock", e.target.checked ? "true" : "")}
              className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium group-hover:text-blue-600 transition-colors whitespace-nowrap">Solo en stock</span>
          </label>
        </div>
      </div>
    </div>
  );
}
