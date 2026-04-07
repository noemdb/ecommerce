"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface ProductFilterBarProps {
  categories: Category[];
}

export function ProductFilterBar({ categories }: ProductFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "";
  const currentStatus = searchParams.get("status") || "";
  const hasFilters = currentCategory || currentStatus;

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); // Reset to page 1
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("status");
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-neutral-900 p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="flex items-center gap-2 px-3 border-r border-neutral-100 dark:border-neutral-800">
        <Filter className="w-4 h-4 text-neutral-400" />
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Filtros</span>
      </div>

      <select
        value={currentCategory}
        onChange={(e) => updateFilter("category", e.target.value)}
        className="h-9 rounded-lg border-0 bg-neutral-50 dark:bg-neutral-800 px-3 text-xs font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
      >
        <option value="">Todas las categorías</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        value={currentStatus}
        onChange={(e) => updateFilter("status", e.target.value)}
        className="h-9 rounded-lg border-0 bg-neutral-50 dark:bg-neutral-800 px-3 text-xs font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
      >
        <option value="">Cualquier estado</option>
        <option value="active">Activo</option>
        <option value="inactive">Inactivo</option>
      </select>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-2 px-3 h-9 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors ml-auto"
        >
          <X className="w-3.5 h-3.5" />
          Limpiar
        </button>
      )}
    </div>
  );
}
