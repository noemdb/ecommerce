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
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-6 mb-8 border-b border-neutral-100 dark:border-neutral-800" id="catalogo">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="w-4 h-4 text-neutral-500" />
        <span className="text-sm font-semibold uppercase tracking-wider text-neutral-500">Filtros</span>
      </div>

      <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
        {/* Sort */}
        <div className="flex items-center gap-2 w-full md:w-auto lg:min-w-[200px]">
          <ArrowDownWideNarrow className="w-4 h-4 text-neutral-400 shrink-0" />
          <select
            value={currentFilters.sort || ""}
            onChange={(e) => handleFilterChange("sort", e.target.value)}
            className="w-full bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
          >
            <option value="">Ordenar por</option>
            <option value="featured">Destacados</option>
            <option value="newest">Más recientes</option>
            <option value="price_asc">Precio: Menor a Mayor</option>
            <option value="price_desc">Precio: Mayor a Menor</option>
            <option value="rating">Mejor valorados</option>
          </select>
        </div>

        {/* Stock Filter */}
        <div className="flex items-center gap-4 ml-auto md:ml-0">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={currentFilters.inStock === "true"}
              onChange={(e) => handleFilterChange("inStock", e.target.checked ? "true" : "")}
              className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium group-hover:text-blue-600 transition-colors">Solo en stock</span>
          </label>
        </div>
      </div>
    </div>
  );
}
